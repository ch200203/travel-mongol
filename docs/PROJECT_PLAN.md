# 몽골 여행 공동 관리 웹사이트 기획서

> 문서 상태: MVP 기획 확정안  
> 작성일: 2026-08-18  
> 대상: 친구 6명의 몽골 여행 준비 및 공동 관리  
> 배포 목표: Netlify Free + Supabase Free

## 1. 제품 개요

단체 채팅과 여러 문서에 흩어진 여행 준비 정보를 하나의 모바일 친화적 웹사이트에서 관리한다. 첫 버전은 `정산`, `준비물`, `일정` 세 탭에 집중한다.

본 서비스는 접근 제어가 없는 공개 쓰기 API를 사용한다. 공유 URL의 비공개성은 편의상 장벽일 뿐 보안 경계가 아니다. 브라우저 번들에서 Supabase publishable key와 API 주소를 추출하면 UI를 거치지 않고도 허용된 API 작업을 실행할 수 있다. 따라서 전용 Supabase 프로젝트에 이 여행 하나의 데이터만 저장하고 민감 정보는 금지한다.

### 핵심 사용자 가치

- 누가 무엇을 준비했고 아직 하지 않았는지 한눈에 확인한다.
- 여행 비용을 공동 장부에 빠르게 기록하고 통화별 합계를 조회한다.
- 확정된 일정을 날짜별로 함께 확인하고 수정한다.
- 팀장과 총무를 지정하되 복잡한 권한 체계는 만들지 않는다.

### 초기 멤버

| 구분 | 멤버 |
| --- | --- |
| 여 | 김승미, 김지은, 서유리 |
| 남 | 인철환, 최태규, 이현종 |

성별 구분은 초기 명단 표시에만 사용한다. 기능상 필요하지 않다면 데이터베이스에는 별도 민감 속성으로 저장하지 않고 `group_label` 같은 표시용 값만 선택적으로 둔다.

## 2. MVP 범위

### 2.1 공통 화면

- 모바일 우선 반응형 레이아웃
- 상단 또는 하단 탭 내비게이션: `정산 / 준비물 / 일정`
- 여행명, 여행 기간, 팀장, 총무 표시
- 팀장·총무 지정 및 변경
- 역할은 배지일 뿐이며 조회·수정 권한은 모두 동일
- 저장 중, 저장 완료, 저장 실패 상태를 명확히 표시
- 두 사용자가 동시에 열어 둔 경우 변경 사항을 화면에 실시간 반영

### 2.2 정산 탭 — 공동 장부

#### 입력 항목

- 사용 내용
- 금액: 0보다 큰 정수 또는 소수
- 통화: 최소 `KRW`, `MNT`; 환율 계산 없음
- 결제자: 초기 멤버 중 선택
- 사용일
- 분류: 교통, 식비, 숙박, 관광, 쇼핑, 기타
- 선택 메모

#### 조회 및 관리

- 여행 공금 목표액, 현재 모금액, 남은 금액과 달성률
- 멤버별 공금 입금 기록과 누적액; 공금 입금은 지출 비용과 분리
- 최신순 비용 목록
- 날짜, 결제자, 분류 기준 필터
- 통화별 전체 합계와 결제자별 합계
- 비용 수정 및 삭제 전 확인
- 서로 다른 통화의 금액을 하나로 합산하지 않음

#### MVP 제외

- 참여자별 1/N 분할
- 누가 누구에게 얼마를 보내야 하는지 계산
- 자동 환율 조회 및 환산
- 영수증·파일 업로드

### 2.3 준비물 탭

두 종류의 체크리스트를 제공한다.

#### 공통 준비 현황

모든 멤버가 각각 완료해야 하는 공통 과제를 `과제 × 멤버` 표로 보여준다.

초기 예시:

- 비행기 발권
- 예약금 21만원 입금 (6명 전원 완료)
- 잔금 준비

필수 동작:

- 공통 과제 추가, 수정, 삭제, 순서 변경
- 공통 과제를 필수 확인과 선택 결정으로 구분
- 각 과제에 선택 마감일 지정
- 멤버별 완료 체크 및 완료 시각 기록
- 과제별 완료 인원과 전체 진행률 표시
- 모바일에서는 표 대신 과제 카드 안에 멤버 체크 목록을 표시해 가독성 유지

