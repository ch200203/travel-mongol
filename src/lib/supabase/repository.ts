import type { RealtimeChannel } from '@supabase/supabase-js'
import { configurationError, isLocalMode, supabase } from './client'
import type { CommonCheck, CommonTask, Expense, FundContribution, ItineraryItem, Member, PersonalItem, SharedFund, Trip, TripData } from '../types'
import { deleteLocalRow, insertLocalRow, loadLocalData, setLocalCommonCheck, subscribeToLocalData, updateLocalRoles, updateLocalRow } from '../localStore'

function client() {
  if (!supabase) throw new Error(configurationError ?? 'Supabase 연결을 만들 수 없습니다.')
  return supabase
}

function failed(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

export async function loadTripData(): Promise<TripData> {
  if (isLocalMode) return loadLocalData()
  const db = client()
  const tripResult = await db.from('trips').select('*').limit(1).single()
  failed(tripResult.error)
  const trip = tripResult.data as Trip
  const tripId = trip.id
  const [members, expenses, tasks, checks, personalItems, itinerary, sharedFunds, fundContributions] = await Promise.all([
    db.from('members').select('*').eq('trip_id', tripId).order('sort_order'),
    db.from('expenses').select('*').eq('trip_id', tripId).order('spent_on', { ascending: false }).order('created_at', { ascending: false }),
    db.from('common_preparation_tasks').select('*').eq('trip_id', tripId).order('sort_order'),
    db.from('common_preparation_checks').select('*').eq('trip_id', tripId),
    db.from('personal_preparation_items').select('*').eq('trip_id', tripId).order('sort_order'),
    db.from('itinerary_items').select('*').eq('trip_id', tripId).order('day_number').order('start_time').order('sort_order'),
    db.from('shared_funds').select('*').eq('trip_id', tripId).order('created_at'),
    db.from('fund_contributions').select('*').eq('trip_id', tripId).order('contributed_on', { ascending: false }).order('created_at', { ascending: false }),
  ])
  for (const result of [members, expenses, tasks, checks, personalItems, itinerary, sharedFunds, fundContributions]) failed(result.error)
  return {
    trip,
    members: members.data as Member[],
    expenses: expenses.data as Expense[],
    tasks: tasks.data as CommonTask[],
    checks: checks.data as CommonCheck[],
    personalItems: personalItems.data as PersonalItem[],
    itinerary: itinerary.data as ItineraryItem[],
    sharedFunds: sharedFunds.data as SharedFund[],
    fundContributions: fundContributions.data as FundContribution[],
  }
}

export async function insertRow(table: string, values: object) {
  if (isLocalMode) { insertLocalRow(table, values); return }
  const { error } = await client().from(table).insert(values)
  failed(error)
}

export async function updateRow(table: string, id: string, values: object) {
  if (isLocalMode) { updateLocalRow(table, id, values); return }
  const { error } = await client().from(table).update(values).eq('id', id)
  failed(error)
}

export async function deleteRow(table: string, id: string) {
  if (isLocalMode) { deleteLocalRow(table, id); return }
  const { error } = await client().from(table).delete().eq('id', id)
  failed(error)
}

export async function updateRoles(tripId: string, values: Pick<Trip, 'leader_member_id' | 'treasurer_member_id'>) {
  if (isLocalMode) { updateLocalRoles(values); return }
  const { error } = await client().from('trips').update(values).eq('id', tripId)
  failed(error)
}

export async function setCommonCheck(check: Omit<CommonCheck, 'completed_at'> & { completed_at?: string | null }) {
  if (isLocalMode) { setLocalCommonCheck({ ...check, completed_at: check.completed_at ?? null }); return }
  const { error } = await client().from('common_preparation_checks').upsert(check, { onConflict: 'trip_id,task_id,member_id' })
  failed(error)
}

const realtimeTables = [
  { table: 'trips', filterColumn: 'id' },
  { table: 'members', filterColumn: 'trip_id' },
  { table: 'expenses', filterColumn: 'trip_id' },
  { table: 'common_preparation_tasks', filterColumn: 'trip_id' },
  { table: 'common_preparation_checks', filterColumn: 'trip_id' },
  { table: 'personal_preparation_items', filterColumn: 'trip_id' },
  { table: 'itinerary_items', filterColumn: 'trip_id' },
  { table: 'shared_funds', filterColumn: 'trip_id' },
  { table: 'fund_contributions', filterColumn: 'trip_id' },
]

export function subscribeToTrip(tripId: string, onChange: () => void): () => void {
  if (isLocalMode) return subscribeToLocalData(onChange)
  const db = client()
  let channel: RealtimeChannel = db.channel(`trip:${tripId}`)
  for (const { table, filterColumn } of realtimeTables) {
    channel = channel.on('postgres_changes', { event: '*', schema: 'api', table, filter: `${filterColumn}=eq.${tripId}` }, onChange)
  }
  channel.subscribe()
  return () => { void db.removeChannel(channel) }
}
