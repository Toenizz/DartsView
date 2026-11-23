const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DAYS = 14;
const CALENDAR_MONTHS = 2;
const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
const dateFormat = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' });
const weekdayFormat = new Intl.DateTimeFormat('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
const timeFormat = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', timeZone: localTimeZone });
const dateTimeFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: localTimeZone });
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
  { label: 'England/UK', territories: ['England', 'UK', 'United Kingdom', 'Vereinigtes Königreich'] }
];
const storedFeedUrl = localStorage.getItem('dartsview-feed-url') || '';
const localApiUrl = location.protocol === 'http:' || location.protocol === 'https:' ? '/api/schedule' : '';
const xmltvFeedUrl = 'https://deswird.org/iptv/GuideFull.xml.gz';

const state = {
  events: [],
  ukEvents: [],
  tournamentEvents: [],
  source: null,
  ukSource: null,
  tournamentSource: null,
  search: '',
  country: '',
  tournament: '',
  activeTab: 'schedule',
  feedUrl: storedFeedUrl || localApiUrl,
  refreshError: '',
  ukError: '',
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
  const end = new Date(start);
  if (state.activeTab === 'calendar') {
    const day = end.getDate();
    end.setDate(1);
    end.setMonth(end.getMonth() + CALENDAR_MONTHS);
    end.setDate(Math.min(day, new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()));
    elements.dateRangeCaption.textContent = 'DEIN 2-MONATS-KALENDER';
    elements.periodLabel.textContent = 'NÄCHSTE 2 MONATE';
  } else {
    end.setTime(end.getTime() + MAX_DAYS * DAY_MS);
    elements.dateRangeCaption.textContent = 'DEIN 14-TAGE-PLAN';
    elements.periodLabel.textContent = 'NÄCHSTE 14 TAGE';
  }
  elements.dateRange.textContent = `${dateFormat.format(start)} – ${dateFormat.format(end)}`;
  elements.timezoneLabel.textContent = localTimeZone.replaceAll('_', ' ');
  elements.scheduleTimezone.textContent = localTimeZone.replaceAll('_', ' ');
  document.querySelector('#footer-year').textContent = String(start.getFullYear());
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
        start: match.start ? new Date(match.start) : null,
        isEstimated: match.isEstimated === true
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
  return [...state.events, ...state.ukEvents];
}

function getLocalDateKey(date) {
  const parts = eventDateFormat.formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function normalizeTournamentName(value) {
  return value
    .toLocaleLowerCase('de')
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
      item.append(
        makeElement('span', '', match.player1),
        makeElement('span', 'event-match-separator', 'vs'),
        makeElement('span', '', match.player2),
        makeElement('span', 'event-match-time', match.start && match.isEstimated
          ? `ca. ${timeFormat.format(match.start)}`
          : event.kind === 'draw' ? 'Anwurfzeit offen' : `Session ab ${timeFormat.format(event.start)}`)
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
  const retrievedAt = state.source?.retrievedAt || state.ukSource?.retrievedAt || state.tournamentSource?.retrievedAt;
  const freshness = retrievedAt && !Number.isNaN(retrievedAt.getTime())
    ? dateTimeFormat.format(retrievedAt)
    : 'Zeitpunkt nicht angegeben';
  const errors = [
    state.refreshError && `D/A/CH-EPG: ${state.refreshError}`,
    state.ukError && `UK-EPG: ${state.ukError}`,
    state.tournamentError && `Turnierkalender: ${state.tournamentError}`
  ].filter(Boolean);
  const hasSource = Boolean(state.source || state.ukSource || state.tournamentSource);
  elements.statStatus.textContent = errors.length
    ? (hasSource ? 'Teilweise' : 'Fehler')
    : state.source || state.ukSource ? 'Verbunden' : state.tournamentSource ? 'Kalender geladen' : 'Keine Quelle';
  elements.statStatus.style.color = errors.length ? 'var(--orange)' : hasSource ? 'var(--lime)' : '';
  elements.statUpdated.textContent = errors.length
    ? errors.join(' · ')
    : hasSource ? `Stand: ${freshness}` : 'Noch keine Daten geladen';
}

function updateFilters() {
  const currentCountry = elements.country.value;
  const allEvents = getAllEvents().filter(isInRange);
  const dachCountries = ['Deutschland', 'Österreich', 'Schweiz', 'England', 'UK', 'United Kingdom', 'Vereinigtes Königreich'];
  const countries = [...new Set(allEvents.flatMap(event => getEventBroadcasts(event).map(item => item.territory)))]
    .filter(c => dachCountries.includes(c))
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

async function loadTournamentEvents() {
  try {
    const response = await fetch('/api/tournament-events', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Turnierkalender: HTTP ${response.status}.`);
    const result = validateSchedule(await response.json());
    state.tournamentEvents = result.events;
    state.tournamentSource = result.source;
    state.tournamentError = '';
  } catch (error) {
    state.tournamentError = error instanceof Error ? error.message : 'Der Turnierkalender konnte nicht geladen werden.';
  }
  updateFilters();
  render();
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
    setPeriod();
    if (state.feedUrl) loadFeed(state.feedUrl);
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      loadUkSchedule();
      loadTournamentEvents();
    }
  }, 2 * 60 * 60 * 1000);
}

init();
