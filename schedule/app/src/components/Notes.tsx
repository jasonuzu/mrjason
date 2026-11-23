import { format } from 'date-fns'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Note } from '@/types/planner'

interface NotesProps {
  notes: Note[]
  onAdd: () => void
  onUpdate: (id: string, values: Pick<Note, 'title' | 'content'>) => void
  onDelete: (id: string) => void
}

export function Notes({ notes, onAdd, onUpdate, onDelete }: NotesProps) {
  return (
    <section className="planner-panel" aria-labelledby="notes-title">
      <div className="panel-heading">
        <div>
          <h2 id="notes-title">Weekly notes</h2>
          <p>Changes save automatically as you type.</p>
        </div>
        <Button type="button" onClick={onAdd} className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]">
          <Plus className="mr-2 h-4 w-4" /> Add note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <FileText aria-hidden="true" />
          <h3>No notes for this week</h3>
          <p>Keep reminders, lesson ideas, and weekly reflections here.</p>
          <Button type="button" variant="outline" onClick={onAdd} className="mt-5 min-h-11 border-[#9aabb9]">Create your first note</Button>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <article key={note.id} className="note-sheet">
              <div className="note-title-row">
                <label htmlFor={`note-title-${note.id}`} className="sr-only">Note title</label>
                <Input
                  id={`note-title-${note.id}`}
                  value={note.title}
                  onChange={(event) => onUpdate(note.id, { title: event.target.value, content: note.content })}
                  className="h-11 border-0 bg-transparent px-0 text-lg font-bold shadow-none focus-visible:ring-0"
                  placeholder="Note title"
                  maxLength={120}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(note.id)} className="h-11 w-11 shrink-0 text-[#9a4444] hover:bg-[#fde9e7] hover:text-[#792f2f]" aria-label={`Delete ${note.title || 'note'}`} title="Delete note">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <label htmlFor={`note-content-${note.id}`} className="sr-only">Note content</label>
              <Textarea
                id={`note-content-${note.id}`}
                value={note.content}
                onChange={(event) => onUpdate(note.id, { title: note.title, content: event.target.value })}
                placeholder="Write your note…"
                className="min-h-40 resize-y border-0 bg-transparent px-0 text-base leading-7 shadow-none focus-visible:ring-0"
              />
              <p className="note-date">Updated {format(new Date(note.updatedAt), 'MMM d, h:mm a')}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
