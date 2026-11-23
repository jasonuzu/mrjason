import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { AlarmClock, ChevronDown, Flag, Info, ListTodo, Pencil, Plus, Timer } from 'lucide-react'
import { CLASS_BREAKS, DAYS, DEFAULT_PERIODS, getCellEntries } from '@/data/schedule'
import type { CellLocation, Period, ScheduleEntry, WeekData } from '@/types/planner'

interface TimetableProps {
  week: WeekData
  editMode: boolean
  highlightJason: boolean
  exporting: boolean
  selectedDay: string
  isCurrentWeek: boolean
  onSelectedDay: (day: string) => void
  onEditCell: (periodId: string, day: string) => void
  onEditPeriod: (period: Period) => void
  onRequestMove: (source: CellLocation, target: CellLocation, entry: ScheduleEntry) => void
}

interface DragData {
  entry: ScheduleEntry
  source: CellLocation
}

interface LinePosition {
  top: number
  left: number
}

function EntryView({ entry }: { entry: ScheduleEntry }) {
  if (entry.kind === 'class' || entry.kind === 'jason') {
    return (
      <div className="lesson-line">
        {entry.className && <span className="class-badge">{entry.className}</span>}
        <strong>{entry.person}</strong>
        {entry.room && <span className="room-badge">{entry.room}</span>}
      </div>
    )
  }
  if (entry.kind === 'task') {
    return (
      <div className="entry-pill entry-task">
        <ListTodo aria-hidden="true" />
        <span>{entry.label}{entry.detail && <small>{entry.detail}</small>}</span>
      </div>
    )
  }
  if (entry.kind === 'duty') {
    return (
      <div className="entry-pill entry-duty">
        <Flag aria-hidden="true" />
        <span>{entry.label}{entry.detail && <small>{entry.detail}</small>}</span>
      </div>
    )
  }
  if (entry.kind === 'notice') {
    return (
      <div className="entry-pill entry-notice">
        <AlarmClock aria-hidden="true" />
        <span>{entry.label}{entry.detail && <small>{entry.detail}</small>}</span>
      </div>
    )
  }
  if (entry.kind === 'time') {
    return <div className="entry-time"><AlarmClock aria-hidden="true" />{entry.label}</div>
  }
  return (
    <div className="entry-pill entry-info">
      <Info aria-hidden="true" />
      <span>{entry.label}{entry.detail && <small>{entry.detail}</small>}</span>
    </div>
  )
}

function DraggableEntry({ entry, source, scope, editMode, exporting }: { entry: ScheduleEntry; source: CellLocation; scope: string; editMode: boolean; exporting: boolean }) {
  const isLesson = entry.kind === 'class' || entry.kind === 'jason'
  const enabled = isLesson && editMode && !exporting
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `${scope}-entry-${source.periodId}-${source.day}-${entry.id}`,
    data: { entry, source } satisfies DragData,
    disabled: !enabled,
  })

  if (!isLesson) return <EntryView entry={entry} />

  return (
    <div
      ref={setNodeRef}
      {...(enabled ? listeners : {})}
      {...(enabled ? attributes : {})}
      className={`lesson-draggable ${enabled ? 'lesson-draggable-enabled' : ''} ${isDragging ? 'lesson-dragging' : ''}`}
      aria-label={enabled ? `Move ${entry.className} ${entry.person} from ${source.day} ${source.periodId}` : undefined}
      title={enabled ? 'Hold and drag to move this class' : undefined}
    >
      <EntryView entry={entry} />
    </div>
  )
}

interface CellContentProps {
  entries: ScheduleEntry[]
  editMode: boolean
  exporting: boolean
  highlightJason: boolean
  label: string
  periodId: string
  day: string
  scope: string
  onEdit: () => void
  allDay?: boolean
}

