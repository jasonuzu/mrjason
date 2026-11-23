import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    let active = true
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session)
        setAuthLoading(false)
      }
    })
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const signInWithEmail = async (email: string) => {
    if (!isSupabaseConfigured) throw new Error('Supabase has not been configured for this copy of the planner.')
    if (window.location.protocol === 'file:') {
      throw new Error('Open the hosted planner to sign in. Your offline copy can continue using browser-local storage.')
    }
    const emailRedirectTo = `${window.location.origin}${window.location.pathname}`
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    session,
    user: session?.user ?? null,
    authLoading,
    signInWithEmail,
    signOut,
  }
}
