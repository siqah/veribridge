-- Fix the created_by foreign key constraint
-- Make the column nullable to support admin uploads from local auth

-- Drop the existing foreign key constraint if it exists
ALTER TABLE mailbox_items DROP CONSTRAINT IF EXISTS mailbox_items_created_by_fkey;

-- Make the column nullable
ALTER TABLE mailbox_items ALTER COLUMN created_by DROP NOT NULL;

-- Re-add the foreign key constraint (nullable)
ALTER TABLE mailbox_items 
  ADD CONSTRAINT mailbox_items_created_by_fkey 
  FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- Verify the change
\d mailbox_items;
