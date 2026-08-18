begin;
create extension if not exists pgtap with schema extensions;
set search_path = extensions, public;
select plan(25);

select ok(has_table_privilege('anon', 'api.trips', 'select'), 'anon can read trips');
select ok(not has_table_privilege('anon', 'api.trips', 'insert'), 'anon cannot create trips');
select ok(not has_table_privilege('anon', 'api.trips', 'delete'), 'anon cannot delete trips');
select ok(not has_column_privilege('anon', 'api.trips', 'name', 'update'), 'anon cannot update trip name');
select ok(has_column_privilege('anon', 'api.trips', 'leader_member_id', 'update'), 'anon can assign leader');
select ok(not has_schema_privilege('anon', 'internal', 'usage'), 'anon cannot access internal schema');
select ok(has_table_privilege('anon', 'api.members', 'select'), 'anon can read members');
select ok(not has_table_privilege('anon', 'api.members', 'insert'), 'anon cannot create members');
select ok(not has_table_privilege('anon', 'api.members', 'delete'), 'anon cannot delete members');

select ok(has_table_privilege('anon', 'api.expenses', 'select') and has_table_privilege('anon', 'api.expenses', 'insert') and has_table_privilege('anon', 'api.expenses', 'update') and has_table_privilege('anon', 'api.expenses', 'delete'), 'anon has expense CRUD');
select ok(has_table_privilege('anon', 'api.shared_funds', 'select') and has_column_privilege('anon', 'api.shared_funds', 'target_amount', 'update') and not has_table_privilege('anon', 'api.shared_funds', 'insert'), 'anon can configure but not create funds');
select ok(has_table_privilege('anon', 'api.fund_contributions', 'select') and has_table_privilege('anon', 'api.fund_contributions', 'insert') and has_table_privilege('anon', 'api.fund_contributions', 'update') and has_table_privilege('anon', 'api.fund_contributions', 'delete'), 'anon has fund contribution CRUD');
select ok(has_table_privilege('anon', 'api.common_preparation_tasks', 'select') and has_table_privilege('anon', 'api.common_preparation_tasks', 'insert') and has_table_privilege('anon', 'api.common_preparation_tasks', 'update') and has_table_privilege('anon', 'api.common_preparation_tasks', 'delete'), 'anon has common task CRUD');
select ok(has_table_privilege('anon', 'api.common_preparation_checks', 'select') and has_table_privilege('anon', 'api.common_preparation_checks', 'insert') and has_table_privilege('anon', 'api.common_preparation_checks', 'update') and has_table_privilege('anon', 'api.common_preparation_checks', 'delete'), 'anon has common check CRUD');
select ok(has_table_privilege('anon', 'api.personal_preparation_items', 'select') and has_table_privilege('anon', 'api.personal_preparation_items', 'insert') and has_table_privilege('anon', 'api.personal_preparation_items', 'update') and has_table_privilege('anon', 'api.personal_preparation_items', 'delete'), 'anon has personal item CRUD');
select ok(has_table_privilege('anon', 'api.itinerary_items', 'select') and has_table_privilege('anon', 'api.itinerary_items', 'insert') and has_table_privilege('anon', 'api.itinerary_items', 'update') and has_table_privilege('anon', 'api.itinerary_items', 'delete'), 'anon has itinerary CRUD');

select ok((select bool_and(relrowsecurity) from pg_class where oid in (
  'api.trips'::regclass, 'api.members'::regclass, 'api.expenses'::regclass, 'api.shared_funds'::regclass, 'api.fund_contributions'::regclass,
  'api.common_preparation_tasks'::regclass, 'api.common_preparation_checks'::regclass,
  'api.personal_preparation_items'::regclass, 'api.itinerary_items'::regclass
)), 'RLS is enabled on every exposed table');

select is((select count(*) from api.members), 6::bigint, 'seed has six members');
select is((select count(*) from api.common_preparation_tasks), 8::bigint, 'seed has eight classified common tasks');
select is((select count(distinct day_number) from api.itinerary_items), 6::bigint, 'seed covers Day 1 through Day 6');
select is((select count(*) from api.expenses), 0::bigint, 'quote amounts are not seeded as expenses');
select is((select count(*) from api.common_preparation_checks), 48::bigint, 'every common task has a check for every member');
select is((select count(*) from api.personal_preparation_items where is_recommended), 144::bigint, 'each member receives 24 recommended personal items');
select is((select count(*) from api.shared_funds), 1::bigint, 'seed has one shared travel fund');
select is((select count(*) from api.fund_contributions), 0::bigint, 'fund starts without fabricated contributions');

select * from finish();
rollback;
