-- Run via Supabase SQL editor or MCP apply_migration.
-- Applied to project zjifbgkjtjpnoabfxcft for local MVP reference.

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  about_me text,
  profile_facts jsonb NOT NULL DEFAULT '{}'::jsonb,
  stripe_customer_id text UNIQUE,
  subscription_status text NOT NULL DEFAULT 'inactive'
    CHECK (subscription_status IN ('inactive', 'active', 'past_due', 'canceled')),
  subscription_price_id text,
  entitlement_tier text NOT NULL DEFAULT 'free'
    CHECK (entitlement_tier IN ('free', 'plus')),
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_stripe_customer_id_idx ON public.profiles (stripe_customer_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.user_consent (
  user_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  depth_tier text NOT NULL DEFAULT 'basic' CHECK (depth_tier IN ('basic', 'deep')),
  accepted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_consent_rw_own ON public.user_consent
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.journey_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  path_id text NOT NULL,
  step_index int NOT NULL DEFAULT 0,
  completed_steps int[] NOT NULL DEFAULT ARRAY[]::int[],
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, path_id)
);

CREATE INDEX journey_progress_user_idx ON public.journey_progress (user_id);

ALTER TABLE public.journey_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY journey_select_own ON public.journey_progress
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY journey_modify_own ON public.journey_progress
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  trace_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_user_created ON public.chat_messages (user_id, created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_select_own ON public.chat_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY chat_insert_own ON public.chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE TABLE public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
