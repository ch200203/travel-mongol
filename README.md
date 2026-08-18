# 몽골 원정대 공동 관리

친구 6명이 몽골 여행의 공동 장부, 준비물, 일정을 함께 관리하는 모바일 우선 SPA입니다. 환경 변수 없이 로컬에서 실행하면 브라우저 `localStorage`를 사용하고, Supabase 환경 변수가 있으면 전용 `api` 스키마를 직접 사용합니다.

> 이 앱에는 로그인이나 사용자별 권한이 없습니다. 공유 URL은 보안 경계가 아니며, 브라우저에서 API 주소와 publishable key를 확인한 누구나 허용된 데이터를 읽고 수정할 수 있습니다. 이 여행만 담은 전용 Supabase 프로젝트를 사용하고 민감 정보는 저장하지 마세요.

## 로컬 실행

```bash
npm install
npm run dev
```

환경 변수가 없으면 로컬 모드로 시작하며 데이터는 현재 브라우저에만 저장됩니다. 다른 브라우저나 기기와 공유되지 않고 브라우저 저장 공간을 지우면 데이터도 사라집니다.

공유 모드가 필요할 때만 `.env.local`에 Supabase 프로젝트의 URL과 publishable key를 입력합니다. `secret` 또는 `service_role` key를 절대 넣지 마세요.

## Supabase 설정

1. 전용 Supabase 프로젝트를 만듭니다.
2. Dashboard의 API 설정에서 exposed schema에 `api`를 추가합니다.
3. Supabase CLI를 연결한 뒤 migration과 seed를 적용합니다.

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase db reset --linked
```

`supabase db reset --linked`는 원격 DB를 초기화하므로 새 전용 프로젝트에서 최초 구성할 때만 사용하세요. 기존 데이터가 있다면 Dashboard SQL Editor에서 `supabase/seed.sql`의 필요 부분만 검토하여 적용합니다.

## 검증

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

실제 Supabase 권한/RLS 검증과 Realtime 다중 브라우저 검증에는 연결된 테스트 프로젝트가 필요합니다.

연결된 로컬 Supabase가 있으면 `supabase test db`로 `supabase/tests/schema.test.sql`의 권한·RLS·시드 검증을 실행합니다.

## Netlify 배포

저장소를 Netlify에 연결하면 `netlify.toml`의 `npm run build`, `dist`, SPA fallback 설정이 사용됩니다. Site configuration의 환경 변수에 다음을 추가합니다.

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

먼저 Deploy Preview에서 `/expenses`, `/preparation`, `/itinerary` 직접 접근과 두 브라우저 실시간 갱신을 확인하세요. 원본 견적 PDF는 `.gitignore`로 제외되며 `public/`이나 `dist/`에 복사하면 안 됩니다.

## 범위

MVP는 비용 장부 CRUD와 통화별 합계, 공통·개인 준비물 CRUD, Day 1~6 일정 CRUD, 팀장·총무 표시, Realtime 동기화를 포함합니다. 환율, 1/N 정산, 인증, 백업, 파일 업로드는 포함하지 않습니다.

일정 화면의 날씨는 Open-Meteo의 최대 16일 실시간 예보를 사용합니다. 출발일이 예보 범위에 들어오기 전에는 조회 가능 날짜를 안내하며, API 키는 필요하지 않습니다. 일출·일몰과 별 관측 추천 시간은 방문지 좌표와 여행 날짜를 기준으로 브라우저에서 계산하며, 달 밝기와 함께 몽골 현지 시각으로 표시합니다.
