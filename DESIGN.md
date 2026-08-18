# Design

## Source of truth
- Status: Active
- Last refreshed: 2026-08-18
- Primary product surfaces: 여행 헤더, 일정, 준비물, 정산, 앨범
- Evidence reviewed: `README.md`, `docs/PROJECT_PLAN.md`, `docs/4. 여나투어 고비테를지 5박6일 견적안내.pdf`, `docs/4. 여나투어 고비사막 숙소 사진.pdf`, `src/app/App.tsx`, `src/features/itinerary/ItineraryPage.tsx`, `src/styles/global.css`

## Brand
- Personality: 함께 여행하는 사람들이 쓰는 따뜻하고 실용적인 몽골 여행 수첩
- Trust signals: 견적서와 여행팀의 최신 변경안 기반 정보, 확정·제안·취소 상태, 현지 변동 가능성 안내
- Avoid: 여행사 광고처럼 보이는 과장, 확인되지 않은 숙소 확정 표현, 장식 때문에 핵심 일정이 묻히는 화면

## Product goals
- Goals: 여섯 명이 모바일에서 이동, 식사, 숙소, 준비물, 비용을 빠르게 함께 확인하고 수정한다.
- Non-goals: 숙소 예약 시스템, 여행사 상품 판매, 인증 기반 개인 데이터 서비스
- Success signals: 각 날짜에서 이동 부담과 당일 숙박 환경을 한눈에 파악하고 세부 일정을 이어서 확인할 수 있다.

## Personas and jobs
- Primary personas: 몽골 여행에 참여하는 친구 6명
- User jobs: 당일 이동량 확인, 식사 계획 확인, 숙소 편의시설과 준비물 판단, 일정 변경 공유
- Key contexts of use: 출발 전 모바일 확인, 이동 중 느린 네트워크, 현지 숙소 도착 전 편의시설 확인

## Information architecture
- Primary navigation: 일정, 준비물, 정산, 앨범의 상단 고정 탭
- Core routes/screens: `/itinerary`, `/preparation`, `/expenses`, `/album`
- Content hierarchy: 전체 여행 요약 → 항공편/날씨 → 일차별 이동·식사·숙소 요약 → 시간순 세부 일정 → 별 관측 정보

## Design principles
- 먼저 판단할 정보: 이동시간·거리와 숙소 편의시설은 세부 일정 전에 보여준다.
- 출처의 한계를 드러내기: 선택한 숙소 등급·객실 형태·추가금과 실제 숙소명 미정 상태를 구분하고 현지 제한 가능성을 함께 표시한다.
- Tradeoffs: 화면 밀도는 높아지지만 숙소 정보는 접을 수 있는 상세 영역으로 두어 시간표 스캔 속도를 지킨다.

## Visual language
- Color: 기존 forest, moss, sand, paper 토큰을 유지하고 숙소 편의시설에는 부드러운 녹색, 주의사항에는 모래색을 사용한다.
- Typography: IBM Plex Sans KR 본문과 Gowun Dodum 제목 체계를 유지한다.
- Spacing/layout rhythm: 기존 0.55~1rem 카드 간격과 12~16px 반경을 재사용한다.
- Shape/radius/elevation: 기존 일정 카드보다 한 단계 높은 요약 카드에 얕은 테두리와 배경 대비를 사용한다.
- Motion: 새 애니메이션을 추가하지 않는다.
- Imagery/iconography: 별도 이미지 의존 없이 짧은 텍스트 아이콘과 명시적 라벨을 함께 사용한다.

## Components
- Existing components to reuse: `ItineraryPage`, `day-group`, `schedule-item`, `subheading`
- New/changed components: 전체 이동 요약, 접이식 투어사 연락처, `DayGuideCard`, 편의시설 배지, 숙소 상세 `<details>`
- Variants and states: 고급 캠프(유료/무료 업그레이드), 여행자 캠프, 숙박 없음(6일차), 편의시설 가능, 현지 제한 주의
- Token/component ownership: 일정 전용 스타일은 `src/styles/global.css`, 일정 안내 데이터는 `src/features/itinerary/dayGuide.ts`

## Accessibility
- Target standard: WCAG 2.1 AA 수준의 명도 대비와 의미 있는 문서 구조
- Keyboard/focus behavior: 숙소 상세는 네이티브 `<details>/<summary>`로 키보드 조작 가능하게 한다.
- Contrast/readability: 아이콘만으로 상태를 전달하지 않고 `샤워 가능`처럼 텍스트를 병기한다.
- Screen-reader semantics: 이동·식사·숙소를 제목이 있는 section으로 구분한다.
- Reduced motion and sensory considerations: 필수 정보에 모션을 사용하지 않는다.

## Responsive behavior
- Supported breakpoints/devices: 320px 이상 모바일 우선, 620px 이하 단일 열, 데스크톱 다중 열
- Layout adaptations: 일차 요약의 이동·식사·숙소 영역은 모바일에서 세로로 쌓는다.
- Touch/hover differences: 숙소 상세 summary는 충분한 터치 높이를 확보하며 hover에 의존하지 않는다.

## Interaction states
- Loading: 기존 전체 화면 로딩 상태 유지
- Empty: 세부 일정이 없어도 일차별 이동·숙소 안내는 표시한다.
- Error: 기존 toast와 재시도 화면 유지
- Success: Supabase Realtime 갱신 후 카드 내용과 시간표가 함께 유지된다.
- Disabled: 해당 없음
- Offline/slow network, if applicable: 정적 일정 안내는 번들에 포함해 데이터 요청과 무관하게 정의하지만, 현재 전체 데이터 로드 실패 시 앱의 기존 오류 화면을 따른다.

## Content voice
- Tone: 짧고 친근하지만 운영상 제한은 분명하게 안내한다.
- Terminology: `고급 캠프`, `여행자 캠프`, `오두막`, `공용/개별 샤워실·화장실`, `무료 업그레이드`를 일관되게 쓴다.
- Microcopy rules: 가능 여부는 `가능`, 미포함은 `투어 숙박 없음`, 확정되지 않은 숙소명은 화면에 임의로 단정하지 않는다. 투어사 링크는 광고 문구 없이 정보와 상담 용도로만 표시한다.

## Implementation constraints
- Framework/styling system: React 19, TypeScript, Vite, 단일 전역 CSS
- Design-token constraints: 기존 CSS 변수와 컴포넌트 패턴을 우선하며 새 디자인 시스템을 만들지 않는다.
- Performance constraints: PDF 이미지나 외부 숙소 이미지를 번들에 추가하지 않는다.
- Compatibility constraints: Supabase와 localStorage 모드 모두 동일한 안내를 보여준다.
- Test/screenshot expectations: 안내 데이터 완전성 테스트, lint, typecheck, unit test, production build를 통과한다.

## Open questions
- [ ] 실제 캠프명이 확정되면 선택 등급 아래에 숙소명을 추가할지 결정 / 여행팀 / 숙소 오인 방지
- [ ] 오지 지역의 인터넷·온수 운영 시간을 현지 가이드에게 확인해 세부 문구를 갱신할지 결정 / 여행팀 / 현장 준비 정확도
