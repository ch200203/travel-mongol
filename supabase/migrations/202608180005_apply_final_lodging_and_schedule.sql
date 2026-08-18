begin;

update api.itinerary_items
set start_time = '05:00', status = 'confirmed', source = 'manual',
    note = '오전 5시 공항 미팅 · 하이에스로 차강소브라가 이동'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '공항 미팅 후 출발';

update api.itinerary_items
set status = 'cancelled', note = '변경된 일정에서 제외'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '바가가즈린촐로 투어';

update api.itinerary_items
set location = case
      when day_number = 1 then '고급 캠프'
      when day_number = 2 then '고급 캠프'
      when day_number = 3 then '고급 캠프(오두막)'
      when day_number = 4 then '여행자 캠프(오두막)'
      when day_number = 5 then '고급 캠프'
    end,
    source = 'manual',
    note = case
      when day_number = 1 then '특식: 삼겹살 · 1인 숙소 추가금 5만원'
      when day_number = 2 then '특식: 허르헉 · 1인 숙소 추가금 3만원 · 캠프파이어와 은하수 헌팅 선택'
      when day_number = 3 and title = '숙소 도착 및 점심' then '캠프식 · 1인 숙소 추가금 3만원'
      when day_number = 3 then coalesce(note, '고급 캠프 오두막 숙박')
      when day_number = 4 then coalesce(note, '여행자 캠프 오두막 숙박')
      when day_number = 5 and title = '숙소 도착' then '무료 업그레이드 · 독수리 체험 선택'
      when day_number = 5 then coalesce(note, '고급 캠프 무료 업그레이드')
    end
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number between 1 and 5
  and (title like '숙소 도착%' or title = '저녁 식사');

update api.itinerary_items
set title = '시내 투어 종료 및 공항 샌딩', location = '울란바토르 → UBN',
    note = '오후 4시 시내 투어 종료 후 18:15 출발 항공편에 맞춰 이동',
    status = 'confirmed', source = 'manual'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and day_number = 6 and start_time = '16:00';

commit;