function CellContent({ entries, editMode, exporting, highlightJason, label, periodId, day, scope, onEdit, allDay = false }: CellContentProps) {
  const highlighted = highlightJason && entries.some((entry) => entry.kind === 'jason')
  const { isOver, setNodeRef } = useDroppable({
    id: `${scope}-cell-${periodId}-${day}`,
    data: { periodId, day } satisfies CellLocation,
    disabled: !editMode || allDay,
  })

  return (
    <div
      ref={setNodeRef}
      className={`schedule-cell ${editMode ? 'schedule-cell-editable' : ''} ${highlighted ? 'cell-jason' : ''} ${allDay ? 'all-day-cell' : ''} ${isOver ? 'cell-drop-target' : ''}`}
    >
      <span className={`cell-entries ${allDay ? 'items-center text-center' : ''}`}>
        {entries.map((entry) => (
          <DraggableEntry key={entry.id} entry={entry} source={{ periodId, day }} scope={scope} editMode={editMode} exporting={exporting} />
        ))}
      </span>
      {editMode && (
        <button type="button" onClick={onEdit} className="cell-edit-trigger" aria-label={`Edit ${label}`}>
          {!exporting && entries.length === 0 && <Plus className="empty-cell-plus" aria-hidden="true" />}
          {!exporting && <Pencil className="cell-edit-icon" aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}

function PeriodLabel({ period, editMode, exporting, onEdit }: { period: Period; editMode: boolean; exporting: boolean; onEdit: () => void }) {
  const content = (
    <>
      <span className="period-name">{period.name}</span>
      <span className="period-time">{period.time}</span>
    </>
  )
  if (!editMode) return <div className="period-label">{content}</div>
  return (
    <button type="button" className="period-label period-label-editable" onClick={onEdit} aria-label={`Edit ${period.name} period`}>
      {content}
      {!exporting && <Pencil className="period-edit-icon" aria-hidden="true" />}
    </button>
  )
}

function periodMinutes(period: Period) {
  const match = period.time.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  return {
    start: Number(match[1]) * 60 + Number(match[2]),
    end: Number(match[3]) * 60 + Number(match[4]),
  }
}

function locateCurrentTime(periods: Period[], now: Date) {
  if (now.getDay() < 1 || now.getDay() > 5) return null
  const minutes = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60
  const candidates = periods
    .map((period) => ({ period, range: periodMinutes(period) }))
    .filter((item) => item.range && minutes >= item.range.start && minutes <= item.range.end)
    .sort((a, b) => (a.range!.end - a.range!.start) - (b.range!.end - b.range!.start))
  const match = candidates[0]
  if (!match?.range) return null
  return {
    period: match.period,
    day: DAYS[now.getDay() - 1].id,
    ratio: Math.min(1, Math.max(0, (minutes - match.range.start) / (match.range.end - match.range.start))),
  }
}

function resolvePeriods(overrides: WeekData['periodOverrides'], includeBreaks: boolean) {
  return DEFAULT_PERIODS.flatMap((period) => {
    const resolvedPeriod = overrides[period.id] ?? period
    const classBreak = includeBreaks ? CLASS_BREAKS[period.id] : undefined
    if (!classBreak) return [resolvedPeriod]
    return [resolvedPeriod, overrides[classBreak.id] ?? classBreak]
  })
}

export function Timetable({ week, editMode, highlightJason, exporting, selectedDay, isCurrentWeek, onSelectedDay, onEditCell, onEditPeriod, onRequestMove }: TimetableProps) {
  const [showBreaks, setShowBreaks] = useState(false)
  const periods = useMemo(() => resolvePeriods(week.periodOverrides, showBreaks), [showBreaks, week.periodOverrides])
  const timePeriods = useMemo(() => resolvePeriods(week.periodOverrides, true), [week.periodOverrides])
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  )
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null)
  const [now, setNow] = useState(() => new Date())
  const [desktopLine, setDesktopLine] = useState<LinePosition | null>(null)
  const [mobileLine, setMobileLine] = useState<LinePosition | null>(null)
  const desktopRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)
  const currentDay = isCurrentWeek && now.getDay() >= 1 && now.getDay() <= 5
    ? DAYS[now.getDay() - 1].id
    : null

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateLines = () => {
      const location = isCurrentWeek ? locateCurrentTime(timePeriods, now) : null
      if (!location) {
        setDesktopLine(null)
        setMobileLine(null)
        return
      }

      // A collapsed 10-minute break still occupies real time. Keep the line
      // visible at the preceding class boundary until the next class begins.
      const breakAnchor = Object.entries(CLASS_BREAKS).find(([, classBreak]) => classBreak.id === location.period.id)?.[0]
      const desktopRow = desktopRef.current?.querySelector<HTMLElement>(`tr[data-period-id="${location.period.id}"]`)
      const desktopAnchorRow = desktopRow ?? (breakAnchor
        ? desktopRef.current?.querySelector<HTMLElement>(`tr[data-period-id="${breakAnchor}"]`)
        : null)
      const currentDayHeading = desktopRef.current?.querySelector<HTMLElement>(`th[data-day="${location.day}"]`)
      const desktopTop = desktopRow
        ? desktopRow.offsetTop + desktopRow.offsetHeight * location.ratio
        : desktopAnchorRow
          ? desktopAnchorRow.offsetTop + desktopAnchorRow.offsetHeight
          : null
      setDesktopLine(desktopTop !== null && currentDayHeading ? {
        top: desktopTop,
        left: currentDayHeading.offsetLeft,
      } : null)

      const mobileRow = mobileRef.current?.querySelector<HTMLElement>(`.mobile-period[data-period-id="${location.period.id}"]`)
      const mobileAnchorRow = mobileRow ?? (breakAnchor
        ? mobileRef.current?.querySelector<HTMLElement>(`.mobile-period[data-period-id="${breakAnchor}"]`)
        : null)
      const mobileTop = mobileRow
        ? mobileRow.offsetTop + mobileRow.offsetHeight * location.ratio
        : mobileAnchorRow
          ? mobileAnchorRow.offsetTop + mobileAnchorRow.offsetHeight
          : null
      setMobileLine(mobileTop !== null && mobileAnchorRow && selectedDay === location.day ? {
        top: mobileTop,
        left: mobileAnchorRow.querySelector<HTMLElement>('.mobile-period-label')?.offsetWidth ?? 0,
      } : null)
    }

    const frame = requestAnimationFrame(updateLines)
    window.addEventListener('resize', updateLines)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateLines)
    }
  }, [isCurrentWeek, now, periods, selectedDay, timePeriods])

  const dragStart = (event: DragStartEvent) => {
    setActiveDrag((event.active.data.current as DragData | undefined) ?? null)
  }

  const dragEnd = (event: DragEndEvent) => {
    const drag = event.active.data.current as DragData | undefined
    const target = event.over?.data.current as CellLocation | undefined
    setActiveDrag(null)
    if (!drag || !target) return
    if (drag.source.periodId === target.periodId && drag.source.day === target.day) return
    onRequestMove(drag.source, target, drag.entry)
  }

  const renderCell = (period: Period, day: string, scope: string, allDay = false) => (
    <CellContent
      entries={getCellEntries(week, period.id, day)}
      editMode={editMode}
      exporting={exporting}
      highlightJason={highlightJason}
      label={`${day === 'all' ? 'all weekdays' : DAYS.find((item) => item.id === day)?.label} ${period.name}`}
      periodId={period.id}
      day={day}
      scope={scope}
      onEdit={() => onEditCell(period.id, day)}
      allDay={allDay}
    />
  )

  return (
    <DndContext sensors={sensors} onDragStart={dragStart} onDragCancel={() => setActiveDrag(null)} onDragEnd={dragEnd}>
      <section aria-label="Weekly timetable">
        <button
          type="button"
          className={`break-expander ${showBreaks ? 'break-expander-open' : ''}`}
          aria-expanded={showBreaks}
          aria-controls="timetable-schedules"
          onClick={() => setShowBreaks((current) => !current)}
        >
          <span className="break-expander-label">
            <Timer aria-hidden="true" />
            <strong>10-minute breaks</strong>
            <span>6</span>
          </span>
          <span className="break-expander-action">
            {showBreaks ? 'Hide' : 'Show'}
            <ChevronDown aria-hidden="true" />
          </span>
        </button>
        {showBreaks && <p className="break-edit-hint">Enable edit, then click any break cell to add a task.</p>}

        <div className="day-selector lg:hidden" aria-label="Choose a weekday">
          {DAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              aria-pressed={selectedDay === day.id}
              onClick={() => onSelectedDay(day.id)}
              className={`day-tab ${selectedDay === day.id ? 'day-tab-active' : ''}`}
            >
              {day.short}
            </button>
          ))}
        </div>

        <div id="timetable-schedules">
        <div ref={mobileRef} className="mobile-schedule lg:hidden">
          {periods.map((period) => (
            <div key={period.id} data-period-id={period.id} className={`mobile-period ${period.tone === 'break' ? 'period-break' : ''} ${period.id.startsWith('class-break-') ? 'class-break-row' : ''}`}>
              <div className="mobile-period-label">
                <PeriodLabel period={period} editMode={editMode} exporting={exporting} onEdit={() => onEditPeriod(period)} />
              </div>
              <div className="mobile-period-cell">
                {renderCell(period, period.id === 'evening-3' ? 'all' : selectedDay, 'mobile', period.id === 'evening-3')}
              </div>
            </div>
          ))}
          {mobileLine && !exporting && (
            <div className="current-time-indicator" style={{ top: mobileLine.top }} aria-hidden="true">
              <span className="current-time-dot" style={{ left: mobileLine.left }} />
            </div>
          )}
        </div>

        <div ref={desktopRef} className="timetable-desktop hidden lg:block">
          <table className="timetable-table">
            <caption className="sr-only">Grade 6 timetable from Monday to Friday</caption>
            <colgroup>
              <col className="period-column" />
              {DAYS.map((day) => <col key={day.id} className={currentDay === day.id ? 'current-day-column' : undefined} />)}
            </colgroup>
            <thead>
              <tr>
                <th scope="col" className="period-heading">PERIOD / TIME</th>
                {DAYS.map((day) => (
                  <th
                    scope="col"
                    data-day={day.id}
                    key={day.id}
                    className={currentDay === day.id ? 'current-day-heading' : undefined}
                    aria-current={currentDay === day.id ? 'date' : undefined}
                  >
                    {day.label.toUpperCase()}
                    {currentDay === day.id && <span className="current-day-label">Today</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.id} data-period-id={period.id} className={`${period.tone === 'break' ? 'period-break' : ''} ${period.id.startsWith('class-break-') ? 'class-break-row' : ''}`}>
                  <th scope="row">
                    <PeriodLabel period={period} editMode={editMode} exporting={exporting} onEdit={() => onEditPeriod(period)} />
                  </th>
                  {period.id === 'evening-3' ? (
                    <td colSpan={5}>{renderCell(period, 'all', 'desktop', true)}</td>
                  ) : (
                    DAYS.map((day) => (
                      <td key={day.id} className={currentDay === day.id ? 'current-day-cell' : undefined}>
                        {renderCell(period, day.id, 'desktop')}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {desktopLine && !exporting && (
            <div className="current-time-indicator" style={{ top: desktopLine.top }} aria-hidden="true">
              <span className="current-time-dot" style={{ left: desktopLine.left }} />
            </div>
          )}
        </div>
        </div>

        <div className="timetable-legend" aria-label="Timetable legend">
          <span><i className="legend-swatch legend-jason" />Jason’s class</span>
          <span><i className="legend-swatch legend-duty" />Special note / duty</span>
          <span><i className="legend-swatch legend-task" />Break task</span>
          <span><i className="legend-swatch legend-class" />Class (6B1 / 6B4)</span>
          <span><i className="legend-swatch legend-room" />Room (D313 / D328)</span>
          <span><i className="legend-swatch legend-notice" />N/A / time notice</span>
          <span><Pencil aria-hidden="true" />Edit or drag in edit mode</span>
        </div>
      </section>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
        {activeDrag && <div className="drag-overlay-card"><EntryView entry={activeDrag.entry} /></div>}
      </DragOverlay>
    </DndContext>
  )
}
