import type { CommonCheck, CommonTask, Expense, FundContribution, ItineraryItem, Member, PersonalItem, SharedFund, Trip, TripData } from './types'

const STORAGE_KEY = 'mongolia-friends-trip:v1'
const tripId = 'local-trip'

const members: Member[] = ['김승미', '김지은', '서유리', '인철환', '최태규', '이현종'].map((name, index) => ({
  id: `local-member-${index + 1}`,
  trip_id: tripId,
  name,
  group_label: index < 3 ? '여' : '남',
  sort_order: index,
}))

const taskSeeds: Array<{ id: string; title: string; category: CommonTask['category'] }> = [
  { id: 'local-common-passport', title: '여권 유효기간 확인', category: 'required' },
  { id: 'local-common-flight', title: '항공권 발권', category: 'required' },
  { id: 'local-common-deposit', title: '예약금 21만원 입금', category: 'required' },
  { id: 'local-common-balance', title: '현지 잔금 95만원 준비', category: 'required' },
  { id: 'local-common-flight-time', title: '항공편 시간 확인', category: 'required' },
  { id: 'local-common-eagle', title: '독수리 체험 참여 여부 정하기', category: 'optional' },
  { id: 'local-common-museum', title: '징기스칸 동상 박물관 입장 여부 정하기', category: 'optional' },
  { id: 'local-common-lunch', title: '마지막 날 점심 업그레이드 여부 정하기', category: 'optional' },
]

const tasks: CommonTask[] = taskSeeds.map(({ id, title, category }, index) => ({
  id,
  trip_id: tripId,
  title,
  due_date: null,
  sort_order: index,
  category,
}))

const recommendedItems: Array<Pick<PersonalItem, 'title' | 'category' | 'priority'>> = [
  { title: '유심/eSIM 준비', category: 'electronics', priority: 'required' },
  { title: '보조배터리', category: 'electronics', priority: 'required' },
  { title: '충전기·충전 케이블', category: 'electronics', priority: 'required' },
  { title: '선 있는 멀티탭', category: 'electronics', priority: 'optional' },
  { title: '보온 가능한 겉옷', category: 'clothing', priority: 'required' },
  { title: '반팔·긴팔 레이어드 옷', category: 'clothing', priority: 'required' },
  { title: '걷기 편한 신발', category: 'clothing', priority: 'required' },
  { title: '게르·차량용 슬리퍼', category: 'clothing', priority: 'optional' },
  { title: '모자·선글라스', category: 'clothing', priority: 'required' },
  { title: '낙타 체험용 장갑', category: 'clothing', priority: 'optional' },
  { title: '자외선 차단제', category: 'toiletries', priority: 'required' },
  { title: '보습제·립밤', category: 'toiletries', priority: 'required' },
  { title: '개인 세면용품', category: 'toiletries', priority: 'required' },
  { title: '속건 수건', category: 'toiletries', priority: 'optional' },
  { title: '휴대용 티슈·물티슈', category: 'toiletries', priority: 'required' },
  { title: '본인 복용약', category: 'medicine', priority: 'required' },
  { title: '기본 상비약·복용법 확인', category: 'medicine', priority: 'optional' },
  { title: '멀미약', category: 'medicine', priority: 'optional' },
  { title: '지퍼백·비닐봉지', category: 'other', priority: 'required' },
  { title: '물병', category: 'other', priority: 'required' },
  { title: '귀마개', category: 'other', priority: 'optional' },
  { title: '별사진용 삼각대', category: 'other', priority: 'optional' },
  { title: '핫팩', category: 'other', priority: 'optional' },
  { title: '여행자보험 가입 여부 결정', category: 'other', priority: 'optional' },
]

function personalSeed(): PersonalItem[] {
  return members.flatMap((member) => recommendedItems.map((item, index) => ({
    id: `local-personal-${member.sort_order + 1}-${index + 1}`,
    trip_id: tripId,
    owner_member_id: member.id,
    title: item.title,
    is_completed: false,
    completed_at: null,
    due_date: null,
    sort_order: index,
    category: item.category,
    priority: item.priority,
    is_recommended: true,
  })))
}

const itinerarySeed: Array<[number, string, string, string]> = [
  [1, '06:00', '차강소브라가', '하이에스 이동 · 공항 미팅 후 출발 · 차강소브라가 일몰'],
  [2, '08:00', '욜링암', '욜링암 투어 · 캠프파이어와 은하수 헌팅 선택'],
  [3, '08:00', '홍고린엘스', '고비사막 투어 · 모래썰매 · 낙타 체험'],
  [4, '09:00', '바양작', '바양작 투어 후 여행자 캠프 숙박'],
  [5, '07:00', '테를지', '테를지 국립공원 · 아리야발 사원 · 거북바위 · 승마 체험'],
  [6, '08:00', '울란바토르', '징기스칸 기마 동상 · 시내 투어 · 공항 샌딩'],
]

const cancelledBagaItem: ItineraryItem = {
  id: 'local-itinerary-baga-cancelled', trip_id: tripId, title: '바가가즈린촐로 투어', day_number: 1,
  start_time: '10:00', end_time: null, location: '바가가즈린촐로', note: '방문하지 않는 일정', link_url: null,
  status: 'cancelled', source: 'quote_pdf', sort_order: 1,
}

