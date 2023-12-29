FROM postgres:latest

# Enable SSL
RUN mkdir -p /var/lib/postgresql/ssl
COPY ./test_keys/server.crt /var/lib/postgresql/ssl/
COPY ./test_keys/server.key /var/lib/postgresql/ssl/
RUN chmod 600 /var/lib/postgresql/ssl/server.key \
    && chown postgres:postgres /var/lib/postgresql/ssl/server.*
# Copy the initialization script
COPY db.dump /docker-entrypoint-initdb.d/
COPY ./init-db.sh /docker-entrypoint-initdb.d/

# Change ownership of the files in /docker-entrypoint-initdb.d/ to postgres user
RUN chown -R postgres:postgres /docker-entrypoint-initdb.d/