#### 개인 준비물

- 멤버를 선택한 뒤 개인 준비물 추가, 수정, 삭제, 체크
- 본인이 아닌 다른 멤버의 목록도 조회·수정 가능
- 개인별 완료율 표시
- 개인 물품은 필수/선택 및 용도별로 분류하고, 처음 준비하는 사람을 위한 수정·삭제 가능한 추천 목록 제공

### 2.4 일정 탭

- 날짜별 일정 그룹
- 일정 제목, 시작·종료 시각, 장소, 메모, 관련 링크
- 일정 추가, 수정, 삭제 및 시간순 정렬
- Day 1~6 범위를 벗어난 일차 입력을 차단하고, 여행 시작일이 정해지면 계산된 실제 날짜를 표시
- 기존에 확인 중인 일정을 확정 후 옮겨 적는 용도
- 지도·외부 예약 서비스 자동 연동은 MVP에서 제외

### 2.5 초기 여행 콘텐츠

[여행 정보 초안](./tavel_plan.md)을 초기 시드 데이터의 기준으로 사용한다. 로컬 원본은 `docs/4. 여나투어 고비테를지 5박6일 견적안내.pdf`이며 공개 배포·버전관리 대상이 아니다.

- Day 1~6 고비사막·테를지 일정을 `제안` 상태로 생성
- 확정 여행 기간인 2026년 9월 9일~14일을 기준으로 일차와 실제 날짜를 함께 표시
- 확정 항공편 OM 310(ICN→UBN), OM 307(UBN→ICN)을 일정에 표시
- 일차별 방문지의 최신 날씨 예보를 조회하고 예보 제공 범위 밖이면 조회 가능 시점을 안내
- 방문지 좌표 기준 일출·일몰과 천문박명 기반 별 관측 추천 시간, 달 밝기를 현지 시각으로 표시
- 여권, 항공권, 예약금, 현지 잔금 등 팀 확인 사항만 공통 과제로 만들고 개인 소지품은 개인 추천 목록으로 생성
- 6인 견적은 1인당 예약금 21만원, 현지 잔금 95만원, 총 116만원으로 참고 표시
- 차량은 스타렉스 대신 하이에스로 확정된 선택을 참고 표시
- 견적 금액은 실제 결제가 확인되기 전까지 정산 장부에 자동 등록하지 않음
- 계좌번호, 전화번호, 주소 등 공개 API에 불필요한 상세 연락 정보는 시드하지 않음
- 독수리 체험, 박물관 입장, 점심 업그레이드는 선택 공통 과제로 분류
- 현지 상황과 항공편에 따라 변경될 수 있으므로 모든 시드 일정은 사용자가 수정 가능

## 3. 후속 기능 후보

우선순위는 MVP 운영 후 결정한다.

1. 비용 참여자 지정, 1/N 분할, 최종 송금액 계산
2. 일정·비용·준비물 항목별 댓글
3. Day별 일정과 사진을 연결해 기록하는 여행 앨범 탭 (화면 자리 마련, 업로드는 후속 구현)
4. 간단한 공동 비밀번호 또는 멤버 로그인
5. 투표, 알림, 캘린더 내보내기

## 4. 명시적 비기능 및 제외 범위

- 로그인과 사용자별 권한 없음
- 웹사이트 URL과 무관하게 공개 Data API를 호출한 누구나 허용된 데이터를 조회·변경 가능
- 백업·복원 및 변경 이력 없음
- 여권번호, 신분증, 항공권 원본 등 민감 문서 저장 금지
- 오프라인 모드와 PWA 설치 기능 없음
- 사진·대용량 파일 저장 없음
- 다국어는 지원하지 않고 한국어만 제공
- 네이티브 앱은 개발하지 않음

`noindex, nofollow` 메타 태그와 `robots.txt`는 검색 노출을 줄일 뿐 접근 제어가 아니다. publishable key도 비밀값이 아니다. 향후 다른 여행팀의 데이터를 같은 프로젝트에 넣거나 민감 정보를 저장해야 한다면 공개 `anon` CRUD 구조를 폐기하고 인증·테넌트 격리 정책을 먼저 설계한다.

