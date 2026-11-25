import { useRef, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { toPng } from 'html-to-image'
import {
  ArrowRight,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileDown,
  HardDrive,
  Highlighter,
  LockKeyhole,
  PencilLine,
  RotateCcw,
  Upload,
} from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { CellEditor } from '@/components/CellEditor'
import { CloudAccount } from '@/components/CloudAccount'
import { Notes } from '@/components/Notes'
import { PeriodEditor } from '@/components/PeriodEditor'
import { Timetable } from '@/components/Timetable'
import { Todos } from '@/components/Todos'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { ALL_PERIODS, DAYS, getCellEntries } from '@/data/schedule'
import { createScheduleLayout, MAX_LAYOUT_FILE_SIZE, parseScheduleLayout } from '@/data/schedule-transfer'
import { usePlannerStore } from '@/hooks/use-planner-store'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import type { CellLocation, Period, PlannerTab, ScheduleEntry, WeekData } from '@/types/planner'
import './App.css'

interface PendingMove {
  source: CellLocation
  target: CellLocation
  entry: ScheduleEntry
}

interface PendingImport {
  week: WeekData
  fileName: string
  sourceWeek: string
  targetWeekKey: string
  targetWeekRange: string
}

const weekOptions = { weekStartsOn: 1 } as const

export default function App() {
  const auth = useSupabaseAuth()
  const planner = usePlannerStore(auth.user?.id ?? null)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), weekOptions))
  const [activeTab, setActiveTab] = useState<PlannerTab>('timetable')
  const [editMode, setEditMode] = useState(false)
  const [highlightJason, setHighlightJason] = useState(true)
  const [selectedDay, setSelectedDay] = useState('monday')
  const [editingCell, setEditingCell] = useState<CellLocation | null>(null)
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null)
  const [pendingMove, setPendingMove] = useState<PendingMove | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const layoutInputRef = useRef<HTMLInputElement>(null)

  const weekKey = format(weekStart, 'yyyy-MM-dd')
  const currentWeekKey = format(startOfWeek(new Date(), weekOptions), 'yyyy-MM-dd')
  const week = planner.getWeek(weekKey)
  const todos = planner.todos(weekKey)
  const notes = planner.notes(weekKey)
  const weekRange = `${format(weekStart, 'MMM d')} – ${format(addDays(weekStart, 4), 'MMM d, yyyy')}`

  const editingEntries = editingCell ? getCellEntries(week, editingCell.periodId, editingCell.day) : []
  const activePeriod = editingCell
    ? week.periodOverrides[editingCell.periodId] ?? ALL_PERIODS.find((period) => period.id === editingCell.periodId)
    : undefined

  const locationLabel = (location: CellLocation) => {
    const period = week.periodOverrides[location.periodId] ?? ALL_PERIODS.find((item) => item.id === location.periodId)
    const day = location.day === 'all' ? 'All weekdays' : DAYS.find((item) => item.id === location.day)?.label ?? location.day
    return { day, period: period?.name ?? location.periodId, time: period?.time ?? '' }
  }

  const changeWeek = (amount: number) => {
    setWeekStart((current) => addDays(current, amount))
    setEditMode(false)
    setEditingCell(null)
    setEditingPeriod(null)
    setPendingMove(null)
    setPendingImport(null)
  }

  const downloadLayout = () => {
    const blob = new Blob([createScheduleLayout(week, weekKey)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = `grade-6-schedule-${weekKey}.json`
    link.href = url
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Schedule layout downloaded')
  }

  const uploadLayout = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_LAYOUT_FILE_SIZE) {
      toast.error('This file is too large. Schedule layouts must be smaller than 1 MB.')
      return
    }
    try {
      const result = parseScheduleLayout(await file.text())
      if (!result.success) {
        toast.error(result.error)
        return
      }
      const importedWeek: WeekData = {
        ...result.week,
        cells: Object.fromEntries(Object.entries(result.week.cells).map(([key, entries]) => [
          key,
          entries.map((entry) => entry.kind === 'todo' && !todos.some((todo) => todo.id === entry.todoId)
            ? { ...entry, kind: 'task' as const, todoId: undefined }
            : entry),
        ])),
      }
      setPendingImport({
        week: importedWeek,
        fileName: file.name,
        sourceWeek: result.sourceWeek,
        targetWeekKey: weekKey,
        targetWeekRange: weekRange,
      })
    } catch {
      toast.error('Could not read this file. Please try again.')
    }
  }

  const exportTimetable = async () => {
    if (!exportRef.current || exporting) return
    setExporting(true)
    try {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      const dataUrl = await toPng(exportRef.current, {
        backgroundColor: '#fbfdfc',
        cacheBust: true,
        pixelRatio: 2,
      })
      const link = document.createElement('a')
      link.download = `grade-6-timetable-${weekKey}.png`
      link.href = dataUrl
      link.click()
      toast.success('Timetable image exported')
    } catch {
      toast.error('Could not export the image. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const tabs: { id: PlannerTab; label: string; count?: number }[] = [
    { id: 'timetable', label: 'Timetable' },
    { id: 'todos', label: 'Todos', count: todos.filter((todo) => !todo.completed).length },
    { id: 'notes', label: 'Notes', count: notes.length },
  ]

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-main">
          <div className="brand-block">
            <span className="brand-mark" aria-hidden="true"><CalendarRange /></span>
            <div>
              <h1>Grade 6 Weekly Timetable</h1>
              <p>Wake Up 7:00 – Bedtime 22:00 · Friday starts at 13:00</p>
            </div>
          </div>

          <CloudAccount
            email={auth.user?.email}
            authLoading={auth.authLoading}
            cloudStatus={planner.cloudStatus}
            cloudError={planner.cloudError}
            onSignIn={auth.signInWithEmail}
            onSignOut={auth.signOut}
            onRetry={planner.retryCloud}
          />
        </div>

        {activeTab === 'timetable' && (
          <div className="header-actions planner-actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditMode((current) => !current)}
                className={`header-button ${editMode ? 'edit-active' : ''}`}
              >
                {editMode ? <Check /> : <PencilLine />}
                <span>{editMode ? 'Done editing' : 'Enable edit'}</span>
              </Button>
              <Button type="button" variant="outline" onClick={exportTimetable} disabled={exporting} className="header-button export-button">
                <Download />
                <span>{exporting ? 'Exporting…' : 'Export image'}</span>
              </Button>
              <Button type="button" variant="outline" onClick={downloadLayout} className="header-button">
                <FileDown />
                <span>Download layout</span>
              </Button>
              <Button type="button" variant="outline" onClick={() => layoutInputRef.current?.click()} className="header-button">
                <Upload />
                <span>Upload layout</span>
              </Button>
              <input
                ref={layoutInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                aria-label="Choose a schedule layout file"
                onChange={(event) => {
                  void uploadLayout(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
              <Button asChild variant="outline" className="header-button offline-download">
                <a
                  href="./Grade%206%20Weekly%20Planner.html"
                  download="Grade 6 Weekly Planner.html"
                  title="Download a single HTML file that opens directly in your browser"
                >
                  <FileDown />
                  <span>Offline copy</span>
                </a>
              </Button>
              <Button type="button" variant="outline" onClick={() => setResetOpen(true)} className="header-button">
                <RotateCcw />
                <span>Reset</span>
              </Button>
              <span className={`mode-badge ${editMode ? 'mode-editing' : ''}`}>
                {editMode ? <PencilLine /> : <LockKeyhole />}
                {editMode ? 'Editing' : 'Read-only'}
              </span>
          </div>
        )}

        {activeTab === 'timetable' && (
          <div className="header-secondary">
            <p>Click a cell to edit it, or hold and drag a class to move it to another slot.</p>
            <button type="button" aria-pressed={highlightJason} onClick={() => setHighlightJason((current) => !current)} className={`highlight-toggle ${highlightJason ? 'highlight-active' : ''}`}>
              <Highlighter aria-hidden="true" /> Jason’s classes highlighted
            </button>
          </div>
        )}
      </header>

      <div className="workspace-bar">
        <nav className="planner-tabs" aria-label="Planner sections" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`planner-tab ${activeTab === tab.id ? 'planner-tab-active' : ''}`}
            >
              {tab.label}
              {tab.count !== undefined && <span>{tab.count}</span>}
            </button>
          ))}
        </nav>

        <div className="week-navigation" aria-label="Week navigation">
          <Button type="button" variant="outline" size="icon" onClick={() => changeWeek(-7)} className="week-arrow" aria-label="Previous week" title="Previous week"><ChevronLeft /></Button>
          <div className="week-label">
            <strong>{weekRange}</strong>
            <span>{weekKey === currentWeekKey ? 'This week' : 'Selected week'}</span>
          </div>
          <Button type="button" variant="outline" size="icon" onClick={() => changeWeek(7)} className="week-arrow" aria-label="Next week" title="Next week"><ChevronRight /></Button>
          <Button type="button" variant="ghost" onClick={() => { setWeekStart(startOfWeek(new Date(), weekOptions)); setEditMode(false) }} disabled={weekKey === currentWeekKey} className="today-button">This week</Button>
        </div>
      </div>

      <main className="app-main">
        {activeTab === 'timetable' && (
          <div role="tabpanel" aria-label="Timetable panel">
            <div ref={exportRef} className="export-area">
              <Timetable
                week={week}
                todos={todos}
                editMode={editMode}
                highlightJason={highlightJason}
                exporting={exporting}
                selectedDay={selectedDay}
                isCurrentWeek={weekKey === currentWeekKey}
                onSelectedDay={setSelectedDay}
                onEditCell={(periodId, day) => setEditingCell({ periodId, day })}
                onEditPeriod={setEditingPeriod}
                onRequestMove={(source, target, entry) => setPendingMove({ source, target, entry })}
                onToggleTodo={(todoId) => planner.toggleTodo(weekKey, todoId)}
              />
            </div>
          </div>
        )}
        {activeTab === 'todos' && (
          <div role="tabpanel" aria-label="Todos panel">
            <Todos todos={todos} onAdd={(text) => planner.addTodo(weekKey, text)} onToggle={(id) => planner.toggleTodo(weekKey, id)} onDelete={(id) => planner.deleteTodo(weekKey, id)} />
          </div>
        )}
        {activeTab === 'notes' && (
          <div role="tabpanel" aria-label="Notes panel">
            <Notes notes={notes} onAdd={() => planner.addNote(weekKey)} onUpdate={(id, values) => planner.updateNote(weekKey, id, values)} onDelete={(id) => planner.deleteNote(weekKey, id)} />
          </div>
        )}
      </main>

      <footer className="app-footer">
        <span className={planner.saveStatus === 'error' ? 'save-error' : ''}>
          <HardDrive aria-hidden="true" />
          {planner.saveStatus === 'saved' ? 'Saved in this browser' : 'Browser storage is unavailable'}
        </span>
        <span>
          {auth.user
            ? planner.cloudStatus === 'saved'
              ? `Cloud sync active for ${auth.user.email}`
              : planner.cloudStatus === 'error'
                ? 'Cloud sync needs attention; your local backup is safe.'
                : 'Connecting your planner to Supabase…'
            : 'Sign in to Cloud sync to use your planner on other devices.'}
        </span>
      </footer>

      <CellEditor
        open={editingCell !== null}
        onOpenChange={(open) => { if (!open) setEditingCell(null) }}
        period={activePeriod}
        dayLabel={editingCell?.day === 'all' ? 'all weekdays' : DAYS.find((day) => day.id === editingCell?.day)?.label ?? ''}
        entries={editingEntries}
        todos={todos}
        onSave={(entries) => {
          if (!editingCell) return
          planner.updateCell(weekKey, editingCell.periodId, editingCell.day, entries)
          toast.success('Timetable cell updated')
        }}
      />

      <PeriodEditor
        open={editingPeriod !== null}
        onOpenChange={(open) => { if (!open) setEditingPeriod(null) }}
        period={editingPeriod ?? undefined}
        onSave={(period) => {
          planner.updatePeriod(weekKey, period)
          toast.success('Period updated')
        }}
      />

      <AlertDialog open={pendingMove !== null} onOpenChange={(open) => { if (!open) setPendingMove(null) }}>
        <AlertDialogContent className="max-w-lg border-[#cbd5df] bg-[#fbfdfc]">
          {pendingMove && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Move this class?</AlertDialogTitle>
                <AlertDialogDescription>
                  Confirm the new timetable slot for {pendingMove.entry.className} · {pendingMove.entry.person} · {pendingMove.entry.room}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="move-confirmation">
                <div>
                  <span>From</span>
                  <strong>{locationLabel(pendingMove.source).day}</strong>
                  <small>{locationLabel(pendingMove.source).period} · {locationLabel(pendingMove.source).time}</small>
                </div>
                <ArrowRight aria-hidden="true" />
                <div>
                  <span>To</span>
                  <strong>{locationLabel(pendingMove.target).day}</strong>
                  <small>{locationLabel(pendingMove.target).period} · {locationLabel(pendingMove.target).time}</small>
                </div>
              </div>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="min-h-11 border-[#b9c6d2]">Keep original</AlertDialogCancel>
                <AlertDialogAction
                  className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]"
                  onClick={() => {
                    planner.moveEntry(
                      weekKey,
                      pendingMove.source.periodId,
                      pendingMove.source.day,
                      pendingMove.target.periodId,
                      pendingMove.target.day,
                      pendingMove.entry.id,
                    )
                    setPendingMove(null)
                    toast.success('Class moved to its new slot')
                  }}
                >
                  Move class
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={pendingImport !== null} onOpenChange={(open) => { if (!open) setPendingImport(null) }}>
        <AlertDialogContent className="border-[#cbd5df] bg-[#fbfdfc]">
          <AlertDialogHeader>
            <AlertDialogTitle>Replace this week’s schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              Uploading <strong>{pendingImport?.fileName}</strong> will replace the timetable, period settings, and break tasks for {pendingImport?.targetWeekRange}. Your todos and notes will not be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingImport && pendingImport.sourceWeek !== pendingImport.targetWeekKey && (
            <p className="text-sm text-[#526575]">
              This layout was downloaded from the week starting {pendingImport.sourceWeek} and will be applied to the currently viewed week.
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 border-[#b9c6d2]">Keep current schedule</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]"
              onClick={() => {
                if (!pendingImport) return
                planner.replaceWeek(pendingImport.targetWeekKey, pendingImport.week)
                setPendingImport(null)
                setEditMode(false)
                toast.success('Schedule layout uploaded')
              }}
            >
              Replace schedule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="border-[#cbd5df] bg-[#fbfdfc]">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset this week’s timetable?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores the original timetable for {weekRange}. Your todos and notes will not be changed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-11 border-[#b9c6d2]">Keep timetable</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-11 bg-[#9a3d3d] text-white hover:bg-[#783030]"
              onClick={() => {
                planner.resetWeek(weekKey)
                setEditMode(false)
                toast.success('Weekly timetable reset')
              }}
            >
              Reset timetable
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster position="bottom-center" closeButton />
    </div>
  )
}
