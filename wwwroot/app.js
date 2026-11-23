console.log('[app.js] Script loaded, version 0.1.7.5');
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 14;
const CALENDAR_MONTHS = 2;
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: localTimeZone });
const dateTimeFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: localTimeZone });
const playerCountryCodes = {
  'Luke Littler': 'GB', 'Luke Humphries': 'GB', 'Michael van Gerwen': 'NL',
  'Gian van Veen': 'NL', 'Danny Noppert': 'NL', 'Michael Smith': 'GB',
  'Nathan Aspinall': 'GB', 'Chris Dobey': 'GB', 'Rob Cross': 'GB',
  'Stephen Bunting': 'GB', 'James Wade': 'GB', 'Dave Chisnall': 'GB',
  'Peter Wright': 'GB', 'Ryan Searle': 'GB', 'Ross Smith': 'GB',
  'Gerwyn Price': 'GB', 'Jonny Clayton': 'GB', 'Damon Heta': 'AU',
  'Gary Anderson': 'GB', 'Martin Schindler': 'DE', 'Ricardo Pietreczko': 'DE',
  'Florian Hempel': 'DE', 'Gabriel Clemens': 'DE', 'Niko Springer': 'DE',
  'Dirk van Duijvenbode': 'NL', 'Jermaine Wattimena': 'NL', 'Raymond van Barneveld': 'NL',
  'Wessel Nijman': 'NL', 'Kevin Doets': 'NL', 'Christian Kist': 'NL',
  'Josh Rock': 'GB', 'Daryl Gurney': 'GB', 'Brendan Dolan': 'GB',
  'Mike De Decker': 'BE', 'Dimitri Van den Bergh': 'BE', 'Kim Huybrechts': 'BE',
  'Peter Jr': 'AU', 'Simon Whitlock': 'AU', 'Joe Cullen': 'GB',
  'Cameron Menzies': 'GB', 'Alan Soutar': 'GB', 'Callan Rydz': 'GB',
  'Andrew Gilding': 'GB', 'Ritchie Edhouse': 'GB', 'Scott Williams': 'GB',
  'Krzysztof Ratajski': 'PL', 'Mensur Suljovic': 'AT', 'Rowby-John Rodriguez': 'AT',
  'Jerome Shipley': 'AT', 'Jose de Sousa': 'PT',
  'Beau Greaves': 'GB', 'Charlie Manby': 'GB', 'Henry Coates': 'GB',
  'Tom Bissell': 'GB', 'Rob Owen': 'GB', 'Luke Woodhouse': 'GB',
  'Alexander Merkx': 'NL', 'Max Hopp': 'DE', 'Sebastian Bialecki': 'PL',
  'Jeffrey de Graaf': 'SE', 'Keane Barry': 'IE', 'William O\'Connor': 'IE',
  'James Hurrell': 'GB', 'Tommy Morris': 'GB', 'Carsten Hoffmann': 'DE',
  'Dennis Nilsson': 'SE', 'Matt Clark': 'GB', 'Terry Tan': 'SG',
  'Franko Giuliani': 'IT', 'Joey Lynaugh': 'IE', 'Jeff Smith': 'CA',
  'David Davies': 'GB', 'Petri Rasmus': 'FI', 'Ryusei Azemoto': 'JP',
  'Harry Lane': 'GB', 'Declan Bailey': 'GB', 'Chris Dobey': 'GB',
  'Richard Veenstra': 'NL', 'Cristo Reyes': 'ES', 'Darius Labanauskas': 'LT',
  'Darryl Pilgrim': 'GB', 'Connor Scutt': 'GB', 'Luke Littler': 'GB',
  'Tom Sykes': 'GB', 'Maik Kuivenhoven': 'NL', 'Bradley Brooks': 'GB',
  'Joe Hunt': 'GB', 'Karel Sedlacek': 'CZ', 'Mickey Mansell': 'GB',
  'Aurora Fochesato': 'IT', 'Steph Clarke': 'CA', 'Stefan Schroder': 'DE',
  'Pat Scurfield': 'GB', 'Ben Townley': 'GB', 'Niels Zonneveld': 'NL',
  'Berry Pater': 'NL', 'Jitse Van der Wal': 'NL', 'Corne Groeneveld': 'NL',
  'Cali West': 'US', 'Cam Crabtree': 'GB', 'Leonard Gates': 'US',
  'Boris Krcmar': 'HR', 'Niko Chamil': 'DE', 'Nathan Girvan': 'GB',
  'Adam Lipscombe': 'GB', 'Adam Warner': 'GB', 'Adam Paxton': 'GB',
  'Jamie Hughes': 'GB', 'Ian White': 'GB', 'Keegan Brown': 'GB',
  'Martijn Dragt': 'NL', 'Martijn Kleermaker': 'NL', 'Vincent van der Voort': 'NL',
  'Haupai Puha': 'NZ', 'Mitchell Clegg': 'NZ', 'Neil Duff': 'GB',
  'Ross Montgomery': 'GB', 'Richard North': 'GB', 'Andy Hamilton': 'GB',
  'Darren Webster': 'GB', 'Adrian Lewis': 'GB', 'Steve Beaton': 'GB',
    'Robert Thornton': 'GB', 'Brentford': 'GB',
    'Stephen Burton': 'GB', 'Ryan Joyce': 'GB',
    'Martin Lukeman': 'GB', 'Berry van Peer': 'NL',
        'Madars Razma': 'LV',
        'Justin Hood': 'GB', 'Connor Scutt': 'GB', 'Darryl Pilgrim': 'GB',
        'Tom Sykes': 'GB', 'Maik Kuivenhoven': 'NL', 'Bradley Brooks': 'GB',
        'Joe Hunt': 'GB', 'Karel Sedlacek': 'CZ', 'Mickey Mansell': 'GB',
        'Aurora Fochesato': 'IT', 'Steph Clarke': 'CA', 'Stefan Schroder': 'DE',
        'Pat Scurfield': 'GB', 'Ben Townley': 'GB', 'Niels Zonneveld': 'NL',
        'Berry Pater': 'NL', 'Jitse Van der Wal': 'NL', 'Corne Groeneveld': 'NL',
        'Cali West': 'US', 'Cam Crabtree': 'GB', 'Leonard Gates': 'US',
        'Boris Krcmar': 'HR', 'Niko Chamil': 'DE', 'Nathan Girvan': 'GB',
        'Adam Lipscombe': 'GB', 'Adam Warner': 'GB', 'Adam Paxton': 'GB',
        'Jamie Hughes': 'GB', 'Ian White': 'GB', 'Keegan Brown': 'GB',
        'Martijn Dragt': 'NL', 'Martijn Kleermaker': 'NL', 'Vincent van der Voort': 'NL',
        'Haupai Puha': 'NZ', 'Mitchell Clegg': 'NZ', 'Neil Duff': 'GB',
        'Ross Montgomery': 'GB', 'Richard North': 'GB', 'Andy Hamilton': 'GB',
        'Darren Webster': 'GB', 'Adrian Lewis': 'GB', 'Steve Beaton': 'GB'
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
  { label: 'Niederlande', territories: ['Niederlande'] },
  { label: 'Spanien', territories: ['Spanien', 'Spain', 'España'] },
  { label: 'Italien', territories: ['Italien', 'Italy', 'Italia'] },
  { label: 'Polen', territories: ['Polen', 'Poland', 'Polska'] },
  { label: 'Tschechien', territories: ['Tschechien', 'Czech Republic', 'Tschechische Republik', 'Česko'] },
  { label: 'Dänemark', territories: ['Dänemark', 'Denmark', 'Danmark'] },
  { label: 'Schweden', territories: ['Schweden', 'Sweden', 'Sverige'] },
  { label: 'Norwegen', territories: ['Norwegen', 'Norway', 'Norge'] },
  { label: 'Finnland', territories: ['Finnland', 'Finland', 'Suomi'] },
  { label: 'Irland', territories: ['Irland', 'Ireland', 'Éire'] },
  { label: 'Portugal', territories: ['Portugal'] },
  { label: 'Griechenland', territories: ['Griechenland', 'Greece', 'Ελλάδα'] },
  { label: 'Ungarn', territories: ['Ungarn', 'Hungary', 'Magyarország'] },
  { label: 'Rumänien', territories: ['Rumänien', 'Romania', 'România'] },
  { label: 'Bulgarien', territories: ['Bulgarien', 'Bulgaria', 'България'] },
  { label: 'Kroatien', territories: ['Kroatien', 'Croatia', 'Hrvatska'] },
  { label: 'Slowenien', territories: ['Slowenien', 'Slovenia', 'Slovenija'] },
  { label: 'Slowakei', territories: ['Slowakei', 'Slovakia', 'Slovensko'] },
  { label: 'Estland', territories: ['Estland', 'Estonia', 'Eesti'] },
  { label: 'Lettland', territories: ['Lettland', 'Latvia', 'Latvija'] },
  { label: 'Litauen', territories: ['Litauen', 'Lithuania', 'Lietuva'] },
  { label: 'Luxemburg', territories: ['Luxemburg', 'Luxembourg', 'Lëtzebuerg'] },
  { label: 'Malta', territories: ['Malta'] },
  { label: 'Zypern', territories: ['Zypern', 'Cyprus', 'Κύπρος'] },
  { label: 'Island', territories: ['Island', 'Iceland', 'Ísland'] },
  { label: 'Liechtenstein', territories: ['Liechtenstein'] },
  { label: 'Monaco', territories: ['Monaco'] },
  { label: 'San Marino', territories: ['San Marino'] },
  { label: 'Vatikanstadt', territories: ['Vatikanstadt', 'Vatican City'] },
  { label: 'Andorra', territories: ['Andorra'] },
  { label: 'Serbien', territories: ['Serbien', 'Serbia', 'Србија'] },
  { label: 'Bosnien und Herzegowina', territories: ['Bosnien und Herzegowina', 'Bosnia and Herzegovina', 'Bosna i Hercegovina'] },
  { label: 'Montenegro', territories: ['Montenegro', 'Crna Gora'] },
  { label: 'Nordmazedonien', territories: ['Nordmazedonien', 'North Macedonia', 'Северна Македонија'] },
  { label: 'Albanien', territories: ['Albanien', 'Albania', 'Shqipëri'] },
  { label: 'Moldau', territories: ['Moldau', 'Moldova', 'Republica Moldova'] },
  { label: 'Ukraine', territories: ['Ukraine', 'Ukraina', 'Україна'] },
  { label: 'Weißrussland', territories: ['Weißrussland', 'Belarus', 'Беларусь'] },
  { label: 'Russland', territories: ['Russland', 'Russia', 'Россия'] },
  { label: 'Türkei', territories: ['Türkei', 'Turkey', 'Türkiye'] },
  { label: 'Georgien', territories: ['Georgien', 'Georgia', 'საქართველო'] },
  { label: 'Armenien', territories: ['Armenien', 'Armenia', 'Հայաստան'] },
  { label: 'Aserbaidschan', territories: ['Aserbaidschan', 'Azerbaijan', 'Azərbaycan'] },
  { label: 'Kasachstan', territories: ['Kasachstan', 'Kazakhstan', 'Қазақстан'] }
];
const storedFeedUrl = localStorage.getItem('dartsview-feed-url') || '';
const localApiUrl = location.protocol === 'http:' || location.protocol === 'https:' ? '/api/schedule' : '';
const xmltvFeedUrl = 'https://deswird.org/iptv/GuideFull.xml.gz';

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
    if (!Array.isArray(matches) || matches.some(match =>
      !match ||
      typeof match.player1 !== 'string' ||
      !match.player1.trim() ||
      typeof match.player2 !== 'string' ||
      !match.player2.trim()
    )) {
      throw new Error(`Eintrag ${index + 1}: „matches“ muss gültige Spielerpaarungen enthalten.`);
    }
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
        country1: typeof match.country1 === 'string' ? match.country1.trim().toUpperCase() : '',
        country2: typeof match.country2 === 'string' ? match.country2.trim().toUpperCase() : '',
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
  if (/^[A-Z]{2}$/.test(code)) return code;
  return playerCountryCodes[playerName] || '';
}

