-- Digital Mailbox Items Table
create table if not exists mailbox_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  order_id text references company_orders(id), -- Optional: link to specific company order
  
  -- Mail details
  title text not null, -- e.g. "HMRC Tax Code"
  sender text, -- e.g. "Companies House", "HMRC"
  file_url text not null, -- The PDF link from Supabase Storage
  
  -- Metadata
  received_at timestamp with time zone default now(),
  is_read boolean default false,
  
  -- Audit
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users -- Admin who uploaded it
);

-- Add index for faster user queries
create index if not exists mailbox_items_user_id_idx on mailbox_items(user_id);
create index if not exists mailbox_items_order_id_idx on mailbox_items(order_id);

-- RLS Policies
alter table mailbox_items enable row level security;

-- Users can only see their own mail
create policy "Users can view own mailbox items"
  on mailbox_items for select
  using (auth.uid() = user_id);

-- Users can update read status of their own mail
create policy "Users can mark own mail as read"
  on mailbox_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for mail attachments
insert into storage.buckets (id, name, public)
values ('mail-attachments', 'mail-attachments', false)
on conflict (id) do nothing;

-- Storage policy: Users can view their own mail files
create policy "Users can view own mail files"
  on storage.objects for select
  using (
    bucket_id = 'mail-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
