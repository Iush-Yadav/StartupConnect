-- Follows Table
create table if not exists follows (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid references profiles(id) on delete cascade,
  followed_id uuid references profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique (follower_id, followed_id)
);

-- Messages Table
create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references profiles(id) on delete cascade,
  receiver_id uuid references profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table follows enable row level security;
alter table messages enable row level security;

-- RLS: Only allow users to see their own follows
create policy "Users can see their follows" on follows
  for select using (auth.uid() = follower_id or auth.uid() = followed_id);

-- RLS: Only allow users to follow/unfollow as themselves
create policy "Users can follow/unfollow" on follows
  for insert using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);
create policy "Users can unfollow" on follows
  for delete using (auth.uid() = follower_id);

-- RLS: Only allow users to read their own messages
create policy "Users can read their messages" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- RLS: Only allow sending messages if sender follows receiver
create policy "Users can send messages to followed users" on messages
  for insert using (
    auth.uid() = sender_id
    and exists (
      select 1 from follows
      where follower_id = sender_id and followed_id = receiver_id
    )
  );

-- RLS: Only allow deleting own messages (optional)
create policy "Users can delete their own messages" on messages
  for delete using (auth.uid() = sender_id); 