import type { EntryKind, Period, ScheduleEntry, WeekData } from '@/types/planner'

export const DAYS = [
  { id: 'monday', label: 'Monday', short: 'Mon' },
  { id: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { id: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { id: 'thursday', label: 'Thursday', short: 'Thu' },
  { id: 'friday', label: 'Friday', short: 'Fri' },
] as const

export const DEFAULT_PERIODS: Period[] = [
  { id: 'wake', name: 'Wake Up', time: '7:00–7:20' },
  { id: 'breakfast', name: 'Breakfast', time: '7:20–7:40' },
  { id: 'reading', name: 'Morning Reading', time: '7:40–7:55' },
  { id: 'p1', name: '1st Period', time: '8:00–8:40' },
  { id: 'p2', name: '2nd Period', time: '8:50–9:30' },
  { id: 'exercise', name: 'Classes-break Exercise', time: '9:30–10:00', tone: 'break' },
  { id: 'p3', name: '3rd Period (Eye)', time: '10:00–10:40' },
  { id: 'p4', name: '4th Period', time: '10:50–11:25' },
  { id: 'p5', name: '5th Period', time: '11:35–12:10' },
  { id: 'lunch', name: 'Lunch / Break', time: '12:10–14:10', tone: 'break' },
  { id: 'p6', name: '6th Period', time: '14:10–14:50' },
  { id: 'p7', name: '7th Period', time: '15:00–15:40' },
  { id: 'p8', name: '8th Period (Eye)', time: '15:50–16:35' },
  { id: 'teacher-study', name: 'Friday Teacher Study', time: '16:00–17:00' },
  { id: 'p9', name: '9th Period (CASRA)', time: '16:45–17:25' },
  { id: 'free', name: 'Free Time', time: '17:25–18:00', tone: 'break' },
  { id: 'dinner', name: 'Dinner / Shower', time: '18:00–19:00', tone: 'break' },
  { id: 'evening-1', name: 'Evening Study 1', time: '19:00–19:40' },
  { id: 'evening-2', name: 'Evening Study 2', time: '19:50–20:30' },
  { id: 'evening-3', name: 'Evening Study 3', time: '20:40–21:20', tone: 'break' },
  { id: 'bedtime', name: 'Bedtime', time: '21:20–22:00', tone: 'break' },
]

// Only the true 10-minute gaps in the 1st–5th and 6th–9th period blocks.
// The existing 30-minute exercise slot between 2nd and 3rd stays unchanged.
export const CLASS_BREAKS: Record<string, Period> = {
  p1: { id: 'class-break-p1', name: 'Break · 1st–2nd', time: '8:40–8:50', tone: 'break' },
  p3: { id: 'class-break-p3', name: 'Break · 3rd–4th', time: '10:40–10:50', tone: 'break' },
  p4: { id: 'class-break-p4', name: 'Break · 4th–5th', time: '11:25–11:35', tone: 'break' },
  p6: { id: 'class-break-p6', name: 'Break · 6th–7th', time: '14:50–15:00', tone: 'break' },
  p7: { id: 'class-break-p7', name: 'Break · 7th–8th', time: '15:40–15:50', tone: 'break' },
  p8: { id: 'class-break-p8', name: 'Break · 8th–9th', time: '16:35–16:45', tone: 'break' },
}

export const ALL_PERIODS = [...DEFAULT_PERIODS, ...Object.values(CLASS_BREAKS)]

let sequence = 0
const makeEntry = (kind: EntryKind, values: Partial<ScheduleEntry> = {}): ScheduleEntry => ({
  id: `template-${sequence++}`,
  kind,
  className: '',
  person: '',
  room: '',
  label: '',
  detail: '',
  ...values,
})

const lesson = (kind: 'jason' | 'class', className: string, person: string, room: string) =>
  makeEntry(kind, { className, person, room })

const duty = (label: string, detail = '') => makeEntry('duty', { label, detail })
const notice = (label: string, detail = '') => makeEntry('notice', { label, detail })
const info = (label: string, detail = '') => makeEntry('info', { label, detail })
const time = (label: string) => makeEntry('time', { label })

export const cellKey = (periodId: string, day: string) => `${periodId}:${day}`

export const DEFAULT_CELLS: Record<string, ScheduleEntry[]> = {
  [cellKey('breakfast', 'monday')]: [duty('Flag Raising Ceremony', '7:30')],
  [cellKey('reading', 'thursday')]: [duty('Jason Morning Reading')],
  [cellKey('p1', 'wednesday')]: [lesson('class', '6B1', 'Emily', 'D328')],
  [cellKey('p1', 'friday')]: [notice('Fri noon class starts', '13:10')],
  [cellKey('p2', 'tuesday')]: [lesson('jason', '6B4', 'Jason', 'D313'), lesson('class', '6B1', 'Emily', 'D328')],
  [cellKey('p2', 'wednesday')]: [lesson('class', '6B4', 'Joey', 'D313')],
  [cellKey('p2', 'friday')]: [notice('Fri noon class starts', '13:10')],
  [cellKey('exercise', 'tuesday')]: [duty('FUN RUN', 'CLIPBOARD DUTY')],
  [cellKey('exercise', 'thursday')]: [duty('FUN RUN STAIR', 'DUTY')],
  [cellKey('p3', 'tuesday')]: [lesson('class', '6B4', 'Joey', 'D313')],
  [cellKey('p3', 'friday')]: [notice('Fri noon class starts', '13:10')],
  [cellKey('p4', 'friday')]: [notice('Fri noon class starts', '13:10')],
  [cellKey('p5', 'monday')]: [lesson('jason', '6B4', 'Jason', 'D313')],
  [cellKey('p5', 'wednesday')]: [lesson('jason', '6B1', 'Jason', 'D328')],
  [cellKey('p5', 'friday')]: [notice('Fri noon class starts', '13:10')],
  [cellKey('lunch', 'friday')]: [duty('Friday begins', '13:00')],
  [cellKey('p6', 'monday')]: [lesson('jason', '6B1', 'Jason', 'D328')],
  [cellKey('p6', 'tuesday')]: [lesson('jason', '6B1', 'Jason', 'D328')],
  [cellKey('p6', 'wednesday')]: [lesson('jason', '6B4', 'Jason', 'D313')],
  [cellKey('p6', 'friday')]: [time('13:10–13:50'), lesson('class', '6B1', 'Emily', 'D328'), lesson('jason', '6B4', 'Jason', 'D313')],
  [cellKey('p7', 'monday')]: [lesson('class', '6B4', 'Joey', 'D313')],
  [cellKey('p7', 'thursday')]: [lesson('jason', '6B4', 'Jason', 'D313'), lesson('class', '6B1', 'Emily', 'D328')],
  [cellKey('p7', 'friday')]: [time('14:00–14:40'), lesson('jason', '6B1', 'Jason', 'D328'), lesson('class', '6B4', 'Joey', 'D313')],
  [cellKey('p8', 'monday')]: [lesson('class', '6B1', 'Emily', 'D328')],
  [cellKey('p8', 'thursday')]: [lesson('class', '6B4', 'Joey', 'D313'), lesson('jason', '6B1', 'Jason', 'D328')],
  [cellKey('p8', 'friday')]: [time('14:50–15:30'), info('(no class scheduled)')],
  [cellKey('teacher-study', 'friday')]: [info('All teachers', 'collective study')],
  [cellKey('evening-3', 'all')]: [info('Grade 6 does not attend (ends at 20:30)')],
}

export const EMPTY_WEEK_DATA: WeekData = { cells: {}, periodOverrides: {} }

export const getCellEntries = (week: WeekData, periodId: string, day: string) => {
  const key = cellKey(periodId, day)
  return week.cells[key] ?? DEFAULT_CELLS[key] ?? []
}
