using Android.App;
using Android.Content;
using Android.Content.PM;
using Android.OS;
using Android.Webkit;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;

namespace Dartsview.Android;

[Activity(
    Label = "Dartsview",
    MainLauncher = true,
    Exported = true,
    Theme = "@android:style/Theme.Material.Light.NoActionBar",
    ConfigurationChanges = ConfigChanges.Orientation | ConfigChanges.ScreenSize)]
public sealed class MainActivity : Activity
{
    private const string AssetOrigin = "appassets.androidplatform.net";
    private const string BaseUrl = "https://" + AssetOrigin + "/";

    protected override void OnCreate(Bundle? savedInstanceState)
    {
        base.OnCreate(savedInstanceState);

        var browser = new WebView(this);
        browser.Settings.JavaScriptEnabled = true;
        browser.Settings.DomStorageEnabled = true;
        browser.Settings.AllowFileAccess = false;
        browser.Settings.AllowContentAccess = false;
        browser.SetWebViewClient(new DartsviewWebViewClient(this));
        SetContentView(browser);

        var assets = Assets ?? throw new InvalidOperationException("Android assets are unavailable.");
        using var stream = assets.Open("wwwroot/index.html");
        using var reader = new StreamReader(stream, Encoding.UTF8);
        browser.LoadDataWithBaseURL(BaseUrl, reader.ReadToEnd(), "text/html", "UTF-8", null);
    }
}

internal sealed class DartsviewWebViewClient : WebViewClient
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(2);
    private static readonly ConcurrentDictionary<string, CachedFeed> Cache = new(StringComparer.Ordinal);
    private static readonly ConcurrentDictionary<string, SemaphoreSlim> Locks = new(StringComparer.Ordinal);
    private readonly global::Android.Content.Res.AssetManager assets;

    public DartsviewWebViewClient(Context context)
    {
        assets = context.Assets ?? throw new InvalidOperationException("Android assets are unavailable.");
    }

    public override WebResourceResponse? ShouldInterceptRequest(WebView? view, IWebResourceRequest? request)
    {
        var uri = request?.Url;
        if (uri is null || !string.Equals(uri.Host, "appassets.androidplatform.net", StringComparison.OrdinalIgnoreCase))
        {
            return base.ShouldInterceptRequest(view, request);
        }

        var path = Uri.UnescapeDataString(uri.Path ?? string.Empty).TrimStart('/');
        if (path.Equals("api/schedule", StringComparison.OrdinalIgnoreCase))
        {
            return GetFeedResponse("xmltv", XmltvFeed.LoadAsync);
        }

        if (path.Equals("api/tournament-events", StringComparison.OrdinalIgnoreCase))
        {
            return GetFeedResponse("tournaments", Darts1Feed.LoadAsync);
        }

        if (path.Split('/').Any(segment => segment is "." or ".."))
        {
            return ErrorResponse(404, "Asset not found.");
        }

        try
        {
            var assetPath = string.IsNullOrEmpty(path) ? "wwwroot/index.html" : $"wwwroot/{path}";
            var asset = assets.Open(assetPath);
            return new WebResourceResponse(ContentTypeFor(path), "UTF-8", asset);
        }
        catch (Java.IO.FileNotFoundException)
        {
            return ErrorResponse(404, "Asset not found.");
        }
    }

    private static WebResourceResponse GetFeedResponse(
        string key,
        Func<CancellationToken, Task<DartsSchedule>> load)
    {
        try
        {
            var payload = GetJsonAsync(key, load).GetAwaiter().GetResult();
            return JsonResponse(payload);
        }
        catch (TaskCanceledException exception)
        {
            global::Android.Util.Log.Error("Dartsview", exception.Message);
            return ErrorResponse(504, "The schedule source timed out.");
        }
        catch (HttpRequestException exception)
        {
            global::Android.Util.Log.Error("Dartsview", exception.Message);
            return ErrorResponse(502, "The schedule source is unavailable.");
        }
        catch (InvalidDataException exception)
        {
            global::Android.Util.Log.Error("Dartsview", exception.Message);
            return ErrorResponse(502, "The schedule source returned invalid data.");
        }
        catch (System.Xml.XmlException exception)
        {
            global::Android.Util.Log.Error("Dartsview", exception.Message);
            return ErrorResponse(502, "The XMLTV source could not be parsed.");
        }
    }

    private static async Task<string> GetJsonAsync(
        string key,
        Func<CancellationToken, Task<DartsSchedule>> load)
    {
        if (Cache.TryGetValue(key, out var cached) && DateTimeOffset.UtcNow - cached.RetrievedAt < CacheDuration)
        {
            return cached.Json;
        }

        var gate = Locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await gate.WaitAsync();
        try
        {
            if (Cache.TryGetValue(key, out cached) && DateTimeOffset.UtcNow - cached.RetrievedAt < CacheDuration)
            {
                return cached.Json;
            }

            var schedule = await load(CancellationToken.None);
            var json = JsonSerializer.Serialize(schedule, JsonOptions);
            Cache[key] = new CachedFeed(json, DateTimeOffset.UtcNow);
            return json;
        }
        finally
        {
            gate.Release();
        }
    }

    private static WebResourceResponse JsonResponse(string json) =>
        new("application/json", "UTF-8", new MemoryStream(Encoding.UTF8.GetBytes(json)));

    private static WebResourceResponse ErrorResponse(int statusCode, string message)
    {
        var json = JsonSerializer.Serialize(new { title = message, status = statusCode }, JsonOptions);
        var headers = new Dictionary<string, string> { ["Cache-Control"] = "no-store" };
        var reason = statusCode == 404 ? "Not Found" : statusCode == 504 ? "Gateway Timeout" : "Bad Gateway";
        return new WebResourceResponse(
            "application/problem+json",
            "UTF-8",
            statusCode,
            reason,
            headers,
            new MemoryStream(Encoding.UTF8.GetBytes(json)));
    }

    private static string ContentTypeFor(string path) =>
        Path.GetExtension(path).ToLowerInvariant() switch
        {
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".json" => "application/json",
            ".svg" => "image/svg+xml",
            ".png" => "image/png",
            _ => "application/octet-stream"
        };

    private sealed record CachedFeed(string Json, DateTimeOffset RetrievedAt);
}
