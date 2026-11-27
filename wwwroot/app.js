console.log('[app.js] Script loaded, version 0.1.7.7');
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 14;
const CALENDAR_MONTHS = 2;
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: localTimeZone });
const dateTimeFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: localTimeZone });
const playerCountryCodes = {
  // England (GB-ENG)
  'Luke Littler': 'GB-ENG', 'Luke Humphries': 'GB-ENG', 'Michael Smith': 'GB-ENG',
  'Nathan Aspinall': 'GB-ENG', 'Chris Dobey': 'GB-ENG', 'Rob Cross': 'GB-ENG',
  'Stephen Bunting': 'GB-ENG', 'James Wade': 'GB-ENG', 'Dave Chisnall': 'GB-ENG',
  'Ryan Searle': 'GB-ENG', 'Ross Smith': 'GB-ENG', 'Joe Cullen': 'GB-ENG',
  'Cameron Menzies': 'GB-ENG', 'Callan Rydz': 'GB-ENG',
  'Andrew Gilding': 'GB-ENG', 'Ritchie Edhouse': 'GB-ENG', 'Scott Williams': 'GB-ENG',
  'Josh Rock': 'GB-ENG', 'Beau Greaves': 'GB-ENG', 'Charlie Manby': 'GB-ENG',
  'Henry Coates': 'GB-ENG', 'Tom Bissell': 'GB-ENG', 'Rob Owen': 'GB-ENG',
  'Luke Woodhouse': 'GB-ENG', 'James Hurrell': 'GB-ENG', 'Tommy Morris': 'GB-ENG',
  'Matt Clark': 'GB-ENG', 'David Davies': 'GB-ENG', 'Harry Lane': 'GB-ENG',
  'Declan Bailey': 'GB-ENG', 'Darryl Pilgrim': 'GB-ENG', 'Connor Scutt': 'GB-ENG',
  'Tom Sykes': 'GB-ENG', 'Bradley Brooks': 'GB-ENG', 'Joe Hunt': 'GB-ENG',
  'Pat Scurfield': 'GB-ENG', 'Ben Townley': 'GB-ENG', 'Cam Crabtree': 'GB-ENG',
  'Nathan Girvan': 'GB-ENG', 'Adam Lipscombe': 'GB-ENG', 'Adam Warner': 'GB-ENG',
  'Adam Paxton': 'GB-ENG', 'Jamie Hughes': 'GB-ENG', 'Ian White': 'GB-ENG',
  'Keegan Brown': 'GB-ENG', 'Neil Duff': 'GB-ENG', 'Ross Montgomery': 'GB-ENG',
  'Richard North': 'GB-ENG', 'Andy Hamilton': 'GB-ENG', 'Darren Webster': 'GB-ENG',
  'Adrian Lewis': 'GB-ENG', 'Steve Beaton': 'GB-ENG',
  'Stephen Burton': 'GB-ENG', 'Ryan Joyce': 'GB-ENG', 'Martin Lukeman': 'GB-ENG',
  'Justin Hood': 'GB-ENG', 'Brentford': 'GB-ENG',
  
  // Scotland (GB-SCT)
    'Gary Anderson': 'GB-SCT', 'Peter Wright': 'GB-SCT',
    'John Henderson': 'GB-SCT', 'Alan Soutar': 'GB-SCT',
  
  // Wales (GB-WLS)
  'Gerwyn Price': 'GB-WLS', 'Jonny Clayton': 'GB-WLS', 'Nick Kenny': 'GB-WLS',
  'Jim Williams': 'GB-WLS', 'Jonathan Worsley': 'GB-WLS', 'Lewy Williams': 'GB-WLS',
  
  // Northern Ireland (GB-NIR)
  'Daryl Gurney': 'GB-NIR', 'Brendan Dolan': 'GB-NIR', 'Mickey Mansell': 'GB-NIR',
  'Kyle McKinstry': 'GB-NIR', 'Gavin Carlin': 'GB-NIR',
  
  // Other countries
  'Michael van Gerwen': 'NL', 'Gian van Veen': 'NL', 'Danny Noppert': 'NL',
  'Dirk van Duijvenbode': 'NL', 'Jermaine Wattimena': 'NL', 'Raymond van Barneveld': 'NL',
  'Wessel Nijman': 'NL', 'Kevin Doets': 'NL', 'Christian Kist': 'NL',
  'Richard Veenstra': 'NL', 'Alexander Merkx': 'NL', 'Maik Kuivenhoven': 'NL',
  'Niels Zonneveld': 'NL', 'Berry Pater': 'NL', 'Jitse Van der Wal': 'NL',
  'Corne Groeneveld': 'NL', 'Martijn Dragt': 'NL', 'Martijn Kleermaker': 'NL',
  'Vincent van der Voort': 'NL', 'Berry van Peer': 'NL',
  
  'Damon Heta': 'AU', 'Peter Jr': 'AU', 'Simon Whitlock': 'AU', 'Haupai Puha': 'NZ',
  'Mitchell Clegg': 'NZ',
  
  'Mike De Decker': 'BE', 'Dimitri Van den Bergh': 'BE', 'Kim Huybrechts': 'BE',
  
  'Martin Schindler': 'DE', 'Ricardo Pietreczko': 'DE', 'Florian Hempel': 'DE',
  'Gabriel Clemens': 'DE', 'Niko Springer': 'DE', 'Max Hopp': 'DE',
  'Sebastian Bialecki': 'PL', 'Carsten Hoffmann': 'DE', 'Niko Chamil': 'DE',
  'Stefan Schroder': 'DE',
  
  'Krzysztof Ratajski': 'PL',
  
  'Mensur Suljovic': 'AT', 'Rowby-John Rodriguez': 'AT', 'Jerome Shipley': 'AT',
  
  'Jose de Sousa': 'PT',
  
  'Jeffrey de Graaf': 'SE', 'Dennis Nilsson': 'SE',
  
  'Keane Barry': 'IE', 'William O\'Connor': 'IE', 'Joey Lynaugh': 'IE',
  
  'Terry Tan': 'SG', 'Franko Giuliani': 'IT', 'Aurora Fochesato': 'IT',
  
  'Jeff Smith': 'CA', 'Steph Clarke': 'CA', 'Leonard Gates': 'US', 'Cali West': 'US',
  
  'Petri Rasmus': 'FI', 'Ryusei Azemoto': 'JP',
  
  'Cristo Reyes': 'ES', 'Darius Labanauskas': 'LT',
  
  'Karel Sedlacek': 'CZ', 'Boris Krcmar': 'HR',
  
  'Madars Razma': 'LV',
};
const playerWorldRanks = {
  'Luke Humphries': 1, 'Luke Littler': 2, 'Michael van Gerwen': 3,
  'Stephen Bunting': 4, 'Josh Rock': 5, 'James Wade': 6,
  'Gerwyn Price': 7, 'Chris Dobey': 8, 'Jonny Clayton': 9,
  'Nathan Aspinall': 10, 'Gary Anderson': 11, 'Rob Cross': 12,
  'Dave Chisnall': 13, 'Damon Heta': 14, 'Danny Noppert': 15,
  'Ross Smith': 16, 'Ryan Searle': 17, 'Peter Wright': 18,
  'Mike De Decker': 19, 'Dimitri Van den Bergh': 20,
  'Jermaine Wattimena': 21, 'Krzysztof Ratajski': 22,
  'Martin Schindler': 23, 'Michael Smith': 24, 'Gian van Veen': 25,
  'Wessel Nijman': 26, 'Dirk van Duijvenbode': 27,
  'Raymond van Barneveld': 28, 'Daryl Gurney': 29,
  'Ricardo Pietreczko': 30, 'Brendan Dolan': 31,
  'Cameron Menzies': 32, 'Kevin Doets': 33, 'Mensur Suljovic': 34,
  'Andrew Gilding': 35, 'Gabriel Clemens': 36, 'Joe Cullen': 37,
  'Ritchie Edhouse': 38, 'Scott Williams': 39,
  'Callan Rydz': 40, 'Niels Zonneveld': 41,
  'Niko Springer': 42, 'Kim Huybrechts': 43,
  'Alan Soutar': 44, 'Luke Woodhouse': 45,
  'Richard Veenstra': 46, 'Keane Barry': 47,
  'Jeffrey de Graaf': 48, 'William O\'Connor': 49,
  'Madars Razma': 50, 'Mickey Mansell': 51,
  'James Hurrell': 52, 'Karel Sedlacek': 53,
  'Florian Hempel': 54, 'Berry van Peer': 55,
  'Ryan Joyce': 56, 'Christian Kist': 57,
  'Ian White': 58, 'Jose de Sousa': 59,
  'Stephen Burton': 60, 'Connor Scutt': 61,
  'Rowby-John Rodriguez': 62, 'Simon Whitlock': 63,
  'Martin Lukeman': 64, 'Ross Montgomery': 65,
  'Darren Webster': 66, 'Steve Beaton': 67,
  'Robert Thornton': 68, 'Adrian Lewis': 69,
  'Neil Duff': 70, 'Andy Hamilton': 71,
  'Richard North': 72, 'Boris Krcmar': 73,
  'Leonard Gates': 74, 'Haupai Puha': 75,
  'Mitchell Clegg': 76, 'Vincent van der Voort': 77,
  'Martijn Kleermaker': 78, 'Martijn Dragt': 79,
  'Jamie Hughes': 80, 'Keegan Brown': 81,
  'Adam Paxton': 82, 'Adam Warner': 83,
  'Adam Lipscombe': 84, 'Nathan Girvan': 85,
  'Niko Chamil': 86, 'Ben Townley': 87,
  'Pat Scurfield': 88, 'Stefan Schroder': 89,
  'Steph Clarke': 90, 'Aurora Fochesato': 91,
  'Terry Tan': 92, 'Matt Clark': 93,
  'Dennis Nilsson': 94, 'Carsten Hoffmann': 95,
  'Tommy Morris': 96, 'Tom Bissell': 97,
  'Rob Owen': 98, 'Charlie Manby': 99,
  'Henry Coates': 100
};

  // Prize money (Order of Merit) in GBP - approximate values for top 100 players
  const playerPrizeMoney = {
    'Luke Humphries': 1250000, 'Luke Littler': 1100000, 'Michael van Gerwen': 950000,
    'Stephen Bunting': 750000, 'Josh Rock': 650000, 'James Wade': 600000,
    'Gerwyn Price': 580000, 'Chris Dobey': 550000, 'Jonny Clayton': 520000,
    'Nathan Aspinall': 500000, 'Gary Anderson': 480000, 'Rob Cross': 460000,
    'Dave Chisnall': 440000, 'Damon Heta': 420000, 'Danny Noppert': 400000,
    'Ross Smith': 380000, 'Ryan Searle': 360000, 'Peter Wright': 350000,
    'Mike De Decker': 340000, 'Dimitri Van den Bergh': 330000,
    'Jermaine Wattimena': 320000, 'Krzysztof Ratajski': 310000,
    'Martin Schindler': 300000, 'Michael Smith': 290000, 'Gian van Veen': 280000,
    'Wessel Nijman': 270000, 'Dirk van Duijvenbode': 260000,
    'Raymond van Barneveld': 250000, 'Daryl Gurney': 240000,
    'Ricardo Pietreczko': 230000, 'Brendan Dolan': 220000,
    'Cameron Menzies': 210000, 'Kevin Doets': 200000, 'Mensur Suljovic': 195000,
    'Andrew Gilding': 190000, 'Gabriel Clemens': 185000, 'Joe Cullen': 180000,
    'Ritchie Edhouse': 175000, 'Scott Williams': 170000,
    'Callan Rydz': 165000, 'Niels Zonneveld': 160000,
    'Niko Springer': 155000, 'Kim Huybrechts': 150000,
    'Alan Soutar': 145000, 'Luke Woodhouse': 140000,
    'Richard Veenstra': 135000, 'Keane Barry': 130000,
    'Jeffrey de Graaf': 125000, 'William O\'Connor': 120000,
    'Madars Razma': 115000, 'Mickey Mansell': 110000,
    'James Hurrell': 105000, 'Karel Sedlacek': 100000,
    'Florian Hempel': 95000, 'Berry van Peer': 90000,
    'Ryan Joyce': 85000, 'Christian Kist': 80000,
    'Ian White': 75000, 'Jose de Sousa': 70000,
    'Stephen Burton': 65000, 'Connor Scutt': 60000,
    'Rowby-John Rodriguez': 55000, 'Simon Whitlock': 50000,
    'Martin Lukeman': 48000, 'Ross Montgomery': 46000,
    'Darren Webster': 44000, 'Steve Beaton': 42000,
    'Robert Thornton': 40000, 'Adrian Lewis': 38000,
    'Neil Duff': 36000, 'Andy Hamilton': 34000,
    'Richard North': 32000, 'Boris Krcmar': 30000,
    'Leonard Gates': 28000, 'Haupai Puha': 26000,
    'Mitchell Clegg': 24000, 'Vincent van der Voort': 22000,
    'Martijn Kleermaker': 20000, 'Martijn Dragt': 19000,
    'Jamie Hughes': 18000, 'Keegan Brown': 17000,
    'Adam Paxton': 16000, 'Adam Warner': 15000,
    'Adam Lipscombe': 14000, 'Nathan Girvan': 13000,
    'Niko Chamil': 12000, 'Ben Townley': 11000,
    'Pat Scurfield': 10000, 'Stefan Schroder': 9500,
    'Steph Clarke': 9000, 'Aurora Fochesato': 8500,
    'Terry Tan': 8000, 'Matt Clark': 7500,
    'Dennis Nilsson': 7000, 'Carsten Hoffmann': 6500,
    'Tommy Morris': 6000, 'Tom Bissell': 5500,
    'Rob Owen': 5000, 'Charlie Manby': 4500,
    'Henry Coates': 4000
  };