## 5. 권장 기술 스택

### 프론트엔드

| 영역 | 선택 | 이유 |
| --- | --- | --- |
| UI | React + TypeScript | 컴포넌트 재사용과 데이터 타입 안정성 |
| 빌드 | Vite | 작은 SPA에 빠르고 단순한 개발 환경 |
| 상태 | React hooks + Context | 3개 탭 규모에서 별도 전역 상태 라이브러리는 과함 |
| 스타일 | CSS Modules 또는 단순 CSS | UI 프레임워크 의존성 없이 작은 번들 유지 |
| 서버 데이터 | Supabase JS + 얇은 repository/query 계층 | 화면과 DB 호출을 분리해 테스트 가능하게 구성 |
| 테스트 | Vitest, Testing Library, Playwright | 로직·컴포넌트·핵심 사용자 흐름을 단계별 검증 |

React Router는 탭별 URL 공유와 새로고침 복원을 원할 때만 추가한다. 첫 구현에서도 `/expenses`, `/preparation`, `/itinerary` 경로를 제공하는 편을 권장한다.

### 백엔드 및 데이터

- Supabase Free의 PostgreSQL을 단일 데이터 원본으로 사용
- 이 여행만을 위한 전용 Supabase 프로젝트를 사용하고 다른 여행팀 데이터는 함께 저장하지 않음
- 클라이언트에서 Supabase Data API에 직접 접근
- 브라우저에는 최신 `publishable key`만 사용하고 secret/service-role key는 절대 포함하지 않음
- Data API 노출 범위를 식별하기 쉽도록 전용 `api` 스키마를 사용하고 내부 객체는 비노출 스키마에 둠
- 기본 테이블·함수·시퀀스 권한을 철회한 뒤 필요한 객체와 작업만 `anon`에 명시적으로 GRANT
- Data API에 노출하는 모든 테이블과 뷰에 RLS 활성화
- `trips`, `members`는 공개 조회만 허용하고, 역할 지정에 필요한 `trips.leader_member_id`, `trips.treasurer_member_id` 업데이트만 별도 허용
- 비용, 공통 과제·체크, 개인 준비물, 일정은 기능에 필요한 CRUD만 허용
- RLS는 이 구조를 비공개로 만들지 않으며 단일 여행 데이터와 허용 작업의 범위만 제한
- 6명 규모에서는 Supabase Realtime의 Postgres Changes로 관련 테이블 변경을 구독
- Netlify Functions와 Supabase Edge Functions는 MVP에 불필요하므로 사용하지 않음

`anon` 권한 매트릭스:

| 객체 | 허용 작업 |
| --- | --- |
| `trips` | `SELECT`, `UPDATE (leader_member_id, treasurer_member_id)` |
| `members` | `SELECT` |
| `expenses` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `shared_funds` | `SELECT`, `UPDATE (name, target_amount)` |
| `fund_contributions` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `common_preparation_tasks` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `common_preparation_checks` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `personal_preparation_items` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| `itinerary_items` | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |

`trips`와 `members`의 생성·삭제, 내부 스키마, 임의 함수 실행은 허용하지 않는다.

### 배포

- Netlify에서 Git 저장소 연결
- 빌드 명령: `npm run build`
- 배포 디렉터리: `dist`
- SPA 라우팅을 위한 fallback redirect 설정
- 환경 변수:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
- Vite의 `VITE_` 변수는 최종 번들에 포함되므로 비밀값을 넣지 않음
- 프로덕션 배포 횟수를 줄이고 Deploy Preview를 검토에 활용

## 6. 시스템 구조

```text
사용자 브라우저
  └─ React + TypeScript + Vite SPA
       ├─ Netlify: 정적 파일 배포, CDN, SPA 라우팅
       └─ Supabase JS
            ├─ 전용 프로젝트: 이 여행 하나의 데이터만 저장
            ├─ PostgreSQL: 멤버, 역할, 비용, 준비물, 일정
            ├─ Data API: 전용 api 스키마만 노출
            ├─ GRANT + RLS: anon 최소 공개 작업만 허용
            └─ Realtime/Postgres Changes: 화면 간 변경 동기화
```

