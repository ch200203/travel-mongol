create extension if not exists pgcrypto with schema extensions;
create schema if not exists api;
create schema if not exists internal;

revoke all on schema public from anon, authenticated;
revoke all on schema api from public, anon, authenticated;
revoke all on schema internal from public, anon, authenticated;
alter default privileges in schema api revoke all on tables from public, anon, authenticated;
alter default privileges in schema api revoke all on sequences from public, anon, authenticated;
alter default privileges in schema api revoke execute on functions from public, anon, authenticated;

create table api.trips (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100 and name !~ '^\s*$'),
  start_date date,
  end_date date,
  leader_member_id uuid,
  treasurer_member_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_trip_dates check ((start_date is null and end_date is null) or (start_date is not null and end_date is not null and start_date <= end_date))
);

create table api.members (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 50 and name !~ '^\s*$'),
  group_label text check (group_label is null or char_length(group_label) <= 20),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id),
  unique (trip_id, name)
);

alter table api.trips
  add constraint trips_leader_same_trip foreign key (id, leader_member_id)
    references api.members(trip_id, id) on delete set null (leader_member_id),
  add constraint trips_treasurer_same_trip foreign key (id, treasurer_member_id)
    references api.members(trip_id, id) on delete set null (treasurer_member_id);

create table api.expenses (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100 and title !~ '^\s*$'),
  amount numeric(14,2) not null check (amount > 0),
  currency text not null check (currency in ('KRW', 'MNT')),
  paid_by_member_id uuid not null,
  spent_on date not null,
  category text not null check (category in ('transport', 'food', 'lodging', 'sightseeing', 'shopping', 'other')),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, paid_by_member_id) references api.members(trip_id, id) on delete restrict
);

create table api.shared_funds (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  name text not null default '여행 공금' check (char_length(name) between 1 and 50 and name !~ '^\s*$'),
  target_amount numeric(14,2) not null default 0 check (target_amount >= 0),
  currency text not null default 'KRW' check (currency in ('KRW', 'MNT')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id),
  unique (trip_id, name)
);

create table api.fund_contributions (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  fund_id uuid not null,
  member_id uuid not null,
  amount numeric(14,2) not null check (amount > 0),
  contributed_on date not null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, fund_id) references api.shared_funds(trip_id, id) on delete cascade,
  foreign key (trip_id, member_id) references api.members(trip_id, id) on delete restrict
);

create table api.common_preparation_tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100 and title !~ '^\s*$'),
  due_date date,
  sort_order integer not null default 0 check (sort_order >= 0),
  category text not null default 'required' check (category in ('required', 'optional')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, id)
);

create table api.common_preparation_checks (
  trip_id uuid not null,
  task_id uuid not null,
  member_id uuid not null,
  is_completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (trip_id, task_id, member_id),
  foreign key (trip_id, task_id) references api.common_preparation_tasks(trip_id, id) on delete cascade,
  foreign key (trip_id, member_id) references api.members(trip_id, id) on delete cascade,
  check (is_completed = (completed_at is not null))
);

create table api.personal_preparation_items (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  owner_member_id uuid not null,
  title text not null check (char_length(title) between 1 and 100 and title !~ '^\s*$'),
  is_completed boolean not null default false,
  completed_at timestamptz,
  due_date date,
  sort_order integer not null default 0 check (sort_order >= 0),
  category text not null default 'other' check (category in ('essential', 'electronics', 'clothing', 'toiletries', 'medicine', 'other')),
  priority text not null default 'optional' check (priority in ('required', 'optional')),
  is_recommended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (trip_id, owner_member_id) references api.members(trip_id, id) on delete cascade,
  check (is_completed = (completed_at is not null))
);

create table api.itinerary_items (
  id uuid primary key default extensions.gen_random_uuid(),
  trip_id uuid not null references api.trips(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100 and title !~ '^\s*$'),
  day_number smallint not null check (day_number between 1 and 6),
  start_time time,
  end_time time,
  location text check (location is null or char_length(location) <= 200),
  note text check (note is null or char_length(note) <= 1000),
  link_url text check (link_url is null or (char_length(link_url) <= 2048 and link_url ~ '^https?://')),
  status text not null default 'proposed' check (status in ('proposed', 'confirmed')),
  source text not null default 'manual' check (source in ('quote_pdf', 'manual')),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time is null or start_time is null or start_time <= end_time)
);