const eventDateFormat = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: localTimeZone
});
const broadcastRegions = [
  { label: 'Deutschland', territories: ['Deutschland'] },
  { label: 'Österreich', territories: ['Österreich'] },
  { label: 'Schweiz', territories: ['Schweiz'] },
  { label: 'England/UK', territories: ['England', 'UK', 'United Kingdom', 'Vereinigtes Königreich'] },
  { label: 'Niederlande', territories: ['Niederlande'] }
];
const storedFeedUrl = localStorage.getItem('dartsview-feed-url') || '';
const localApiUrl = location.protocol === 'http:' || location.protocol === 'https:' ? '/api/schedule' : '';
const xmltvFeedUrl = 'https://deswird.org/iptv/GuideFull.xml.gz';

// Tournament logo mapping - maps tournament names to logo URLs
const tournamentLogos = {
  'PDC': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Championship': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Darts-WM': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Darts Championship': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'WDF World Championship': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'WDF Dart-WM': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'PDC Players Championship Finals': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'Players Championship Finals': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Premier League': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Matchplay': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Grand Prix': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Grand Slam of Darts': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'Grand Slam of Darts': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC European Championship': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC UK Open': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Series Finals': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Cup of Darts': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Bahrain Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Dutch Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Nordic Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Australian Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC New Zealand Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC US Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Poland Darts Masters': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC EU Qualifying School': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC UK Qualifying School': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Challenge Tour': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Development Tour': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDPA World Championship Qualifikation': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC World Youth Championship': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Women\'s World Matchplay': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'PDC Women\'s Series': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'WDF World Masters': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'WDF Europe Cup': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'WDF Asia-Pacific Cup': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'WDF Americas Cup': 'https://www.darts1.de/bilder/termine/wdf.gif',
  'DDV German Masters': 'https://www.darts1.de/bilder/termine/ddv.gif',
  'DDV German Open': 'https://www.darts1.de/bilder/termine/ddv.gif',
  'DDV Ranglistenturnier': 'https://www.darts1.de/bilder/termine/ddv.gif',
  'DSAB Swiss Darts Open': 'https://www.darts1.de/bilder/termine/dsab.gif',
  'DSAB Masters of Masters': 'https://www.darts1.de/bilder/termine/dsab.gif',
  'DSAB Deutsche Meisterschaften': 'https://www.darts1.de/bilder/termine/dsab.gif',
  'Modus Super Series': 'https://www.darts1.de/bilder/termine/pdc.gif',
  'Modus Darts': 'https://www.darts1.de/bilder/termine/pdc.gif',
};

