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
  'Robert Thornton': 'GB', 'Brentford': 'GB'
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
  'Madars Razma': 51, 'Mickey Mansell': 52,
  'James Hurrell': 53, 'Karel Sedlacek': 54,
  'Florian Hempel': 55, 'Berry van Peer': 56,
  'Ryan Joyce': 57, 'Christian Kist': 58,
  'Ian White': 59, 'Jose de Sousa': 60,
  'Stephen Burton': 61, 'Connor Scutt': 62,
  'Rowby-John Rodriguez': 63, 'Simon Whitlock': 64
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
  { label: 'Belgien', territories: ['Belgien'] }
];
const storedFeedUrl = localStorage.getItem('dartsview-feed-url') || '';
const localApiUrl = location.protocol === 'http:' || location.protocol === 'https:' ? '/api/schedule' : '';
const xmltvFeedUrl = 'https://deswird.org/iptv/GuideFull.xml.gz';

const state = {
  events: [],
  ukEvents: [],
  nlEvents: [],
  beEvents: [],
  tournamentEvents: [],
  source: null,
  ukSource: null,
  nlSource: null,
  beSource: null,
  tournamentSource: null,
  search: '',
  country: '',
  tournament: '',
  activeTab: 'schedule',
  feedUrl: storedFeedUrl || localApiUrl,
  refreshError: '',
  ukError: '',
  nlError: '',
  beError: '',
  tournamentError: ''
};

