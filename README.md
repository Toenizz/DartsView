# Dartsview

Dartsview ist eine lokale Web-App mit einem 14-Tage-Spielplan für Darts-Sessions und TV-Sendungen sowie einem Dartskalender für Turniere der kommenden zwei Monate. Sie zeigt Senderangaben aus dem EPG sowie Runde, Spielort und Uhrzeiten, wenn die jeweilige Quelle sie veröffentlicht. Fehlende Angaben werden nicht erraten.

## Starten

Im Projektordner ausführen:

```powershell
dotnet run -- --urls http://localhost:5080
```

Danach `http://localhost:5080` im Browser öffnen. Beim Laden der Seite ruft die App den XMLTV-GZIP-Feed und den zusätzlichen Turnierkalender automatisch ab. Der Server cached beide Quellen zwei Stunden; die App fragt sie ebenfalls alle zwei Stunden automatisch erneut ab. Eine manuelle Aktualisierung ist zusätzlich möglich.

## EPG-Quelle und Abdeckung

Die App verwendet `https://deswird.org/iptv/GuideFull.xml.gz` für TV-Sendungen. Die Quellseite beschreibt diesen Feed als D/A/CH-Guide; er weist keine vollständige Abdeckung aller europäischen Länder aus.

Zusätzlich liest der Server den Darts1.de-Kalender unter `https://www.darts1.de/termine/termine.php` für die dort aufgeführten PDC-, WDF-, DDV- und DSAB-Turniere. Im Dartskalender werden veröffentlichte Sessions und Runden unter anderem für die Players Championship Finals, die Lakeside-WDF-WM, die PDC-WM und die Bahrain Darts Masters ergänzt. Die zusätzlichen Kalenderdaten enthalten keine bestätigten Senderangaben. Diese Abdeckung entspricht dem veröffentlichten Darts1-Kalender und ist keine Garantie für jedes Darts-Turnier in Europa. Beide Quellen werden zwei Stunden zwischengespeichert.

Die App prüft keine Verbreitungsrechte der Sender. Angaben im EPG sind keine Bestätigung, dass ein Programm in jedem Gebiet empfangbar oder lizenziert ist.

## JSON-Import und Datenformat

Alternativ kann die App JSON über **Spielplan laden** importieren oder einen JSON-Endpunkt über **Feed verbinden** angeben. Das Format steht in [`wwwroot/schedule.template.json`](./wwwroot/schedule.template.json). `source` enthält Quelle, Abrufzeit und optional Abdeckung. Jedes Element in `events` benötigt ID, Turnier, Runde/Phase und Startzeit mit Zeitzone. `stop`, Veranstaltungsort, Stadt, Land, Paarung und Sender sind optional. Sender stehen in `broadcasts` und können nach Gebiet differenziert werden.

Bei externen JSON-Feeds muss der Anbieter CORS-Anfragen erlauben. Die App speichert die Feed-URL lokal im Browser; importierte Dateien werden nicht hochgeladen.

## Android-Test-APK

Das Android-Projekt verwendet dieselben Feed-Parser und Frontend-Dateien wie die Web-App. Zum lokalen Bauen:

```powershell
dotnet workload install android
dotnet publish .\android\Dartsview.Android.csproj -c Release -f net8.0-android
```

Die APK liegt anschließend unter `android\bin\Release\net8.0-android\de.toenizz.dartsview-Signed.apk`. GitHub Releases mit einem `v*-test`-Tag werden automatisch gebaut und als Test-APK angehängt.

Test-APKs sind mit dem Android-Debug-Schlüssel signiert. Sie sind nicht für den Play Store oder als dauerhaft aktualisierbare Installation gedacht; spätere Builds können einen anderen Schlüssel verwenden. Für eine dauerhafte Verteilung muss ein eigener privater Release-Schlüssel eingerichtet werden.
