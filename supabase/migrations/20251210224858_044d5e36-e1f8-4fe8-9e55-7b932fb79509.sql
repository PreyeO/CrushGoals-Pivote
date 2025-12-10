-- Create friendships table
CREATE TABLE public.friendships (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view their own friendships (sent and received)
CREATE POLICY "Users can view their friendships"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendships"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they're part of (accept/reject)
CREATE POLICY "Users can update friendships they received"
ON public.friendships FOR UPDATE
USING (auth.uid() = friend_id);

-- Users can delete their own friendship requests or received ones
CREATE POLICY "Users can delete friendships"
ON public.friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create index for faster lookups
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);