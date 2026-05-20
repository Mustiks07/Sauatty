-- Sync auth.users -> public.users (idempotent and exception-safe).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, phone, name, role, created_at)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'name', 'Қолданушы'),
    'USER',
    now()
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  -- Never block auth signup if profile insert fails — getSessionUser has a fallback.
  raise warning 'handle_new_user failed: %', sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