// Channel/Sender logo mapping for tournaments without specific competition logos
const channelLogos = {
  // German broadcasters
  'ProSieben': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/ProSieben_2014.svg/200px-ProSieben_2014.svg.png',
  'SAT.1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Sat.1_Logo_2017.svg/200px-Sat.1_Logo_2017.svg.png',
  'VOX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/VOX_%28ProSiebenSat.1%29_logo.svg/200px-VOX_%28ProSiebenSat.1%29_logo.svg.png',
  'RTL II': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/RTL_II_2021.svg/200px-RTL_II_2021.svg.png',
  'Kabel Eins': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Kabel_Eins_Logo.svg/200px-Kabel_Eins_Logo.svg.png',
  'Sport1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sport1_Logo_2019.svg/200px-Sport1_Logo_2019.svg.png',
  'SPORT 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Sport1_Logo_2019.svg/200px-Sport1_Logo_2019.svg.png',
  'DAZN': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/DAZN_Logo.svg/200px-DAZN_Logo.svg.png',
  'Eurosport': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Eurosport_logo_%282015%29.svg/200px-Eurosport_logo_%282015%29.svg.png',
  'ZDF': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/ZDF_logo.svg/200px-ZDF_logo.svg.png',

  // UK broadcasters
  'Channel 4': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Channel_4_%28OnDemand%29.svg/200px-Channel_4_%28OnDemand%29.svg.png',
  'ITV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/ITV_Logo.svg/200px-ITV_Logo.svg.png',
  'Sky Sports': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Sky_Sports_Logo.svg/200px-Sky_Sports_Logo.svg.png',

  // Dutch broadcasters
  'NPO 1': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Nederlandse_Publieke_Omroep_logo.svg/200px-Nederlandse_Publieke_Omroep_logo.svg.png',
  'Ziggo Sport': 'https://logo.clearbit.com/ziggosport.nl',
};


const state = {
  events: [],
  ukEvents: [],
  nlEvents: [],
  tournamentEvents: [],
  source: null,
  ukSource: null,
  nlSource: null,
  tournamentSource: null,
  search: '',
  country: '',
  tournament: '',
  activeTab: 'schedule',
  feedUrl: storedFeedUrl || localApiUrl,
  refreshError: '',
  ukError: '',
  nlError: '',
  tournamentError: ''
};

const elements = {
  dateRange: document.querySelector('#date-range'),
  dateRangeCaption: document.querySelector('#date-range-caption'),
  periodLabel: document.querySelector('#period-label'),
  scheduleHeading: document.querySelector('#schedule-heading'),
  schedulePanel: document.querySelector('#schedule-panel'),
  rankingPanel: document.querySelector('#ranking-panel'),
  rankingList: document.querySelector('#ranking-list'),
  rankingUpdated: document.querySelector('#ranking-updated'),
  viewSchedule: document.querySelector('#view-schedule'),
  viewCalendar: document.querySelector('#view-calendar'),
  viewRanking: document.querySelector('#view-ranking'),
  timezoneLabel: document.querySelector('#timezone-label'),
  scheduleTimezone: document.querySelector('#schedule-timezone'),
  statMatches: document.querySelector('#stat-matches'),
  statMatchesFoot: document.querySelector('#stat-matches-foot'),
  statTournaments: document.querySelector('#stat-tournaments'),
  statStatus: document.querySelector('#stat-status'),
  statUpdated: document.querySelector('#stat-updated'),
  search: document.querySelector('#search-input'),
  country: document.querySelector('#country-filter'),
  tournament: document.querySelector('#tournament-filter'),
  reset: document.querySelector('#reset-filters'),
  resultCount: document.querySelector('#result-count'),
  list: document.querySelector('#schedule-list'),
  empty: document.querySelector('#empty-state'),
  emptyTitle: document.querySelector('#empty-title'),
  emptyCopy: document.querySelector('#empty-copy')
};

function setPeriod() {
  const start = new Date();
  const scheduleEnd = new Date(start.getTime() + MAX_DAYS * DAY_MS);
  const end = new Date(start);
  const scheduleDateRange = `${formatTabDate(start)} - ${formatTabDate(scheduleEnd)}`;
  elements.viewSchedule.textContent = scheduleDateRange;
  elements.viewSchedule.setAttribute('aria-label', `Alle Termine, ${scheduleDateRange}`);
  if (state.activeTab === 'calendar') {
    const day = end.getDate();
    end.setDate(1);
    end.setMonth(end.getMonth() + CALENDAR_MONTHS);
    end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
    elements.dateRangeCaption.textContent = 'DEIN 2-MONATS-KALENDER';
    elements.periodLabel.textContent = 'NÄCHSTE 2 MONATE';
  } else {
    end.setTime(scheduleEnd.getTime());
    elements.dateRangeCaption.textContent = 'DEIN 14-TAGE-PLAN';
    elements.periodLabel.textContent = 'NÄCHSTE 14 TAGE';
  }
  elements.dateRange.textContent = `${dateFormat.format(start)} – ${dateFormat.format(end)}`;
  elements.timezoneLabel.textContent = localTimeZone.replaceAll('_', ' ');
  elements.scheduleTimezone.textContent = localTimeZone.replaceAll('_', ' ');
  document.querySelector('#footer-year').textContent = String(start.getFullYear());
}

function formatTabDate(date) {
  return `${date.getDate()}.${String(date.getMonth() + 1).padStart(2, '0')}.`;
}

function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
  } catch {
    return '';
  }
}

function getFeedRequestUrl(url) {
  if (url !== xmltvFeedUrl) return url;
  if (!localApiUrl) {
    throw new Error('Der XMLTV-GZIP-Feed muss über den lokalen Dartsview-Server geladen werden.');
  }
  return localApiUrl;
}

function validateSchedule(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.events)) {
    throw new Error('Das JSON muss ein Objekt mit einem events-Array enthalten.');
  }

  const events = payload.events.map((event, index) => {
    if (!event || typeof event !== 'object') {
      throw new Error(`Eintrag ${index + 1} ist kein gültiges Objekt.`);
    }

    const requiredText = ['id', 'tournament', 'stage', 'start'];
    for (const field of requiredText) {
      if (typeof event[field] !== 'string' || !event[field].trim()) {
        throw new Error(`Eintrag ${index + 1}: „${field}“ fehlt.`);
      }
    }

    const start = new Date(event.start);
    if (Number.isNaN(start.getTime()) || !/(Z|[+-]\d{2}:\d{2})$/i.test(event.start)) {
      throw new Error(`Eintrag ${index + 1}: „start“ braucht ein gültiges Datum mit Zeitzone.`);
    }

    const broadcasts = event.broadcasts === undefined ? [] : event.broadcasts;
    if (!Array.isArray(broadcasts) || broadcasts.some(item =>
      !item || typeof item.territory !== 'string' || !item.territory.trim() ||
      typeof item.channel !== 'string' || !item.channel.trim()
    )) {
      throw new Error(`Eintrag ${index + 1}: „broadcasts“ muss eine Liste aus Gebiet und Sender sein.`);
    }

    const matches = event.matches ?? [];
    for (const match of matches) {
      if (match.start !== undefined && match.start !== null &&
          (typeof match.start !== 'string' ||
           Number.isNaN(new Date(match.start).getTime()) ||
           !/(Z|[+-]\d{2}:\d{2})$/i.test(match.start))) {
        throw new Error(`Eintrag ${index + 1}: Eine Spielstartzeit braucht ein gültiges Datum mit Zeitzone.`);
      }
      if (match.isEstimated !== undefined && typeof match.isEstimated !== 'boolean') {
        throw new Error(`Eintrag ${index + 1}: „isEstimated“ muss ein boolescher Wert sein.`);
      }
      const hasScore1 = match.score1 !== undefined && match.score1 !== null;
      const hasScore2 = match.score2 !== undefined && match.score2 !== null;
      if (hasScore1 !== hasScore2 ||
          (hasScore1 && (!Number.isInteger(match.score1) || match.score1 < 0 ||
                         !Number.isInteger(match.score2) || match.score2 < 0))) {
        throw new Error(`Eintrag ${index + 1}: Ein Spielstand muss aus zwei gültigen Zahlen bestehen.`);
      }
      if (match.scoreStatus !== undefined && match.scoreStatus !== null &&
          !['live', 'finished'].includes(match.scoreStatus)) {
        throw new Error(`Eintrag ${index + 1}: „scoreStatus“ ist ungültig.`);
      }
    }

    const stop = event.stop ? new Date(event.stop) : null;
    if (stop && Number.isNaN(stop.getTime())) {
      throw new Error(`Eintrag ${index + 1}: „stop“ ist kein gültiges Datum.`);
    }

    return {
      ...event,
      start,
      stop,
      venue: typeof event.venue === 'string' ? event.venue : '',
      city: typeof event.city === 'string' ? event.city : '',
      country: typeof event.country === 'string' ? event.country : '',
      participants: typeof event.participants === 'string' ? event.participants : '',
      title: typeof event.title === 'string' ? event.title : '',
      kind: typeof event.kind === 'string' ? event.kind : 'broadcast',
      allDay: event.allDay === true,
      matches: matches.map(match => ({
        player1: match.player1.trim(),
        player2: match.player2.trim(),
              country1: typeof match.Country1 === 'string' ? match.Country1.trim().toUpperCase() : '',
              country2: typeof match.Country2 === 'string' ? match.Country2.trim().toUpperCase() : '',
        rank1: Number.isInteger(match.rank1) ? match.rank1 : null,
        rank2: Number.isInteger(match.rank2) ? match.rank2 : null,
        start: match.start ? new Date(match.start) : null,
        isEstimated: match.isEstimated === true,
        score1: match.score1 ?? null,
        score2: match.score2 ?? null,
        scoreStatus: match.scoreStatus ?? null
      })),
      timingNote: typeof event.timingNote === 'string' ? event.timingNote : '',
      sourceUrl: safeUrl(event.sourceUrl),
      broadcasts: broadcasts.map(item => ({
        territory: item.territory.trim(),
        channel: item.channel.trim(),
        url: safeUrl(item.url)
      }))
    };
  });

  const source = payload.source && typeof payload.source === 'object' ? payload.source : {};
  return {
    events,
    source: {
      name: typeof source.name === 'string' && source.name.trim() ? source.name.trim() : 'Unbenannte Quelle',
      url: safeUrl(source.url),
      retrievedAt: source.retrievedAt ? new Date(source.retrievedAt) : null,
      rightsReviewedAt: source.rightsReviewedAt ? new Date(source.rightsReviewedAt) : null,
      scope: typeof source.scope === 'string' ? source.scope : ''
    }
  };
}

