# Dartsview

Dartsview ist eine lokale Web-App mit einem 14-Tage-Spielplan für Darts-Sessions und TV-Sendungen sowie einem Dartskalender für Turniere der kommenden zwei Monate. Sie zeigt Senderangaben aus dem EPG sowie Runde, Spielort und Uhrzeiten, wenn die jeweilige Quelle sie veröffentlicht. Fehlende Angaben werden nicht erraten.

## Starten

Im Projektordner ausführen:

```powershell
dotnet run -- --urls http://localhost:5080
```

Danach `http://localhost:5080` im Browser öffnen. Beim Laden der Seite ruft die App die D/A/CH- und UK-XMLTV-GZIP-Feeds sowie den zusätzlichen Turnierkalender automatisch ab. Der Server cached jede Quelle zwei Stunden; die App fragt sie ebenfalls alle zwei Stunden automatisch erneut ab. Eine manuelle Aktualisierung ist zusätzlich möglich.

## EPG-Quelle und Abdeckung

Für D/A/CH-TV-Sendungen verwendet die App `https://deswird.org/iptv/GuideFull.xml.gz`. Die Quellseite beschreibt diesen Feed als D/A/CH-Guide; er weist keine vollständige Abdeckung aller europäischen Länder aus.

Für englische Sender wird zusätzlich der UK1-XMLTV-Feed von [EPGSHARE01](https://epgshare01.online/epgshare01/epg_ripper_UK1.xml.gz) geladen. Seine Kanalliste enthält Free-TV und Pay-TV, darunter Sky Sports, TNT Sports und Premier Sports. Laut Anbieter ist der EPG für legale Nutzung vorgesehen; der Feed liefert Programmdaten, keine Streams. Die Abdeckung und Programminformationen können unvollständig sein.

Zusätzlich liest der Server den Darts1.de-Kalender unter `https://www.darts1.de/termine/termine.php` für die dort aufgeführten PDC-, WDF-, DDV- und DSAB-Turniere. Im Dartskalender werden veröffentlichte Sessions und Runden unter anderem für die Players Championship Finals, die Lakeside-WDF-WM, die PDC-WM und die Bahrain Darts Masters ergänzt. Die zusätzlichen Kalenderdaten enthalten keine bestätigten Senderangaben. Diese Abdeckung entspricht dem veröffentlichten Darts1-Kalender und ist keine Garantie für jedes Darts-Turnier in Europa. Beide Quellen werden zwei Stunden zwischengespeichert.

Sender aus beiden EPG-Feeds werden einem Turnier nur bei übereinstimmendem Turniernamen und Veranstaltungstag zugeordnet. Auf den Turnierkarten erscheinen Deutschland, Österreich, Schweiz und England/UK; „keine EPG-Angabe“ bedeutet, dass der jeweilige Feed für dieses Event und Gebiet keinen Sender nennt. Die App leitet daraus keine Übertragungsrechte oder zusätzliche Sender ab. Beide EPG-Feeds werden unabhängig geladen und zwischengespeichert, damit ein Feed-Ausfall den jeweils anderen nicht blockiert.

Veröffentlichte Paarungen erscheinen direkt im 14-Tage-Spielplan. Bei jeder Paarung steht der Sessionbeginn (zum Beispiel „Session ab 13:45“); das ist nicht die bestätigte Anwurfzeit dieses einzelnen Spiels. Für noch nicht terminierte Paarungen bleibt die Anwurfzeit als offen markiert. Zeiten werden nicht geschätzt.

Die App prüft keine Verbreitungsrechte der Sender. Angaben im EPG sind keine Bestätigung, dass ein Programm in jedem Gebiet empfangbar oder lizenziert ist.

## Android-Test-APK

Das Android-Projekt verwendet dieselben Feed-Parser und Frontend-Dateien wie die Web-App. Zum lokalen Bauen:

```powershell
dotnet workload install android
dotnet publish .\android\Dartsview.Android.csproj -c Release -f net8.0-android
```

Die APK liegt anschließend unter `android\bin\Release\net8.0-android\de.toenizz.dartsview-Signed.apk`. GitHub Releases mit einem `v*-test`-Tag werden automatisch gebaut und als Test-APK angehängt.

Test-APKs sind mit dem Android-Debug-Schlüssel signiert. Sie sind nicht für den Play Store oder als dauerhaft aktualisierbare Installation gedacht; spätere Builds können einen anderen Schlüssel verwenden. Für eine dauerhafte Verteilung muss ein eigener privater Release-Schlüssel eingerichtet werden.
