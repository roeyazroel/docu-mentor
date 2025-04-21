-- Function to safely update file content and create a version in a transaction
CREATE OR REPLACE FUNCTION update_file_content_with_version(
  p_file_id VARCHAR(36),
  p_content TEXT,
  p_version INT,
  p_user_id VARCHAR(36),
  p_old_content TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Update (or insert if not exists) the file content
  INSERT INTO file_contents (file_id, content, version)
  VALUES (p_file_id, p_content, p_version)
  ON CONFLICT (file_id)
  DO UPDATE SET
    content = p_content,
    version = p_version;

  -- Create a version history entry only if there was previous content
  IF p_version > 1 THEN
    INSERT INTO file_versions (
      id,
      file_id,
      content,
      version,
      created_by,
      created_at
    )
    VALUES (
      gen_random_uuid(),
      p_file_id,
      p_old_content,
      p_version - 1,
      p_user_id,
      NOW()
    );
  END IF;

  -- Log the update access
  INSERT INTO fs_access_logs (
    id,
    node_id,
    user_id,
    action,
    timestamp
  )
  VALUES (
    gen_random_uuid(),
    p_file_id,
    p_user_id,
    'update',
    NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Helper function to safely check if a function exists
CREATE OR REPLACE FUNCTION pg_get_function_result(functionname text)
RETURNS boolean AS $$
DECLARE
  exist boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM pg_proc
    WHERE proname = functionname
  ) INTO exist;
  RETURN exist;
END;
$$ LANGUAGE plpgsql;

-- Wrapper function for CREATE or REPLACE
CREATE OR REPLACE FUNCTION create_update_file_content_procedure()
RETURNS void AS $$
BEGIN
  -- Function is already created above
  RAISE NOTICE 'Procedure updated_file_content_with_version created or updated';
END;
$$ LANGUAGE plpgsql;

-- Function to migrate data from memory to database
CREATE OR REPLACE FUNCTION migrate_memory_to_database(
  p_organization_id VARCHAR(36),
  p_user_id VARCHAR(36)
)
RETURNS VOID AS $$
DECLARE
  v_data_migrated BOOLEAN := FALSE;
BEGIN
  -- Insert migration logic here
  -- This would be called from the application to migrate in-memory data

  -- Note: This is a placeholder. The actual implementation would involve
  -- the application sending the in-memory data structure to be processed

  RAISE NOTICE 'Migration procedure called for organization: %', p_organization_id;
END;
$$ LANGUAGE plpgsql;
