import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { EntryKind, Period, ScheduleEntry } from '@/types/planner'

interface CellEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: Period
  dayLabel: string
  entries: ScheduleEntry[]
  onSave: (entries: ScheduleEntry[]) => void
}

const kindLabels: Record<EntryKind, string> = {
  jason: "Jason’s class",
  class: 'Class',
  task: 'Task',
  duty: 'Special note / duty',
  notice: 'Time notice',
  info: 'Information',
  time: 'Time label',
}

const newId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`

export function CellEditor({ open, onOpenChange, period, dayLabel, entries, onSave }: CellEditorProps) {
  const [draft, setDraft] = useState<ScheduleEntry[]>([])
  const [error, setError] = useState('')
  const isClassBreak = period?.id.startsWith('class-break-') ?? false

  useEffect(() => {
    if (open) {
      setDraft(entries.map((entry) => ({ ...entry })))
      setError('')
    }
  }, [open, entries])

  const updateEntry = (id: string, values: Partial<ScheduleEntry>) => {
    setDraft((current) => current.map((entry) => (entry.id === id ? { ...entry, ...values } : entry)))
  }

  const addEntry = () => {
    setDraft((current) => [
      ...current,
      {
        id: newId(),
        kind: isClassBreak ? 'task' : 'class',
        className: '',
        person: '',
        room: '',
        label: '',
        detail: '',
      },
    ])
  }

  const save = () => {
    const invalid = draft.some((entry) => {
      if (entry.kind === 'class' || entry.kind === 'jason') return !entry.className.trim() || !entry.person.trim()
      return !entry.label.trim()
    })
    if (invalid) {
      setError('Add a class and teacher for lessons, or a label for tasks, notes, and notices.')
      return
    }
    onSave(draft)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto border-[#cbd5df] bg-[#fbfdfc] p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#172333]">Edit {dayLabel}</DialogTitle>
          <DialogDescription className="text-[#536274]">
            {period?.name} · {period?.time}. {isClassBreak
              ? 'Add tasks or notes to this 10-minute break.'
              : 'Add lessons, duties, or notices to this cell.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {draft.length === 0 && (
            <div className="border border-dashed border-[#b9c6d2] px-4 py-8 text-center text-sm text-[#5f6e7e]">
              {isClassBreak ? 'This break is empty. Add a task below.' : 'This cell is empty. Add an entry below.'}
            </div>
          )}

          {draft.map((entry, index) => {
            const isLesson = entry.kind === 'class' || entry.kind === 'jason'
            return (
              <section key={entry.id} className="border-b border-[#d8e0e6] py-5 first:pt-1 last:border-b-0" aria-label={`Entry ${index + 1}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <label className="sr-only" htmlFor={`kind-${entry.id}`}>Entry type</label>
                  <select
                    id={`kind-${entry.id}`}
                    value={entry.kind}
                    onChange={(event) => updateEntry(entry.id, { kind: event.target.value as EntryKind })}
                    className="min-h-11 rounded-md border border-[#b9c6d2] bg-white px-3 text-sm font-semibold text-[#243447] outline-none focus-visible:ring-2 focus-visible:ring-[#287f3c]"
                  >
                    {Object.entries(kindLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-[#a13c3c] hover:bg-[#fde9e7] hover:text-[#802d2d]"
                    onClick={() => setDraft((current) => current.filter((item) => item.id !== entry.id))}
                    aria-label={`Delete entry ${index + 1}`}
                    title="Delete entry"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {isLesson ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#536274]" htmlFor={`class-${entry.id}`}>Class</label>
                      <Input id={`class-${entry.id}`} value={entry.className} onChange={(event) => updateEntry(entry.id, { className: event.target.value })} placeholder="6B4" className="h-11 border-[#b9c6d2] bg-white" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#536274]" htmlFor={`person-${entry.id}`}>Teacher</label>
                      <Input id={`person-${entry.id}`} value={entry.person} onChange={(event) => updateEntry(entry.id, { person: event.target.value })} placeholder="Jason" className="h-11 border-[#b9c6d2] bg-white" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#536274]" htmlFor={`room-${entry.id}`}>Room</label>
                      <Input id={`room-${entry.id}`} value={entry.room} onChange={(event) => updateEntry(entry.id, { room: event.target.value })} placeholder="D313" className="h-11 border-[#b9c6d2] bg-white" />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#536274]" htmlFor={`label-${entry.id}`}>Label</label>
                      <Input id={`label-${entry.id}`} value={entry.label} onChange={(event) => updateEntry(entry.id, { label: event.target.value })} placeholder={entry.kind === 'time' ? '13:10–13:50' : entry.kind === 'task' ? 'Pack library books' : 'Morning reading'} className="h-11 border-[#b9c6d2] bg-white" />
                    </div>
                    {entry.kind !== 'time' && (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-[#536274]" htmlFor={`detail-${entry.id}`}>Detail (optional)</label>
                        <Input id={`detail-${entry.id}`} value={entry.detail} onChange={(event) => updateEntry(entry.id, { detail: event.target.value })} placeholder="Room, time, or extra detail" className="h-11 border-[#b9c6d2] bg-white" />
                      </div>
                    )}
                  </div>
                )}
              </section>
            )
          })}
        </div>

        {error && <p role="alert" className="mt-3 text-sm font-semibold text-[#a13c3c]">{error}</p>}

        <Button type="button" variant="outline" onClick={addEntry} className="mt-4 min-h-11 w-full border-dashed border-[#8ea2b2] bg-transparent text-[#29475d] hover:bg-[#edf4f6]">
          <Plus className="mr-2 h-4 w-4" /> {isClassBreak ? 'Add task' : 'Add entry'}
        </Button>

        <DialogFooter className="mt-5 gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-11 border-[#b9c6d2]">Cancel</Button>
          <Button type="button" onClick={save} className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
