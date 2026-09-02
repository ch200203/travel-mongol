export interface MealGuide {
  breakfast: string
  lunch: string
  dinner: string
}

/**
 * 캠프마다 전기·샤워 운영 시간이 달라서 여행팀이 따로 보낸 제한 안내를 그대로 옮겼다.
 * '무제한'이 아닌 값은 그 시간대를 벗어나면 쓸 수 없다는 뜻이라 화면에서 따로 강조한다.
 */
export interface LodgingUtilities {
  power: string
  shower: string
  internet: string
}

export interface LodgingGuide {
  name: string
  roomType: string
  surchargeWon: number
  complimentaryUpgrade: boolean
  utilities: LodgingUtilities
  features: string[]
}

export interface DayGuide {
  day: number
  destination: string
  drivingHours: number
  drivingKm: number
  meals: MealGuide
  lodging: LodgingGuide | null
  highlights: string[]
}

const travelerCampFeatures = [
  '관광객용 현대식 게르로 난로나 히터를 사용해요.',
  '샤워실과 화장실은 공용이며 온수 사용이 가능해요.',
]

const premiumCampFeatures = [
  '현대적 편의시설을 갖춘 상위 등급 캠프예요.',
  '객실 내부의 개별 샤워실과 화장실, 온수 사용이 가능해요.',
]

const unlimited: LodgingUtilities = { power: '무제한', shower: '무제한', internet: '가능' }

export const dayGuides: DayGuide[] = [
  {
    day: 1,
    destination: '차강소브라가',
    drivingHours: 8,
    drivingKm: 450,
    meals: { breakfast: '불포함', lunch: '현지 식당', dinner: '캠프식' },
    lodging: {
      name: '고급 캠프',
      roomType: '게르형 객실',
      surchargeWon: 50_000,
      complimentaryUpgrade: false,
      utilities: unlimited,
      features: [...premiumCampFeatures, '차강소브라가 일몰 후 캠프에서 숙박해요.'],
    },
    highlights: ['차강소브라가에서는 운동화 필수', '마트 장보기', '05:00 공항 미팅'],
  },
  {
    day: 2,
    destination: '욜링암',
    drivingHours: 5,
    drivingKm: 320,
    meals: { breakfast: '캠프식', lunch: '현지 식당', dinner: '특식(허르헉)' },
    lodging: {
      name: '고급 캠프',
      roomType: '게르형 객실',
      surchargeWon: 30_000,
      complimentaryUpgrade: false,
      utilities: unlimited,
      features: [...premiumCampFeatures, '욜링암 투어와 캠프파이어 후 편하게 쉴 수 있는 상위 등급 숙소예요.'],
    },
    highlights: ['욜링암 입구 플리마켓', '캠프파이어', '은하수 헌팅'],
  },
  {
    day: 3,
    destination: '홍고린엘스',
    drivingHours: 5,
    drivingKm: 300,
    meals: { breakfast: '가이드 요리', lunch: '캠프식', dinner: '특식(삼겹살)' },
    lodging: {
      name: '고급 캠프',
      roomType: '오두막',
      surchargeWon: 30_000,
      complimentaryUpgrade: false,
      // 홍고린엘스는 고급 캠프도 여행자 캠프와 같은 제한 시간을 쓴다.
      utilities: { power: '23:00까지', shower: '18:00~23:00', internet: '가능' },
      features: [...premiumCampFeatures, '게르 대신 오두막 객실에서 숙박해요.'],
    },
    highlights: ['모래 썰매', '낙타 체험', '은하수 헌팅'],
  },
  {
    day: 4,
    destination: '바양작',
    drivingHours: 3,
    drivingKm: 160,
    meals: { breakfast: '가이드 요리', lunch: '현지 식당', dinner: '가이드 요리' },
    lodging: {
      name: '여행자 캠프',
      roomType: '오두막',
      surchargeWon: 0,
      complimentaryUpgrade: false,
      utilities: { power: '무제한', shower: '19:00~23:00', internet: '가능' },
      features: [...travelerCampFeatures, '여행자 캠프의 오두막 객실에서 숙박해요.'],
    },
    highlights: ['바양작 투어', '일몰 감상 20:00~20:30'],
  },
  {
    day: 5,
    destination: '테를지',
    drivingHours: 8,
    drivingKm: 690,
    meals: { breakfast: '가이드 요리', lunch: '현지 식당', dinner: '현지 식당' },
    lodging: {
      name: '고급 캠프',
      roomType: '상위 등급 객실',
      surchargeWon: 0,
      complimentaryUpgrade: true,
      utilities: unlimited,
      features: [...premiumCampFeatures, '장거리 이동 후 테를지에서 무료 업그레이드된 고급 캠프를 이용해요.'],
    },
    highlights: ['아리야발 사원', '거북바위', '승마 체험', '독수리 체험(추가 비용)'],
  },
  {
    day: 6,
    destination: '울란바토르',
    drivingHours: 2,
    drivingKm: 80,
    meals: { breakfast: '캠프식', lunch: '현지 식당', dinner: '불포함(18:15 출국)' },
    lodging: null,
    highlights: ['징기스칸 기마 동상', '시내 투어', '15:00 공항 샌딩', '16:30 공항 도착', '18:15 비행기 탑승'],
  },
]

export const totalDriving = dayGuides.reduce(
  (total, day) => ({ hours: total.hours + day.drivingHours, km: total.km + day.drivingKm }),
  { hours: 0, km: 0 },
)

export const totalLodgingSurchargeWon = dayGuides.reduce((total, day) => total + (day.lodging?.surchargeWon ?? 0), 0)

/** 캠프 운영 시간이 정해진 날은 밤에 충전이 끊기므로 준비물 안내와 함께 강조한다. */
export function hasUtilityLimit(lodging: LodgingGuide): boolean {
  return lodging.utilities.power !== '무제한' || lodging.utilities.shower !== '무제한'
}

export const lodgingCaution = '숙소 등급과 객실 형태는 여행팀의 최신 변경안을 반영했어요. 실제 캠프명은 배정 후 확정되며, 오지 지역 특성상 전기·인터넷·온수 사용이 일시적으로 제한될 수 있어요.'

export const breakfastNote = '조식은 가이드가 준비하는 식사 대신 숙소 식당에서 제공되는 캠프식 식사로 변경할 수 있어요. 변경을 원하면 상담 시 미리 말씀해주세요.'

export const scheduleCaution = '현지 상황(기상, 도로, 운영 상황 등)과 항공편 시간에 따라 세부 일정은 유동적으로 조정될 수 있어요.'
