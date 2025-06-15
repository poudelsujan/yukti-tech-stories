
-- 1. Create user profile table linked to Supabase auth users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text
);

-- 2. Create a roles enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- 3. Create user_roles table (many-to-many: 1 user, many roles)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

-- 4. Security definer to check user roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  );
$$;

-- 5. Trigger to auto-create public.profiles on user sign-up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'avatar_url');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. RLS for profiles (users can only select/update their own profile)
alter table public.profiles enable row level security;
create policy "Users can view their own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Anyone can insert their profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- 7. Enable RLS for user_roles, only admins can select/update, users can view their own
alter table public.user_roles enable row level security;
create policy "Admins can select/update all roles"
  on public.user_roles
  for all
  using (public.has_role(auth.uid(), 'admin'));

create policy "Users can select their own roles"
  on public.user_roles
  for select
  using (user_id = auth.uid());

create policy "Users can insert their own user_role"
  on public.user_roles
  for insert
  with check (user_id = auth.uid());

-- NOTE: After running this code, enable Google as an auth provider 
-- through https://supabase.com/dashboard/project/sjpfdfxbxttvatvrnvfl/auth/providers.

