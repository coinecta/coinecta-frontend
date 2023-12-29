#!/bin/bash
set -e

# Append to pg_hba.conf to enforce SSL connections
echo "hostssl all all all md5" >> "$PGDATA/pg_hba.conf"

# Configure PostgreSQL to use SSL
echo "ssl = on" >> "$PGDATA/postgresql.conf"
echo "ssl_cert_file = '/var/lib/postgresql/ssl/server.crt'" >> "$PGDATA/postgresql.conf"
echo "ssl_key_file = '/var/lib/postgresql/ssl/server.key'" >> "$PGDATA/postgresql.conf"

# Use pg_restore to import the custom-format dump
pg_restore --no-owner -U "$POSTGRES_USER" -d "$POSTGRES_DB" /docker-entrypoint-initdb.d/db.dump