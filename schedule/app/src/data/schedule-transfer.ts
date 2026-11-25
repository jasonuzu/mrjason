import { ALL_PERIODS, cellKey, DAYS, getCellEntries } from '@/data/schedule'
import type { EntryKind, Period, ScheduleEntry, WeekData } from '@/types/planner'

const FORMAT = 'grade-6-weekly-planner-schedule'
const VERSION = 1
export const MAX_LAYOUT_FILE_SIZE = 1024 * 1024

const ENTRY_KINDS: EntryKind[] = ['jason', 'class', 'task', 'todo', 'duty', 'notice', 'info', 'time']
const DAYS_AND_ALL = [...DAYS.map((day) => day.id), 'all']

interface ScheduleLayoutFile {
  format: typeof FORMAT
  version: typeof VERSION
  exportedAt: string
  sourceWeek: string
  week: WeekData
}

export type LayoutImportResult =
  | { success: true; week: WeekData; sourceWeek: string }
  | { success: false; error: string }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isShortString = (value: unknown, maximum = 500): value is string =>
  typeof value === 'string' && value.length <= maximum

function parsePeriod(value: unknown): Period | null {
  if (!isRecord(value)) return null
  const { id, name, time, tone } = value
  if (!isShortString(id, 100) || !id || !isShortString(name) || !name || !isShortString(time, 100)) return null
  if (tone !== undefined && tone !== 'break') return null
  return { id, name, time, ...(tone === 'break' ? { tone } : {}) }
}

function parseEntry(value: unknown): ScheduleEntry | null {
  if (!isRecord(value)) return null
  const { id, kind, todoId, className, person, room, label, detail } = value
  if (!isShortString(id, 150) || !id || !ENTRY_KINDS.includes(kind as EntryKind)) return null
  if (![className, person, room, label, detail].every((field) => isShortString(field))) return null
  if (todoId !== undefined && (!isShortString(todoId, 150) || !todoId)) return null
  if (kind === 'todo' && !todoId) return null
  return {
    id,
    kind: kind as EntryKind,
    ...(todoId !== undefined ? { todoId } : {}),
    className: className as string,
    person: person as string,
    room: room as string,
    label: label as string,
    detail: detail as string,
  }
}

/** Export a self-contained snapshot rather than depending on future app defaults. */
export function createScheduleLayout(week: WeekData, sourceWeek: string): string {
  const periodOverrides = Object.fromEntries(
    ALL_PERIODS.map((period) => [period.id, week.periodOverrides[period.id] ?? period]),
  )
  const cells = Object.fromEntries(
    ALL_PERIODS.flatMap((period) =>
      DAYS_AND_ALL.map((day) => [cellKey(period.id, day), getCellEntries(week, period.id, day)]),
    ),
  )
  const layout: ScheduleLayoutFile = {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    sourceWeek,
    week: { cells, periodOverrides },
  }
  return JSON.stringify(layout, null, 2)
}

/** Validate and rebuild the file contents so only known schedule fields enter the store. */
export function parseScheduleLayout(text: string): LayoutImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { success: false, error: 'This file is not valid JSON. Choose a schedule layout downloaded from this planner.' }
  }

  if (!isRecord(parsed) || parsed.format !== FORMAT || parsed.version !== VERSION) {
    return { success: false, error: 'This is not a supported Grade 6 schedule layout file.' }
  }
  if (!isShortString(parsed.sourceWeek, 10) || !/^\d{4}-\d{2}-\d{2}$/.test(parsed.sourceWeek) || !isRecord(parsed.week)) {
    return { success: false, error: 'The schedule layout is missing its week information.' }
  }

  const { cells, periodOverrides } = parsed.week
  if (!isRecord(cells) || !isRecord(periodOverrides)) {
    return { success: false, error: 'The schedule layout does not contain a complete timetable.' }
  }

  const cleanPeriods: WeekData['periodOverrides'] = {}
  for (const period of ALL_PERIODS) {
    const cleanPeriod = parsePeriod(periodOverrides[period.id])
    if (!cleanPeriod || cleanPeriod.id !== period.id) {
      return { success: false, error: `The schedule layout has an invalid or missing period: ${period.name}.` }
    }
    cleanPeriods[period.id] = cleanPeriod
  }

  const cleanCells: WeekData['cells'] = {}
  for (const period of ALL_PERIODS) {
    for (const day of DAYS_AND_ALL) {
      const key = cellKey(period.id, day)
      const entries = cells[key]
      if (!Array.isArray(entries) || entries.length > 100) {
        return { success: false, error: 'The schedule layout has an invalid or missing timetable cell.' }
      }
      const cleanEntries: ScheduleEntry[] = []
      for (const entry of entries) {
        const cleanEntry = parseEntry(entry)
        if (!cleanEntry) {
          return { success: false, error: 'The schedule layout contains an invalid class, task, or note entry.' }
        }
        cleanEntries.push(cleanEntry)
      }
      cleanCells[key] = cleanEntries
    }
  }

  return {
    success: true,
    sourceWeek: parsed.sourceWeek,
    week: { cells: cleanCells, periodOverrides: cleanPeriods },
  }
}
