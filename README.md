# Dartsview

Dartsview ist eine lokale Web-App mit einem 14-Tage-Spielplan für Darts-Sessions und TV-Sendungen sowie einem Dartskalender für Turniere der kommenden zwei Monate. Sie zeigt Senderangaben aus dem EPG sowie Runde, Spielort und Uhrzeiten, wenn die jeweilige Quelle sie veröffentlicht. Fehlende Angaben werden nicht erraten.

## Starten

Im Projektordner ausführen:

```powershell
dotnet run -- --urls http://localhost:5080
```

Danach `http://localhost:5080` im Browser öffnen. Beim Laden der Seite ruft die App die D/A/CH-, UK-, niederländischen und belgischen XMLTV-GZIP-Feeds sowie den zusätzlichen Turnierkalender automatisch ab. Die EPG-Feeds werden zwei Stunden zwischengespeichert. Der Turnierkalender wird außerhalb von Spieltagen alle zwei Stunden und an Spieltagen etwa jede Minute aktualisiert; bei Rückkehr zur App wird ebenfalls neu geladen.

## EPG-Quelle und Abdeckung

Für D/A/CH-TV-Sendungen verwendet die App `https://deswird.org/iptv/GuideFull.xml.gz`. Die Quellseite beschreibt diesen Feed als D/A/CH-Guide; er weist keine vollständige Abdeckung aller europäischen Länder aus.

