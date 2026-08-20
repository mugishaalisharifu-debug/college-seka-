DO $$
DECLARE
  target_id uuid := (SELECT id FROM users WHERE email='store.manager@school.rw' AND role='Store-Manager');
  dup_ids uuid[];
BEGIN
  SELECT array_agg(id) INTO dup_ids FROM users WHERE role='Store-Manager' AND id != target_id;
  
  UPDATE inventory_transactions SET recorded_by = target_id WHERE recorded_by = ANY(dup_ids);
  UPDATE store_transactions SET recorded_by = target_id WHERE recorded_by = ANY(dup_ids);
  UPDATE student_requirement_checks SET inspected_by = target_id WHERE inspected_by = ANY(dup_ids);
  UPDATE student_store_deposits SET received_by = target_id WHERE received_by = ANY(dup_ids);
  UPDATE news SET author_id = target_id WHERE author_id = ANY(dup_ids);
  
  DELETE FROM users WHERE id = ANY(dup_ids);
  RAISE NOTICE 'Deleted % duplicate users', (SELECT count(*) FROM users WHERE role='Store-Manager' AND id != target_id);
END $$;
