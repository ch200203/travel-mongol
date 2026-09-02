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
  { id: 'local-common-notion', title: '노션 여행 안내 정독', category: 'required' },
  { id: 'local-common-contract', title: '투어 계약서·면책 동의서 확인', category: 'required' },
  { id: 'local-common-riding', title: '승마·낙타 체험 참여 여부 정하기', category: 'optional' },
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
  { title: '손전등·헤드랜턴', category: 'electronics', priority: 'required' },
  { title: '모래썰매용 긴 바지', category: 'clothing', priority: 'required' },
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

type ItinerarySeed = Omit<ItineraryItem, 'id' | 'trip_id'>

const itinerarySeed: ItinerarySeed[] = [
  { day_number: 1, start_time: '05:00', end_time: null, title: '공항 미팅 후 출발', location: 'UBN 공항', note: '별고비팀 미팅 후 차강소브라가로 이동', link_url: null, status: 'confirmed', source: 'manual', sort_order: 0 },
  { day_number: 1, start_time: '10:00', end_time: null, title: '마트 장보기', location: null, note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 1, start_time: '11:00', end_time: null, title: '점심 식사', location: null, note: '현지 식당', link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 1, start_time: '16:00', end_time: null, title: '차강소브라가 투어', location: '차강소브라가', note: '운동화 필수', link_url: null, status: 'proposed', source: 'manual', sort_order: 3 },
  { day_number: 1, start_time: '17:00', end_time: null, title: '숙소 도착', location: '고급 캠프', note: '1인 숙소 추가금 5만원', link_url: null, status: 'proposed', source: 'manual', sort_order: 4 },
  { day_number: 1, start_time: '18:00', end_time: null, title: '저녁 식사', location: '고급 캠프', note: '캠프식', link_url: null, status: 'proposed', source: 'manual', sort_order: 5 },
  { day_number: 2, start_time: '08:00', end_time: null, title: '숙소 출발', location: null, note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 0 },
  { day_number: 2, start_time: '11:00', end_time: null, title: '점심 식사', location: null, note: '현지 식당', link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 2, start_time: '15:00', end_time: null, title: '욜링암 투어', location: '욜링암', note: '입구 플리마켓 이용 가능', link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 2, start_time: '17:00', end_time: null, title: '숙소 도착 및 저녁 식사', location: '고급 캠프', note: '특식: 허르헉 · 캠프파이어 · 은하수 헌팅', link_url: null, status: 'proposed', source: 'manual', sort_order: 3 },
  { day_number: 3, start_time: '08:00', end_time: null, title: '숙소 출발', location: null, note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 0 },
  { day_number: 3, start_time: '12:00', end_time: null, title: '숙소 도착 및 점심 식사', location: '고급 캠프(오두막)', note: '캠프식 · 1인 숙소 추가금 3만원', link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 3, start_time: '15:00', end_time: null, title: '고비사막 투어', location: '홍고린엘스', note: '모래 썰매 · 낙타 체험', link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 3, start_time: '18:00', end_time: null, title: '저녁 식사', location: '고급 캠프(오두막)', note: '특식: 삼겹살 · 은하수 헌팅', link_url: null, status: 'proposed', source: 'manual', sort_order: 3 },
  { day_number: 4, start_time: '09:00', end_time: null, title: '숙소 출발', location: null, note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 0 },
  { day_number: 4, start_time: '12:00', end_time: null, title: '점심 식사', location: null, note: '현지 식당', link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 4, start_time: '13:00', end_time: null, title: '바양작 투어', location: '바양작', note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 4, start_time: '17:00', end_time: null, title: '숙소 도착', location: '여행자 캠프(오두막)', note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 3 },
  { day_number: 4, start_time: '18:00', end_time: null, title: '저녁 식사', location: '여행자 캠프(오두막)', note: '가이드 요리', link_url: null, status: 'proposed', source: 'manual', sort_order: 4 },
  { day_number: 4, start_time: '19:00', end_time: null, title: '노을 및 일몰 감상', location: '바양작', note: '일몰 예상 시간 20:00~20:30', link_url: null, status: 'proposed', source: 'manual', sort_order: 5 },
  { day_number: 5, start_time: '07:00', end_time: null, title: '숙소 출발', location: null, note: '테를지까지 장거리 이동', link_url: null, status: 'proposed', source: 'manual', sort_order: 0 },
  { day_number: 5, start_time: '12:00', end_time: null, title: '점심 식사', location: null, note: '현지 식당', link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 5, start_time: '16:00', end_time: null, title: '테를지 국립공원 투어', location: '테를지', note: '아리야발 사원 · 거북바위 · 승마 체험 · 독수리 체험 추가 가능', link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 5, start_time: '18:00', end_time: null, title: '숙소 도착', location: '고급 캠프', note: '무료 업그레이드', link_url: null, status: 'proposed', source: 'manual', sort_order: 3 },
  { day_number: 5, start_time: '19:00', end_time: null, title: '저녁 식사', location: '현지 식당', note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 4 },
  { day_number: 6, start_time: '08:00', end_time: null, title: '숙소 출발', location: null, note: null, link_url: null, status: 'proposed', source: 'manual', sort_order: 0 },
  { day_number: 6, start_time: '09:00', end_time: null, title: '징기스칸 기마 동상 방문', location: '징기스칸 기마 동상', note: '박물관 입장 추가 비용', link_url: null, status: 'proposed', source: 'manual', sort_order: 1 },
  { day_number: 6, start_time: '12:00', end_time: null, title: '점심 식사 및 시내 투어', location: '울란바토르', note: '수흐바타르 광장 · 국영백화점 · 캐시미어 매장', link_url: null, status: 'proposed', source: 'manual', sort_order: 2 },
  { day_number: 6, start_time: '15:00', end_time: null, title: '공항 샌딩', location: '울란바토르 → UBN', note: '시내에서 공항으로 이동', link_url: null, status: 'confirmed', source: 'manual', sort_order: 3 },
  { day_number: 6, start_time: '16:30', end_time: null, title: '공항 도착 및 투어 종료', location: 'UBN 공항', note: '별고비팀 투어 종료', link_url: null, status: 'confirmed', source: 'manual', sort_order: 4 },
]

