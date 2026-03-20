-- Create payments table for idempotency and auditing
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'NGN',
    tx_ref TEXT UNIQUE NOT NULL, -- Ensure we only process each reference once
    transaction_id TEXT,
    status TEXT NOT NULL,
    tier TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS payments_tx_ref_idx ON payments(tx_ref);
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