Für englische Sender wird zusätzlich der UK1-XMLTV-Feed von [EPGSHARE01](https://epgshare01.online/epgshare01/epg_ripper_UK1.xml.gz) geladen. Seine Kanalliste enthält Free-TV und Pay-TV, darunter Sky Sports, TNT Sports und Premier Sports. Laut Anbieter ist der EPG für legale Nutzung vorgesehen; der Feed liefert Programmdaten, keine Streams. Die Abdeckung und Programminformationen können unvollständig sein.

Für die Niederlande wird zusätzlich der NL1-XMLTV-Feed von [EPGSHARE01](https://epgshare01.online/epgshare01/epg_ripper_NL1.xml.gz) ausgewertet. Er enthält niederländische Free-TV- und Pay-TV-Kanäle, darunter Viaplay. Angezeigt werden nur Darts-Programme, die der Feed tatsächlich aufführt und die sich einem Turnier und dessen Veranstaltungstagen zuordnen lassen; fehlende Listings werden nicht aus Übertragungsrechten abgeleitet.

Für Belgien wird zusätzlich der BE2-XMLTV-Feed von [EPGSHARE01](https://epgshare01.online/epgshare01/epg_ripper_BE2.xml.gz) ausgewertet. Er wird unabhängig geladen und enthält belgische Programme laut Kanalliste. Im aktuellen 14-Tage-Fenster war darin kein Darts-/PDC-Programm gelistet; daraus lässt sich nicht ableiten, dass ein Event nicht ausgestrahlt wird.

Zusätzlich liest der Server den Darts1.de-Kalender unter `https://www.darts1.de/termine/termine.php` für die dort aufgeführten PDC-, WDF-, DDV- und DSAB-Turniere. Im Dartskalender werden veröffentlichte Sessions, Paarungen und Spielstände unter anderem für die Players Championship Finals, die Lakeside-WDF-WM, die PDC-WM und die Bahrain Darts Masters ergänzt. Die zusätzlichen Kalenderdaten enthalten keine bestätigten Senderangaben. Diese Abdeckung entspricht dem veröffentlichten Darts1-Kalender und ist keine Garantie für jedes Darts-Turnier in Europa. Die Turnierquelle wird an Spieltagen alle 45 Sekunden und sonst zwei Stunden zwischengespeichert; die App fragt sie während einer Session ungefähr jede Minute ab.

Sender aus den vier EPG-Feeds werden einem Turnier nur bei übereinstimmendem Turniernamen und Veranstaltungstag zugeordnet. Auf den Turnierkarten erscheinen Deutschland, Österreich, Schweiz, England/UK, die Niederlande und Belgien; „keine EPG-Angabe“ bedeutet, dass der jeweilige Feed für dieses Event und Gebiet keinen Sender nennt. Die App leitet daraus keine Übertragungsrechte oder zusätzliche Sender ab. Die EPG-Feeds werden unabhängig geladen und zwischengespeichert, damit ein Feed-Ausfall die anderen nicht blockiert. Die Prüfung weiterer europäischer Länderfeeds ist keine vollständige Abdeckung aller europäischen Sender; aus dem großen Gesamtfeed werden wegen seines Umfangs keine Programmdaten geladen.

Veröffentlichte Paarungen erscheinen direkt im 14-Tage-Spielplan. Wenn eine Quelle nur Sessionbeginn und Spielreihenfolge nennt, zeigt Dartsview unverbindliche Einzelstart-Schätzungen: Best-of-11-Spiele im Abstand von etwa 35 Minuten, längere Formate im Abstand von etwa 50 Minuten. Die erste Partie wird auf den offiziellen Sessionbeginn gesetzt; parallel angesetzte Spiele teilen sich einen Slot. Diese „ca.“-Zeiten können sich durch Spielverlauf und Verzögerungen verschieben und sind keine bestätigten Anwurfzeiten. Noch keiner Session zugeordnete Paarungen bleiben zeitlich offen.

Die App prüft keine Verbreitungsrechte der Sender. Angaben im EPG sind keine Bestätigung, dass ein Programm in jedem Gebiet empfangbar oder lizenziert ist.

## Android-Play-Store-Build

Das Android-Projekt verwendet dieselben Feed-Parser und Frontend-Dateien wie die Web-App und zielt auf Android 16 (API 36), wie es Google Play für neue Apps und Updates seit dem 31. August 2026 verlangt. Der Store-Build erzeugt ein signiertes Android App Bundle (AAB) mit dem vorhandenen Upload-Keystore; ein Debug-Schlüssel wird für diesen Build nicht verwendet. In der Play Console sollte Play App Signing aktiviert sein. Google signiert dann die an Nutzer verteilten Pakete mit dem App-Signaturschlüssel. Vor jedem Store-Upload muss der `ApplicationVersion`-Code höher als der zuletzt in der Play Console hochgeladene Code sein.

Der Repository-Stamm bleibt auf .NET 8; `android\global.json` wählt .NET 10 für Android-Builds. Für einen lokal debug-signierten Test-APK-Build in PowerShell in den Android-Ordner wechseln und ausführen:

```powershell
Set-Location android
dotnet publish .\Dartsview.Android.csproj -c Release -f net10.0-android36.0 -p:AndroidPackageFormat=apk
```

Der private Keystore und seine Passwörter dürfen nicht ins Repository eingecheckt oder hier im Chat geteilt werden. Für GitHub Actions unter **Settings → Secrets and variables → Actions** müssen diese Repository-Secrets gesetzt werden:

- `ANDROID_SIGNING_KEYSTORE_BASE64`: vorhandene `.jks`-/`.keystore`-Datei als einzeiliger Base64-Text
- `ANDROID_SIGNING_KEY_ALIAS`
- `ANDROID_SIGNING_KEY_PASSWORD`
- `ANDROID_SIGNING_STORE_PASSWORD`

Den Base64-Wert kannst du lokal in PowerShell erzeugen:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\secure\dartsview-upload.jks"))
```

Ein Tag wie `v0.1.6-playstore` startet den signierten AAB-Build und hängt `Dartsview-playstore.aab` an ein GitHub Release an. Dieses AAB kann anschließend in der Play Console hochgeladen werden; die Workflow-Automatisierung veröffentlicht es nicht selbst im Store. Der Play-Store-Build bricht explizit ab, wenn Keystore oder Zugangsdaten fehlen.

Für Gerätetests erzeugt ein `v*-test`-Tag separat eine APK mit Debug-Signatur. Diese Test-APK ist nicht für den Play Store geeignet und lässt sich nicht zuverlässig über eine Play-Store-Installation aktualisieren.
