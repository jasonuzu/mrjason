import { useEffect, useRef, useState } from 'react'
import { cellKey, EMPTY_WEEK_DATA, getCellEntries } from '@/data/schedule'
import { supabase } from '@/lib/supabase'
import type { Note, Period, PlannerStore, ScheduleEntry, Todo, WeekData } from '@/types/planner'

const STORAGE_KEY = 'grade-6-weekly-planner-v1'
const emptyStore: PlannerStore = { version: 1, weeks: {}, todos: {}, notes: {} }

export type CloudStatus = 'local' | 'loading' | 'syncing' | 'saved' | 'error'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isPlannerStore = (value: unknown): value is PlannerStore =>
  isRecord(value) && value.version === 1 && isRecord(value.weeks) && isRecord(value.todos) && isRecord(value.notes)

const cloudErrorMessage = (code?: string) => code === 'PGRST205'
  ? 'The Supabase planner table is not installed yet. Run supabase/schema.sql in the Supabase SQL Editor.'
  : 'Cloud sync is unavailable. Your changes are still saved in this browser.'

const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

function loadStore(): PlannerStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyStore
    const parsed = JSON.parse(raw) as Partial<PlannerStore>
    if (parsed.version !== 1) return emptyStore
    return {
      version: 1,
      weeks: parsed.weeks ?? {},
      todos: parsed.todos ?? {},
      notes: parsed.notes ?? {},
    }
  } catch {
    return emptyStore
  }
}

