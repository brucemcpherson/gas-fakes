### JDBC & Cloud SQL Troubleshooting

#### 1. MySQL 8.x/8.4 Authentication Plugin
**The Problem:** Apps Script's JDBC driver is incompatible with the default `caching_sha2_password` security in MySQL 8.0+.
**The Solution:** Use the legacy `mysql_native_password` plugin.
1. **Enable Database Flag:** In Cloud SQL Console, add the flag `mysql_native_password` and set it to `on`.
2. **Downgrade User:** Run `ALTER USER 'your-user'@'%' IDENTIFIED WITH mysql_native_password BY 'your-password';`.

#### 2. GCP Project Configuration
**The Problem:** Connection fails even with correct DB credentials because the script isn't authorized to "tunnel" to the instance.
**The Solution:**
1. **Enable API:** Ensure the **Cloud SQL Admin API** is enabled in the Google Cloud project.
2. **IAM Role:** The user running the script (or the service account) must have the **Cloud SQL Client** (`roles/cloudsql.client`) role.
3. **OAuth Scopes:** The script must include the `https://www.googleapis.com/auth/sqlservice` scope. Add this to your `appsscript.json` manifest if not automatically prompted.

#### 3. Connection Syntax
**The Problem:** Using IP addresses with `getCloudSqlConnection`.
**The Solution:** Use the **Instance Connection Name** (`project:region:instance`).
- **MySQL:** `jdbc:google:mysql://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **PostgreSQL:** `jdbc:google:postgres://INSTANCE_CONNECTION_NAME/DATABASE_NAME`
- **SQL Server:** `jdbc:google:sqlserver://INSTANCE_CONNECTION_NAME/DATABASE_NAME`