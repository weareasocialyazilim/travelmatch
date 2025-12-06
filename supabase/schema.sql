-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES (Users)
-- Extends the default auth.users table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  avatar_url text,
  role text check (role in ('Traveler', 'Local', 'Admin')),
  kyc_status text default 'Unverified' check (kyc_status in ('Unverified', 'Pending', 'Verified')),
  bio text,
  location jsonb, -- { lat: number, lng: number, city: string, country: string }
  trust_score integer default 0,
  is_verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MOMENTS (Gestures/Gifts)
create table public.moments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) >= 5),
  description text,
  type text check (type in ('coffee', 'ticket', 'dinner', 'other')),
  status text default 'active' check (status in ('active', 'completed', 'cancelled', 'expired')),
  location jsonb,
  image_url text,
  price_amount numeric check (price_amount > 0),
  price_currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROOFS
create table public.proofs (
  id uuid default uuid_generate_v4() primary key,
  moment_id uuid references public.moments(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  status text default 'pending' check (status in ('pending', 'verified', 'rejected', 'failed')),
  media_urls text[], -- Array of image/video URLs
  description text,
  location jsonb,
  ai_score numeric,
  community_score numeric,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete set null,
  receiver_id uuid references public.profiles(id) on delete set null,
  moment_id uuid references public.moments(id) on delete set null,
  proof_id uuid references public.proofs(id) on delete set null,
  type text not null check (type in ('gift', 'withdrawal', 'refund', 'deposit')),
  status text default 'pending' check (status in ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  amount numeric not null,
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone
);

-- RLS POLICIES (Row Level Security)
alter table public.profiles enable row level security;
alter table public.moments enable row level security;
alter table public.proofs enable row level security;
alter table public.transactions enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- Moments Policies
create policy "Moments are viewable by everyone"
  on public.moments for select
  using ( true );

create policy "Users can create moments"
  on public.moments for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own moments"
  on public.moments for update
  using ( auth.uid() = user_id );

-- Proofs Policies
create policy "Proofs are viewable by everyone"
  on public.proofs for select
  using ( true );

create policy "Users can create proofs"
  on public.proofs for insert
  with check ( auth.uid() = user_id );

-- Transactions Policies
create policy "Users can view their own transactions"
  on public.transactions for select
  using ( auth.uid() = sender_id or auth.uid() = receiver_id );

-- FUNCTIONS & TRIGGERS

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'name', 'Traveler');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKETS
-- Note: Storage buckets must be created via the Supabase Dashboard or API, 
-- but we can define the policies here if the buckets exist.
-- Assuming buckets: 'avatars', 'moments', 'proofs'

-- Storage Policies (Example for avatars)
-- create policy "Avatar images are publicly accessible"
--   on storage.objects for select
--   using ( bucket_id = 'avatars' );

-- create policy "Anyone can upload an avatar"
--   on storage.objects for insert
--   with check ( bucket_id = 'avatars' );