/** 최종 일정표가 바뀌면 접두사의 버전을 올려 기존 기기의 시드 일정을 통째로 갈아끼운다. */
const scheduleSeedPrefix = 'local-schedule-v2'

function itinerarySeedRows(): ItineraryItem[] {
  return itinerarySeed.map((item, index) => ({ ...item, id: `${scheduleSeedPrefix}-${index + 1}`, trip_id: tripId }))
}

/** 시드로 심은 일정인지 판별한다. 사용자가 직접 추가한 일정은 UUID라 여기에 걸리지 않는다. */
function isSeededSchedule(id: string): boolean {
  return /^local-schedule(-v\d+)?-\d+$/.test(id) || /^local-itinerary-/.test(id)
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
      name: '별고비팀',
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
    itinerary: [...flightItems, ...itinerarySeedRows()],
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
    if (data.trip.name !== '별고비팀') {
      data.trip.name = '별고비팀'
      changed = true
    }
    for (const flight of flightItems) {
      if (!data.itinerary.some((item) => item.id === flight.id)) { data.itinerary.push(flight); changed = true }
    }
    if (!data.itinerary.some((item) => item.id === `${scheduleSeedPrefix}-1`)) {
      data.itinerary = data.itinerary.filter((item) => !isSeededSchedule(item.id))
      data.itinerary.push(...itinerarySeedRows())
      changed = true
    }
    if (!tasks.every((task) => data.tasks.some((item) => item.id === task.id))) {
      const oldTasks = data.tasks
      const oldChecks = data.checks
      const knownPattern = /여권|항공권 발권|예약금|현지 잔금|여행자보험|유심|개인 준비물 목록|운동화|항공편 시간|비상 연락처|노션|계약서|면책|승마|독수리 체험|기마 동상|점심 업그레이드/
      const customTasks = oldTasks.filter((task) => !knownPattern.test(task.title) && !tasks.some((seed) => seed.id === task.id))
        .map((task, index) => ({ ...task, category: task.category ?? 'required' as const, sort_order: tasks.length + index }))
      const aliases: Record<string, RegExp> = {
        'local-common-passport': /여권/,
        'local-common-flight': /항공권 발권/,
        'local-common-deposit': /예약금/,
        'local-common-balance': /현지 잔금/,
        'local-common-flight-time': /항공편 시간/,
        'local-common-notion': /노션/,
        'local-common-contract': /계약서|면책/,
        'local-common-riding': /승마/,
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