이 규모에서는 별도 API 서버를 두지 않는 것이 가장 단순하다. 다만 이는 접근 제어 없는 공개 쓰기 API라는 의도적 제약을 가진다. 인증, 여러 여행팀, 민감 데이터, 비밀 로직, 외부 결제·환율 API가 추가되면 현재 구조를 확장하지 말고 인증과 테넌트 격리를 포함해 재설계한다.

## 7. 데이터 모델 초안

### 공통 무결성 원칙

- 여행 소속 멤버를 참조하는 모든 테이블은 `(trip_id, member_id)` 복합 외래 키를 사용해 다른 여행의 멤버를 참조할 수 없게 한다.
- `members`에는 `(trip_id, id)` 유일 제약을 두어 복합 외래 키의 참조 대상 키를 제공한다.
- 여행 기간은 둘 다 비어 있거나 `start_date <= end_date`여야 한다.
- 제목·이름·메모·URL은 컬럼 타입과 CHECK로 최대 길이와 공백-only 입력을 제한한다.
- 금액, 통화, 일정 시간 범위 등 핵심 규칙은 UI뿐 아니라 DB CHECK로 강제한다.
- 공개 Data API는 UI 검증을 우회할 수 있으므로 DB 제약과 외래 키를 최종 방어선으로 본다.

### `trips`

| 필드 | 설명 |
| --- | --- |
| `id` | UUID 기본 키 |
| `name` | 여행명 |
| `start_date`, `end_date` | 여행 기간, 초기에는 null 허용 |
| `leader_member_id` | 팀장 표시 대상 |
| `treasurer_member_id` | 총무 표시 대상 |
| `created_at`, `updated_at` | 생성·수정 시각 |

`(id, leader_member_id)`와 `(id, treasurer_member_id)`가 같은 여행의 `members(trip_id, id)`를 참조하도록 복합 외래 키를 둔다. 멤버 삭제 시 역할 멤버 컬럼만 `SET NULL`이 되도록 PostgreSQL의 column-list referential action 또는 동등한 제약 트리거를 사용한다.

`name`은 공백이 아닌 1~100자로 제한한다. 테이블 생성 순환을 피하기 위해 `trips`를 역할 외래 키 없이 생성한 뒤 `members`를 만들고, 마지막에 역할 복합 외래 키를 추가한다.

### `members`

| 필드 | 설명 |
| --- | --- |
| `id` | UUID 기본 키 |
| `trip_id` | 여행 참조 |
| `name` | 멤버 이름 |
| `group_label` | 선택적 표시 그룹 (`여`, `남`) |
| `sort_order` | 표시 순서 |

`(trip_id, id)` UNIQUE를 둔다. 해당 멤버를 참조하는 비용이 하나라도 있으면 멤버 삭제는 `RESTRICT`한다.

`name`은 공백이 아닌 1~50자로 제한하고 같은 여행 안에서 중복 이름을 허용하지 않는다.

### `expenses`

| 필드 | 설명 |
| --- | --- |
| `id`, `trip_id` | 식별자와 여행 참조 |
| `title`, `category`, `note` | 내용과 분류 |
| `amount` | 양수 numeric 값 |
| `currency` | `KRW` 또는 `MNT`; 합계는 통화별 계산 |
| `paid_by_member_id` | 결제자 참조 |
| `spent_on` | 사용일 |
| `created_at`, `updated_at` | 생성·수정 시각 |

`trip_id`와 `paid_by_member_id`는 필수다. `(trip_id, paid_by_member_id)`가 같은 여행의 멤버만 가리키도록 복합 외래 키를 두고 삭제는 `RESTRICT`한다. `amount numeric(14,2) > 0`, `currency IN ('KRW', 'MNT')`, 허용 분류, 제목 1~100자, 메모 최대 500자 제약을 DB에서 강제한다.

### `shared_funds`, `fund_contributions`

여행별 공금 목표와 멤버별 입금 기록을 지출 장부와 분리한다. 목표액은 0 이상, 입금액은 0보다 커야 하며 공금·멤버 복합 외래 키로 같은 여행 소속만 허용한다.