const flightItems: ItineraryItem[] = [
  {
    id: 'local-flight-outbound', trip_id: tripId, title: '인천 → 울란바토르 (OM 310)', day_number: 1,
    start_time: '01:50', end_time: '04:30', location: 'ICN 터미널 1 → UBN',
    note: 'MIAT 몽골항공 · 직항 · Economy Saver · 3시간 40분 · 확정', link_url: null,
    status: 'confirmed', source: 'manual', sort_order: 0,
  },
  {
    id: 'local-flight-inbound', trip_id: tripId, title: '울란바토르 → 인천 (OM 307)', day_number: 6,
    start_time: '18:15', end_time: '22:25', location: 'UBN → ICN 터미널 1',
    note: 'MIAT 몽골항공 · 직항 · Economy Saver · 3시간 10분 · 확정', link_url: null,
    status: 'confirmed', source: 'manual', sort_order: 99,
  },
]

function initialData(): TripData {
  const data: TripData = {
    trip: {
      id: tripId,
      name: '몽골 고비사막·테를지 원정대',
      start_date: '2026-09-09',
      end_date: '2026-09-14',
      leader_member_id: null,
      treasurer_member_id: null,
    },
    members,
    expenses: [],
    tasks,
    checks: tasks.flatMap((task) => members.map((member) => ({
      trip_id: tripId,
      task_id: task.id,
      member_id: member.id,
      is_completed: task.id === 'local-common-deposit',
      completed_at: task.id === 'local-common-deposit' ? '2026-08-18T00:00:00+09:00' : null,
    }))),
    personalItems: personalSeed(),
    itinerary: [...flightItems, cancelledBagaItem, ...itinerarySeed.map<ItineraryItem>(([day, time, title, note], index) => ({
      id: `local-itinerary-${day}`,
      trip_id: tripId,
      title,
      day_number: day,
      start_time: time,
      end_time: null,
      location: title,
      note,
      link_url: null,
      status: 'proposed',
      source: 'quote_pdf',
      sort_order: index,
    }))],
    sharedFunds: [{ id: 'local-shared-fund', trip_id: tripId, name: '여행 공금', target_amount: 0, currency: 'KRW' }],
    fundContributions: [],
  }
  return sortItinerary(data)
}

function sortItinerary(data: TripData): TripData {
  data.itinerary.sort((left, right) => left.day_number - right.day_number || (left.start_time ?? '').localeCompare(right.start_time ?? '') || left.sort_order - right.sort_order)
  return data
}

export function loadLocalData(): TripData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const data = initialData()
    saveLocalData(data)
    return sortItinerary(data)
  }
  try {
    const data = JSON.parse(stored) as TripData
    let changed = false
    if (!data.sharedFunds) { data.sharedFunds = [{ id: 'local-shared-fund', trip_id: tripId, name: '여행 공금', target_amount: 0, currency: 'KRW' }]; changed = true }
    if (!data.fundContributions) { data.fundContributions = []; changed = true }
    if (data.trip.start_date !== '2026-09-09' || data.trip.end_date !== '2026-09-14') {
      data.trip.start_date = '2026-09-09'
      data.trip.end_date = '2026-09-14'
      changed = true
    }
    for (const flight of flightItems) {
      if (!data.itinerary.some((item) => item.id === flight.id)) { data.itinerary.push(flight); changed = true }
    }
    if (!data.itinerary.some((item) => item.id === cancelledBagaItem.id)) {
      data.itinerary.push({ ...cancelledBagaItem })
      changed = true
    }
    if (!tasks.every((task) => data.tasks.some((item) => item.id === task.id))) {
      const oldTasks = data.tasks
      const oldChecks = data.checks
      const knownPattern = /여권|항공권 발권|예약금|현지 잔금|여행자보험|유심|개인 준비물 목록|운동화|항공편 시간|비상 연락처|독수리 체험|기마 동상|점심 업그레이드/
      const customTasks = oldTasks.filter((task) => !knownPattern.test(task.title) && !tasks.some((seed) => seed.id === task.id))
        .map((task, index) => ({ ...task, category: task.category ?? 'required' as const, sort_order: tasks.length + index }))
      const aliases: Record<string, RegExp> = {
        'local-common-passport': /여권/,
        'local-common-flight': /항공권 발권/,
        'local-common-deposit': /예약금/,
        'local-common-balance': /현지 잔금/,
        'local-common-flight-time': /항공편 시간/,
        'local-common-eagle': /독수리 체험/,
        'local-common-museum': /기마 동상/,
        'local-common-lunch': /점심 업그레이드/,
      }
      const migratedChecks = tasks.flatMap((task) => data.members.map((member) => {
        const oldTask = oldTasks.find((item) => aliases[task.id]?.test(item.title))
        const oldCheck = oldTask && oldChecks.find((item) => item.task_id === oldTask.id && item.member_id === member.id)
        const completed = task.id === 'local-common-deposit' || oldCheck?.is_completed === true
        return { trip_id: data.trip.id, task_id: task.id, member_id: member.id, is_completed: completed, completed_at: completed ? oldCheck?.completed_at ?? '2026-08-18T00:00:00+09:00' : null }
      }))
      const customIds = new Set(customTasks.map((task) => task.id))
      data.tasks = [...tasks.map((task) => ({ ...task })), ...customTasks]
      data.checks = [...migratedChecks, ...oldChecks.filter((check) => customIds.has(check.task_id))]
      changed = true
    }
    data.personalItems = data.personalItems.map((item) => ({
      ...item,
      category: item.category ?? 'other',
      priority: item.priority ?? 'optional',
      is_recommended: item.is_recommended ?? false,
    }))
    for (const recommendation of personalSeed()) {
      if (!data.personalItems.some((item) => item.owner_member_id === recommendation.owner_member_id && item.title === recommendation.title)) {
        data.personalItems.push(recommendation)
        changed = true
      }
    }
    const firstDay = data.itinerary.find((item) => item.id === 'local-itinerary-1')
    if (firstDay && firstDay.title.includes('바가가즈린촐로')) {
      firstDay.title = '차강소브라가'
      firstDay.location = '차강소브라가'
      firstDay.note = '하이에스 이동 · 공항 미팅 후 출발 · 차강소브라가 일몰'
      changed = true
    }
    if (firstDay && !firstDay.note?.includes('하이에스')) {
      firstDay.note = `하이에스 이동 · ${firstDay.note ?? ''}`.trim()
      changed = true
    }
    if (changed) saveLocalData(data)
    return data
  } catch {
    const data = initialData()
    saveLocalData(data)
    return data
  }
}

