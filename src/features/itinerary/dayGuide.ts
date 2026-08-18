export interface MealGuide {
  breakfast: string
  lunch: string
  dinner: string
}

export interface LodgingGuide {
  name: string
  amenities: string[]
  features: string[]
  candidates: string[]
  upgrades: string[]
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

export const dayGuides: DayGuide[] = [
  {
    day: 1,
    destination: '바가가즈린촐로 · 차강소브라가',
    drivingHours: 8,
    drivingKm: 450,
    meals: { breakfast: '불포함', lunch: '현지 식당', dinner: '특식(삼겹살)' },
    lodging: {
      name: '여행자 캠프',
      amenities: travelerCampAmenities,
      features: [...travelerCampFeatures, '차강소브라가 일몰 후 캠프에서 숙박해요.'],
      candidates: ['Bulga ger camp', 'Gobi Nomatk ger camp', 'Tsagaan suvrag ger camp', 'Gobi sky ger camp'],
      upgrades: ['Govi Caravanserai lodge(객실별 추가요금)', '호텔'],
    },
    highlights: ['차강소브라가에서는 운동화 필수', '마트 장보기'],
  },
  {
    day: 2,
    destination: '욜링암',
    drivingHours: 5,
    drivingKm: 320,
    meals: { breakfast: '가이드 요리', lunch: '현지 식당', dinner: '특식(허르헉)' },
    lodging: {
      name: '여행자 캠프',
      amenities: travelerCampAmenities,
      features: [...travelerCampFeatures, '캠핑 또는 유목민 게르로 변경하면 1인당 2만원 할인돼요.'],
      candidates: ['Gurvan saikhan camp', 'Gobi urguu ger camp', 'Jargantiin urguu ger camp'],
      upgrades: ['Gobi urguu2 ger camp', 'Tsenguun Govi Hotel', 'Yol Hotel'],
    },
    highlights: ['욜링암 입구 플리마켓', '캠프파이어', '은하수 헌팅'],
  },
  {
    day: 3,
    destination: '홍고린엘스',
    drivingHours: 5,
    drivingKm: 300,
    meals: { breakfast: '가이드 요리', lunch: '캠프식', dinner: '가이드 요리' },
    lodging: {
      name: '여행자 캠프',
      amenities: travelerCampAmenities,
      features: [...travelerCampFeatures, '고비사막 체험 후 같은 지역 캠프에서 쉬어요.'],
      candidates: ['Gobi tugul ger camp', 'Mandalaa ger camp', 'Gobi Hishig ger camp'],
      upgrades: ['Gobi discovery ger camp', '고급 캠프(오두막)'],
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
      amenities: travelerCampAmenities,
      features: [...travelerCampFeatures, '비교적 이동이 짧은 날로 바양작 투어 후 숙박해요.'],
      candidates: ['Gurvan saikhan camp', 'Gobi Desert Guest house', 'Gobi urguu ger camp', 'Jargantiin urguu ger camp'],
      upgrades: ['Gobi urguu2 ger camp', 'Yol Hotel', '호텔'],
    },
    highlights: ['바양작 투어', '오후 캠프 휴식'],
  },
  {
    day: 5,
    destination: '테를지',
    drivingHours: 8,
    drivingKm: 690,
    meals: { breakfast: '가이드 요리', lunch: '현지 식당', dinner: '가이드 요리' },
    lodging: {
      name: '여행자 캠프',
      amenities: travelerCampAmenities,
      features: [...travelerCampFeatures, '장거리 이동 후 테를지 국립공원 권역에서 숙박해요.'],
      candidates: ['Khumug Resort'],
      upgrades: ['Terelj Bridge Resort', 'Sondor Resort', 'Premium Bolor', '고급 캠프 또는 호텔'],
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
    highlights: ['징기스칸 기마 동상', '시내 투어', '공항 샌딩'],
  },
]

export const totalDriving = dayGuides.reduce(
  (total, day) => ({ hours: total.hours + day.drivingHours, km: total.km + day.drivingKm }),
  { hours: 0, km: 0 },
)

export const lodgingCaution = '실제 숙소는 같은 등급의 후보 중 현지 운영 상황에 따라 배정돼요. 오지 지역 특성상 전기·인터넷·온수 사용이 일시적으로 제한될 수 있어요.'