### `common_preparation_tasks`

| 필드 | 설명 |
| --- | --- |
| `id`, `trip_id` | 식별자와 여행 참조 |
| `title` | 모든 멤버가 수행할 공통 과제 |
| `due_date` | 선택 마감일 |
| `sort_order` | 표시 순서 |

복합 참조를 위해 `(trip_id, id)` UNIQUE를 둔다. 제목은 공백이 아닌 1~100자로 제한한다.

### `common_preparation_checks`

| 필드 | 설명 |
| --- | --- |
| `trip_id`, `task_id`, `member_id` | 과제·멤버별 복합 기본 키 |
| `is_completed` | 완료 여부 |
| `completed_at` | 완료 시각 |

세 키는 모두 필수다. `(trip_id, task_id)`와 `(trip_id, member_id)`를 각각 복합 외래 키로 참조한다. 공통 과제나 멤버를 삭제하면 관련 체크 행은 `CASCADE`하며, 다른 여행의 과제나 멤버를 연결할 수 없다. `is_completed = (completed_at IS NOT NULL)` CHECK로 완료 상태와 시각을 일치시킨다.

### `personal_preparation_items`

| 필드 | 설명 |
| --- | --- |
| `id`, `trip_id` | 식별자와 여행 참조 |
| `owner_member_id` | 준비물 소유 멤버 |
| `title` | 개인 준비물명 |
| `is_completed`, `completed_at` | 해당 준비물의 완료 상태와 시각 |
| `due_date`, `sort_order` | 선택 마감일과 표시 순서 |

`id`, `trip_id`, `owner_member_id`, `title`, `is_completed`, `sort_order`는 `NOT NULL`이다. 완료 상태를 항목 행에 직접 저장해 소유자가 아닌 멤버의 체크 행이 생길 여지를 제거한다. `(trip_id, owner_member_id)` 복합 외래 키로 같은 여행 소속을 강제하고, 멤버 삭제 시 개인 준비물은 `CASCADE`한다. `is_completed = (completed_at IS NOT NULL)` CHECK로 완료 상태와 시각을 일치시킨다.

### `itinerary_items`

| 필드 | 설명 |
| --- | --- |
| `id`, `trip_id` | 식별자와 여행 참조 |
| `title`, `location`, `note`, `link_url` | 일정 정보 |
| `day_number` | 여행 일차; 초기값 1~6 |
| `start_time`, `end_time` | 몽골 현지 시작·종료 시각 |
| `status`, `source` | `proposed`/`confirmed`, `quote_pdf`/`manual` |
| `sort_order` | 같은 시각일 때 표시 순서 |

`day_number`는 이 상품 범위인 1~6으로 제한하고, `end_time`이 있으면 `start_time <= end_time`이어야 한다. 제목 1~100자, 장소 최대 200자, 메모 최대 1000자, URL 최대 2048자, 상태·출처 허용값을 DB에서 제한한다. 실제 날짜는 `trips.start_date + (day_number - 1)`로 계산한다. 모든 변경 테이블에는 `updated_at` 자동 갱신 트리거를 둔다. 댓글은 MVP 이후 별도 테이블로 추가하되 대상 행과 같은 여행 소속임을 동일하게 강제한다.

## 8. UX 원칙

- 현지에서도 한 손으로 사용할 수 있도록 모바일 화면을 우선한다.
- 체크는 한 번의 탭으로 완료하고 결과를 즉시 반영한다.
- 삭제에는 확인 절차를 두되 저장에는 불필요한 확인을 요구하지 않는다.
- 실시간 동기화가 끊겨도 오류를 숨기지 않고 재시도 방법을 표시한다.
- 공통 준비 현황은 데스크톱에서 표, 모바일에서 카드 목록으로 제공한다.
- 색상만으로 완료·역할 상태를 전달하지 않고 텍스트·아이콘을 함께 사용한다.

## 9. 무료 플랜 적합성 및 운영 주의사항

2026-08-18 기준 공식 문서를 따른다.

