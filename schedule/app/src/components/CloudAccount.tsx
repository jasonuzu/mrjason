import { useState } from 'react'
import { CheckCircle2, Cloud, CloudOff, LoaderCircle, LogOut, Mail, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { CloudStatus } from '@/hooks/use-planner-store'

interface CloudAccountProps {
  email?: string
  authLoading: boolean
  cloudStatus: CloudStatus
  cloudError: string | null
  onSignIn: (email: string) => Promise<void>
  onSignOut: () => Promise<void>
  onRetry: () => void
}

export function CloudAccount({
  email,
  authLoading,
  cloudStatus,
  cloudError,
  onSignIn,
  onSignOut,
  onRetry,
}: CloudAccountProps) {
  const [open, setOpen] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const signedIn = Boolean(email)

  const buttonLabel = authLoading || cloudStatus === 'loading'
    ? 'Connecting…'
    : cloudStatus === 'syncing'
      ? 'Syncing…'
      : cloudStatus === 'error'
        ? 'Sync issue'
        : signedIn
          ? 'Cloud synced'
          : 'Cloud sync'

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await onSignIn(emailInput)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send the sign-in link. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    setBusy(true)
    setError(null)
    try {
      await onSignOut()
      setSent(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not sign out. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={`header-button cloud-button ${signedIn && cloudStatus === 'saved' ? 'cloud-connected' : ''} ${cloudStatus === 'error' ? 'cloud-error' : ''}`}
        onClick={() => { setOpen(true); setError(null) }}
      >
        {authLoading || cloudStatus === 'loading' || cloudStatus === 'syncing'
          ? <LoaderCircle className="animate-spin" />
          : cloudStatus === 'error'
            ? <CloudOff />
            : <Cloud />}
        <span>{buttonLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-[#cbd5df] bg-[#fbfdfc] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{signedIn ? 'Cloud sync' : 'Use your planner everywhere'}</DialogTitle>
            <DialogDescription>
              {signedIn
                ? 'Your schedules, todos, and notes are linked to this account.'
                : 'Sign in with an email link to sync your planner securely across devices.'}
            </DialogDescription>
          </DialogHeader>

          {signedIn ? (
            <div className="cloud-account-panel">
              <div className="cloud-account-email"><Mail aria-hidden="true" /><span>{email}</span></div>
              <div className={`cloud-status-message ${cloudStatus === 'error' ? 'cloud-status-error' : ''}`}>
                {cloudStatus === 'saved' && <CheckCircle2 aria-hidden="true" />}
                {cloudStatus === 'syncing' || cloudStatus === 'loading' ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                {cloudStatus === 'error' ? <CloudOff aria-hidden="true" /> : null}
                <span>
                  {cloudStatus === 'saved' && 'All changes are saved to Supabase. A local backup remains in this browser.'}
                  {cloudStatus === 'syncing' && 'Saving your latest changes…'}
                  {cloudStatus === 'loading' && 'Loading your cloud planner…'}
                  {cloudStatus === 'error' && (cloudError ?? 'Cloud sync is unavailable. Your local changes are safe.')}
                </span>
              </div>
              {cloudStatus === 'error' && (
                <Button type="button" variant="outline" onClick={onRetry} className="min-h-11">
                  <RefreshCw /> Retry cloud sync
                </Button>
              )}
              <Button type="button" variant="outline" onClick={signOut} disabled={busy} className="min-h-11 self-start">
                <LogOut /> {busy ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          ) : sent ? (
            <div className="cloud-sent" role="status">
              <Mail aria-hidden="true" />
              <div>
                <strong>Check your email</strong>
                <p>We sent a sign-in link to <b>{emailInput}</b>. Open it on this device to finish signing in.</p>
              </div>
              <Button type="button" variant="outline" onClick={() => setSent(false)} className="min-h-11">Use another email</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="cloud-signin-form">
              <label htmlFor="cloud-email">Email address</label>
              <input
                id="cloud-email"
                type="email"
                autoComplete="email"
                required
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                placeholder="you@example.com"
                disabled={busy}
              />
              <Button type="submit" disabled={busy || !emailInput.trim()} className="min-h-11 bg-[#216b36] text-white hover:bg-[#19552b]">
                {busy ? <LoaderCircle className="animate-spin" /> : <Mail />}
                {busy ? 'Sending…' : 'Send sign-in link'}
              </Button>
              <p className="cloud-local-note">No password needed. You can also keep using the planner without signing in; it will remain saved only in this browser.</p>
            </form>
          )}
          {error && <p className="cloud-form-error" role="alert">{error}</p>}
        </DialogContent>
      </Dialog>
    </>
  )
}
