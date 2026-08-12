export const MINICON_DISCORD_URL = 'https://discord.com/invite/m3qvuXgkZ7';
export const MINICON_PDF_URL = '/minicon/programme.pdf';
export const MINICON_EVENT_URL = '/events/era-minicon-2026';
export const MINICON_CALENDAR_URL = '/events/era-minicon-2026.ics';
export const MINICON_PROMOTION_END = '2026-08-17T04:00:00Z';
export const MINICON_TIMEZONE = 'America/Toronto';

export type MiniconSessionKind = 'session' | 'break' | 'social';

export interface MiniconSession {
  id: string;
  start: string;
  end: string;
  title: string;
  speaker?: string;
  mode?: string;
  notes?: string;
  kind: MiniconSessionKind;
}

export interface MiniconSpeaker {
  name: string;
  affiliation: Array<{
    label: string;
    href?: string;
  }>;
  background: string;
  talk: string;
}

export const miniconSchedule: MiniconSession[] = [
  {
    id: 'welcome',
    start: '2026-08-16T13:00:00Z',
    end: '2026-08-16T13:30:00Z',
    title: 'Welcome, ERA introduction and icebreaker',
    speaker: 'ERA organisers',
    mode: 'In person',
    kind: 'session',
  },
  {
    id: 'lana-sinapayen',
    start: '2026-08-16T13:30:00Z',
    end: '2026-08-16T14:15:00Z',
    title: "Don't get trapped by your research question! Tips to harness the scientific potential of your curiosity",
    speaker: 'Lana Sinapayen',
    mode: 'Remote',
    notes: '30 min talk + 15 min Q&A.',
    kind: 'session',
  },
  {
    id: 'snack-exchange',
    start: '2026-08-16T14:15:00Z',
    end: '2026-08-16T14:45:00Z',
    title: 'Coffee break and snack exchange',
    notes: 'Bring a snack from your home country and share it with the others!',
    kind: 'social',
  },
  {
    id: 'alyssa-adams',
    start: '2026-08-16T14:45:00Z',
    end: '2026-08-16T15:45:00Z',
    title: 'The career landscape for ALifers: academia, industry and in between',
    speaker: 'Alyssa Adams',
    mode: 'Remote',
    notes: '60 min incl. Q&A.',
    kind: 'session',
  },
  {
    id: 'bert-chan',
    start: '2026-08-16T15:45:00Z',
    end: '2026-08-16T16:30:00Z',
    title: 'The Artificial Life Institute and my own path into the field',
    speaker: 'Bert Chan',
    mode: 'In person',
    notes: '30 min talk + 15 min Q&A.',
    kind: 'session',
  },
  {
    id: 'lunch',
    start: '2026-08-16T16:30:00Z',
    end: '2026-08-16T17:30:00Z',
    title: 'Lunch break',
    kind: 'break',
  },
  {
    id: 'michael-levin',
    start: '2026-08-16T17:30:00Z',
    end: '2026-08-16T18:30:00Z',
    title: "Criticality of a path through idea space and academia: the Levin Lab's work through the last 25 years",
    speaker: 'Michael Levin',
    mode: 'Remote',
    notes: '60 min incl. Q&A.',
    kind: 'session',
  },
  {
    id: 'afternoon-coffee',
    start: '2026-08-16T18:30:00Z',
    end: '2026-08-16T19:00:00Z',
    title: 'Coffee break',
    kind: 'break',
  },
  {
    id: 'susan-stepney',
    start: '2026-08-16T19:00:00Z',
    end: '2026-08-16T20:00:00Z',
    title: 'How to write a good paper',
    speaker: 'Susan Stepney',
    mode: 'In person',
    notes: '60 min incl. Q&A.',
    kind: 'session',
  },
  {
    id: 'eyvind-niklasson',
    start: '2026-08-16T20:00:00Z',
    end: '2026-08-16T21:00:00Z',
    title: 'A bit on "Life in Z80", how it came about, and how I ended up here.',
    speaker: 'Eyvind Niklasson',
    mode: 'In person',
    notes: '45 min talk + 15 min Q&A.',
    kind: 'session',
  },
  {
    id: 'wrap-up',
    start: '2026-08-16T21:00:00Z',
    end: '2026-08-16T21:15:00Z',
    title: 'Wrap-up, announcements and pointer to ERA Workshop on 18 August',
    speaker: 'ERA organisers',
    mode: 'In person',
    kind: 'session',
  },
];

