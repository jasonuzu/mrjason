export type EntryKind = 'jason' | 'class' | 'task' | 'todo' | 'duty' | 'notice' | 'info' | 'time'

export interface ScheduleEntry {
  id: string
  kind: EntryKind
  todoId?: string
  className: string
  person: string
  room: string
  label: string
  detail: string
}

export interface Period {
  id: string
  name: string
  time: string
  tone?: 'break'
}

export interface WeekData {
  cells: Record<string, ScheduleEntry[]>
  periodOverrides: Record<string, Period>
}

export interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export interface PlannerStore {
  version: 1
  weeks: Record<string, WeekData>
  todos: Record<string, Todo[]>
  notes: Record<string, Note[]>
}

export interface CellLocation {
  periodId: string
  day: string
}

export type PlannerTab = 'timetable' | 'todos' | 'notes'
