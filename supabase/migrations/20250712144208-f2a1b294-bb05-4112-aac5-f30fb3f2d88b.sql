ALTER TABLE integration_settings
ADD CONSTRAINT integration_user_unique UNIQUE (user_id);