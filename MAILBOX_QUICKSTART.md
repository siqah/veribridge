# Digital Mailbox Setup - Quick Start

## Step 1: Run Database Schema ✅

Copy this SQL and run it in your **Supabase SQL Editor**:

**Location**: Database → SQL Editor → New Query

```sql
-- Digital Mailbox Items Table
create table if not exists mailbox_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  order_id text references company_orders(id),

  title text not null,
  sender text,
  file_url text not null,

  received_at timestamp with time zone default now(),
  is_read boolean default false,

  created_at timestamp with time zone default now(),
  created_by uuid references auth.users
);

create index if not exists mailbox_items_user_id_idx on mailbox_items(user_id);
create index if not exists mailbox_items_order_id_idx on mailbox_items(order_id);

alter table mailbox_items enable row level security;

create policy "Users can view own mailbox items"
  on mailbox_items for select
  using (auth.uid() = user_id);

create policy "Users can mark own mail as read"
  on mailbox_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket
insert into storage.buckets (id, name, public)
values ('mail-attachments', 'mail-attachments', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can view own mail files"
  on storage.objects for select
  using (
    bucket_id = 'mail-attachments' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

> **Note**: Admin upload policies are not needed here because the backend uses the Service Key to bypass RLS for uploads.

## Step 2: Test the System ✅

1. **Go to Admin Dashboard**: Navigate to any UK company formation order
2. **You'll see**: "Upload Mail" section in the sidebar (UK orders only)
3. **Test Upload**:

   - Title: "Test HMRC Letter"
   - Sender: "HMRC"
   - Upload any PDF file
   - Click "Send to User's Mailbox"

4. **Check User Mailbox**:
   - Log in as that user (or use their account)
   - Go to `/mailbox`
   - Should see the uploaded mail with download button

## Step 3: Production Workflow 📧

**When Rapid Formations emails you**:

1. Email arrives: `admin@veribridge.co.ke`

   - Subject: _"Mail for Kamau Digital Ltd"_
   - Attachment: Scanned PDF

2. Download the PDF

3. Open VeriBridge admin dashboard

4. Find the user's UK company order

5. Scroll to "Upload Mail" section

6. Fill in:

   - **Title**: "Companies House Authentication Code" or "HMRC UTR Letter"
   - **Sender**: "Companies House" or "HMRC"
   - **File**: Upload the PDF

7. Click "Send to User's Mailbox"

8. Done! User can now download it from their dashboard

---

## What Mail to Upload?

✅ **DO Upload**:

- HMRC tax codes, UTR numbers
- Companies House authentication codes
- Official government notices
- Annual confirmation statements

❌ **DON'T Upload**:

- Bank cards (tell users to use local address)
- Marketing mail (ignore)
- Private business mail (not part of service)

---

## User Access

Users see their mailbox at:

- **Route**: `/mailbox` (requires login)
- **Shows**: Inbox-style list of all their mail
- **Actions**: Download PDF, mark as read

---

## Troubleshooting

**Error uploading file?**

- Check file is PDF (not image or document)
- File size under 10MB
- Supabase storage bucket created

**User can't see mail?**

- Verify RLS policies ran correctly
- Check user_id matches the order's user_id
- Ensure storage policy allows user access

**Need to resend?**

- Just upload again with updated title
- Old mail stays in their inbox
