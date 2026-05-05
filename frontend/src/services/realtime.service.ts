import { supabase } from '../lib/supabase'
import { useBoardStore } from '../stores/boardStore'
import { useActivityStore } from '../stores/activityStore'
import { usePresenceStore } from '../stores/presenceStore'
import { getCardWithUser } from '../api/cards.api'
import type { ActivityEntry } from '../stores/activityStore'
import toast from 'react-hot-toast'

let channel: ReturnType<typeof supabase.channel> | null = null

async function fetchActivity(id: string): Promise<ActivityEntry | null> {
  const { data } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('id', id)
    .single()
  if (!data) return null

  // Fetch display name separately — no FK from activity_logs.user_id → profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', data.user_id)
    .maybeSingle()

  return {
    id: data.id,
    board_id: data.board_id,
    user_id: data.user_id,
    message: data.message,
    created_at: data.created_at,
    display_name: profile?.display_name || 'Unknown',
  }
}

export async function connectRealtime(
  boardId: string,
  userId: string,
  displayName: string
) {
  if (channel) return

  channel = supabase.channel(`board:${boardId}`, {
    config: { presence: { key: userId } },
  })

  // ── Presence ──────────────────────────────────────────────
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel!.presenceState<{ display_name: string }>()
    const users = Object.entries(state).map(([uid, metas]) => ({
      user_id: uid,
      display_name: (metas[0] as any).display_name || uid,
    }))
    usePresenceStore.getState().setUsers(users)
  })

  // ── Card INSERT ────────────────────────────────────────────
  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
    async (payload) => {
      const card = await getCardWithUser(payload.new.id)
      useBoardStore.getState().addCard(card)
    }
  )

  // ── Card UPDATE ────────────────────────────────────────────
  channel.on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
    async (payload) => {
      const card = await getCardWithUser(payload.new.id)
      useBoardStore.getState().updateCard(card)
    }
  )

  // ── Card DELETE ────────────────────────────────────────────
  channel.on(
    'postgres_changes',
    { event: 'DELETE', schema: 'public', table: 'cards', filter: `board_id=eq.${boardId}` },
    (payload) => {
      const old = payload.old as { id: string; column_id: string }
      useBoardStore.getState().deleteCard(old.id, old.column_id)
    }
  )

  // ── Activity INSERT ────────────────────────────────────────
  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `board_id=eq.${boardId}` },
    async (payload) => {
      const entry = await fetchActivity(payload.new.id)
      if (entry) useActivityStore.getState().addMessage(entry)
    }
  )

  // ── Deadline alerts (broadcast from Edge Function) ─────────
  channel.on('broadcast', { event: 'deadline_alert' }, ({ payload }) => {
    const cards = payload.cards as { card_title: string }[]
    cards.forEach((c) => {
      toast(`⏰ Deadline approaching: "${c.card_title}"`, {
        duration: 6000,
        style: { background: '#fef9e7', color: '#b7860b', border: '1px solid #b7860b' },
      })
    })
  })

  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel!.track({ display_name: displayName })
    }
  })
}

export async function disconnectRealtime() {
  if (channel) {
    await supabase.removeChannel(channel)
    channel = null
  }
  usePresenceStore.getState().clear()
}
