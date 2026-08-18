export type Currency = 'KRW' | 'MNT'
export type ExpenseCategory = 'transport' | 'food' | 'lodging' | 'sightseeing' | 'shopping' | 'other'

export interface Trip {
  id: string
  name: string
  start_date: string | null
  end_date: string | null
  leader_member_id: string | null
  treasurer_member_id: string | null
}

export interface Member {
  id: string
  trip_id: string
  name: string
  group_label: string | null
  sort_order: number
}

export interface Expense {
  id: string
  trip_id: string
  title: string
  amount: number
  currency: Currency
  paid_by_member_id: string
  spent_on: string
  category: ExpenseCategory
  note: string | null
  created_at: string
}

export interface CommonTask {
  id: string
  trip_id: string
  title: string
  due_date: string | null
  sort_order: number
  category: 'required' | 'optional'
}

export interface CommonCheck {
  trip_id: string
  task_id: string
  member_id: string
  is_completed: boolean
  completed_at: string | null
}

export interface PersonalItem {
  id: string
  trip_id: string
  owner_member_id: string
  title: string
  is_completed: boolean
  completed_at: string | null
  due_date: string | null
  sort_order: number
  category: 'essential' | 'electronics' | 'clothing' | 'toiletries' | 'medicine' | 'other'
  priority: 'required' | 'optional'
  is_recommended: boolean
}

export interface ItineraryItem {
  id: string
  trip_id: string
  title: string
  day_number: number
  start_time: string | null
  end_time: string | null
  location: string | null
  note: string | null
  link_url: string | null
  status: 'proposed' | 'confirmed' | 'cancelled'
  source: 'quote_pdf' | 'manual'
  sort_order: number
}

export interface SharedFund {
  id: string
  trip_id: string
  name: string
  target_amount: number
  currency: Currency
}

export interface FundContribution {
  id: string
  trip_id: string
  fund_id: string
  member_id: string
  amount: number
  contributed_on: string
  note: string | null
  created_at: string
}

export interface TripData {
  trip: Trip
  members: Member[]
  expenses: Expense[]
  tasks: CommonTask[]
  checks: CommonCheck[]
  personalItems: PersonalItem[]
  itinerary: ItineraryItem[]
  sharedFunds: SharedFund[]
  fundContributions: FundContribution[]
}
