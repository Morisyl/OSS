CREATE TABLE export_column_labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE (field_key, label)
);

CREATE TABLE export_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);