function getAllEvents() {
  return [...getEpgEvents(), ...state.tournamentEvents];
}

function getEpgEvents() {
  return [...state.events, ...state.ukEvents, ...state.nlEvents];
}

function getLocalDateKey(date) {
  const parts = eventDateFormat.formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeTournamentName(value) {
  return value
    .toLocaleLowerCase('de')
    .replace(/\bdarts?[\s-]*(?:wm|weltmeisterschaft)\b/g, ' world championship ')
    .replace(/\b(?:pdc|wdf|ddv|dsab|darts?)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function matchesTournamentEvent(broadcastEvent, event) {
  const broadcastName = normalizeTournamentName(broadcastEvent.tournament);
  const eventName = normalizeTournamentName(event.tournament);
  if (!broadcastName || !eventName ||
      !(broadcastName === eventName || broadcastName.includes(eventName) || eventName.includes(broadcastName))) {
    return false;
  }

  const firstDay = getLocalDateKey(event.start);
  const lastDay = event.stop
    ? getLocalDateKey(new Date(event.stop.getTime() - 1))
    : firstDay;
  const broadcastDay = getLocalDateKey(broadcastEvent.start);
  return broadcastDay >= firstDay && broadcastDay <= lastDay;
}

function getEventBroadcasts(event) {
  const broadcasts = [...event.broadcasts];
  if (event.kind !== 'broadcast') {
    for (const broadcastEvent of getEpgEvents()) {
      if (broadcastEvent.id !== event.id && matchesTournamentEvent(broadcastEvent, event)) {
        broadcasts.push(...broadcastEvent.broadcasts);
      }
    }
  }

  const unique = new Map();
  for (const broadcast of broadcasts) {
    const key = `${broadcast.territory.toLocaleLowerCase('de')}|${broadcast.channel.toLocaleLowerCase('de')}`;
    if (!unique.has(key) || (!unique.get(key).url && broadcast.url)) {
      unique.set(key, broadcast);
    }
  }
  return [...unique.values()];
}

function displayTerritory(territory) {
  const labels = {
    'Deutschland': 'Deutschland',
    'Österreich': 'Österreich',
    'Schweiz': 'Schweiz',
    'Niederlande': 'Niederlande',
    'UK': 'UK',
    'England': 'England',
    'United Kingdom': 'UK',
    'Vereinigtes Königreich': 'UK'
  };
  return labels[territory] || territory;
}

function isInRange(event) {
  const now = new Date();
  const end = new Date(now);
  if (state.activeTab === 'calendar') {
    const day = end.getDate();
    end.setDate(1);
    end.setMonth(end.getMonth() + CALENDAR_MONTHS);
    end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
  } else {
    end.setTime(end.getTime() + MAX_DAYS * DAY_MS);
  }
  return (event.start >= now || (event.stop && event.stop > now)) && event.start <= end;
}

function getVisibleEvents(eventPool = getAllEvents().filter(isInRange)) {
  const query = state.search.trim().toLocaleLowerCase('de');
  return eventPool
    .filter(event => state.activeTab === 'calendar' || !state.country || getEventBroadcasts(event).some(item => item.territory === state.country))
    .filter(event => !state.tournament || event.tournament === state.tournament)
    .filter(event => {
      if (!query) return true;
      const searchable = [
        event.tournament, event.stage, event.venue, event.city, event.country,
        event.participants,
        ...event.matches.flatMap(match => [match.player1, match.player2]),
        ...getEventBroadcasts(event).flatMap(item => [item.channel, item.territory])
      ].join(' ').toLocaleLowerCase('de');
      return searchable.includes(query);
    })
    .sort((a, b) => a.start - b.start);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function countryCodeForPlayer(playerName, suppliedCode) {
  const code = (suppliedCode || '').trim().toUpperCase();
  
  // Handle UK constituent country codes (GB-ENG, GB-SCT, GB-WLS, GB-NIR)
  if (/^GB-[A-Z]{3}$/.test(code)) {
    return code;
  }
  
  // If supplied code is generic 'GB', ignore it and use player-specific code from playerCountryCodes
  // This ensures UK players get their correct constituent country flags (England, Scotland, Wales, Northern Ireland)
  if (code === 'GB') {
    return playerCountryCodes[playerName] || '';
  }
  
  // Handle standard 2-letter country codes
  if (/^[A-Z]{2}$/.test(code)) return code;
  
  return playerCountryCodes[playerName] || '';
}

function makeCountryFlag(code) {
  if (!code || typeof code !== 'string') return null;

  // Use flagcdn.com for official flag images
  // Handle UK constituent countries with their specific flags
  let flagCode = code.toLowerCase();
  
  // Map UK constituent country codes to flagcdn codes
  const ukFlagMap = {
    'GB-ENG': 'gb-eng',  // England - St George's Cross
    'GB-SCT': 'gb-sct',  // Scotland - St Andrew's Cross
    'GB-WLS': 'gb-wls',  // Wales - Welsh Dragon
    'GB-NIR': 'gb-nir',  // Northern Ireland - St Patrick's Saltire
    'GB': 'gb-eng'       // Default to England flag for generic GB
  };
  
  if (ukFlagMap[code]) {
    flagCode = ukFlagMap[code];
  } else if (!/^[A-Z]{2}(-[A-Z]{3})?$/.test(code)) {
    return null;
  }

  const img = document.createElement('img');
  img.src = `https://flagcdn.com/32x24/${flagCode}.png`;
  img.alt = code;
  img.title = code;
  img.classList.add('event-player-flag');
  img.setAttribute('aria-label', `Land: ${code}`);
  img.setAttribute('role', 'img');
  img.loading = 'lazy';
  img.width = 32;
  img.height = 24;
  return img;
}

function makePlayer(playerName, suppliedCode, suppliedRank) {
  const player = makeElement('span', 'event-player');
  const code = countryCodeForPlayer(playerName, suppliedCode);
  const rank = Number.isInteger(suppliedRank) ? suppliedRank : playerWorldRanks[playerName] || null;
  const flag = makeCountryFlag(code);
  if (flag) {
    flag.setAttribute('aria-label', `Land: ${code}`);
    flag.setAttribute('role', 'img');
    flag.setAttribute('title', code);
    player.append(flag);
  }
  player.append(makeElement('span', 'event-player-name', playerName));
  if (rank) {
    player.append(makeElement('span', 'event-player-rank', `(${rank})`));
  }
  return player;
}

function makeBroadcasts(event) {
  const container = makeElement('div', 'event-broadcasts');
  const broadcasts = getEventBroadcasts(event);
  const displayedTerritories = new Set();
  // Only show regions that have actual broadcasts
  const regionsWithBroadcasts = [];
  for (const region of broadcastRegions) {
    const regionalBroadcasts = broadcasts.filter(item => region.territories.includes(item.territory));
    if (regionalBroadcasts.length) {
      regionsWithBroadcasts.push({ region, regionalBroadcasts });
      for (const territory of region.territories) displayedTerritories.add(territory);
    }
  }

  for (const { region, regionalBroadcasts } of regionsWithBroadcasts) {
    for (const broadcast of regionalBroadcasts) {
      const label = `${region.label}: ${broadcast.channel}`;
      if (broadcast.url) {
        const link = makeElement('a', 'broadcast-chip', label);
        link.href = broadcast.url;
        link.target = '_blank';
        link.rel = 'noreferrer';
        container.append(link);
      } else {
        container.append(makeElement('span', 'broadcast-chip', label));
      }
    }
  }

  for (const broadcast of broadcasts) {
    if (displayedTerritories.has(broadcast.territory)) continue;
    container.append(makeElement('span', 'broadcast-chip', `${broadcast.territory}: ${broadcast.channel}`));
  }
  return container;
}

function makeEventCard(event) {
  const card = makeElement('article', 'event-card');
  card.tabIndex = 0;
  card.role = 'button';
  card.setAttribute('aria-label', `Turnier: ${event.tournament}. Klicken für Details.`);

  // Click handler for desktop/mouse users
  card.addEventListener('click', () => showEventDetails(event));
  // Focus handler for keyboard users
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showEventDetails(event);
    }
  });

  const time = makeElement('div', 'event-time');
  time.append(makeElement('strong', '', event.kind === 'draw'
    ? 'Offen'
    : event.allDay ? 'Ganztägig' : timeFormat.format(event.start)));
  time.append(makeElement('span', '', event.kind === 'draw'
    ? 'Spielzeit'
    : event.kind === 'session' ? 'Sessionbeginn' : event.allDay ? 'Turnierzeitraum' : localTimeZone.replaceAll('_', ' ')));

  const title = makeElement('div', 'event-title');
  title.append(makeElement('strong', '', event.title || event.tournament));
  if (event.matches.length) {
    const matchList = makeElement('ul', 'event-match-list');
    for (const match of event.matches) {
      const item = makeElement('li', 'event-match');
      const matchInfo = makeElement('span', 'event-match-info');
      if (match.score1 !== null && match.score2 !== null) {
        matchInfo.append(makeElement('span', 'event-match-score', `${match.score1}:${match.score2}`));
        if (match.scoreStatus === 'live') {
          matchInfo.append(makeElement('span', 'event-match-status event-match-status--live', 'LIVE'));
        } else if (match.scoreStatus === 'finished') {
          matchInfo.append(makeElement('span', 'event-match-status event-match-status--finished', 'Endstand'));
        }
      }
      matchInfo.append(makeElement('span', 'event-match-time', match.start && match.isEstimated
        ? `ca. ${timeFormat.format(match.start)}`
        : event.kind === 'draw' ? 'Anwurfzeit offen' : `Session ab ${timeFormat.format(event.start)}`));
      item.append(
              makePlayer(match.player1, match.Country1, match.rank1),
        makeElement('span', 'event-match-separator', '-'),
              makePlayer(match.player2, match.Country2, match.rank2),
        matchInfo
      );
      matchList.append(item);
    }
    title.append(matchList);
    if (event.timingNote) {
      title.append(makeElement('span', 'event-match-note', event.timingNote));
    }
  } else {
    title.append(makeElement('span', '', event.kind === 'tournament'
      ? 'Paarungen noch nicht veröffentlicht'
      : event.participants || 'Spielpaarung noch nicht veröffentlicht'));
  }
  title.append(makeBroadcasts(event));

  const stage = makeElement('div', 'event-stage');
  stage.append(makeElement('label', '', 'Runde / Phase'));
  stage.append(makeElement('span', '', event.stage));

  const venue = makeElement('div', 'event-venue');
  venue.append(makeElement('label', '', 'Austragungsort'));
  const place = [event.venue, event.city, event.country].filter(Boolean).join(', ');
  venue.append(makeElement('span', '', place || 'Im EPG nicht angegeben'));

  // Prize money and winner info
  const prizeInfo = makeElement('div', 'event-prize-info');
  // Check if we have prize money data for this tournament
  const tournamentPrizeMoney = getTournamentPrizeMoney(event.tournament);
  const lastWinner = getLastTournamentWinner(event.tournament);
  prizeInfo.append(makeElement('span', '', tournamentPrizeMoney || 'Preisgeld nicht angegeben'));
  if (lastWinner) {
    const winnerSpan = makeElement('span', 'event-last-winner', `Letzter Gewinner: ${lastWinner}`);
    prizeInfo.append(winnerSpan);
  }

  if (!event.allDay && event.stop && !Number.isNaN(event.stop.getTime())) {
    time.querySelector('strong').textContent += `–${timeFormat.format(event.stop)}`;
  }

  card.append(time, title, stage, venue, prizeInfo);
  if (event.sourceUrl) {
    const link = makeElement('a', 'event-link', '↗');
    link.href = event.sourceUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.setAttribute('aria-label', `Quelle für ${event.tournament} öffnen`);
    card.append(link);
  }
  return card;
}

// Show tournament details when event card is clicked
function showEventDetails(event) {
  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'event-details-modal';
  detailsDiv.innerHTML = `
    <div class="event-details-content">
      <h3>${event.tournament}</h3>
      <p><strong>Austragungsort:</strong> ${[event.venue, event.city, event.country].filter(Boolean).join(', ') || 'Nicht angegeben'}</p>
      <p><strong>Teilnehmerfeld:</strong> ${event.participants || 'Noch nicht veröffentlicht'}</p>
      <p><strong>Preisgeld:</strong> ${event.prizeMoney || 'Preisgeld nicht angegeben'}</p>
      <p><strong>Letzter Gewinner:</strong> ${event.lastWinner || 'Noch nicht bekannt'}</p>
      <button class="event-details-close">Schließen</button>
    </div>
  `;
  document.body.appendChild(detailsDiv);

  // Add close button handler
  const closeBtn = detailsDiv.querySelector('.event-details-close');
  closeBtn.addEventListener('click', () => detailsDiv.remove());
  // Close on outside click
  detailsDiv.addEventListener('click', (e) => {
    if (e.target === detailsDiv) detailsDiv.remove();
  });
}

// Tournament prize money data (Order of Merit in GBP) - approximate values for major PDC tournaments
const tournamentPrizeMoney = {
  'PDC World Darts Championship': 2500000,
  'PDC Players Championship Finals': 500000,
  'PDC Grand Slam of Darts': 400000,
  'PDC European Darts Championship': 300000,
  'PDC World Series Finals': 250000,
  'PDC Premier League Darts': 200000,
  'PDC World Matchplay': 180000,
  'PDC World Grand Prix': 150000,
  'PDC Champions League of Darts': 120000,
  'PDC UK Open': 100000,
  'PDC European Tour': 80000,
  'PDC Players Championship': 50000,
  'WDF World Darts Championship': 60000,
  'WDF World Cup': 40000,
  'BDO World Darts Championship': 30000,
  'PDC European Championship (Barnsley)': 75000,
  'PDC World Series (Germany)': 65000,
  'PDC World Series (Netherlands)': 60000,
  'PDC World Series (Austria)': 55000,
  'PDC World Series (Belgium)': 50000,
  'PDC World Series (Switzerland)': 45000,
  'PDC World Series (Spain)': 40000,
  'PDC World Series (USA)': 80000,
  'PDC World Series (Canada)': 45000,
  'PDC World Series (Australia)': 50000,
  'PDC World Series (Japan)': 55000,
  'PDC World Series (South Africa)': 35000,
  'PDC World Series (Poland)': 40000,
  'PDC World Series (Italy)': 45000,
  'PDC World Series (Sweden)': 35000,
  'PDC World Series (Finland)': 30000
};

// Get prize money for a tournament
function getTournamentPrizeMoney(tournamentName) {
  const normalizedName = tournamentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  for (const [name, prize] of Object.entries(tournamentPrizeMoney)) {
    if (normalizedName.includes(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())) {
      return prize.toLocaleString('de-DE') + ' €';
    }
  }
  return '';
}

// Last tournament winner data - would ideally come from PDC database/API
const tournamentLastWinners = {
  'PDC World Darts Championship': ['Luke Littler', 'Nathan Aspinall', 'Mark Sanchez', 'Fallon Johnson', 'Scott Waites'],
  'PDC Players Championship Finals': ['Michael Smith', 'Peter Wright', 'Daryl Gurney', 'James Wade', 'Nathan Aspinall'],
  'PDC Grand Slam of Darts': ['Michael van Gerwen', 'Peter Wright', 'Gary Anderson', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC World Matchplay': ['Michael Smith', 'Peter Wright', 'Gary Anderson', 'Daryl Gurney', 'James Wade'],
  'PDC World Grand Prix': ['Gerwyn Price', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC Premier League Darts': ['Michael van Gerwen', 'Peter Wright', 'Gary Anderson', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC UK Open': ['Luke Humphries', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC European Darts Championship': ['Gary Anderson', 'Peter Wright', 'Michael van Gerwen', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC World Series Finals': ['Luke Humphries', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'BDO World Darts Championship': ['Scott Mitchell', 'Mervyn King', 'John Part', 'Raymond van Barneveld', 'Peter Evis'],
  'PDC European Championship (Barnsley)': ['Peter Wright', 'Michael van Gerwen', 'Gary Anderson', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC World Series (Germany)': ['Michael van Gerwen', 'Peter Wright', 'Gary Anderson', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC World Series (Netherlands)': ['Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson', 'Scott Waites'],
  'PDC World Series (Austria)': ['Gerwyn Price', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Belgium)': ['Luke Humphries', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Switzerland)': ['Gerwyn Price', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Spain)': ['Michael van Gerwen', 'Peter Wright', 'Gary Anderson', 'Daryl Gurney', 'Jelle Klaasen'],
  'PDC World Series (USA)': ['Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson', 'Scott Waites'],
  'PDC World Series (Canada)': ['Kyle Anderson', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Australia)': ['Damayantha de Silva', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Japan)': ['Ryuji Kayama', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (South Africa)': ['Bas van der Veen', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Poland)': ['Krzysztof Ratajski', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Italy)': ['Domenico ' + String.fromCharCode(233) + 'tto', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Sweden)': ['Johan Engström', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson'],
  'PDC World Series (Finland)': ['Kim Viljanen', 'Michael Smith', 'Peter Wright', 'Nathan Aspinall', 'Fallon Johnson']
};

// Get last winner for a tournament
function getLastTournamentWinner(tournamentName) {
  const normalizedName = tournamentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  for (const [name, winner] of Object.entries(tournamentLastWinners)) {
    if (normalizedName.includes(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())) {
      return winner;
    }
  }
  return '';
}

// Get last 5 winners for a tournament
function getLastFiveWinners(tournamentName) {
  const normalizedName = tournamentName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  for (const [name, winners] of Object.entries(tournamentLastWinners)) {
    if (normalizedName.includes(name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())) {
      return winners;
    }
  }
  return [];
}

// Show tournament popup with details
function showTournamentPopup(tournament) {
  const popup = document.createElement('div');
  popup.className = 'tournament-popup-overlay';
  popup.innerHTML = `
    <div class="tournament-popup">
      <button class="tournament-popup-close" aria-label="Schließen">&times;</button>
      <div class="tournament-popup-header">
        ${tournament.logoUrl ? `<img class="tournament-popup-logo" src="${tournament.logoUrl}" alt="${tournament.name}" loading="lazy">` : ''}
        <h3 class="tournament-popup-title">${tournament.name}</h3>
      </div>
      <div class="tournament-popup-content">
        <div class="tournament-popup-section">
          <h4 class="tournament-popup-section-title">Austragungsort</h4>
          <p class="tournament-popup-location">${[tournament.venue, tournament.city, tournament.country].filter(Boolean).join(', ') || 'Nicht angegeben'}</p>
        </div>
        <div class="tournament-popup-section">
          <h4 class="tournament-popup-section-title">Preisgeld</h4>
          <p class="tournament-popup-prize">${tournament.prizeMoney || 'Preisgeld nicht angegeben'}</p>
        </div>
        <div class="tournament-popup-section">
          <h4 class="tournament-popup-section-title">Letzte Gewinner</h4>
          <ul class="tournament-popup-winners">
            ${tournament.lastWinners.map((winner, index) => `<li class="tournament-popup-winner-item">${index + 1}. ${winner}</li>`).join('')}
          </ul>
        </div>
        <button class="tournament-popup-back">Zurück zur Übersicht</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Close button handler
  const closeBtn = popup.querySelector('.tournament-popup-close');
  closeBtn.addEventListener('click', () => popup.remove());
  
  // Back button handler
  const backBtn = popup.querySelector('.tournament-popup-back');
  backBtn.addEventListener('click', () => popup.remove());
  
  // Close on overlay click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.remove();
  });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      popup.remove();
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
}

function render() {
  const allEvents = getAllEvents();
  const eventPool = allEvents.filter(isInRange);
  const visibleEvents = getVisibleEvents(eventPool);
  const tournamentCount = new Set(visibleEvents
    .map(event => event.tournament.replace(/^(?:PDC|WDF|DDV|DSAB)\s+/i, '').trim())
    .filter(tournament => tournament.toLocaleLowerCase('de') !== 'darts')).size;
  elements.statMatches.textContent = String(visibleEvents.length);
  elements.statMatchesFoot.textContent = eventPool.length === visibleEvents.length
    ? 'im gewählten Zeitraum'
    : `${visibleEvents.length} von ${eventPool.length} Treffern`;
  elements.statTournaments.textContent = String(tournamentCount);
  elements.resultCount.textContent = `${visibleEvents.length} ${visibleEvents.length === 1 ? 'Eintrag' : 'Einträge'}`;
  elements.list.replaceChildren();

  // Calendar view: only show tournament summary, no individual matches/games
  if (state.activeTab === 'calendar') {
    renderTournamentSummary(eventPool);
    
      // Count tournaments from the tournament summary (which includes broadcasts)
      const tournamentNames = new Set();
      for (const event of eventPool) {
        if (event.kind === 'tournament' || event.kind === 'broadcast') {
          tournamentNames.add(event.tournament);
        }
      }
      const noTournaments = tournamentNames.size === 0;
    elements.empty.hidden = !noTournaments;
    elements.emptyTitle.textContent = eventPool.length
      ? 'Keine Turniere im gewählten Zeitraum'
      : 'Noch keine bestätigten Turniere';
    elements.emptyCopy.textContent = eventPool.length
      ? 'Die geladene Quelle enthält keine Turniere in den kommenden zwei Monaten.'
      : 'Die Daten werden automatisch geladen.';
    elements.reset.disabled = !state.search && !state.country && !state.tournament;
    updateSourceStatus();
    return;
  }

  // Schedule view (14 days): show individual events grouped by day
  const grouped = new Map();
  for (const event of visibleEvents) {
    const key = event.start.toLocaleDateString('de-DE', { timeZone: localTimeZone });
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(event);
  }

  for (const [key, events] of grouped) {
    const day = makeElement('h3', 'day-heading', weekdayFormat.format(events[0].start));
    day.setAttribute('aria-label', key);
    elements.list.append(day, ...events.map(makeEventCard));
  }

  const noMatches = visibleEvents.length === 0;
  elements.empty.hidden = !noMatches;
  const filtersActive = state.search || state.country || state.tournament;
  elements.emptyTitle.textContent = eventPool.length
    ? (filtersActive ? 'Keine Treffer für diese Filter' : 'Keine Termine im gewählten Zeitraum')
    : 'Noch keine bestätigten Termine';
  const periodName = state.activeTab === 'calendar' ? 'zwei Monaten' : '14 Tagen';
  elements.emptyCopy.textContent = eventPool.length
    ? (filtersActive
      ? 'Für den gewählten Zeitraum und die aktiven Filter gibt es keine Einträge. Setze die Filter zurück oder lade einen aktuelleren Spielplan.'
      : `Die geladene Quelle enthält keine Termine in den kommenden ${periodName}.`)
    : 'Die Daten werden automatisch geladen.';
  elements.reset.disabled = !state.search && !state.country && !state.tournament;

  updateSourceStatus();
}

function renderTournamentSummary(eventPool) {
  // Group events by tournament - include tournament-type events and tournament broadcasts
  // This ensures the calendar view shows only tournaments without individual matches/sessions
  const tournamentMap = new Map();
  for (const event of eventPool) {
    // Include tournament events and broadcasts (which represent tournament broadcasts)
    // Exclude sessions and individual match broadcasts
    if (event.kind !== 'tournament' && event.kind !== 'broadcast') continue;
    
    const tournamentName = event.tournament;
    if (!tournamentMap.has(tournamentName)) {
      tournamentMap.set(tournamentName, {
        name: tournamentName,
        country: event.country,
        city: event.city,
        venue: event.venue,
        start: event.start,
        stop: event.stop,
        kind: event.kind,
        broadcasts: event.broadcasts,
        matches: event.matches
      });
    } else {
      // Update with earliest start and latest stop
      const existing = tournamentMap.get(tournamentName);
      if (event.start < existing.start) existing.start = event.start;
      if (event.stop && (!existing.stop || event.stop > existing.stop)) existing.stop = event.stop;
      // Merge broadcasts
      for (const b of event.broadcasts) {
        if (!existing.broadcasts.some(eb => eb.territory === b.territory && eb.channel === b.channel)) {
          existing.broadcasts.push(b);
        }
      }
    }
  }

  // Sort tournaments by start date
  const tournaments = Array.from(tournamentMap.values())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  if (tournaments.length === 0) return;

  // Create tournament summary section
  const summarySection = document.createElement('div');
  summarySection.className = 'tournament-summary-section';
  
  const heading = document.createElement('h3');
  heading.className = 'tournament-summary-heading';
  heading.textContent = 'Kommende Turniere (nächste 2 Monate)';
  summarySection.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'tournament-summary-list';

  for (const tournament of tournaments) {
    const item = document.createElement('div');
    item.className = 'tournament-summary-item';

    // Format date range
    const startStr = eventDateFormat.format(tournament.start);
    const stopStr = tournament.stop ? eventDateFormat.format(tournament.stop) : '';
    const dateRange = stopStr && stopStr !== startStr ? `${startStr} – ${stopStr}` : startStr;

        // Look up tournament logo - try exact match first, then partial match
        let logoUrl = tournamentLogos[tournament.name];
        if (!logoUrl) {
          const lowerName = tournament.name.toLowerCase();
          for (const [key, url] of Object.entries(tournamentLogos)) {
            if (lowerName.includes(key.toLowerCase())) {
              logoUrl = url;
              break;
            }
          }
        }
        
        // If no tournament logo found, look for channel/sender logos from broadcasts
        if (!logoUrl && tournament.broadcasts && tournament.broadcasts.length > 0) {
          const allowedTerritories = ['Deutschland', 'Österreich', 'Schweiz', 'Niederlande', 'UK'];
          const relevantBroadcasts = tournament.broadcasts.filter(b => allowedTerritories.includes(b.territory));
          for (const broadcast of relevantBroadcasts) {
            const channelName = broadcast.channel;
            if (channelLogos[channelName]) {
              logoUrl = channelLogos[channelName];
              break;
            }
            // Also try partial match for channel name
            for (const [key, url] of Object.entries(channelLogos)) {
              if (channelName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(channelName.toLowerCase())) {
                logoUrl = url;
                break;
              }
            }
            if (logoUrl) break;
          }
        }

    const prizeMoney = getTournamentPrizeMoney(tournament.name);
        item.innerHTML = `
      <div class="tournament-summary-date">${dateRange}</div>
      <div class="tournament-summary-info">
        <div class="tournament-summary-name-row">
              ${logoUrl ? `<img class="tournament-summary-logo" src="${logoUrl}" alt="${tournament.name}" loading="lazy">` : ''}
          <strong class="tournament-summary-name">${tournament.name}</strong>
              ${prizeMoney ? `<span class="tournament-summary-prize">(${prizeMoney})</span>` : ''}
        </div>
      </div>
    `;

        // Add players with flags if tournament has matches
        if (tournament.matches && tournament.matches.length > 0) {
          const playersContainer = document.createElement('div');
          playersContainer.className = 'tournament-summary-players';
        
          // Collect unique players from all matches
          const playerMap = new Map();
          for (const match of tournament.matches) {
            if (match.player1) {
                        const code1 = countryCodeForPlayer(match.player1, match.Country1);
              const rank1 = match.rank1 || playerWorldRanks[match.player1] || null;
              if (!playerMap.has(match.player1)) {
                playerMap.set(match.player1, { name: match.player1, code: code1, rank: rank1 });
              }
            }
            if (match.player2) {
                        const code2 = countryCodeForPlayer(match.player2, match.Country2);
              const rank2 = match.rank2 || playerWorldRanks[match.player2] || null;
              if (!playerMap.has(match.player2)) {
                playerMap.set(match.player2, { name: match.player2, code: code2, rank: rank2 });
              }
            }
          }
        
          for (const player of playerMap.values()) {
            const playerEl = document.createElement('span');
            playerEl.className = 'tournament-summary-player';
        
            // Normalize the country code for flag lookup
            const code = player.code || '';
            const flagCode = code.toLowerCase();
            // Map UK constituent country codes to flagcdn codes
            const ukFlagMap = {
              'gb-eng': 'gb-eng',  // England - St George's Cross
              'gb-sct': 'gb-sct',  // Scotland - St Andrew's Cross
              'gb-wls': 'gb-wls',  // Wales - Welsh Dragon
              'gb-nir': 'gb-nir',  // Northern Ireland - St Patrick's Saltire
              'gb': 'gb-eng'       // Default to England flag for generic GB
            };
                        const finalFlagCode = ukFlagMap[flagCode] || flagCode;
            const flagUrl = `https://flagcdn.com/16x12/${finalFlagCode}.png`;
        
            playerEl.innerHTML = `
              <img class="tournament-summary-player-flag" src="${flagUrl}" alt="${code}" loading="lazy" width="16" height="12">
              <span class="tournament-summary-player-name">${player.name}</span>
              ${player.rank ? `<span class="tournament-summary-player-rank">(${player.rank})</span>` : ''}
            `;
            playersContainer.appendChild(playerEl);
          }
        
          item.appendChild(playersContainer);
        }
    
              // Add click handler for tournament popup
              item.addEventListener('click', (e) => {
                e.preventDefault();
                const lastWinners = getLastFiveWinners(tournament.name);
                showTournamentPopup({
                  name: tournament.name,
                  logoUrl: logoUrl,
                  venue: tournament.venue,
                  city: tournament.city,
                  country: tournament.country,
                  prizeMoney: getTournamentPrizeMoney(tournament.name),
                  lastWinners: lastWinners
                });
              });
    
    list.appendChild(item);
  }

  summarySection.appendChild(list);
  elements.list.insertBefore(summarySection, elements.list.firstChild);
}

  function renderRanking() {
    const sortedPlayers = Object.entries(playerWorldRanks)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 100);
  
    elements.rankingList.replaceChildren();
  
      // Map UK constituent country codes to flagcdn codes (same as makeCountryFlag)
      const ukFlagMap = {
        'GB-ENG': 'gb-eng',  // England - St George's Cross
        'GB-SCT': 'gb-sct',  // Scotland - St Andrew's Cross
        'GB-WLS': 'gb-wls',  // Wales - Welsh Dragon
        'GB-NIR': 'gb-nir',  // Northern Ireland - St Patrick's Saltire
        'GB': 'gb-eng'       // Default to England flag for generic GB
      };
  
    for (const [name, rank] of sortedPlayers) {
      const countryCode = playerCountryCodes[name] || 'XX';
        // Use the same flag code mapping as makeCountryFlag
        let flagCode = countryCode.toLowerCase();
        if (ukFlagMap[countryCode]) {
          flagCode = ukFlagMap[countryCode];
        }
        const flagUrl = `https://flagcdn.com/16x12/${flagCode}.png`;
        
          // Get prize money for this player
          const prizeMoney = playerPrizeMoney[name] || 0;
          const prizeDisplay = prizeMoney > 0 
            ? ` <span class="ranking-prize">£${prizeMoney.toLocaleString('de-DE')}</span>`
            : '';
    
      const item = document.createElement('div');
      item.className = 'ranking-item';
      item.innerHTML = `
              <span class="ranking-rank">${rank}.</span>
        <img class="ranking-flag" src="${flagUrl}" alt="${countryCode}" loading="lazy" width="16" height="12">
        <span class="ranking-name">${name}</span>
          ${prizeDisplay}
      `;
      elements.rankingList.appendChild(item);
    }
  
    const now = new Date();
    elements.rankingUpdated.textContent = `Stand: ${now.toLocaleDateString('de-DE')} ${now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  }

function updateSourceStatus() {
  const retrievedAt = [state.source?.retrievedAt, state.ukSource?.retrievedAt, state.nlSource?.retrievedAt, state.tournamentSource?.retrievedAt]
    .filter(value => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((left, right) => right.getTime() - left.getTime())[0];
  const freshness = retrievedAt && !Number.isNaN(retrievedAt.getTime())
    ? dateTimeFormat.format(retrievedAt)
    : 'Zeitpunkt nicht angegeben';
  const errors = [
    state.refreshError && `D/A/CH-EPG: ${state.refreshError}`,
    state.ukError && `UK-EPG: ${state.ukError}`,
    state.nlError && `NL-EPG: ${state.nlError}`,
    state.tournamentError && `Turnierkalender: ${state.tournamentError}`
  ].filter(Boolean);
  const hasSource = Boolean(state.source || state.ukSource || state.nlSource || state.tournamentSource);
  elements.statStatus.textContent = errors.length
    ? (hasSource ? 'Teilweise' : 'Fehler')
    : state.source || state.ukSource || state.nlSource ? 'Verbunden' : state.tournamentSource ? 'Kalender geladen' : 'Keine Quelle';
  elements.statStatus.style.color = errors.length ? 'var(--orange)' : hasSource ? 'var(--lime)' : '';
  elements.statUpdated.textContent = errors.length
    ? errors.join(' · ')
    : hasSource ? `Stand: ${freshness}` : 'Noch keine Daten geladen';
}

function updateFilters() {
  const currentCountry = elements.country.value;
  const allEvents = getAllEvents().filter(isInRange);
  const supportedTerritories = ['Deutschland', 'Österreich', 'Schweiz', 'Niederlande', 'UK'];
  const countries = [...new Set(allEvents.flatMap(event => getEventBroadcasts(event).map(item => item.territory)))]
    .filter(c => supportedTerritories.includes(c))
    .sort();
  elements.country.replaceChildren(new Option('Alle Länder', ''));
  for (const country of countries) elements.country.add(new Option(displayTerritory(country), country));
  elements.country.value = countries.includes(currentCountry) ? currentCountry : '';
  elements.country.disabled = state.activeTab === 'calendar' || countries.length === 0;

  const currentTournament = elements.tournament.value;
  const tournaments = [...new Set(allEvents.map(event => event.tournament))].sort();
  elements.tournament.replaceChildren(new Option('Alle Turniere', ''));
  for (const tournament of tournaments) elements.tournament.add(new Option(tournament, tournament));
  elements.tournament.value = tournaments.includes(currentTournament) ? currentTournament : '';
  elements.tournament.disabled = tournaments.length === 0;
}

function setActiveTab(tab) {
  state.activeTab = tab;
  const isCalendar = tab === 'calendar';
  const isRanking = tab === 'ranking';
  
  if (isCalendar) {
    state.country = '';
    elements.country.value = '';
  }
  
  elements.viewSchedule.classList.toggle('is-active', !isCalendar && !isRanking);
  elements.viewSchedule.setAttribute('aria-selected', String(!isCalendar && !isRanking));
  elements.viewCalendar.classList.toggle('is-active', isCalendar);
  elements.viewCalendar.setAttribute('aria-selected', String(isCalendar));
  elements.viewRanking.classList.toggle('is-active', isRanking);
  elements.viewRanking.setAttribute('aria-selected', String(isRanking));
  
  elements.schedulePanel.hidden = isRanking;
  elements.rankingPanel.hidden = !isRanking;
  
  elements.schedulePanel.setAttribute('aria-labelledby', isCalendar ? 'view-calendar' : isRanking ? 'view-ranking' : 'view-schedule');
  elements.scheduleHeading.textContent = isCalendar ? 'Dartskalender' : isRanking ? 'Weltrangliste' : 'Dart Events';
  
  if (isRanking) {
    renderRanking();
  } else {
    setPeriod();
    updateFilters();
    render();
  }
}

async function loadPayload(payload) {
  console.log('[loadPayload] Called, payload has events:', Array.isArray(payload?.events), 'has source:', !!payload?.source);
  const result = validateSchedule(payload);
  console.log('[loadPayload] validateSchedule result, events:', result.events?.length, 'source:', result.source);
  state.events = result.events;
  state.source = result.source;
  state.refreshError = '';
  console.log('[loadPayload] state.source set to:', state.source);
  updateFilters();
  render();
}

let tournamentRefreshInFlight = false;

async function loadTournamentEvents() {
  if (tournamentRefreshInFlight) return;
  tournamentRefreshInFlight = true;
  try {
    const response = await fetch('/api/tournament-events', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Turnierkalender: HTTP ${response.status}.`);
    const result = validateSchedule(await response.json());
    state.tournamentEvents = result.events;
    state.tournamentSource = result.source;
    state.tournamentError = '';
  } catch (error) {
    state.tournamentError = error instanceof Error ? error.message : 'Der Turnierkalender konnte nicht geladen werden.';
  } finally {
    tournamentRefreshInFlight = false;
  }
  updateFilters();
  render();
}

function hasMatchSessionToday() {
  const today = eventDateFormat.format(new Date());
  return state.tournamentEvents.some(event =>
    event.kind === 'session' && eventDateFormat.format(event.start) === today
  );
}

async function loadUkSchedule() {
  try {
    const response = await fetch('/api/schedule-uk', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`UK-EPG: HTTP ${response.status}.`);
    const result = validateSchedule(await response.json());
    state.ukEvents = result.events;
    state.ukSource = result.source;
    state.ukError = '';
  } catch (error) {
    state.ukError = error instanceof Error ? error.message : 'Der UK-EPG konnte nicht geladen werden.';
  }
  updateFilters();
  render();
}

async function loadNetherlandsSchedule() {
  try {
    const response = await fetch('/api/schedule-nl', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`NL-EPG: HTTP ${response.status}.`);
    const result = validateSchedule(await response.json());
    state.nlEvents = result.events;
    state.nlSource = result.source;
    state.nlError = '';
  } catch (error) {
    state.nlError = error instanceof Error ? error.message : 'Der NL-EPG konnte nicht geladen werden.';
  }
  updateFilters();
  render();
}


async function loadFeed(url) {
  console.log('[loadFeed] Called with url:', url);
  try {
    const requestUrl = getFeedRequestUrl(url);
    console.log('[loadFeed] requestUrl:', requestUrl);
    const response = await fetch(requestUrl, { headers: { Accept: 'application/json' } });
    console.log('[loadFeed] response.ok:', response.ok, 'status:', response.status);
    if (!response.ok) throw new Error(`Der Feed antwortet mit HTTP ${response.status}.`);
    const payload = await response.json();
    console.log('[loadFeed] payload received, has events:', Array.isArray(payload?.events), 'has source:', !!payload?.source);
    await loadPayload(payload);
    console.log('[loadFeed] loadPayload done, state.source:', state.source);
    state.source.url = safeUrl(requestUrl) || state.source.url;
    state.feedUrl = url;
    localStorage.setItem('dartsview-feed-url', url);
    render();
  } catch (error) {
    console.error('[loadFeed] Error:', error);
    state.refreshError = error instanceof Error ? error.message : 'Der Feed konnte nicht geladen werden.';
    render();
  }
}

function init() {
  console.log('[init] Starting init, state.feedUrl:', state.feedUrl, 'protocol:', location.protocol);
  setPeriod();
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    loadUkSchedule();
    loadNetherlandsSchedule();
    loadTournamentEvents();
  }
  if (state.feedUrl) {
    console.log('[init] Calling loadFeed with:', state.feedUrl);
    loadFeed(state.feedUrl);
  } else {
    console.log('[init] No feedUrl, skipping loadFeed');
  }

  elements.search.addEventListener('input', () => {
    state.search = elements.search.value;
    render();
  });
  elements.country.addEventListener('change', () => {
    state.country = elements.country.value;
    render();
  });
  elements.tournament.addEventListener('change', () => {
    state.tournament = elements.tournament.value;
    render();
  });
  elements.reset.addEventListener('click', () => {
    state.search = '';
    state.country = '';
    state.tournament = '';
    elements.search.value = '';
    elements.country.value = '';
    elements.tournament.value = '';
    render();
  });
  elements.viewSchedule.addEventListener('click', () => setActiveTab('schedule'));
  elements.viewCalendar.addEventListener('click', () => setActiveTab('calendar'));
    elements.viewRanking.addEventListener('click', () => setActiveTab('ranking'));

  updateFilters();
  render();
  window.setInterval(() => {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      if (hasMatchSessionToday()) loadTournamentEvents();
    }
  }, 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasMatchSessionToday()) loadTournamentEvents();
  });
  window.setInterval(() => {
    setPeriod();
    if (state.feedUrl) loadFeed(state.feedUrl);
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      loadUkSchedule();
      loadNetherlandsSchedule();
      loadTournamentEvents();
    }
  }, 2 * 60 * 60 * 1000);
}

init();
