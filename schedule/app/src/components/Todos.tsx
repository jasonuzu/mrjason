import { useState } from 'react'
import type { FormEvent } from 'react'
import { CheckCircle2, Circle, ListTodo, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import type { Todo } from '@/types/planner'

interface TodosProps {
  todos: Todo[]
  onAdd: (text: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function Todos({ todos, onAdd, onToggle, onDelete }: TodosProps) {
  const [text, setText] = useState('')
  const open = todos.filter((todo) => !todo.completed)
  const completed = todos.filter((todo) => todo.completed)
  const percentage = todos.length ? Math.round((completed.length / todos.length) * 100) : 0

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    onAdd(value)
    setText('')
  }

  const renderTodo = (todo: Todo) => (
    <li key={todo.id} className="todo-item">
      <Checkbox
        id={`todo-${todo.id}`}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="h-5 w-5 border-[#799084] data-[state=checked]:border-[#216b36] data-[state=checked]:bg-[#216b36]"
        aria-label={`Mark ${todo.text} as ${todo.completed ? 'open' : 'complete'}`}
      />
      <label htmlFor={`todo-${todo.id}`} className={`todo-text ${todo.completed ? 'todo-complete' : ''}`}>{todo.text}</label>
      <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(todo.id)} className="h-11 w-11 shrink-0 text-[#9a4444] hover:bg-[#fde9e7] hover:text-[#792f2f]" aria-label={`Delete ${todo.text}`} title="Delete todo">
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  )

  return (
    <section className="planner-panel" aria-labelledby="todos-title">
      <div className="panel-heading">
        <div>
          <h2 id="todos-title">Weekly todos</h2>
          <p>{open.length} open · {completed.length} completed</p>
        </div>
        <ListTodo aria-hidden="true" />
      </div>

      <form onSubmit={submit} className="todo-form">
        <label htmlFor="new-todo" className="sr-only">New todo</label>
        <Input id="new-todo" value={text} onChange={(event) => setText(event.target.value)} placeholder="Add something to do this week…" className="h-12 border-[#b9c6d2] bg-white text-base" maxLength={240} />
        <Button type="submit" disabled={!text.trim()} className="h-12 bg-[#216b36] px-5 text-white hover:bg-[#19552b] disabled:opacity-45">
          <Plus className="mr-2 h-4 w-4" /> Add todo
        </Button>
      </form>

      {todos.length > 0 && (
        <div className="todo-progress">
          <div className="flex items-center justify-between gap-4 text-sm text-[#536274]">
            <span>Weekly progress</span><strong>{percentage}%</strong>
          </div>
          <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label="Todo completion">
            <span style={{ transform: `scaleX(${percentage / 100})` }} />
          </div>
        </div>
      )}

      {todos.length === 0 ? (
        <div className="empty-state">
          <Circle aria-hidden="true" />
          <h3>Your week is clear</h3>
          <p>Add your first todo above. It will be saved with this week.</p>
        </div>
      ) : (
        <div className="todo-sections">
          <div>
            <h3 className="list-heading">To do</h3>
            {open.length ? <ul className="todo-list">{open.map(renderTodo)}</ul> : <p className="inline-empty"><CheckCircle2 aria-hidden="true" /> Everything is complete.</p>}
          </div>
          {completed.length > 0 && (
            <div>
              <h3 className="list-heading">Completed</h3>
              <ul className="todo-list">{completed.map(renderTodo)}</ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
