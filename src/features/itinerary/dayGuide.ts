export interface MealGuide {
  breakfast: string
  lunch: string
  dinner: string
}

export interface LodgingGuide {
  name: string
  roomType: string
  surchargeWon: number
  complimentaryUpgrade: boolean
  amenities: string[]
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

const travelerCampAmenities = ['전기 가능', '인터넷 가능', '샤워 가능']

const premiumCampFeatures = [
  '현대적 편의시설을 갖춘 상위 등급 캠프예요.',
  '객실 내부의 개별 샤워실과 화장실, 온수 사용이 가능해요.',
]

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
      amenities: travelerCampAmenities,
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
      amenities: travelerCampAmenities,
      features: [...premiumCampFeatures, '욜링암 투어와 캠프파이어 후 편하게 쉴 수 있는 상위 등급 숙소예요.'],
    },
    highlights: ['욜링암 입구 플리마켓', '캠프파이어', '은하수 헌팅'],
  },
  {
    day: 3,
    destination: '홍고린엘스',
    drivingHours: 5,
    drivingKm: 300,
    meals: { breakfast: '가이드 요리', lunch: '캠프식', dinner: '특식(삼계탕)' },
    lodging: {
      name: '고급 캠프',
      roomType: '오두막',
      surchargeWon: 30_000,
      complimentaryUpgrade: false,
      amenities: travelerCampAmenities,
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
      amenities: travelerCampAmenities,
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
      amenities: travelerCampAmenities,
      features: [...premiumCampFeatures, '장거리 이동 후 테를지에서 무료 업그레이드된 고급 캠프를 이용해요.'],
    },
    highlights: ['아리야발 사원', '거북바위', '승마 체험', '독수리 체험(추가 비용)'],
  },
  {
    day: 6,
    destination: '울란바토르',
    drivingHours: 2,
    drivingKm: 80,
    meals: { breakfast: '캠프식', lunch: '현지 식당', dinner: '투어 종료 후 개별' },
    lodging: null,
    highlights: ['징기스칸 기마 동상', '시내 투어', '15:00 공항 샌딩', '16:00 공항 도착'],
  },
]

export const totalDriving = dayGuides.reduce(
  (total, day) => ({ hours: total.hours + day.drivingHours, km: total.km + day.drivingKm }),
  { hours: 0, km: 0 },
)

export const totalLodgingSurchargeWon = dayGuides.reduce((total, day) => total + (day.lodging?.surchargeWon ?? 0), 0)

export const lodgingCaution = '숙소 등급과 객실 형태는 여행팀의 최신 변경안을 반영했어요. 실제 캠프명은 배정 후 확정되며, 오지 지역 특성상 전기·인터넷·온수 사용이 일시적으로 제한될 수 있어요.'
