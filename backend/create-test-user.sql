-- Créer un utilisateur de test avec subscription active
DO $$
DECLARE
  user_id UUID;
  plan_id UUID;
  subscription_id UUID;
BEGIN
  -- Récupérer l'ID du plan Premium
  SELECT id INTO plan_id FROM subscription_plans WHERE name = 'Premium' LIMIT 1;
  
  -- Créer l'utilisateur
  INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    'anstettadrien@gmail.com',
    '$2b$10$YourHashedPasswordHere', -- Vous devrez le changer
    'Adrien',
    'Anstett',
    'user',
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
  RETURNING id INTO user_id;
  
  -- Créer la subscription
  INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    user_id,
    plan_id,
    'active',
    NOW(),
    NOW() + INTERVAL '1 year',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  -- Créer les settings utilisateur
  INSERT INTO user_settings (id, user_id, bankroll_mode, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    user_id,
    'real',
    NOW(),
    NOW()
  )
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE 'User created successfully with ID: %', user_id;
END $$;
