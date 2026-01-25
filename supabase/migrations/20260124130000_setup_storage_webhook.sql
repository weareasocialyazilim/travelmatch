-- Migration: Setup Storage Webhook for Rekognition
-- Created: 2026-01-24 13:00:00
-- Purpose: Trigger Edge Function on file upload to storage.objects

-- Ensure pg_net extension is enabled for making HTTP requests
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

-- Function to trigger the Edge Function
CREATE OR REPLACE FUNCTION public.trigger_handle_storage_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  -- ⚠️ CONFIGURATION NEEDED ⚠️
  -- For Local: Use 'http://host.docker.internal:54321/functions/v1/handle-storage-upload'
  -- For Production: Use 'https://[YOUR_PROJECT_REF].supabase.co/functions/v1/handle-storage-upload'
  -- Updated for Production Project: bjikxgtbptrvawkguypv
  edge_function_url text := 'https://bjikxgtbptrvawkguypv.supabase.co/functions/v1/handle-storage-upload';
  
  headers jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('request.jwt.claim.role', true) || '"}'::jsonb;
  payload jsonb;
  request_id integer;
BEGIN
  -- Construct the webhook payload
  payload = jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', row_to_json(NEW),
    'old_record', NULL -- For INSERTs, OLD is null
  );

  -- Log for debugging (optional)
  -- RAISE NOTICE 'Triggering Rekognition for %', NEW.name;

  -- Send async HTTP request
  SELECT 
    net.http_post(
      url := edge_function_url,
      body := payload,
      headers := headers
    )
  INTO request_id;

  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists
DROP TRIGGER IF EXISTS "on_file_upload_rekognition" ON storage.objects;

-- Create the trigger on storage.objects
-- Only fire for NEW files (INSERT)
CREATE TRIGGER "on_file_upload_rekognition"
  AFTER INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_handle_storage_upload();
