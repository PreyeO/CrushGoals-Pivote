-- Create friend_invites table for email invitations to non-users
CREATE TABLE public.friend_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL,
  invitee_email TEXT NOT NULL,
  invite_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.friend_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invites they sent
CREATE POLICY "Users can view their sent invites"
ON public.friend_invites
FOR SELECT
USING (auth.uid() = inviter_id);

-- Policy: Users can view invites sent to their email
CREATE POLICY "Users can view invites to their email"
ON public.friend_invites
FOR SELECT
USING (
  invitee_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
);

-- Policy: Users can create invites
CREATE POLICY "Users can create invites"
ON public.friend_invites
FOR INSERT
WITH CHECK (auth.uid() = inviter_id);

-- Policy: Users can update invites sent to their email (to accept)
CREATE POLICY "Users can update invites to their email"
ON public.friend_invites
FOR UPDATE
USING (
  invitee_email = (SELECT email FROM public.profiles WHERE user_id = auth.uid())
);

-- Policy: Users can delete their own invites
CREATE POLICY "Users can delete their invites"
ON public.friend_invites
FOR DELETE
USING (auth.uid() = inviter_id);

-- Create index for faster email lookups
CREATE INDEX idx_friend_invites_email ON public.friend_invites(invitee_email);
CREATE INDEX idx_friend_invites_token ON public.friend_invites(invite_token);