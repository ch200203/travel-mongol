-- 여나투어 최종 일정표(별고비팀)와 캠프별 전기·샤워 제한 안내를 반영한다.
begin;

-- Day 3 석식이 삼계탕에서 삼겹살로 확정됐다.
update api.itinerary_items
set note = '특식: 삼겹살 · 은하수 헌팅', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 3 and title = '저녁 식사';

-- 투어 종료(공항 도착)가 16:00에서 16:30으로 조정됐다. 18:15 항공편은 기존 행이 이미 담고 있다.
update api.itinerary_items
set start_time = '16:30', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 6 and title = '공항 도착 및 투어 종료';

-- 안전 수칙 안내에 따라 출발 전 확인 과제와 승마·낙타 선택 과제를 추가한다.
insert into api.common_preparation_tasks (id, trip_id, title, category, sort_order) values
  ('30000000-0000-4000-8000-000000000009', '10000000-0000-4000-8000-000000000001', '노션 여행 안내 정독', 'required', 5),
  ('30000000-0000-4000-8000-00000000000a', '10000000-0000-4000-8000-000000000001', '투어 계약서·면책 동의서 확인', 'required', 6),
  ('30000000-0000-4000-8000-00000000000b', '10000000-0000-4000-8000-000000000001', '승마·낙타 체험 참여 여부 정하기', 'optional', 7)
on conflict (id) do update
set title = excluded.title, category = excluded.category, sort_order = excluded.sort_order;

update api.common_preparation_tasks set sort_order = 8
where id = '30000000-0000-4000-8000-000000000006';
update api.common_preparation_tasks set sort_order = 9
where id = '30000000-0000-4000-8000-000000000007';
update api.common_preparation_tasks set sort_order = 10
where id = '30000000-0000-4000-8000-000000000008';

-- 새 과제도 기존 과제와 동일하게 멤버별 체크 행을 만들어 준다.
insert into api.common_preparation_checks (trip_id, task_id, member_id, is_completed, completed_at)
select tasks.trip_id, tasks.id, members.id, false, null
from api.common_preparation_tasks tasks
join api.members members on members.trip_id = tasks.trip_id
where tasks.id in (
  '30000000-0000-4000-8000-000000000009',
  '30000000-0000-4000-8000-00000000000a',
  '30000000-0000-4000-8000-00000000000b'
)
and not exists (
  select 1 from api.common_preparation_checks checks
  where checks.task_id = tasks.id and checks.member_id = members.id
);

-- 안전 수칙에서 나온 준비물(손전등, 모래썰매용 긴 바지)을 멤버별 추천 목록에 더한다.
insert into api.personal_preparation_items
  (trip_id, owner_member_id, title, category, priority, is_recommended, sort_order)
select members.trip_id, members.id, item.title, item.category, item.priority, true, item.sort_order
from api.members members
cross join (values
  ('손전등·헤드랜턴','electronics','required',24),
  ('모래썰매용 긴 바지','clothing','required',25)
) as item(title, category, priority, sort_order)
where not exists (
  select 1 from api.personal_preparation_items existing
  where existing.owner_member_id = members.id and existing.title = item.title
);

commit;
