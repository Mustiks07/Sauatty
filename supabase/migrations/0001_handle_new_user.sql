-- Sync auth.users -> public.users
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
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