export function usePlannerStore(userId: string | null) {
  const [store, setStore] = useState<PlannerStore>(loadStore)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error'>('saved')
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('local')
  const [cloudError, setCloudError] = useState<string | null>(null)
  const [cloudRetry, setCloudRetry] = useState(0)
  const storeRef = useRef(store)
  const activeUserRef = useRef<string | null>(null)
  const loadedUserRef = useRef<string | null>(null)
  const lastCloudUserRef = useRef<string | null>(null)

  useEffect(() => {
    storeRef.current = store
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }, [store])

  useEffect(() => {
    activeUserRef.current = userId
    loadedUserRef.current = null
    setCloudError(null)
    if (!userId) {
      setCloudStatus('local')
      return
    }

    let cancelled = false
    setCloudStatus('loading')
    const loadCloud = async () => {
      const { data, error } = await supabase
        .from('planner_states')
        .select('data')
        .eq('user_id', userId)
        .maybeSingle()
      if (cancelled || activeUserRef.current !== userId) return
      if (error) {
        setCloudStatus('error')
        setCloudError(cloudErrorMessage(error.code))
        return
      }

      if (data && isPlannerStore(data.data)) {
        lastCloudUserRef.current = userId
        setStore(data.data)
        loadedUserRef.current = userId
        setCloudStatus('saved')
        return
      }

      // First sign-in uploads this browser's planner. A different account with no
      // cloud data starts clean rather than inheriting the previous account's data.
      const differentAccount = lastCloudUserRef.current !== null && lastCloudUserRef.current !== userId
      const initialStore = differentAccount ? emptyStore : storeRef.current
      lastCloudUserRef.current = userId
      if (differentAccount) setStore(initialStore)
      const { error: insertError } = await supabase
        .from('planner_states')
        .upsert({ user_id: userId, data: initialStore, updated_at: new Date().toISOString() })
      if (cancelled || activeUserRef.current !== userId) return
      if (insertError) {
        setCloudStatus('error')
        setCloudError(cloudErrorMessage(insertError.code))
        return
      }
      loadedUserRef.current = userId
      setCloudStatus('saved')
    }
    void loadCloud()
    return () => { cancelled = true }
  }, [userId, cloudRetry])

  useEffect(() => {
    if (!userId || loadedUserRef.current !== userId) return
    setCloudStatus('syncing')
    setCloudError(null)
    const timer = window.setTimeout(async () => {
      const { error } = await supabase
        .from('planner_states')
        .upsert({ user_id: userId, data: store, updated_at: new Date().toISOString() })
      if (activeUserRef.current !== userId) return
      if (error) {
        setCloudStatus('error')
        setCloudError(cloudErrorMessage(error.code))
      } else {
        setCloudStatus('saved')
      }
    }, 700)
    return () => window.clearTimeout(timer)
  }, [store, userId])

  const getWeek = (weekKey: string): WeekData => store.weeks[weekKey] ?? EMPTY_WEEK_DATA

  const updateCell = (weekKey: string, periodId: string, day: string, entries: ScheduleEntry[]) => {
    setStore((current) => {
      const week = current.weeks[weekKey] ?? EMPTY_WEEK_DATA
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [weekKey]: { ...week, cells: { ...week.cells, [cellKey(periodId, day)]: entries } },
        },
      }
    })
  }

  const moveEntry = (weekKey: string, sourcePeriodId: string, sourceDay: string, targetPeriodId: string, targetDay: string, entryId: string) => {
    if (sourcePeriodId === targetPeriodId && sourceDay === targetDay) return
    setStore((current) => {
      const week = current.weeks[weekKey] ?? EMPTY_WEEK_DATA
      const sourceEntries = getCellEntries(week, sourcePeriodId, sourceDay)
      const entry = sourceEntries.find((item) => item.id === entryId)
      if (!entry) return current
      const targetEntries = getCellEntries(week, targetPeriodId, targetDay)
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [weekKey]: {
            ...week,
            cells: {
              ...week.cells,
              [cellKey(sourcePeriodId, sourceDay)]: sourceEntries.filter((item) => item.id !== entryId),
              [cellKey(targetPeriodId, targetDay)]: [...targetEntries, entry],
            },
          },
        },
      }
    })
  }

  const updatePeriod = (weekKey: string, period: Period) => {
    setStore((current) => {
      const week = current.weeks[weekKey] ?? EMPTY_WEEK_DATA
      return {
        ...current,
        weeks: {
          ...current.weeks,
          [weekKey]: {
            ...week,
            periodOverrides: { ...week.periodOverrides, [period.id]: period },
          },
        },
      }
    })
  }

  const replaceWeek = (weekKey: string, week: WeekData) => {
    setStore((current) => ({
      ...current,
      weeks: { ...current.weeks, [weekKey]: week },
    }))
  }

  const resetWeek = (weekKey: string) => {
    setStore((current) => ({
      ...current,
      weeks: { ...current.weeks, [weekKey]: EMPTY_WEEK_DATA },
    }))
  }

  const addTodo = (weekKey: string, text: string) => {
    const todo: Todo = { id: makeId(), text, completed: false, createdAt: new Date().toISOString() }
    setStore((current) => ({
      ...current,
      todos: { ...current.todos, [weekKey]: [todo, ...(current.todos[weekKey] ?? [])] },
    }))
  }

  const toggleTodo = (weekKey: string, todoId: string) => {
    setStore((current) => ({
      ...current,
      todos: {
        ...current.todos,
        [weekKey]: (current.todos[weekKey] ?? []).map((todo) =>
          todo.id === todoId ? { ...todo, completed: !todo.completed } : todo,
        ),
      },
    }))
  }

  const deleteTodo = (weekKey: string, todoId: string) => {
    setStore((current) => ({
      ...current,
      todos: {
        ...current.todos,
        [weekKey]: (current.todos[weekKey] ?? []).filter((todo) => todo.id !== todoId),
      },
    }))
  }

  const addNote = (weekKey: string) => {
    const note: Note = {
      id: makeId(),
      title: 'Untitled note',
      content: '',
      updatedAt: new Date().toISOString(),
    }
    setStore((current) => ({
      ...current,
      notes: { ...current.notes, [weekKey]: [note, ...(current.notes[weekKey] ?? [])] },
    }))
  }

  const updateNote = (weekKey: string, noteId: string, values: Pick<Note, 'title' | 'content'>) => {
    setStore((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [weekKey]: (current.notes[weekKey] ?? []).map((note) =>
          note.id === noteId ? { ...note, ...values, updatedAt: new Date().toISOString() } : note,
        ),
      },
    }))
  }

  const deleteNote = (weekKey: string, noteId: string) => {
    setStore((current) => ({
      ...current,
      notes: {
        ...current.notes,
        [weekKey]: (current.notes[weekKey] ?? []).filter((note) => note.id !== noteId),
      },
    }))
  }

  return {
    getWeek,
    todos: (weekKey: string) => store.todos[weekKey] ?? [],
    notes: (weekKey: string) => store.notes[weekKey] ?? [],
    saveStatus,
    cloudStatus,
    cloudError,
    retryCloud: () => setCloudRetry((current) => current + 1),
    updateCell,
    moveEntry,
    updatePeriod,
    replaceWeek,
    resetWeek,
    addTodo,
    toggleTodo,
    deleteTodo,
    addNote,
    updateNote,
    deleteNote,
  }
}
