begin;

update api.trips
set name = '별고비팀'
where id = '10000000-0000-4000-8000-000000000001';

delete from api.itinerary_items
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '바가가즈린촐로 투어';

update api.itinerary_items
set location = 'UBN 공항', note = '별고비팀 미팅 후 차강소브라가로 이동', status = 'confirmed', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 1 and title = '공항 미팅 후 출발';

update api.itinerary_items set start_time = '10:00', sort_order = 1, source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 1 and title = '마트 장보기';

update api.itinerary_items set start_time = '11:00', sort_order = 2, source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 1 and title = '점심 식사';

update api.itinerary_items set start_time = '16:00', sort_order = 3, source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 1 and title = '차강소브라가 투어';

update api.itinerary_items
set start_time = '17:00', title = '숙소 도착', note = '1인 숙소 추가금 5만원', sort_order = 4, source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 1 and title = '숙소 도착 및 저녁';

insert into api.itinerary_items (trip_id, day_number, start_time, title, location, note, status, source, sort_order)
select '10000000-0000-4000-8000-000000000001', 1, '18:00', '저녁 식사', '고급 캠프', '캠프식', 'proposed', 'manual', 5
where not exists (
  select 1 from api.itinerary_items
  where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 1 and title = '저녁 식사'
);

update api.itinerary_items set note = '특식: 삼계탕 · 은하수 헌팅', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 3 and title = '저녁 식사';

insert into api.itinerary_items (trip_id, day_number, start_time, title, location, note, status, source, sort_order)
select '10000000-0000-4000-8000-000000000001', 4, '19:00', '노을 및 일몰 감상', '바양작', '일몰 예상 시간 20:00~20:30', 'proposed', 'manual', 5
where not exists (
  select 1 from api.itinerary_items
  where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 4 and title = '노을 및 일몰 감상'
);

update api.itinerary_items set location = '현지 식당', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 5 and title = '저녁 식사';

update api.itinerary_items
set start_time = '16:00', title = '공항 도착 및 투어 종료', location = 'UBN 공항',
    note = '별고비팀 투어 종료', status = 'confirmed', source = 'manual', sort_order = 4
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 6 and start_time = '16:00';

insert into api.itinerary_items (trip_id, day_number, start_time, title, location, note, status, source, sort_order)
select '10000000-0000-4000-8000-000000000001', 6, '15:00', '공항 샌딩', '울란바토르 → UBN', '시내에서 공항으로 이동', 'confirmed', 'manual', 3
where not exists (
  select 1 from api.itinerary_items
  where trip_id = '10000000-0000-4000-8000-000000000001' and day_number = 6 and title = '공항 샌딩'
);

commit;
