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
var ukRefreshLock = new SemaphoreSlim(1, 1);
var nlRefreshLock = new SemaphoreSlim(1, 1);
var beRefreshLock = new SemaphoreSlim(1, 1);
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

app.MapGet("/api/schedule-uk", async (IMemoryCache cache, CancellationToken cancellationToken) =>
{
    if (cache.TryGetValue("xmltv-schedule-uk", out DartsSchedule? cached) && cached is not null)
    {
        return Results.Ok(cached);
    }

    await ukRefreshLock.WaitAsync(cancellationToken);
    try
    {
        if (cache.TryGetValue("xmltv-schedule-uk", out cached) && cached is not null)
        {
            return Results.Ok(cached);
        }

        var schedule = await XmltvFeed.LoadUkAsync(cancellationToken);
        cache.Set("xmltv-schedule-uk", schedule, TimeSpan.FromHours(2));
        return Results.Ok(schedule);
    }
    catch (HttpRequestException exception)
    {
        app.Logger.LogError(exception, "The UK XMLTV source could not be reached.");
        return Results.Problem("Die UK-XMLTV-Quelle ist nicht erreichbar.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
    {
        app.Logger.LogError(exception, "The UK XMLTV source request timed out.");
        return Results.Problem("Der Abruf der UK-XMLTV-Quelle hat zu lange gedauert.", statusCode: (int)HttpStatusCode.GatewayTimeout);
    }
    catch (InvalidDataException exception)
    {
        app.Logger.LogError(exception, "The UK XMLTV source returned invalid compressed data.");
        return Results.Problem("Die UK-XMLTV-Datei ist ungültig oder zu groß.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (XmlException exception)
    {
        app.Logger.LogError(exception, "The UK XMLTV document could not be parsed.");
        return Results.Problem("Das UK-XMLTV-Dokument konnte nicht gelesen werden.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    finally
    {
        ukRefreshLock.Release();
    }
});

app.MapGet("/api/schedule-nl", async (IMemoryCache cache, CancellationToken cancellationToken) =>
{
    if (cache.TryGetValue("xmltv-schedule-nl", out DartsSchedule? cached) && cached is not null)
    {
        return Results.Ok(cached);
    }

    await nlRefreshLock.WaitAsync(cancellationToken);
    try
    {
        if (cache.TryGetValue("xmltv-schedule-nl", out cached) && cached is not null)
        {
            return Results.Ok(cached);
        }

        var schedule = await XmltvFeed.LoadNetherlandsAsync(cancellationToken);
        cache.Set("xmltv-schedule-nl", schedule, TimeSpan.FromHours(2));
        return Results.Ok(schedule);
    }
    catch (HttpRequestException exception)
    {
        app.Logger.LogError(exception, "The Netherlands XMLTV source could not be reached.");
        return Results.Problem("Die NL-XMLTV-Quelle ist nicht erreichbar.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
    {
        app.Logger.LogError(exception, "The Netherlands XMLTV source request timed out.");
        return Results.Problem("Der Abruf der NL-XMLTV-Quelle hat zu lange gedauert.", statusCode: (int)HttpStatusCode.GatewayTimeout);
    }
    catch (InvalidDataException exception)
    {
        app.Logger.LogError(exception, "The Netherlands XMLTV source returned invalid compressed data.");
        return Results.Problem("Die NL-XMLTV-Datei ist ungültig oder zu groß.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (XmlException exception)
    {
        app.Logger.LogError(exception, "The Netherlands XMLTV document could not be parsed.");
        return Results.Problem("Das NL-XMLTV-Dokument konnte nicht gelesen werden.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    finally
    {
        nlRefreshLock.Release();
    }
});

app.MapGet("/api/schedule-be", async (IMemoryCache cache, CancellationToken cancellationToken) =>
{
    if (cache.TryGetValue("xmltv-schedule-be", out DartsSchedule? cached) && cached is not null)
    {
        return Results.Ok(cached);
    }

    await beRefreshLock.WaitAsync(cancellationToken);
    try
    {
        if (cache.TryGetValue("xmltv-schedule-be", out cached) && cached is not null)
        {
            return Results.Ok(cached);
        }

        var schedule = await XmltvFeed.LoadBelgiumAsync(cancellationToken);
        cache.Set("xmltv-schedule-be", schedule, TimeSpan.FromHours(2));
        return Results.Ok(schedule);
    }
    catch (HttpRequestException exception)
    {
        app.Logger.LogError(exception, "The Belgium XMLTV source could not be reached.");
        return Results.Problem("Die BE-XMLTV-Quelle ist nicht erreichbar.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (TaskCanceledException exception) when (!cancellationToken.IsCancellationRequested)
    {
        app.Logger.LogError(exception, "The Belgium XMLTV source request timed out.");
        return Results.Problem("Der Abruf der BE-XMLTV-Quelle hat zu lange gedauert.", statusCode: (int)HttpStatusCode.GatewayTimeout);
    }
    catch (InvalidDataException exception)
    {
        app.Logger.LogError(exception, "The Belgium XMLTV source returned invalid compressed data.");
        return Results.Problem("Die BE-XMLTV-Datei ist ungültig oder zu groß.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    catch (XmlException exception)
    {
        app.Logger.LogError(exception, "The Belgium XMLTV document could not be parsed.");
        return Results.Problem("Das BE-XMLTV-Dokument konnte nicht gelesen werden.", statusCode: (int)HttpStatusCode.BadGateway);
    }
    finally
    {
        beRefreshLock.Release();
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
        cache.Set("tournament-events", schedule, Darts1Feed.GetCacheDuration(schedule, DateTimeOffset.UtcNow));
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
    bool AllDay = false,
    IReadOnlyList<DartsMatch>? Matches = null,
    string TimingNote = "");
internal sealed record EpgBroadcast(string Territory, string Channel, string Url);
internal sealed record DartsMatch(
    string Player1,
    string Player2,
    string? Start = null,
    bool IsEstimated = false,
    int? Score1 = null,
    int? Score2 = null,
    string? ScoreStatus = null,
    string? Country1 = null,
    string? Country2 = null);

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
        var playersSessions = ParseSessions(await playersTask, PlayersChampionshipUrl, "PDC Players Championship Finals", "Butlin's Minehead Arena", "Minehead", "England", "Europe/London", now, rangeEnd).ToArray();
        var drawnMatches = ParsePlayersChampionshipDraw(await playersTask);
        var firstRoundSessionIndices = Enumerable.Range(0, playersSessions.Length)
            .Where(index => Regex.IsMatch(playersSessions[index].Stage, @"\b1\.\s*Runde\b", RegexOptions.IgnoreCase))
            .ToArray();
        if (drawnMatches.Count == 32 &&
            firstRoundSessionIndices.Length == 2)
        {
            const int matchesPerSession = 16;
            for (var index = 0; index < firstRoundSessionIndices.Length; index++)
            {
                var sessionIndex = firstRoundSessionIndices[index];
                var session = playersSessions[sessionIndex];
                var existingMatches = session.Matches ?? Array.Empty<DartsMatch>();
                var existingByKey = existingMatches
                    .GroupBy(MatchKey, StringComparer.OrdinalIgnoreCase)
                    .ToDictionary(group => group.Key, group => group.First(), StringComparer.OrdinalIgnoreCase);
                var sessionDraw = drawnMatches.Skip(index * matchesPerSession).Take(matchesPerSession).ToArray();
                var assignedKeys = sessionDraw.Select(MatchKey).ToHashSet(StringComparer.OrdinalIgnoreCase);
                var sessionMatches = sessionDraw
                    .Select(match => existingByKey.TryGetValue(MatchKey(match), out var existing) ? existing : match)
                    .Concat(existingMatches.Where(match => !assignedKeys.Contains(MatchKey(match))))
                    .ToArray();
                playersSessions[sessionIndex] = session with
                {
                    Matches = EstimateMatchStarts(
                        sessionMatches,
                        DateTimeOffset.Parse(session.Start, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind),
                        session.Tournament,
                        session.Stage,
                        simultaneousMatches: 2),
                    TimingNote = "Einzelstartzeiten sind Schätzungen ab Sessionbeginn und Spielreihenfolge; parallele Spiele teilen sich einen Slot, Verzögerungen sind möglich."
                };
            }
        }

        var events = ParseCalendar(await calendarTask, now, rangeEnd)
            .Concat(playersSessions)
            .Concat(ParseSessions(await lakesideTask, LakesideUrl, "WDF Dart-WM", "Lakeside Country Club", "Frimley Green", "England", "Europe/London", now, rangeEnd))
            .Concat(ParseSessions(await pdcWorldTask, PdcWorldChampionshipUrl, "PDC Darts-WM", "Alexandra Palace", "London", "England", "Europe/London", now, rangeEnd))
            .Concat(ParseSessions(await bahrainTask, BahrainDartsMastersUrl, "PDC Bahrain Darts Masters", "Bahrain International Circuit", "Bahrain", "Bahrain", "Asia/Bahrain", now, rangeEnd));

        var scheduledMatchKeys = playersSessions
            .SelectMany(session => session.Matches ?? Array.Empty<DartsMatch>())
            .Select(MatchKey)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var unassignedMatches = drawnMatches
            .Where(match => !scheduledMatchKeys.Contains(MatchKey(match)))
            .ToArray();
        if (unassignedMatches.Length > 0 && playersSessions.Length > 0)
        {
            var firstSession = playersSessions[0];
            events = events.Append(new EpgEvent(
                CreateId($"draw|{PlayersChampionshipUrl}|{firstSession.Start}"),
                firstSession.Tournament,
                "Erstrundenauslosung",
                firstSession.Start,
                string.Empty,
                firstSession.Venue,
                firstSession.City,
                firstSession.Country,
                string.Empty,
                Array.Empty<EpgBroadcast>(),
                PlayersChampionshipUrl,
                firstSession.Tournament,
                "draw",
                false,
                unassignedMatches,
                "Die Paarungen sind noch keiner Session zugeordnet; individuelle Anwurfzeiten sind nicht veröffentlicht."));
        }

        var orderedEvents = events
            .DistinctBy(item => item.Id)
            .OrderBy(item => item.Start, StringComparer.Ordinal)
            .ToArray();

        return new DartsSchedule(
            new EpgSource(
                "Darts1.de Turnierkalender und Spielpläne",
                CalendarUrl,
                DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture),
                "Turniertermine der nächsten zwei Monate und veröffentlichte Sessions; TV-Sender werden nicht ausgewiesen"),
            orderedEvents);
    }

    internal static TimeSpan GetCacheDuration(DartsSchedule schedule, DateTimeOffset now)
    {
        var isMatchDay = schedule.Events.Any(item =>
            item.Kind == "session" &&
            DateTimeOffset.TryParse(item.Start, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out var sessionStart) &&
            sessionStart.Date == now.ToOffset(sessionStart.Offset).Date);
        return isMatchDay ? TimeSpan.FromSeconds(45) : TimeSpan.FromHours(2);
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
                    string.Empty,
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
        for (var index = 0; index < items.Count; index++)
        {
            var item = items[index];
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
            var detailsStart = item.Index + item.Length;
            var detailsEnd = index + 1 < items.Count ? items[index + 1].Index : html.Length;
            var nextHeading = html.IndexOf("<h2", detailsStart, StringComparison.OrdinalIgnoreCase);
            if (nextHeading >= 0 && nextHeading < detailsEnd)
            {
                detailsEnd = nextHeading;
            }

            var matches = EstimateMatchStarts(
                ParseMatchups(html[detailsStart..detailsEnd]),
                start,
                tournament,
                stage);
            sessions.Add(new EpgEvent(
                CreateId($"session|{tournament}|{start:O}|{stage}"),
                tournament,
                stage,
                start.ToString("O", CultureInfo.InvariantCulture),
                string.Empty,
                venue,
                city,
                country,
                string.Empty,
                Array.Empty<EpgBroadcast>(),
                pageUrl,
                tournament,
                "session",
                Matches: matches,
                TimingNote: matches.Count > 0
                    ? "Einzelstartzeiten sind Schätzungen ab Sessionbeginn und Spielreihenfolge; Verzögerungen sind möglich."
                    : string.Empty));
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

    private static IReadOnlyList<DartsMatch> EstimateMatchStarts(
        IReadOnlyList<DartsMatch> matches,
        DateTimeOffset sessionStart,
        string tournament,
        string stage,
        int simultaneousMatches = 1)
    {
        var interval = EstimatedMatchIntervalMinutes(tournament, stage);
        return matches
            .Select((match, index) => match with
            {
                Start = sessionStart.AddMinutes(index / simultaneousMatches * interval).ToString("O", CultureInfo.InvariantCulture),
                IsEstimated = true,
                ScoreStatus = GetScoreStatus(match, stage)
            })
            .ToArray();
    }

    private static int EstimatedMatchIntervalMinutes(string tournament, string stage)
    {
        var format = Regex.Match(stage, @"Best of\s+(?<count>\d+)\s+(?<unit>sets?|legs?)", RegexOptions.IgnoreCase);
        if (format.Success)
        {
            if (format.Groups["unit"].Value.StartsWith("set", StringComparison.OrdinalIgnoreCase) ||
                !int.TryParse(format.Groups["count"].Value, NumberStyles.None, CultureInfo.InvariantCulture, out var count) ||
                count > 11)
            {
                return 50;
            }

            return 35;
        }

        if (tournament.Contains("PDC Darts-WM", StringComparison.OrdinalIgnoreCase) ||
            Regex.IsMatch(stage, @"Final|Halbfinal|Viertelfinal|Semifinal|Quarterfinal", RegexOptions.IgnoreCase))
        {
            return 50;
        }

        return 35;
    }

    private static string? GetScoreStatus(DartsMatch match, string stage)
    {
        if (match.Score1 is not int score1 || match.Score2 is not int score2)
        {
            return null;
        }

        var format = Regex.Match(stage, @"Best of\s+(?<count>\d+)\s+(?<unit>sets?|legs?)", RegexOptions.IgnoreCase);
        if (!format.Success ||
            !int.TryParse(format.Groups["count"].Value, NumberStyles.None, CultureInfo.InvariantCulture, out var formatLength))
        {
            return null;
        }

        var winningScore = formatLength / 2 + 1;
        if (score1 >= winningScore || score2 >= winningScore)
        {
            return "finished";
        }

        return score1 + score2 > 0 ? "live" : null;
    }

    private static IReadOnlyList<DartsMatch> ParsePlayersChampionshipDraw(string html)
    {
        var drawHeading = html.IndexOf("Teilnehmer & Auslosung", StringComparison.OrdinalIgnoreCase);
        if (drawHeading < 0)
        {
            return Array.Empty<DartsMatch>();
        }

        var scheduleHeading = html.IndexOf("Players Championship Finals Spielplan", drawHeading, StringComparison.OrdinalIgnoreCase);
        return scheduleHeading < 0
            ? Array.Empty<DartsMatch>()
            : ParseMatchups(html[drawHeading..scheduleHeading]);
    }

    private static IReadOnlyList<DartsMatch> ParseMatchups(string html)
    {
        var matches = new List<DartsMatch>();
        var tables = Regex.Matches(
            html,
            "<table\\b[^>]*class=\"spielplan\"[^>]*>(?<content>.*?)</table>",
            RegexOptions.Singleline | RegexOptions.IgnoreCase);

        foreach (Match table in tables)
        {
            var rows = Regex.Matches(table.Groups["content"].Value, "<tr\\b[^>]*>(?<content>.*?)</tr>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            foreach (Match row in rows)
            {
                var cells = Regex.Matches(row.Groups["content"].Value, "<td\\b[^>]*>(?<content>.*?)</td>", RegexOptions.Singleline | RegexOptions.IgnoreCase);
                if (cells.Count != 3)
                {
                    continue;
                }

                var scoreText = PlainText(cells[1].Groups["content"].Value);
                var scoreMatch = Regex.Match(scoreText, @"^(?<score1>\d+)\s*:\s*(?<score2>\d+)$");
                var isUnplayed = string.Equals(scoreText, "v", StringComparison.OrdinalIgnoreCase);
                if (!isUnplayed && !scoreMatch.Success)
                {
                    continue;
                }

                var score1 = 0;
                var score2 = 0;
                if (scoreMatch.Success &&
                    (!int.TryParse(scoreMatch.Groups["score1"].Value, NumberStyles.None, CultureInfo.InvariantCulture, out score1) ||
                     !int.TryParse(scoreMatch.Groups["score2"].Value, NumberStyles.None, CultureInfo.InvariantCulture, out score2)))
                {
                    continue;
                }

                var player1 = PlainText(cells[0].Groups["content"].Value);
                var player2 = PlainText(cells[2].Groups["content"].Value);
                if (!string.IsNullOrWhiteSpace(player1) && !string.IsNullOrWhiteSpace(player2))
                {
                    var hasScore = scoreMatch.Success && (score1 > 0 || score2 > 0);
                    matches.Add(new DartsMatch(
                        player1,
                        player2,
                        Country1: GetPlayerCountryCode(player1),
                        Country2: GetPlayerCountryCode(player2),
                        Score1: hasScore ? score1 : null,
                        Score2: hasScore ? score2 : null));
                }
            }
        }

        return matches;
    }

    private static string? GetPlayerCountryCode(string playerName)
    {
        var countries = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
                // England (GB-ENG)
                ["Luke Littler"] = "GB-ENG", ["Luke Humphries"] = "GB-ENG", ["Michael Smith"] = "GB-ENG",
                ["Nathan Aspinall"] = "GB-ENG", ["Chris Dobey"] = "GB-ENG", ["Rob Cross"] = "GB-ENG",
                ["Stephen Bunting"] = "GB-ENG", ["James Wade"] = "GB-ENG", ["Dave Chisnall"] = "GB-ENG",
                ["Ryan Searle"] = "GB-ENG", ["Ross Smith"] = "GB-ENG", ["Joe Cullen"] = "GB-ENG",
                ["Cameron Menzies"] = "GB-ENG", ["Callan Rydz"] = "GB-ENG", ["Andrew Gilding"] = "GB-ENG",
                ["Ritchie Edhouse"] = "GB-ENG", ["Scott Williams"] = "GB-ENG", ["Josh Rock"] = "GB-ENG",
                ["Beau Greaves"] = "GB-ENG", ["Charlie Manby"] = "GB-ENG", ["Henry Coates"] = "GB-ENG",
                ["Tom Bissell"] = "GB-ENG", ["Rob Owen"] = "GB-ENG", ["Luke Woodhouse"] = "GB-ENG",
                ["James Hurrell"] = "GB-ENG", ["Tommy Morris"] = "GB-ENG", ["Matt Clark"] = "GB-ENG", ["Paula Jacklin"] = "GB-ENG",
                ["David Davies"] = "GB-ENG", ["Harry Lane"] = "GB-ENG", ["Declan Bailey"] = "GB-ENG",
                ["Darryl Pilgrim"] = "GB-ENG", ["Connor Scutt"] = "GB-ENG", ["Tom Sykes"] = "GB-ENG",
                ["Bradley Brooks"] = "GB-ENG", ["Joe Hunt"] = "GB-ENG", ["Pat Scurfield"] = "GB-ENG",
                ["Ben Townley"] = "GB-ENG", ["Neil Duff"] = "GB-ENG", ["Ross Montgomery"] = "GB-ENG",
                ["Andy Hamilton"] = "GB-ENG", ["Darren Webster"] = "GB-ENG", ["Adrian Lewis"] = "GB-ENG",
                ["Steve Beaton"] = "GB-ENG", ["Stephen Burton"] = "GB-ENG",
                ["Ryan Joyce"] = "GB-ENG", ["Martin Lukeman"] = "GB-ENG", ["Justin Hood"] = "GB-ENG",
                                ["Brentford"] = "GB-ENG",
            
                // Scotland (GB-SCT)
                ["Gary Anderson"] = "GB-SCT", ["Peter Wright"] = "GB-SCT", ["John Henderson"] = "GB-SCT",
                                ["Robert Thornton"] = "GB-SCT", ["Alan Soutar"] = "GB-SCT",
                ["Lorraine Hyde"] = "GB-SCT", ["Mitchell Lawrie"] = "GB-SCT",
            
                // Wales (GB-WLS)
                ["Gerwyn Price"] = "GB-WLS", ["Jonny Clayton"] = "GB-WLS", ["Nick Kenny"] = "GB-WLS",
                ["Jim Williams"] = "GB-WLS", ["Jonathan Worsley"] = "GB-WLS", ["Lewy Williams"] = "GB-WLS",
            
                // Northern Ireland (GB-NIR)
                ["Daryl Gurney"] = "GB-NIR", ["Brendan Dolan"] = "GB-NIR", ["Mickey Mansell"] = "GB-NIR",
                ["Kyle McKinstry"] = "GB-NIR", ["Gavin Carlin"] = "GB-NIR",
            
                // Netherlands (NL)
                ["Michael van Gerwen"] = "NL", ["Gian van Veen"] = "NL", ["Danny Noppert"] = "NL",
                ["Dirk van Duijvenbode"] = "NL", ["Jermaine Wattimena"] = "NL", ["Raymond van Barneveld"] = "NL",
                                ["Moreno Blom"] = "NL", ["Anca Zijlstra"] = "NL", ["Ron Meulenkamp"] = "NL", ["Aileen de Graaf"] = "NL",
                ["Wessel Nijman"] = "NL", ["Kevin Doets"] = "NL", ["Christian Kist"] = "NL",
                ["Richard Veenstra"] = "NL", ["Alexander Merkx"] = "NL", ["Maik Kuivenhoven"] = "NL",
                ["Niels Zonneveld"] = "NL", ["Berry Pater"] = "NL", ["Jitse Van der Wal"] = "NL",
                ["Corne Groeneveld"] = "NL", ["Martijn Dragt"] = "NL", ["Martijn Kleermaker"] = "NL",
                ["Vincent van der Voort"] = "NL", ["Berry van Peer"] = "NL",
                                ["Emine Dursun"] = "TR", ["Zehra Gemi"] = "TR",
            
                // Australia (AU)
                ["Damon Heta"] = "AU", ["Simon Whitlock"] = "AU",
            
                // New Zealand (NZ)
                ["Haupai Puha"] = "NZ", ["Mitchell Clegg"] = "NZ", ["Mark Cleaver"] = "NZ",
            
                // Belgium (BE)
                ["Mike De Decker"] = "BE", ["Dimitri Van den Bergh"] = "BE", ["Kim Huybrechts"] = "BE",
            
                // Germany (DE)
                ["Martin Schindler"] = "DE", ["Ricardo Pietreczko"] = "DE", ["Florian Hempel"] = "DE",
                ["Gabriel Clemens"] = "DE", ["Niko Springer"] = "DE", ["Max Hopp"] = "DE", ["Irina Armstrong"] = "DE",
                ["Carsten Hoffmann"] = "DE", ["Niko Chamil"] = "DE", ["Stefan Schroder"] = "DE",
            
                // Poland (PL)
                ["Krzysztof Ratajski"] = "PL", ["Sebastian Bialecki"] = "PL",
            
                // Austria (AT)
                ["Mensur Suljovic"] = "AT", ["Rowby-John Rodriguez"] = "AT", ["Jerome Shipley"] = "AT",
            
                                // Scotland (GB-SCT)
                                ["Gary Anderson"] = "GB-SCT", ["Peter Wright"] = "GB-SCT",
                                ["John Henderson"] = "GB-SCT", ["Alan Soutar"] = "GB-SCT",
                                ["Lorraine Hyde"] = "GB-SCT", ["Mitchell Lawrie"] = "GB-SCT",
                
                                // Wales (GB-WLS)
                                ["Gerwyn Price"] = "GB-WLS", ["Jonny Clayton"] = "GB-WLS", ["Nick Kenny"] = "GB-WLS",
                                ["Jim Williams"] = "GB-WLS", ["Jonathan Worsley"] = "GB-WLS", ["Lewy Williams"] = "GB-WLS",
                                ["Rhian O'Sullivan"] = "GB-WLS",
                
                                // Northern Ireland (GB-NIR)
                                ["Daryl Gurney"] = "GB-NIR", ["Brendan Dolan"] = "GB-NIR", ["Mickey Mansell"] = "GB-NIR",
                                ["Kyle McKinstry"] = "GB-NIR", ["Gavin Carlin"] = "GB-NIR",
                
                                // Austria (AT)
                                ["Mensur Suljovic"] = "AT", ["Rowby-John Rodriguez"] = "AT", ["Jerome Shipley"] = "AT",
                
                                // Other countries
                                ["Michael van Gerwen"] = "NL", ["Gian van Veen"] = "NL", ["Danny Noppert"] = "NL",
                                ["Dirk van Duijvenbode"] = "NL", ["Jermaine Wattimena"] = "NL", ["Raymond van Barneveld"] = "NL",
                                ["Moreno Blom"] = "NL", ["Anca Zijlstra"] = "NL", ["Ron Meulenkamp"] = "NL", ["Aileen de Graaf"] = "NL",
                                ["Wessel Nijman"] = "NL", ["Kevin Doets"] = "NL", ["Christian Kist"] = "NL",
                                ["Richard Veenstra"] = "NL", ["Alexander Merkx"] = "NL", ["Maik Kuivenhoven"] = "NL",
                                ["Niels Zonneveld"] = "NL", ["Berry Pater"] = "NL", ["Jitse Van der Wal"] = "NL",
                                ["Corne Groeneveld"] = "NL", ["Martijn Dragt"] = "NL", ["Martijn Kleermaker"] = "NL",
                                ["Vincent van der Voort"] = "NL", ["Berry van Peer"] = "NL",
                                ["Emine Dursun"] = "TR", ["Zehra Gemi"] = "TR",
                                ["Damon Heta"] = "AU", ["Peter Jr"] = "AU", ["Simon Whitlock"] = "AU",
                                ["Haupai Puha"] = "NZ", ["Mitchell Clegg"] = "NZ", ["Mark Cleaver"] = "NZ",
                                ["Mike De Decker"] = "BE", ["Dimitri Van den Bergh"] = "BE", ["Kim Huybrechts"] = "BE",
                                ["Martin Schindler"] = "DE", ["Ricardo Pietreczko"] = "DE", ["Florian Hempel"] = "DE",
                                ["Gabriel Clemens"] = "DE", ["Niko Springer"] = "DE", ["Max Hopp"] = "DE", ["Irina Armstrong"] = "DE",
                                ["Sebastian Bialecki"] = "PL", ["Carsten Hoffmann"] = "DE", ["Niko Chamil"] = "DE",
                                ["Stefan Schroder"] = "DE",
                
                // Portugal (PT)
            ["Jose de Sousa"] = "PT",
            
                // Sweden (SE)
                ["Jeffrey de Graaf"] = "SE", ["Dennis Nilsson"] = "SE",
            
                // Ireland (IE)
                ["Keane Barry"] = "IE", ["William O'Connor"] = "IE", ["Joey Lynaugh"] = "IE",
            
                // Singapore (SG)
                ["Terry Tan"] = "SG",
            
                // Italy (IT)
                ["Franko Giuliani"] = "IT", ["Aurora Fochesato"] = "IT",
            
                // Canada (CA)
                ["Jeff Smith"] = "CA", ["Steph Clarke"] = "CA",
            
                // United States (US)
                ["Leonard Gates"] = "US", ["Cali West"] = "US",
            
                // Finland (FI)
                ["Petri Rasmus"] = "FI",
            
                // Japan (JP)
                ["Ryusei Azemoto"] = "JP", ["Mayumi Ouchi"] = "JP",
            
                // Spain (ES)
                ["Cristo Reyes"] = "ES",
            
                // Lithuania (LT)
                ["Darius Labanauskas"] = "LT",
            
                // Czech Republic (CZ)
                ["Karel Sedlacek"] = "CZ",
            
                // Croatia (HR)
                ["Boris Krcmar"] = "HR",
            
                // Latvia (LV)
                                ["Madars Razma"] = "LV",

                                // Additional England players
                                ["Ronnie Baxter"] = "GB-ENG", ["Steve Brown"] = "GB-ENG", ["Phil Taylor"] = "GB-ENG",
                                ["Raymond Smith"] = "GB-ENG", ["Tony O'Shea"] = "GB-ENG", ["Garry Thompson"] = "GB-ENG",
                                ["Jamie Caven"] = "GB-ENG", ["Ricky Evans"] = "GB-ENG", ["James Richardson"] = "GB-ENG",
                                ["Nathan Girvan"] = "GB-ENG", ["Adam Lipscombe"] = "GB-ENG", ["Adam Warner"] = "GB-ENG",
                                ["Adam Paxton"] = "GB-ENG", ["Jamie Hughes"] = "GB-ENG", ["Ian White"] = "GB-ENG",
                                ["Keegan Brown"] = "GB-ENG", ["Neil Duff"] = "GB-ENG", ["Ross Montgomery"] = "GB-ENG",
                                ["Richard North"] = "GB-ENG", ["Andy Hamilton"] = "GB-ENG", ["Darren Webster"] = "GB-ENG",
                                ["Adrian Lewis"] = "GB-ENG", ["Steve Beaton"] = "GB-ENG",

        return countries.TryGetValue(playerName.Trim(), out var countryCode) ? countryCode : null;
    }

    private static string MatchKey(DartsMatch match)
    {
        var player1 = match.Player1.Trim();
        var player2 = match.Player2.Trim();
        return string.Compare(player1, player2, StringComparison.OrdinalIgnoreCase) <= 0
            ? $"{player1}|{player2}"
            : $"{player2}|{player1}";
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
    private const string UkFeedUrl = "https://epgshare01.online/epgshare01/epg_ripper_UK1.xml.gz";
    private const string NetherlandsFeedUrl = "https://epgshare01.online/epgshare01/epg_ripper_NL1.xml.gz";
    private const string BelgiumFeedUrl = "https://epgshare01.online/epgshare01/epg_ripper_BE2.xml.gz";
    private const int MaxCompressedBytes = 32 * 1024 * 1024;
    private const int MaxUkCompressedBytes = 4 * 1024 * 1024;
    private const int MaxNetherlandsCompressedBytes = 4 * 1024 * 1024;
    private const int MaxBelgiumCompressedBytes = 12 * 1024 * 1024;
    private const long MaxXmlCharacters = 512_000_000;
    private static readonly HttpClient Client = new(new HttpClientHandler
    {
        AutomaticDecompression = DecompressionMethods.None
    })
    {
        Timeout = TimeSpan.FromSeconds(90)
    };

    public static Task<DartsSchedule> LoadAsync(CancellationToken cancellationToken) =>
        LoadFeedAsync(
            FeedUrl,
            "deswird.org XMLTV · GuideFull",
            "D/A/CH laut Quelle; weitere europäische Gebiete sind in diesem Feed nicht ausgewiesen",
            MaxCompressedBytes,
            cancellationToken);

    public static Task<DartsSchedule> LoadUkAsync(CancellationToken cancellationToken) =>
        LoadFeedAsync(
            UkFeedUrl,
            "EPGSHARE01 XMLTV · UK1",
            "Vereinigtes Königreich; Free-TV- und Pay-TV-Kanäle laut UK1-Kanalliste",
            MaxUkCompressedBytes,
            cancellationToken);

    public static Task<DartsSchedule> LoadNetherlandsAsync(CancellationToken cancellationToken) =>
        LoadFeedAsync(
            NetherlandsFeedUrl,
            "EPGSHARE01 XMLTV · NL1",
            "Niederlande; Kanäle laut NL1-Kanalliste",
            MaxNetherlandsCompressedBytes,
            cancellationToken);

    public static Task<DartsSchedule> LoadBelgiumAsync(CancellationToken cancellationToken) =>
        LoadFeedAsync(
            BelgiumFeedUrl,
            "EPGSHARE01 XMLTV · BE2",
            "Belgien; Kanäle laut BE2-Kanalliste",
            MaxBelgiumCompressedBytes,
            cancellationToken);

    private static async Task<DartsSchedule> LoadFeedAsync(
        string feedUrl,
        string sourceName,
        string scope,
        int maxCompressedBytes,
        CancellationToken cancellationToken)
    {
        using var response = await Client.GetAsync(
            feedUrl,
            HttpCompletionOption.ResponseHeadersRead,
            cancellationToken);
        response.EnsureSuccessStatusCode();

        if (response.Content.Headers.ContentLength is long contentLength && contentLength > maxCompressedBytes)
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
                sourceName,
                feedUrl,
                DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture),
                scope),
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
        channel = NormalizeChannelLabel(channelId, channel);
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
                    if (events.ContainsKey(key))
                    {
                        return;
                    }
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
                        if (events.ContainsKey(key))
                        {
                            return;
                        }
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

    private static string NormalizeChannelLabel(string channelId, string channel) =>
        channelId.ToLowerInvariant() switch
        {
            "skysp+.uk" => "Sky Sports+",
            "skysp+hd.uk" => "Sky Sports+ HD",
            "skyspmainevhd.uk" => "Sky Sports Main Event HD",
            "skysp.mix.hd.uk" => "Sky Sports Mix HD",
            _ => channel
        };

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
        var match = Regex.Match(channelId, @"(?:^|[.\-_])(de|at|ch|uk|gb|nl|be|us)(?:$|[.\-_])", RegexOptions.IgnoreCase);
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
            "nl" => "Niederlande",
            "be" => "Belgien",
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