function saveLocalData(data: TripData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function addRow<T>(rows: T[], values: object): T[] {
  return [...rows, { ...values, id: crypto.randomUUID(), created_at: new Date().toISOString() } as T]
}

function changeRow<T extends { id: string }>(rows: T[], id: string, values: object): T[] {
  return rows.map((row) => row.id === id ? { ...row, ...values } : row)
}

export function insertLocalRow(table: string, values: object) {
  const data = loadLocalData()
  switch (table) {
    case 'expenses': data.expenses = addRow<Expense>(data.expenses, values); break
    case 'common_preparation_tasks': data.tasks = addRow<CommonTask>(data.tasks, values); break
    case 'personal_preparation_items': data.personalItems = addRow<PersonalItem>(data.personalItems, values); break
    case 'itinerary_items': data.itinerary = addRow<ItineraryItem>(data.itinerary, values); break
    case 'fund_contributions': data.fundContributions = addRow<FundContribution>(data.fundContributions, values); break
    default: throw new Error(`지원하지 않는 로컬 테이블입니다: ${table}`)
  }
  saveLocalData(data)
}

export function updateLocalRow(table: string, id: string, values: object) {
  const data = loadLocalData()
  switch (table) {
    case 'expenses': data.expenses = changeRow(data.expenses, id, values); break
    case 'common_preparation_tasks': data.tasks = changeRow(data.tasks, id, values); break
    case 'personal_preparation_items': data.personalItems = changeRow(data.personalItems, id, values); break
    case 'itinerary_items': data.itinerary = changeRow(data.itinerary, id, values); break
    case 'shared_funds': data.sharedFunds = changeRow<SharedFund>(data.sharedFunds, id, values); break
    case 'fund_contributions': data.fundContributions = changeRow(data.fundContributions, id, values); break
    default: throw new Error(`지원하지 않는 로컬 테이블입니다: ${table}`)
  }
  saveLocalData(data)
}

export function deleteLocalRow(table: string, id: string) {
  const data = loadLocalData()
  switch (table) {
    case 'expenses': data.expenses = data.expenses.filter((row) => row.id !== id); break
    case 'common_preparation_tasks':
      data.tasks = data.tasks.filter((row) => row.id !== id)
      data.checks = data.checks.filter((row) => row.task_id !== id)
      break
    case 'personal_preparation_items': data.personalItems = data.personalItems.filter((row) => row.id !== id); break
    case 'itinerary_items': data.itinerary = data.itinerary.filter((row) => row.id !== id); break
    case 'fund_contributions': data.fundContributions = data.fundContributions.filter((row) => row.id !== id); break
    default: throw new Error(`지원하지 않는 로컬 테이블입니다: ${table}`)
  }
  saveLocalData(data)
}

export function updateLocalRoles(values: Pick<Trip, 'leader_member_id' | 'treasurer_member_id'>) {
  const data = loadLocalData()
  data.trip = { ...data.trip, ...values }
  saveLocalData(data)
}

export function setLocalCommonCheck(check: CommonCheck) {
  const data = loadLocalData()
  const index = data.checks.findIndex((row) => row.trip_id === check.trip_id && row.task_id === check.task_id && row.member_id === check.member_id)
  if (index === -1) data.checks.push(check)
  else data.checks[index] = check
  saveLocalData(data)
}

export function subscribeToLocalData(onChange: () => void): () => void {
  const listener = (event: StorageEvent) => { if (event.key === STORAGE_KEY) onChange() }
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
