
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS onboarding_completo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tipo_negocio text,
  ADD COLUMN IF NOT EXISTS tempo_atuacao text;
