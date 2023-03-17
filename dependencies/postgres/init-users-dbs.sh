#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER crawler;
	CREATE DATABASE crawler;
	GRANT ALL PRIVILEGES ON DATABASE crawler TO crawler;
	ALTER DATABASE crawler OWNER TO crawler;
	
	CREATE USER readingroom;
	CREATE DATABASE readingroom;
	GRANT ALL PRIVILEGES ON DATABASE readingroom TO readingroom;
	ALTER DATABASE readingroom OWNER TO readingroom;
EOSQL

psql -v ON_ERROR_STOP=1 -c "ALTER USER crawler PASSWORD '"$POSTGRES_PASSWORD"';"
psql -v ON_ERROR_STOP=1 -c "ALTER USER readingroom PASSWORD '"$POSTGRES_PASSWORD"';"