export const miniconSpeakers: MiniconSpeaker[] = [
  {
    name: 'Lana Sinapayen',
    affiliation: [
      { label: 'Associate Researcher, ' },
      { label: 'Sony CSL Kyoto', href: 'https://lanasina.github.io/' },
      { label: '; Specially Appointed Associate Professor, ' },
      { label: 'NIBB', href: 'https://www.nibb.ac.jp/en/sections/members/lana_sinapayen.html' },
      { label: '; ' },
      { label: 'ISAL Research Chair', href: 'https://alife.org/board-of-directors/' },
    ],
    background: 'Their research spans astrobiology, open-ended evolution, neural cellular automata, and artificial perception.',
    talk: "Don't get trapped by your research question! Tips to harness the scientific potential of your curiosity",
  },
  {
    name: 'Alyssa Adams',
    affiliation: [
      { label: 'Vice President, ' },
      { label: 'ISAL', href: 'https://alife.org/board-of-directors/' },
      { label: '; Deputy Director, ' },
      { label: 'Cross Labs', href: 'https://www.crosslabs.org/team' },
    ],
    background: 'A physicist by training, Adams works across artificial life research, scientific leadership, and community building.',
    talk: 'The career landscape for ALifers: academia, industry and in between',
  },
  {
    name: 'Bert Chan',
    affiliation: [
      { label: 'Researcher, ' },
      { label: 'Artificial Life Institute', href: 'https://alife.institute/en/people/' },
      { label: '; creator of ' },
      { label: 'Lenia', href: 'https://arxiv.org/abs/1812.05433' },
    ],
    background: 'His work explores open-ended evolution and self-organising artificial life.',
    talk: 'The Artificial Life Institute and my own path into the field',
  },
  {
    name: 'Michael Levin',
    affiliation: [
      { label: 'Vannevar Bush Distinguished Professor, ' },
      { label: 'Tufts University', href: 'https://allencenter.tufts.edu/our-team/michael-levin/' },
    ],
    background: 'His research examines bioelectric signalling, morphogenesis, and collective intelligence in living systems.',
    talk: "Criticality of a path through idea space and academia: the Levin Lab's work through the last 25 years",
  },
  {
    name: 'Susan Stepney',
    affiliation: [
      { label: 'Professor Emerita, ' },
      { label: 'University of York', href: 'https://www.cs.york.ac.uk/people/susan' },
      { label: '; Co-Editor-in-Chief, ' },
      { label: 'Artificial Life', href: 'https://direct.mit.edu/artl' },
    ],
    background: 'Her research covers artificial life, complex systems, and unconventional computing.',
    talk: 'How to write a good paper',
  },
  {
    name: 'Eyvind Niklasson',
    affiliation: [
      { label: 'Researcher, ' },
      { label: 'Google', href: 'https://research.google/people/eyvindniklasson/' },
    ],
    background: 'His work covers self-organising systems, neural cellular automata, and computational life.',
    talk: 'A bit on "Life in Z80", how it came about, and how I ended up here.',
  },
];

export function isMiniconPromotionActive(
  now: number | Date = Date.now()
): boolean {
  const timestamp = now instanceof Date ? now.getTime() : now;
  return timestamp < Date.parse(MINICON_PROMOTION_END);
}

function dateIndex(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day)) / 86_400_000;
}

export function formatScheduleRange(
  session: Pick<MiniconSession, 'start' | 'end'>,
  timeZone: string,
  locale = 'en-GB'
): string {
  const start = new Date(session.start);
  const end = new Date(session.end);
  const formatter = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const eventDay = dateIndex(new Date(miniconSchedule[0].start), MINICON_TIMEZONE);
  const dayOffset = Math.max(dateIndex(start, timeZone), dateIndex(end, timeZone)) - eventDay;
  const dayLabel = dayOffset > 0 ? ` (+${dayOffset} day${dayOffset === 1 ? '' : 's'})` : '';

  return `${formatter.format(start)} - ${formatter.format(end)}${dayLabel}`;
}
