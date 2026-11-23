import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Period } from '@/types/planner'

interface PeriodEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  period?: Period
  onSave: (period: Period) => void
}

export function PeriodEditor({ open, onOpenChange, period, onSave }: PeriodEditorProps) {
  const [name, setName] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && period) {
      setName(period.name)
      setTime(period.time)
      setError('')
    }
  }, [open, period])

  const save = () => {
    if (!period) return
    if (!name.trim() || !time.trim()) {
      setError('Both the period name and time are required.')
      return
    }
    onSave({ ...period, name: name.trim(), time: time.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-[#cbd5df] bg-[#fbfdfc]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#172333]">Edit period</DialogTitle>
          <DialogDescription className="text-[#536274]">Change this period for the selected week only.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div>
            <label htmlFor="period-name" className="mb-1.5 block text-sm font-semibold text-[#33475a]">Period name</label>
            <Input id="period-name" value={name} onChange={(event) => setName(event.target.value)} className="h-11 border-[#b9c6d2] bg-white" />
          </div>
          <div>
            <label htmlFor="period-time" className="mb-1.5 block text-sm font-semibold text-[#33475a]">Time</label>
            <Input id="period-time" value={time} onChange={(event) => setTime(event.target.value)} className="h-11 border-[#b9c6d2] bg-white" />
          </div>
          {error && <p role="alert" className="text-sm font-semibold text-[#a13c3c]">{error}</p>}
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="min-h-11 border-[#b9c6d2]">Cancel</Button>
          <Button type="button" onClick={save} className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]">Save period</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