function makeCountryFlag(code) {
  if (!/^[A-Z]{2}$/.test(code)) return null;

  // Use flagcdn.com for official flag images
  // For England (GB-ENG), use the St George's Cross flag instead of UK flag
  let flagCode = code.toLowerCase();
  if (code === 'GB') {
    // Use England flag (St George's Cross) instead of UK flag
    flagCode = 'gb-eng';
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
        makePlayer(match.player1, match.country1, match.rank1),
        makeElement('span', 'event-match-separator', '-'),
        makePlayer(match.player2, match.country2, match.rank2),
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

  if (!event.allDay && event.stop && !Number.isNaN(event.stop.getTime())) {
    time.querySelector('strong').textContent += `–${timeFormat.format(event.stop)}`;
  }

  card.append(time, title, stage, venue);
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

  function renderRanking() {
    const sortedPlayers = Object.entries(playerWorldRanks)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 100);
  
    elements.rankingList.replaceChildren();
  
    for (const [name, rank] of sortedPlayers) {
      const countryCode = playerCountryCodes[name] || 'XX';
      const flagUrl = `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
    
      const item = document.createElement('div');
      item.className = 'ranking-item';
      item.innerHTML = `
        <span class="ranking-rank">${rank}</span>
        <img class="ranking-flag" src="${flagUrl}" alt="${countryCode}" loading="lazy" width="16" height="12">
        <span class="ranking-name">${name}</span>
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
