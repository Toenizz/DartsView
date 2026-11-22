using System.Globalization;
using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;
#if !ANDROID
using Microsoft.Extensions.Caching.Memory;
#endif

#if !ANDROID
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();

var refreshLock = new SemaphoreSlim(1, 1);
var tournamentRefreshLock = new SemaphoreSlim(1, 1);
app.MapGet("/api/schedule", async (IMemoryCache cache, CancellationToken cancellationToken) =>
{
    if (cache.TryGetValue("xmltv-schedule", out DartsSchedule? cached) && cached is not null)
    {
        return Results.Ok(cached);
    }

    await refreshLock.WaitAsync(cancellationToken);
    try
    {
        if (cache.TryGetValue("xmltv-schedule", out cached) && cached is not null)
        {
            return Results.Ok(cached);
        }

        var schedule = await XmltvFeed.LoadAsync(cancellationToken);
        cache.Set("xmltv-schedule", schedule, TimeSpan.FromHours(2));
        return Results.Ok(schedule);
    }
    catch (HttpRequestException exception)
    {
        app.Logger.LogError(exception, "The XMLTV source could not be reached.");
        return Results.Problem("Die XMLTV-Quelle ist nicht erreichbar.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
    {
        app.Logger.LogError(exception, "The XMLTV source request timed out.");
        return Results.Problem("Der Abruf der XMLTV-Quelle hat zu lange gedauert.", statusCode: (int)HttpStatusCode.GatewayTimeout);
    }
    catch (InvalidDataException exception)
    {
        app.Logger.LogError(exception, "The XMLTV source returned invalid compressed data.");
        return Results.Problem("Die XMLTV-Datei ist ungültig oder zu groß.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (XmlException exception)
    {
        app.Logger.LogError(exception, "The XMLTV document could not be parsed.");
        return Results.Problem("Das XMLTV-Dokument konnte nicht gelesen werden.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    finally
    {
        refreshLock.Release();
    }
});

app.MapGet("/api/tournament-events", async (IMemoryCache cache, CancellationToken cancellationToken) =>
{
    if (cache.TryGetValue("tournament-events", out DartsSchedule? cached) && cached is not null)
    {
        return Results.Ok(cached);
    }

    await tournamentRefreshLock.WaitAsync(cancellationToken);
    try
    {
        if (cache.TryGetValue("tournament-events", out cached) && cached is not null)
        {
            return Results.Ok(cached);
        }

        var schedule = await Darts1Feed.LoadAsync(cancellationToken);
        cache.Set("tournament-events", schedule, TimeSpan.FromHours(2));
        return Results.Ok(schedule);
    }
    catch (HttpRequestException exception)
    {
        app.Logger.LogError(exception, "The Darts1 tournament schedule could not be reached.");
        return Results.Problem("Der Darts1-Turnierkalender ist nicht erreichbar.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
    {
        app.Logger.LogError(exception, "The Darts1 tournament schedule request timed out.");
        return Results.Problem("Der Abruf des Darts1-Turnierkalenders hat zu lange gedauert.", statusCode: (int)HttpStatusCode.GatewayTimeout);
    }
    catch (InvalidDataException exception)
    {
        app.Logger.LogError(exception, "The Darts1 tournament schedule could not be parsed.");
        return Results.Problem("Der Darts1-Turnierkalender ist ungültig oder zu groß.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    finally
    {
        tournamentRefreshLock.Release();
    }
});

app.Run();
#endif

internal sealed record DartsSchedule(EpgSource Source, IReadOnlyList<EpgEvent> Events);
internal sealed record EpgSource(string Name, string Url, string RetrievedAt, string Scope);
internal sealed record EpgEvent(
    string Id,
    string Tournament,
    string Stage,
    string Start,
    string Stop,
    string Venue,
    string City,
    string Country,
    string Participants,
    IReadOnlyList<EpgBroadcast> Broadcasts,
    string SourceUrl,
    string Title,
    string Kind = "broadcast",
    bool AllDay = false);
internal sealed record EpgBroadcast(string Territory, string Channel, string Url);

internal static class Darts1Feed
{
    private const string CalendarUrl = "https://www.darts1.de/termine/termine.php";
    private const string PlayersChampionshipUrl = "https://www.darts1.de/players-championship/players-championship.php";
    private const string LakesideUrl = "https://www.darts1.de/dart-wm/lakeside-dart-wm-startzeiten.php";
    private const string PdcWorldChampionshipUrl = "https://www.darts1.de/dart-wm/dart-wm-startzeiten.php";
    private const string BahrainDartsMastersUrl = "https://www.darts1.de/world-series/bahrain-darts-masters.php";
    private const int MaxPageBytes = 4 * 1024 * 1024;
    private static readonly HttpClient Client = new()
    {
        Timeout = TimeSpan.FromSeconds(30)
    };

    public static async Task<DartsSchedule> LoadAsync(CancellationToken cancellationToken)
    {
        var calendarTask = GetPageAsync(CalendarUrl, cancellationToken);
        var playersTask = GetPageAsync(PlayersChampionshipUrl, cancellationToken);
        var lakesideTask = GetPageAsync(LakesideUrl, cancellationToken);
        var pdcWorldTask = GetPageAsync(PdcWorldChampionshipUrl, cancellationToken);
        var bahrainTask = GetPageAsync(BahrainDartsMastersUrl, cancellationToken);
        await Task.WhenAll(calendarTask, playersTask, lakesideTask, pdcWorldTask, bahrainTask);

        var now = DateTimeOffset.UtcNow;
        var rangeEnd = now.AddMonths(2);
        var events = ParseCalendar(await calendarTask, now, rangeEnd)
            .Concat(ParseSessions(await playersTask, PlayersChampionshipUrl, "PDC Players Championship Finals", "Butlin's Minehead Arena", "Minehead", "England", "Europe/London", now, rangeEnd))
            .Concat(ParseSessions(await lakesideTask, LakesideUrl, "WDF Dart-WM", "Lakeside Country Club", "Frimley Green", "England", "Europe/London", now, rangeEnd))
            .Concat(ParseSessions(await pdcWorldTask, PdcWorldChampionshipUrl, "PDC Darts-WM", "Alexandra Palace", "London", "England", "Europe/London", now, rangeEnd))
            .Concat(ParseSessions(await bahrainTask, BahrainDartsMastersUrl, "PDC Bahrain Darts Masters", "Bahrain International Circuit", "Bahrain", "Bahrain", "Asia/Bahrain", now, rangeEnd))
            .DistinctBy(item => item.Id)
            .OrderBy(item => item.Start, StringComparer.Ordinal)
            .ToArray();

        return new DartsSchedule(
            new EpgSource(
                "Darts1.de Turnierkalender und Spielpläne",
                CalendarUrl,
                DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture),
                "Turniertermine der nächsten zwei Monate und veröffentlichte Sessions; TV-Sender werden nicht ausgewiesen"),
            events);
    }

    private static async Task<string> GetPageAsync(string url, CancellationToken cancellationToken)
    {
        using var response = await Client.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
        response.EnsureSuccessStatusCode();
        if (response.Content.Headers.ContentLength is > MaxPageBytes)
        {
            throw new InvalidDataException("A Darts1 page exceeds the size limit.");
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var content = new MemoryStream();
        var buffer = new byte[16 * 1024];
        int bytesRead;
        while ((bytesRead = await stream.ReadAsync(buffer, cancellationToken)) > 0)
        {
            if (content.Length + bytesRead > MaxPageBytes)
            {
                throw new InvalidDataException("A Darts1 page exceeds the size limit.");
            }

            content.Write(buffer, 0, bytesRead);
        }

        return Encoding.UTF8.GetString(content.ToArray());
    }

    private static IReadOnlyList<EpgEvent> ParseCalendar(string html, DateTimeOffset now, DateTimeOffset rangeEnd)
    {
        var entries = new List<CalendarEntry>();
        var spans = Regex.Matches(html, "<span class=\"(?<category>pdc|wdf|ddv|dsab) box\">(?<content>.*?)</span>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        for (var index = 0; index < spans.Count; index++)
        {
            var category = spans[index].Groups["category"].Value.ToLowerInvariant();
            var body = spans[index].Groups["content"].Value;
            var plain = PlainText(body);
            if (plain.Equals("bis", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var dateMatch = Regex.Match(plain, @"(?<date>\d{2}\.\d{2}\.\d{4})");
            if (!dateMatch.Success ||
                !DateOnly.TryParseExact(dateMatch.Groups["date"].Value, "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var startDate))
            {
                continue;
            }

            var linkMatch = Regex.Match(body, "<a\\s+[^>]*href=\"(?<url>[^\"]+)\"[^>]*>(?<text>.*?)</a>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            var description = Regex.Replace(plain, Regex.Escape(dateMatch.Value), string.Empty).Trim(' ', ',', '·', '-');
            var comma = description.IndexOf(',');
            var titlePart = comma >= 0 ? description[..comma].Trim() : description;
            var venue = comma >= 0 ? description[(comma + 1)..].Trim() : string.Empty;
            var linkedTitle = linkMatch.Success ? PlainText(linkMatch.Groups["text"].Value) : string.Empty;
            var title = string.IsNullOrWhiteSpace(linkedTitle) ? titlePart : linkedTitle;
            if (!string.IsNullOrWhiteSpace(linkedTitle) &&
                titlePart.StartsWith(linkedTitle, StringComparison.OrdinalIgnoreCase))
            {
                title = $"{linkedTitle}{titlePart[linkedTitle.Length..]}".Trim();
            }

            var endDate = startDate;
            if (index + 2 < spans.Count &&
                spans[index + 1].Groups["category"].Value.Equals(category, StringComparison.OrdinalIgnoreCase) &&
                PlainText(spans[index + 1].Groups["content"].Value).Equals("bis", StringComparison.OrdinalIgnoreCase) &&
                spans[index + 2].Groups["category"].Value.Equals(category, StringComparison.OrdinalIgnoreCase))
            {
                var endText = PlainText(spans[index + 2].Groups["content"].Value);
                var endMatch = Regex.Match(endText, @"(?<date>\d{2}\.\d{2}\.\d{4})");
                if (endMatch.Success &&
                    DateOnly.TryParseExact(endMatch.Groups["date"].Value, "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedEnd))
                {
                    endDate = parsedEnd;
                    index += 2;
                }
            }

            var sourceUrl = linkMatch.Success
                ? new Uri(new Uri(CalendarUrl), WebUtility.HtmlDecode(linkMatch.Groups["url"].Value)).ToString()
                : CalendarUrl;
            entries.Add(new CalendarEntry(title, venue, sourceUrl, startDate, endDate));
        }

        var merged = new List<CalendarEntry>();
        foreach (var group in entries.GroupBy(entry => $"{entry.Title}|{entry.Venue}", StringComparer.OrdinalIgnoreCase))
        {
            CalendarEntry? current = null;
            foreach (var entry in group.OrderBy(item => item.Start))
            {
                if (current is null)
                {
                    current = entry;
                }
                else if (entry.Start <= current.End.AddDays(2))
                {
                    current = current with
                    {
                        Start = current.Start < entry.Start ? current.Start : entry.Start,
                        End = current.End > entry.End ? current.End : entry.End
                    };
                }
                else
                {
                    merged.Add(current);
                    current = entry;
                }
            }

            if (current is not null)
            {
                merged.Add(current);
            }
        }

        return merged
            .Where(entry => entry.End.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc) >= now.UtcDateTime &&
                            entry.Start.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc) <= rangeEnd.UtcDateTime)
            .Select(entry =>
            {
                var first = new DateTimeOffset(entry.Start.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
                var stop = new DateTimeOffset(entry.End.AddDays(1).ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc));
                var range = entry.Start == entry.End
                    ? entry.Start.ToString("d MMMM", CultureInfo.GetCultureInfo("de-DE"))
                    : $"{entry.Start.ToString("d MMMM", CultureInfo.GetCultureInfo("de-DE"))} – {entry.End.ToString("d MMMM", CultureInfo.GetCultureInfo("de-DE"))}";
                return new EpgEvent(
                    CreateId($"tournament|{entry.Title}|{entry.Start:yyyy-MM-dd}"),
                    entry.Title,
                    $"Turnierzeitraum · {range}",
                    first.ToString("O", CultureInfo.InvariantCulture),
                    stop.ToString("O", CultureInfo.InvariantCulture),
                    entry.Venue,
                    LastLocationPart(entry.Venue),
                    string.Empty,
                    "Turnierkalender · Darts1.de",
                    Array.Empty<EpgBroadcast>(),
                    entry.SourceUrl,
                    entry.Title,
                    "tournament",
                    true);
            })
            .ToArray();
    }

    private static IReadOnlyList<EpgEvent> ParseSessions(
        string html,
        string pageUrl,
        string tournament,
        string venue,
        string city,
        string country,
        string timeZoneId,
        DateTimeOffset now,
        DateTimeOffset rangeEnd)
    {
        var sessions = new List<EpgEvent>();
        var items = Regex.Matches(html, "<p class=\"event\"[^>]*>(?<content>.*?)</p>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
        foreach (Match item in items)
        {
            var content = item.Groups["content"].Value;
            var startMatch = Regex.Match(content, "<time[^>]*itemprop=\"startDate\"[^>]*datetime=\"(?<start>[^\"]+)\"", RegexOptions.IgnoreCase);
            var stageMatch = Regex.Match(content, "<span[^>]*itemprop=\"name\"[^>]*>(?<stage>.*?)</span>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            if (!startMatch.Success ||
                !DateTime.TryParseExact(startMatch.Groups["start"].Value, "yyyy-MM-dd'T'HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var localStart) ||
                !stageMatch.Success)
            {
                continue;
            }

            var start = ToVenueTime(localStart, timeZoneId);
            if (start > rangeEnd || start.AddHours(8) <= now)
            {
                continue;
            }

            var stage = PlainText(stageMatch.Groups["stage"].Value);
            sessions.Add(new EpgEvent(
                CreateId($"session|{tournament}|{start:O}|{stage}"),
                tournament,
                stage,
                start.ToString("O", CultureInfo.InvariantCulture),
                string.Empty,
                venue,
                city,
                country,
                "Session · Darts1.de",
                Array.Empty<EpgBroadcast>(),
                pageUrl,
                tournament,
                "session"));
        }

        var datedSections = Regex.Matches(
            html,
            "<b>(?<label>[^<]+)</b>(?<after>(?:(?!<b>).){0,1600}?)<a\\b[^>]*>(?<stage>.*?)</a>",
            RegexOptions.Singleline | RegexOptions.IgnoreCase);
        foreach (Match section in datedSections)
        {
            var label = PlainText(section.Groups["label"].Value);
            var dateMatch = Regex.Match(
                label,
                @"(?<day>\d{1,2})\.\s*(?<month>Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)\s+(?<year>\d{4}),\s*(?<hour>\d{1,2})(?:[.:](?<minute>\d{2}))?",
                RegexOptions.IgnoreCase);
            if (!dateMatch.Success)
            {
                continue;
            }

            var dateText = $"{dateMatch.Groups["day"].Value} {dateMatch.Groups["month"].Value} {dateMatch.Groups["year"].Value} " +
                           $"{dateMatch.Groups["hour"].Value}:{(dateMatch.Groups["minute"].Success ? dateMatch.Groups["minute"].Value : "00")}";
            if (!DateTime.TryParseExact(
                    dateText,
                    "d MMMM yyyy H:mm",
                    CultureInfo.GetCultureInfo("de-DE"),
                    DateTimeStyles.None,
                    out var localStart))
            {
                continue;
            }

            var start = ToVenueTime(localStart, timeZoneId);
            if (start > rangeEnd || start.AddHours(8) <= now)
            {
                continue;
            }

            var stage = PlainText(section.Groups["stage"].Value);
            sessions.Add(new EpgEvent(
                CreateId($"session|{tournament}|{start:O}|{stage}"),
                tournament,
                stage,
                start.ToString("O", CultureInfo.InvariantCulture),
                string.Empty,
                venue,
                city,
                country,
                "Session · Darts1.de",
                Array.Empty<EpgBroadcast>(),
                pageUrl,
                tournament,
                "session"));
        }

        return sessions.DistinctBy(session => session.Id).ToArray();
    }

    private static DateTimeOffset ToVenueTime(DateTime localTime, string timeZoneId)
    {
        var zone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        var unspecified = DateTime.SpecifyKind(localTime, DateTimeKind.Unspecified);
        return new DateTimeOffset(unspecified, zone.GetUtcOffset(unspecified));
    }

    private static string PlainText(string html) =>
        Regex.Replace(WebUtility.HtmlDecode(Regex.Replace(html, "<[^>]+>", " "))
            .Replace('\u00a0', ' ')
            .Replace('\u200b', ' '), @"\s+", " ")
            .Trim();

    private static string LastLocationPart(string venue)
    {
        var comma = venue.LastIndexOf(',');
        return comma >= 0 ? venue[(comma + 1)..].Trim() : venue;
    }

    private static string CreateId(string key) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(key))).ToLowerInvariant();

    private sealed record CalendarEntry(string Title, string Venue, string SourceUrl, DateOnly Start, DateOnly End);
}

internal sealed class XmltvFeed
{
    private const string FeedUrl = "https://deswird.org/iptv/GuideFull.xml.gz";
    private const int MaxCompressedBytes = 32 * 1024 * 1024;
    private const long MaxXmlCharacters = 512_000_000;
    private static readonly HttpClient Client = new(new HttpClientHandler
    {
        AutomaticDecompression = DecompressionMethods.None
    })
    {
        Timeout = TimeSpan.FromSeconds(90)
    };

    public static async Task<DartsSchedule> LoadAsync(CancellationToken cancellationToken)
    {
        using var response = await Client.GetAsync(
            FeedUrl,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);
        response.EnsureSuccessStatusCode();

        if (response.Content.Headers.ContentLength is > MaxCompressedBytes)
        {
            throw new InvalidDataException("The compressed XMLTV file exceeds the size limit.");
        }

        await using var networkStream = await response.Content.ReadAsStreamAsync(cancellationToken);
        await using var gzipStream = new GZipStream(networkStream, CompressionMode.Decompress);
        var settings = new XmlReaderSettings
        {
            DtdProcessing = DtdProcessing.Ignore,
            XmlResolver = null,
            IgnoreComments = true,
            IgnoreWhitespace = true,
            MaxCharactersInDocument = MaxXmlCharacters
        };

        using var reader = XmlReader.Create(gzipStream, settings);
        var channelNames = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        var events = new Dictionary<string, MutableEpgEvent>(StringComparer.OrdinalIgnoreCase);
        var now = DateTimeOffset.UtcNow;
        var rangeEnd = now.AddDays(14);

        while (!reader.EOF)
        {
            if (reader.NodeType == XmlNodeType.Element && reader.LocalName == "channel")
            {
                var channel = (XElement)XNode.ReadFrom(reader);
                var id = (string?)channel.Attribute("id");
                var displayName = channel.Elements()
                    .FirstOrDefault(element => element.Name.LocalName == "display-name")
                    ?.Value
                    .Trim();

                if (!string.IsNullOrWhiteSpace(id))
                {
                    channelNames[id] = string.IsNullOrWhiteSpace(displayName) ? id : displayName;
                }

                continue;
            }

            if (reader.NodeType == XmlNodeType.Element && reader.LocalName == "programme")
            {
                var programme = (XElement)XNode.ReadFrom(reader);
                AddProgramme(programme, channelNames, events, now, rangeEnd);
                continue;
            }

            reader.Read();
        }

        var orderedEvents = events.Values
            .OrderBy(item => item.Start)
            .Select(item => item.ToEvent())
            .ToArray();

        return new DartsSchedule(
            new EpgSource(
                "deswird.org XMLTV · GuideFull",
                FeedUrl,
                DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture),
                "D/A/CH laut Quelle; weitere europäische Gebiete sind in diesem Feed nicht ausgewiesen"),
            orderedEvents);
    }

    private static void AddProgramme(
        XElement programme,
        IReadOnlyDictionary<string, string> channelNames,
        IDictionary<string, MutableEpgEvent> events,
        DateTimeOffset now,
        DateTimeOffset rangeEnd)
    {
        var title = ChildValue(programme, "title");
        if (!IsDartsProgramme(title))
        {
            return;
        }

        var startText = (string?)programme.Attribute("start");
        var stopText = (string?)programme.Attribute("stop");
        if (!TryParseXmltvDate(startText, out var start) ||
            !TryParseXmltvDate(stopText, out var stop) ||
            stop <= start ||
            (stop - start).TotalMinutes is < 15 or > 720 ||
            start > rangeEnd ||
            stop <= now)
        {
            return;
        }

        var channelId = (string?)programme.Attribute("channel") ?? string.Empty;
        var channel = channelNames.TryGetValue(channelId, out var displayName)
            ? displayName
            : channelId;
        if (string.IsNullOrWhiteSpace(channel))
        {
            return;
        }

        var tournament = Regex.Replace(title.Trim(), @"^\s*Darts\s*:\s*", "", RegexOptions.IgnoreCase);
        if (string.IsNullOrWhiteSpace(tournament))
        {
            tournament = title.Trim();
        }

        var key = $"{start.UtcDateTime.Ticks}|{tournament}";
        var sameTimeEvents = events.Values
            .Where(item => item.Start == start && item.Stop == stop)
            .ToArray();
        var entry = sameTimeEvents.FirstOrDefault(item =>
            string.Equals(item.Tournament, tournament, StringComparison.OrdinalIgnoreCase));
        if (entry is null && IsGenericDarts(tournament))
        {
            entry = sameTimeEvents.FirstOrDefault(item => !IsGenericDarts(item.Tournament));
        }

        entry ??= sameTimeEvents.FirstOrDefault(item => IsGenericDarts(item.Tournament));
        if (entry is null)
        {
            entry = new MutableEpgEvent(
                key,
                tournament,
                TryFindStage(programme) ?? "Nicht im EPG angegeben",
                start,
                stop,
                TryFindLocation(programme) ?? "Im EPG nicht angegeben",
                string.Empty,
                string.Empty,
                title.Trim());
            events.Add(key, entry);
        }
        else
        {
            if (IsGenericDarts(entry.Tournament) && !IsGenericDarts(tournament))
            {
                events.Remove(entry.Key);
                entry.Promote(key, tournament, title.Trim());
                events.Add(entry.Key, entry);
            }

            if (stop > entry.Stop)
            {
                entry.Stop = stop;
            }
        }

        entry.AddBroadcast(TerritoryFor(channelId), channel);
    }

    private static bool IsGenericDarts(string tournament) =>
        string.Equals(tournament.Trim(), "Darts", StringComparison.OrdinalIgnoreCase);

    private static string ChildValue(XElement parent, string localName) =>
        parent.Elements().FirstOrDefault(element => element.Name.LocalName == localName)?.Value ?? string.Empty;

    private static bool IsDartsProgramme(string title) =>
        Regex.IsMatch(title, @"\b(?:darts?|PDC)\b", RegexOptions.IgnoreCase) &&
        !Regex.IsMatch(title, @"\bTravel\s+by\s+Dart\b", RegexOptions.IgnoreCase) &&
        !Regex.IsMatch(title, @"\bHighlights\b", RegexOptions.IgnoreCase);

    private static string? TryFindStage(XElement programme)
    {
        var text = string.Join(" ", programme.Elements().Select(element => element.Value));
        var match = Regex.Match(
            text,
            @"\b(?:last\s+\d+|round\s+(?:of\s+)?\d+|first\s+round|second\s+round|quarter[\s-]?finals?|semi[\s-]?finals?|final|group\s+stage|achtelfinale|viertelfinale|halbfinale|finale)\b",
            RegexOptions.IgnoreCase);
        return match.Success ? match.Value : null;
    }

    private static string? TryFindLocation(XElement programme)
    {
        var text = string.Join(" ", programme.Elements().Select(element => element.Value));
        var match = Regex.Match(
            text,
            @"(?:venue|location|spielort|austragungsort)\s*:\s*([^.;\r\n]+)",
            RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private static string TerritoryFor(string channelId)
    {
        var match = Regex.Match(channelId, @"(?:^|[.\-_])(de|at|ch|uk|gb|us)(?:$|[.\-_])", RegexOptions.IgnoreCase);
        if (!match.Success)
        {
            return "D/A/CH-Feed · Gebiet nicht ausgewiesen";
        }

        return match.Groups[1].Value.ToLowerInvariant() switch
        {
            "de" => "Deutschland",
            "at" => "Österreich",
            "ch" => "Schweiz",
            "uk" or "gb" => "Vereinigtes Königreich",
            "us" => "USA",
            _ => "Gebiet nicht ausgewiesen"
        };
    }

    private static bool TryParseXmltvDate(string? value, out DateTimeOffset result)
    {
        result = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var normalized = Regex.Replace(value.Trim(), @"([+-]\d{2})(\d{2})$", "$1:$2");
        var formats = new[] { "yyyyMMddHHmmss zzz", "yyyyMMddHHmm zzz" };
        return DateTimeOffset.TryParseExact(
            normalized,
            formats,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out result);
    }

    private sealed class MutableEpgEvent
    {
        private readonly Dictionary<string, EpgBroadcast> broadcasts = new(StringComparer.OrdinalIgnoreCase);

        public MutableEpgEvent(
            string key,
            string tournament,
            string stage,
            DateTimeOffset start,
            DateTimeOffset stop,
            string venue,
            string city,
            string country,
            string title)
        {
            Key = key;
            Tournament = tournament;
            Stage = stage;
            Start = start;
            Stop = stop;
            Venue = venue;
            City = city;
            Country = country;
            Title = title;
        }

        public string Key { get; private set; }
        public string Tournament { get; private set; }
        public string Stage { get; }
        public DateTimeOffset Start { get; }
        public DateTimeOffset Stop { get; set; }
        public string Venue { get; }
        public string City { get; }
        public string Country { get; }
        public string Title { get; private set; }

        public void Promote(string key, string tournament, string title)
        {
            Key = key;
            Tournament = tournament;
            Title = title;
        }

        public void AddBroadcast(string territory, string channel)
        {
            var key = $"{territory}|{channel}";
            if (broadcasts.ContainsKey(key))
            {
                return;
            }

            var normalizedChannel = NormalizeChannelName(channel);
            var existing = broadcasts.Values.FirstOrDefault(item =>
                NormalizeChannelName(item.Channel) == normalizedChannel);
            if (existing is not null)
            {
                var existingUnspecified = existing.Territory.Contains("Gebiet nicht ausgewiesen", StringComparison.Ordinal);
                var newUnspecified = territory.Contains("Gebiet nicht ausgewiesen", StringComparison.Ordinal);
                if (!existingUnspecified && (newUnspecified || existing.Territory == territory))
                {
                    return;
                }

                if (existingUnspecified && newUnspecified)
                {
                    return;
                }

                if (existingUnspecified)
                {
                    broadcasts.Remove($"{existing.Territory}|{existing.Channel}");
                }
            }

            broadcasts[key] = new EpgBroadcast(territory, channel, string.Empty);
        }

        private static string NormalizeChannelName(string channel) =>
            new(channel.Where(char.IsLetterOrDigit).Select(char.ToUpperInvariant).ToArray());

        public EpgEvent ToEvent()
        {
            var id = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(Key))).ToLowerInvariant();
            return new EpgEvent(
                id,
                Tournament,
                Stage,
                Start.ToString("O", CultureInfo.InvariantCulture),
                Stop.ToString("O", CultureInfo.InvariantCulture),
                Venue,
                City,
                Country,
                string.Empty,
                broadcasts.Values.ToArray(),
                string.Empty,
                Title);
        }
    }
}
