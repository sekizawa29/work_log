-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Create clients table
create table clients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create time_entries table
create table time_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  task_name text not null,
  client_id uuid references clients(id),
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  duration integer, -- in seconds
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table clients enable row level security;
alter table time_entries enable row level security;

-- Create policies
create policy "Users can view their own profile." on profiles for select using (auth.uid() = id);
create policy "Users can update their own profile." on profiles for update using (auth.uid() = id);

create policy "Users can view their own clients." on clients for select using (auth.uid() = user_id);
create policy "Users can insert their own clients." on clients for insert with check (auth.uid() = user_id);
create policy "Users can update their own clients." on clients for update using (auth.uid() = user_id);
create policy "Users can delete their own clients." on clients for delete using (auth.uid() = user_id);

create policy "Users can view their own time entries." on time_entries for select using (auth.uid() = user_id);
create policy "Users can insert their own time entries." on time_entries for insert with check (auth.uid() = user_id);
create policy "Users can update their own time entries." on time_entries for update using (auth.uid() = user_id);
create policy "Users can delete their own time entries." on time_entries for delete using (auth.uid() = user_id);

-- Handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
