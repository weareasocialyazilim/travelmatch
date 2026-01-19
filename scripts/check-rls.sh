#!/bin/bash

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "❌ Docker is not running. Please start Docker to check local RLS status."
  exit 1
fi

echo "🔍 Checking for tables without RLS enabled in 'public' schema..."

docker exec -i lovendo-postgres psql -U postgres -d postgres -c "
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename NOT IN (
    SELECT tablename 
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relrowsecurity = true 
      AND n.nspname = 'public'
  );
"

if [ $? -eq 0 ]; then
    echo "✅ RLS check complete. If no tables listed above, all public tables have RLS enabled."
else
    echo "❌ Failed to query database."
fi