- Netlify Free는 월 300크레딧이며 프로덕션 배포는 회당 15크레딧이다. 대역폭은 GB당 20크레딧, 웹 요청은 1만 건당 2크레딧으로 계산된다. 6명용 정적 SPA에는 충분하지만 잦은 프로덕션 배포를 피한다.
- Netlify 계정의 크레딧을 모두 쓰면 다음 결제 주기까지 프로젝트가 일시 중지될 수 있다.
- Supabase Free는 프로젝트당 DB 500MB, 스토리지 1GB, egress 5GB, Realtime 월 200만 메시지·동시 연결 200개 수준이다. 텍스트 중심 6명 앱에는 충분하다.
- Supabase Free 프로젝트는 1주 비활성 후 일시 중지될 수 있고 자동 백업이 제공되지 않는다. 사용자가 백업 기능을 원하지 않는다는 결정을 문서상 위험으로 유지한다.
- 공개 CRUD RLS는 데이터 보호가 아니라 공개 접근을 명시한 정책이다. publishable key가 노출되어도 정상이나 secret/service-role key 노출은 금지한다.
- 공개 쓰기 구조에서는 URL을 몰라도 publishable key와 API 주소를 얻은 사용자가 직접 요청할 수 있다. 단일 여행 전용 프로젝트, 전용 API 스키마, 명시적 GRANT, RLS, DB 제약으로 피해 범위만 제한한다.

공식 근거:

