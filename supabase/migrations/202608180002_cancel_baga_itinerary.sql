begin;

alter table api.itinerary_items drop constraint if exists itinerary_items_status_check;
alter table api.itinerary_items
  add constraint itinerary_items_status_check check (status in ('proposed', 'confirmed', 'cancelled'));

update api.itinerary_items
set note = '하이에스로 차강소브라가까지 이동 시작'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '공항 미팅 후 출발';

update api.itinerary_items
set status = 'cancelled', note = '방문하지 않는 일정'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '바가가즈린촐로 투어';

commit;
