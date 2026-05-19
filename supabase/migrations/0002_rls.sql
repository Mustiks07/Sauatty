-- Deny-by-default RLS on all public tables. Server uses service role and bypasses.
alter table public.users enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.answer_options enable row level security;
alter table public.test_attempts enable row level security;
alter table public.user_answers enable row level security;
alter table public.drafts enable row level security;

-- Storage bucket for question images: read-only for authenticated users.
-- Create bucket "question-images" in Supabase dashboard before applying.
drop policy if exists "auth users can read question images" on storage.objects;
create policy "auth users can read question images"
  on storage.objects for select
  using ( bucket_id = 'question-images' and auth.role() = 'authenticated' );