- [Netlify의 Vite 배포 설정](https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/)
- [Netlify 요금 및 크레딧](https://www.netlify.com/pricing/)
- [Netlify 크레딧 계산 방식](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)
- [Supabase Free 플랜 한도](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Supabase 데이터 보안과 키 관리](https://supabase.com/docs/guides/database/secure-data)
- [Supabase Data API 보안: GRANT, RLS, 전용 스키마](https://supabase.com/docs/guides/api/securing-your-api)
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
- [PostgreSQL 복합 외래 키와 column-list `SET NULL`](https://www.postgresql.org/docs/current/ddl-constraints.html)

## 10. 구현 단계

1. React + TypeScript + Vite 프로젝트와 품질 도구를 구성한다.
2. Netlify 설정, SPA redirect, 환경 변수 예시 파일을 추가한다.
3. Supabase SQL migration으로 분리된 준비물 테이블, 같은 여행 소속 복합 외래 키, 삭제 정책, CHECK, 인덱스, 전용 API 스키마, 기본 권한 철회, 명시적 GRANT, RLS, seed 데이터를 만든다.
4. 공통 앱 셸, 탭 라우팅, 로딩·빈 상태·오류 피드백을 구현한다.
5. 공동 장부 CRUD, 필터, 통화별·결제자별 합계를 구현한다.
6. 공통 준비 현황 매트릭스와 개인 준비물 CRUD를 구현한다.
7. 팀장·총무 역할 배지 지정 기능을 구현한다.
8. 일차별 일정 CRUD, 현지 시각 정렬, 여행 시작일 기반 실제 날짜 계산을 구현한다.
9. 필요한 테이블에 Postgres Changes 구독을 추가하고 다중 브라우저 동기화를 검증한다.
10. 단위·컴포넌트·E2E 테스트를 통과시킨 뒤 Netlify Preview와 Production 배포를 검증한다.

## 11. 수용 기준

- [ ] 초기 멤버 6명이 정확한 이름으로 표시된다.
- [ ] 팀장과 총무를 각각 지정·변경할 수 있고 권한 차이는 생기지 않는다.
- [ ] 사용자는 비용을 추가·조회·수정·삭제할 수 있다.
- [ ] 비용 목록은 날짜·결제자·분류로 필터링된다.
- [ ] KRW와 MNT 합계가 각각 표시되며 서로 환산하거나 합산하지 않는다.
- [ ] 공금 목표액과 멤버별 입금 기록을 관리하고 현재 모금액·남은 금액·달성률을 확인할 수 있다.
- [ ] 공통 준비 과제마다 6명의 완료 상태를 개별 체크할 수 있다.
- [ ] 공통 준비 과제별 완료 인원과 진행률이 즉시 갱신된다.
- [ ] 각 멤버의 개인 준비물을 추가·수정·삭제·체크할 수 있다.
- [ ] 일정이 날짜와 시간 순서로 표시되고 CRUD가 가능하다.
- [ ] 두 브라우저에서 한쪽의 핵심 데이터 변경이 다른 쪽에 새로고침 없이 반영된다.
- [ ] 360px 폭 화면에서 가로 스크롤 없이 핵심 CRUD를 수행할 수 있다.
- [ ] 로그인 없이 접근 가능하며 모든 공개 테이블에 RLS가 활성화되어 있다.
- [ ] 문서와 UI가 이 구조를 공유 URL 보안이 아닌 접근 제어 없는 공개 쓰기 API로 정확히 설명한다.
- [ ] `anon`은 명시적으로 허용한 스키마·테이블·컬럼·작업 이외에 접근할 수 없다.
- [ ] `anon`으로 여행·멤버 생성 또는 삭제, 역할 이외의 여행 컬럼 수정, 내부 스키마 조회를 시도하면 거부된다.
- [ ] 다른 여행의 멤버를 비용 결제자, 팀장, 총무, 개인 준비물 소유자 또는 공통 과제 체크 대상으로 참조하려는 직접 API/SQL 요청이 DB에서 거부된다.
- [ ] 팀장·총무 멤버 삭제 시 역할 지정은 null이 되고, 비용이 존재하는 멤버 삭제는 거부되며, 공통 과제 삭제 시 해당 체크 행은 함께 삭제된다.
- [ ] 잘못된 여행 기간, 0 이하 금액, 미지원 통화, 공백 제목, 초과 길이 문자열, 종료가 시작보다 빠른 일정이 DB에서 거부된다.
- [ ] 공통 과제와 개인 준비물이 별도 테이블에 저장되어 소유자 없는 개인 준비물이나 개인 준비물의 제3자 체크 행을 만들 수 없다.
- [ ] 공통 과제는 필수/선택으로, 개인 준비물은 용도와 중요도로 구분되며 개인 소지품이 공통 과제에 중복되지 않는다.
- [ ] 브라우저 번들에는 Supabase secret/service-role key가 포함되지 않는다.
- [ ] `dist`와 공개 Git 추적 파일에는 원본 견적 PDF 및 PDF의 계좌번호·전화번호·주소가 포함되지 않는다.
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`가 성공한다.
- [ ] 핵심 흐름 E2E 테스트가 Netlify Deploy Preview에서 통과한다.

## 12. 주요 위험과 대응

| 위험 | 대응 |
| --- | --- |
| 공개 API를 통한 무단 조회·수정 | 전용 프로젝트에 단일 여행만 저장, 민감 정보 금지, 구조를 UI/README에 명시; 이후 로그인 기능 검토 |
| 인증 없는 API 남용 | 기본 권한 철회, 전용 API 스키마, 최소 GRANT, RLS, DB 제약, Supabase 사용량 모니터링 |
| 향후 다른 여행팀 데이터 추가 | 현재 프로젝트에 추가 금지; 인증과 `trip_id` 기반 테넌트 RLS를 먼저 설계한 새 구조로 이전 |
| 견적 PDF의 계좌·연락처 노출 | PDF는 로컬 참고 자료로만 유지하고 `.gitignore`로 제외하며 `public/`·`dist/`에 복사하지 않음 |
| 동시 수정 충돌 | `updated_at` 표시, 저장 후 서버값 재조회, 실시간 갱신; 복잡한 충돌 병합은 제외 |
| 삭제·오입력으로 데이터 손실 | 삭제 확인 제공; 백업·감사 로그는 사용자의 MVP 제외 결정에 따라 미제공 |
| 무료 프로젝트 일시 중지 | 여행 직전 접속 확인, 필요 시 Supabase Dashboard에서 프로젝트 복원 |
| 무료 크레딧 소진 | 정적 배포 유지, 이미지 미사용, Deploy Preview 활용, 사용량 알림 확인 |

## 13. 완료 정의

MVP는 세 탭의 CRUD, 역할 표시, 실시간 동기화, 모바일 사용성, Netlify 배포 및 자동 검증이 모두 수용 기준을 충족할 때 완료된다. 댓글, 자동 정산, 인증, 백업, 추억 공유는 완료 정의에 포함하지 않는다.
