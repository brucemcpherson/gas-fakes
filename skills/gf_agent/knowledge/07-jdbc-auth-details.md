### JDBC & Cloud SQL Authentication Guide

#### 1. "Failed to establish a database connection" (Generic Error)
This is the most common error. Systematically check:
- **Cloud SQL Admin API**: MUST be enabled in the Google Cloud Console for the project.
- **IAM Permissions**: The authenticated user (or service account) must have the **Cloud SQL Client** role (`roles/cloudsql.client`).
- **OAuth Scopes**: Your `appsscript.json` manifest must include the `"https://www.googleapis.com/auth/sqlservice"` scope.
- **Instance Connection Name**: Ensure you are using the full name (`project-id:region:instance-id`) and not just the instance ID or IP address when using `getCloudSqlConnection`.

#### 2. "Access denied for user" (Database Level)
Even if the secure tunnel is established, the database engine may reject the user:
- **Host Wildcard**: In MySQL/PostgreSQL, users are often restricted by host (e.g., `'user'@'localhost'`). Connections via `getCloudSqlConnection` appear as coming from an internal Google network. Ensure your user is created with a wildcard host or a host that allows Google's internal ranges (e.g., `'user'@'%'`).
- **Password Complexity**: While `Jdbc.getCloudSqlConnection` handles passwords as separate arguments (avoiding URI encoding issues), double-check for typos or expired passwords.

#### 3. MySQL 8.0+ Authentication Plugin
MySQL 8.0+ uses `caching_sha2_password` by default, which is incompatible with the Apps Script JDBC driver.
- **Symptom**: `Handshake failed` or `Access denied` even with correct credentials.
- **Fix**:
  1. In the Cloud SQL Console, add the database flag `mysql_native_password` and set it to `on`.
  2. Run the following SQL to downgrade the user: `ALTER USER 'your-user'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';`.

#### 4. Connection Methods: Tunneling vs. Public IP
- **Method A: `Jdbc.getCloudSqlConnection(url, user, password)` (Recommended)**
  - Works for MySQL and PostgreSQL.
  - Uses an internal secure tunnel; **no IP whitelisting required**.
  - URL format: `jdbc:google:mysql://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **Method B: `Jdbc.getConnection(url, user, password)`**
  - Required for **SQL Server** or non-Google hosted databases.
  - **IP Whitelisting**: You MUST whitelist Apps Script's public IP ranges in your database firewall/networking settings.
  - URL format: `jdbc:sqlserver://PUBLIC_IP:1433;databaseName=DB_NAME`