create index expenses_trip_date_idx on api.expenses (trip_id, spent_on desc);
create index expenses_trip_payer_idx on api.expenses (trip_id, paid_by_member_id);
create index expenses_trip_category_idx on api.expenses (trip_id, category);
create index fund_contributions_trip_date_idx on api.fund_contributions (trip_id, contributed_on desc);
create index fund_contributions_member_idx on api.fund_contributions (trip_id, member_id);
create index common_tasks_trip_order_idx on api.common_preparation_tasks (trip_id, sort_order);
create index personal_items_owner_order_idx on api.personal_preparation_items (trip_id, owner_member_id, sort_order);
create index itinerary_trip_day_time_idx on api.itinerary_items (trip_id, day_number, start_time, sort_order);

create function internal.set_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array['trips','members','expenses','shared_funds','fund_contributions','common_preparation_tasks','common_preparation_checks','personal_preparation_items','itinerary_items'] loop
    execute format('create trigger set_updated_at before update on api.%I for each row execute function internal.set_updated_at()', table_name);
  end loop;
end $$;

alter table api.trips enable row level security;
alter table api.members enable row level security;
alter table api.expenses enable row level security;
alter table api.shared_funds enable row level security;
alter table api.fund_contributions enable row level security;
alter table api.common_preparation_tasks enable row level security;
alter table api.common_preparation_checks enable row level security;
alter table api.personal_preparation_items enable row level security;
alter table api.itinerary_items enable row level security;

create policy trips_read on api.trips for select to anon using (true);
create policy trips_role_update on api.trips for update to anon using (true) with check (true);
create policy members_read on api.members for select to anon using (true);

create policy expenses_read on api.expenses for select to anon using (true);
create policy expenses_insert on api.expenses for insert to anon with check (true);
create policy expenses_update on api.expenses for update to anon using (true) with check (true);
create policy expenses_delete on api.expenses for delete to anon using (true);
create policy shared_funds_read on api.shared_funds for select to anon using (true);
create policy shared_funds_update on api.shared_funds for update to anon using (true) with check (true);
create policy fund_contributions_read on api.fund_contributions for select to anon using (true);
create policy fund_contributions_insert on api.fund_contributions for insert to anon with check (true);
create policy fund_contributions_update on api.fund_contributions for update to anon using (true) with check (true);
create policy fund_contributions_delete on api.fund_contributions for delete to anon using (true);
create policy common_tasks_read on api.common_preparation_tasks for select to anon using (true);
create policy common_tasks_insert on api.common_preparation_tasks for insert to anon with check (true);
create policy common_tasks_update on api.common_preparation_tasks for update to anon using (true) with check (true);
create policy common_tasks_delete on api.common_preparation_tasks for delete to anon using (true);
create policy common_checks_read on api.common_preparation_checks for select to anon using (true);
create policy common_checks_insert on api.common_preparation_checks for insert to anon with check (true);
create policy common_checks_update on api.common_preparation_checks for update to anon using (true) with check (true);
create policy common_checks_delete on api.common_preparation_checks for delete to anon using (true);
create policy personal_items_read on api.personal_preparation_items for select to anon using (true);
create policy personal_items_insert on api.personal_preparation_items for insert to anon with check (true);
create policy personal_items_update on api.personal_preparation_items for update to anon using (true) with check (true);
create policy personal_items_delete on api.personal_preparation_items for delete to anon using (true);
create policy itinerary_read on api.itinerary_items for select to anon using (true);
create policy itinerary_insert on api.itinerary_items for insert to anon with check (true);
create policy itinerary_update on api.itinerary_items for update to anon using (true) with check (true);
create policy itinerary_delete on api.itinerary_items for delete to anon using (true);

grant usage on schema api to anon;
grant select on api.trips, api.members to anon;
grant update (leader_member_id, treasurer_member_id) on api.trips to anon;
grant select, insert, update, delete on api.expenses to anon;
grant select, update (name, target_amount) on api.shared_funds to anon;
grant select, insert, update, delete on api.fund_contributions to anon;
grant select, insert, update, delete on api.common_preparation_tasks to anon;
grant select, insert, update, delete on api.common_preparation_checks to anon;
grant select, insert, update, delete on api.personal_preparation_items to anon;
grant select, insert, update, delete on api.itinerary_items to anon;
revoke execute on function internal.set_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['trips','members','expenses','shared_funds','fund_contributions','common_preparation_tasks','common_preparation_checks','personal_preparation_items','itinerary_items'] loop
    begin
      execute format('alter publication supabase_realtime add table api.%I', table_name);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;
