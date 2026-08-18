update api.itinerary_items
set status = 'proposed', note = '견적서 기준 Day 1 방문 일정'
where trip_id = '10000000-0000-4000-8000-000000000001'
  and title = '바가가즈린촐로 투어';