const elements = {
  dateRange: document.querySelector('#date-range'),
  dateRangeCaption: document.querySelector('#date-range-caption'),
  periodLabel: document.querySelector('#period-label'),
  scheduleHeading: document.querySelector('#schedule-heading'),
  schedulePanel: document.querySelector('#schedule-panel'),
  viewSchedule: document.querySelector('#view-schedule'),
  viewCalendar: document.querySelector('#view-calendar'),
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
  return [...state.events, ...state.ukEvents, ...state.nlEvents, ...state.beEvents];
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
  return ['England', 'UK', 'United Kingdom', 'Vereinigtes Königreich'].includes(territory)
    ? 'England/UK'
    : territory;
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

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 30 20');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.classList.add('event-player-flag');

  const rect = (x, y, width, height, fill) => {
    const element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    element.setAttribute('x', x);
    element.setAttribute('y', y);
    element.setAttribute('width', width);
    element.setAttribute('height', height);
    element.setAttribute('fill', fill);
    svg.append(element);
  };
  const rectFull = fill => rect(0, 0, 30, 20, fill);
  const horizontal = fills => fills.forEach((fill, index) => rect(0, index * 20 / fills.length, 30, 20 / fills.length, fill));

  if (code === 'GB') {
    rectFull('#1f4b99');
    rect(0, 7, 30, 6, '#fff');
    rect(12, 0, 6, 20, '#fff');
    rect(0, 8.5, 30, 3, '#cf142b');
    rect(13.5, 0, 3, 20, '#cf142b');
  } else if (code === 'DE') horizontal(['#171717', '#dd0000', '#ffce00']);
  else if (code === 'NL') horizontal(['#ae1c28', '#fff', '#21468b']);
  else if (code === 'AT') horizontal(['#ed2939', '#fff', '#ed2939']);
  else if (code === 'BE') rect(0, 0, 10, 20, '#171717'), rect(10, 0, 10, 20, '#fade4b'), rect(20, 0, 10, 20, '#ef3340');
  else if (code === 'PL') rect(0, 0, 30, 10, '#fff'), rect(0, 10, 30, 10, '#dc143c');
  else if (code === 'FR') rect(0, 0, 10, 20, '#002395'), rect(10, 0, 10, 20, '#fff'), rect(20, 0, 10, 20, '#ed2939');
  else if (code === 'IT') rect(0, 0, 10, 20, '#009246'), rect(10, 0, 10, 20, '#fff'), rect(20, 0, 10, 20, '#ce2b37');
  else if (code === 'IE') rect(0, 0, 10, 20, '#169b62'), rect(10, 0, 10, 20, '#fff'), rect(20, 0, 10, 20, '#ff883e');
  else if (code === 'FI') rectFull('#fff'), rect(0, 7.5, 30, 5, '#003580'), rect(8, 0, 5, 20, '#003580');
  else if (code === 'SE') rectFull('#006aa7'), rect(0, 7.5, 30, 5, '#fecc00'), rect(8, 0, 5, 20, '#fecc00');
  else if (code === 'NO') rectFull('#ba0c2f'), rect(0, 7, 30, 6, '#fff'), rect(8, 0, 5, 20, '#fff'), rect(0, 8.5, 30, 3, '#00205b'), rect(9.5, 0, 2, 20, '#00205b');
  else if (code === 'DK') rectFull('#c60c30'), rect(0, 8, 30, 4, '#fff'), rect(8, 0, 4, 20, '#fff');
  else if (code === 'CH') rectFull('#d52b1e'), rect(11.5, 3, 7, 14, '#fff'), rect(7, 7.5, 16, 5, '#fff');
  else if (code === 'UA') horizontal(['#005bbb', '#ffd500']);
  else if (code === 'RU') horizontal(['#fff', '#0039a6', '#d52b1e']);
  else if (code === 'RO') rect(0, 0, 10, 20, '#002b7f'), rect(10, 0, 10, 20, '#fcd116'), rect(20, 0, 10, 20, '#ce1126');
  else if (code === 'BG') horizontal(['#fff', '#00966e', '#d62612']);
  else if (code === 'LT') horizontal(['#fdb913', '#006a44', '#c1272d']);
  else if (code === 'PT') rect(0, 0, 12, 20, '#046a38'), rect(12, 0, 18, 20, '#da291c');
  else if (code === 'ES') horizontal(['#aa151b', '#f1bf00', '#aa151b']);
  else if (code === 'JP') rectFull('#fff'), (() => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '15');
    circle.setAttribute('cy', '10');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', '#bc002d');
    svg.append(circle);
  })();
  else if (code === 'AU') rectFull('#000066'), rect(0, 0, 15, 10, '#000066');
  else if (code === 'NZ') rectFull('#00247d');
  else if (code === 'CA') rect(0, 0, 7.5, 20, '#d80621'), rect(7.5, 0, 15, 20, '#fff'), rect(22.5, 0, 7.5, 20, '#d80621');
  else if (code === 'US') {
    for (let index = 0; index < 7; index++) rect(0, index * 20 / 7, 30, 20 / 7, index % 2 ? '#fff' : '#b22234');
    rect(0, 0, 12, 8.6, '#3c3b6e');
  } else if (code === 'SG') horizontal(['#ef3340', '#fff']);
  else if (code === 'CZ') rect(0, 0, 30, 10, '#fff'), rect(0, 10, 30, 10, '#d7141a');
  else if (code === 'TR') rectFull('#e30a17'), (() => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '12');
    circle.setAttribute('cy', '10');
    circle.setAttribute('r', '5');
    circle.setAttribute('fill', '#fff');
    svg.append(circle);
  })();
  else if (code === 'IN') horizontal(['#ff9933', '#fff', '#138808']);
  else if (code === 'BR') rectFull('#009c3b'), (() => {
    const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    diamond.setAttribute('points', '15,2 28,10 15,18 2,10');
    diamond.setAttribute('fill', '#ffdf00');
    svg.append(diamond);
  })();
  else if (code === 'KR') rectFull('#fff');
  else if (code === 'ZA') rectFull('#007749');
  else if (code === 'HR') horizontal(['#ff0000', '#fff', '#171796']);
  else if (code === 'HU') horizontal(['#ce2939', '#fff', '#477050']);
  else rectFull('#667085');

  return svg;
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
  for (const region of broadcastRegions) {
    const regionalBroadcasts = broadcasts.filter(item => region.territories.includes(item.territory));
    for (const territory of region.territories) displayedTerritories.add(territory);
    if (!regionalBroadcasts.length) {
      const chip = makeElement('span', 'broadcast-chip broadcast-chip--unknown', `${region.label}: keine EPG-Angabe`);
      chip.title = `Für ${region.label} enthält das EPG zu diesem Event keine Senderangabe.`;
      container.append(chip);
      continue;
    }

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
        makeElement('span', 'event-match-separator', 'vs'),
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

function updateSourceStatus() {
  const retrievedAt = [state.source?.retrievedAt, state.ukSource?.retrievedAt, state.nlSource?.retrievedAt, state.beSource?.retrievedAt, state.tournamentSource?.retrievedAt]
    .filter(value => value instanceof Date && !Number.isNaN(value.getTime()))
    .sort((left, right) => right.getTime() - left.getTime())[0];
  const freshness = retrievedAt && !Number.isNaN(retrievedAt.getTime())
    ? dateTimeFormat.format(retrievedAt)
    : 'Zeitpunkt nicht angegeben';
  const errors = [
    state.refreshError && `D/A/CH-EPG: ${state.refreshError}`,
    state.ukError && `UK-EPG: ${state.ukError}`,
    state.nlError && `NL-EPG: ${state.nlError}`,
    state.beError && `BE-EPG: ${state.beError}`,
    state.tournamentError && `Turnierkalender: ${state.tournamentError}`
  ].filter(Boolean);
  const hasSource = Boolean(state.source || state.ukSource || state.nlSource || state.beSource || state.tournamentSource);
  elements.statStatus.textContent = errors.length
    ? (hasSource ? 'Teilweise' : 'Fehler')
    : state.source || state.ukSource || state.nlSource || state.beSource ? 'Verbunden' : state.tournamentSource ? 'Kalender geladen' : 'Keine Quelle';
  elements.statStatus.style.color = errors.length ? 'var(--orange)' : hasSource ? 'var(--lime)' : '';
  elements.statUpdated.textContent = errors.length
    ? errors.join(' · ')
    : hasSource ? `Stand: ${freshness}` : 'Noch keine Daten geladen';
}

function updateFilters() {
  const currentCountry = elements.country.value;
  const allEvents = getAllEvents().filter(isInRange);
  const supportedTerritories = ['Deutschland', 'Österreich', 'Schweiz', 'England', 'UK', 'United Kingdom', 'Vereinigtes Königreich', 'Niederlande', 'Belgien'];
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
  if (isCalendar) {
    state.country = '';
    elements.country.value = '';
  }
  elements.viewSchedule.classList.toggle('is-active', !isCalendar);
  elements.viewSchedule.setAttribute('aria-selected', String(!isCalendar));
  elements.viewCalendar.classList.toggle('is-active', isCalendar);
  elements.viewCalendar.setAttribute('aria-selected', String(isCalendar));
  elements.schedulePanel.setAttribute('aria-labelledby', isCalendar ? 'view-calendar' : 'view-schedule');
  elements.scheduleHeading.textContent = isCalendar ? 'Dartskalender' : 'Der Spielplan';
  setPeriod();
  updateFilters();
  render();
}

async function loadPayload(payload) {
  const result = validateSchedule(payload);
  state.events = result.events;
  state.source = result.source;
  state.refreshError = '';
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

async function loadBelgiumSchedule() {
  try {
    const response = await fetch('/api/schedule-be', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`BE-EPG: HTTP ${response.status}.`);
    const result = validateSchedule(await response.json());
    state.beEvents = result.events;
    state.beSource = result.source;
    state.beError = '';
  } catch (error) {
    state.beError = error instanceof Error ? error.message : 'Der BE-EPG konnte nicht geladen werden.';
  }
  updateFilters();
  render();
}

async function loadFeed(url) {
  try {
    const requestUrl = getFeedRequestUrl(url);
    const response = await fetch(requestUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Der Feed antwortet mit HTTP ${response.status}.`);
    await loadPayload(await response.json());
    state.source.url = safeUrl(requestUrl) || state.source.url;
    state.feedUrl = url;
    localStorage.setItem('dartsview-feed-url', url);
    render();
  } catch (error) {
    state.refreshError = error instanceof Error ? error.message : 'Der Feed konnte nicht geladen werden.';
    render();
  }
}

function init() {
  setPeriod();
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    loadUkSchedule();
    loadNetherlandsSchedule();
    loadBelgiumSchedule();
    loadTournamentEvents();
  }
  if (state.feedUrl) {
    loadFeed(state.feedUrl);
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
      loadBelgiumSchedule();
      loadTournamentEvents();
    }
  }, 2 * 60 * 60 * 1000);
}

init();
