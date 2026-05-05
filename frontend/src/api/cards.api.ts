import { supabase } from '../lib/supabase'
import type { CardRow } from '../stores/boardStore'

async function logActivity(boardId: string, userId: string, message: string) {
  await supabase.from('activity_logs').insert({ board_id: boardId, user_id: userId, message })
}

// Fetch card then separately fetch the assigned user profile
// (no FK from cards.assigned_user_id → profiles, so no join syntax)
export async function getCardWithUser(cardId: string): Promise<CardRow> {
  const { data: card, error } = await supabase
    .from('cards')
    .select('*')
    .eq('id', cardId)
    .single()
  if (error) throw new Error(error.message)

  let assigned_user = null
  if (card.assigned_user_id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('id', card.assigned_user_id)
      .maybeSingle()
    assigned_user = profile || null
  }

  return { ...card, assigned_user } as CardRow
}

async function getBoardIdForColumn(columnId: string): Promise<string> {
  const { data } = await supabase
    .from('columns')
    .select('board_id')
    .eq('id', columnId)
    .single()
  return data?.board_id || ''
}

export const cardsApi = {
  create: async (
    columnId: string,
    data: { title: string; description?: string; assigned_user_id?: string | null; deadline?: string | null },
    userId: string,
    displayName: string
  ): Promise<CardRow> => {
    const boardId = await getBoardIdForColumn(columnId)
    const { data: card, error } = await supabase
      .from('cards')
      .insert({ column_id: columnId, board_id: boardId, ...data })
      .select()
      .single()
    if (error) throw new Error(error.message)
    await logActivity(boardId, userId, `${displayName} created card '${card.title}'`)
    return getCardWithUser(card.id)
  },

  update: async (
    cardId: string,
    data: { title?: string; description?: string | null; assigned_user_id?: string | null; deadline?: string | null },
    userId: string,
    displayName: string
  ): Promise<CardRow> => {
    const { data: card, error } = await supabase
      .from('cards')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select('board_id, title')
      .single()
    if (error) throw new Error(error.message)
    await logActivity(card.board_id, userId, `${displayName} updated card '${card.title}'`)
    return getCardWithUser(cardId)
  },

  delete: async (cardId: string, userId: string, displayName: string): Promise<void> => {
    const { data: card } = await supabase
      .from('cards')
      .select('board_id, title')
      .eq('id', cardId)
      .maybeSingle()
    if (card) {
      await logActivity(card.board_id, userId, `${displayName} deleted card '${card.title}'`)
    }
    const { error } = await supabase.from('cards').delete().eq('id', cardId)
    if (error) throw new Error(error.message)
  },

  move: async (
    cardId: string,
    targetColumnId: string,
    userId: string,
    displayName: string
  ): Promise<CardRow> => {
    const { data: card, error } = await supabase
      .from('cards')
      .update({ column_id: targetColumnId, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .select('board_id, title')
      .single()
    if (error) throw new Error(error.message)
    await logActivity(card.board_id, userId, `${displayName} moved card '${card.title}'`)
    return getCardWithUser(cardId)
  },
}
