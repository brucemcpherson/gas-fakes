# <img src="../logo.png" alt="gas-fakes logo" width="50" align="top"> Notes on JDBC handling in Apps Script and gas-fakes

The Google Apps Script implementation of JDBC is notoriously strict and frequently unsupported out-of-the-box by modern database providers. Converting a standard connection string for a variety of databases into one that Apps Script's underlying Java JDBC driver will accept can be complex and error-prone.

Since the objective of `gas-fakes` is to emulate Live Apps Script, we've added a suite of utilities to help you normalize connection strings, strip unsupported connectivity requirements, and seamlessly bridge the gap between local development and Live Apps Script execution.

Under the hood, `gas-fakes` uses the highly performant `pg` and `mysql2` Node.js libraries. These libraries handle modern security and connection configurations smoothly, whereas Google's Java JDBC driver often rejects them.

---

## The Golden Rules of Live Apps Script JDBC

Through extensive testing, we've identified the exact limitations of Live Apps Script's JDBC driver. To successfully connect to a database from Apps Script, you **must** adhere to the following rules:

1. **Use the 3-Argument Method:** Always prefer `Jdbc.getConnection(url, user, password)` over passing a single connection string with embedded credentials. Single-argument embedded strings are poorly parsed and frequently trigger authentication failures on Live Apps Script.
2. **Do NOT URI-Encode Credentials:** When passing your `user` and `password` as explicit string arguments to `Jdbc.getConnection(url, user, password)`, **do not** URI-encode them (e.g., changing `%` to `%25`). The Java driver treats them as exact literal strings, and encoding them will cause authentication to fail.
3. **Strip ALL SSL/Tunneling Query Parameters:** Apps Script's native driver strictly rejects connection parameters it does not understand. If your `url` contains `?sslmode=require`, `?ssl-mode=REQUIRED`, `?ssl=true`, `?useSSL=true`, or `?channel_binding=require`, the driver will crash immediately with an error like: `"The following connection properties are unsupported: sslmode,ssl."` These must be aggressively stripped from the end of the URL before calling `.getConnection()`.

Having said that, the simplest solution is to use gas-fakes cli, give it a standard connection string and it will give you all the possible connection options. See [test/testjdbc.js](test/testjdbc.js) for examples of which to use.

---

## Databases Validated

These databases have been thoroughly tested and verified to work correctly on both `gas-fakes` (locally) and Live Apps Script. Examples of their configurations can be found in [`test/testjdbc.js`](test/testjdbc.js).

- **PostgreSQL** on [Neon](https://neon.com/)
- **MySQL** on [Aiven](https://aiven.io/)
- **CockroachDB** (Postgres-like) on [cockroachlabs.com](https://www.cockroachlabs.com/)
- **PostgreSQL** on [Google Cloud SQL](https://cloud.google.com/sql)
- **MySQL** on [Google Cloud SQL](https://cloud.google.com/sql)

---

## Using the `gas-fakes` CLI String Normalizer

Because manually stripping unsupported query parameters and formatting host strings for Apps Script is tedious, `gas-fakes` includes a built-in CLI tool that parses any standard Database URL and provides the exact formatted variants required for both Local and Live Apps Script execution.

Run the following command in your terminal, passing in the URL provided by your database host:

```bash
gas-fakes jdbc --connection-string "jdbc:postgresql://your-host.com:5432/mydb?sslmode=require&user=admin&password=secretPassword"
```

The CLI will output a clean JSON payload mapping exactly what parameters should be used in both environments:

```json
{
  "current": "local",
  "gas": {
    "url": "jdbc:postgresql://your-host.com:5432/mydb",
    "connectionString": "jdbc:postgresql://your-host.com:5432/mydb",
    "user": "admin",
    "password": "secretPassword",
    "fullConnectionString": "jdbc:postgresql://your-host.com:5432/mydb?user=admin&password=secretPassword",
    "isCloudSqlConnection": false,
    "proxyCommand": ""
  },
  "local": {
    "url": "jdbc:postgresql://your-host.com:5432/mydb",
    "connectionString": "jdbc:postgresql://your-host.com:5432/mydb?user=admin&password=secretPassword&ssl=true",
    "user": "admin",
    "password": "secretPassword",
    "fullConnectionString": "jdbc:postgresql://your-host.com:5432/mydb?user=admin&password=secretPassword&ssl=true",
    "useProxy": false,
    "proxyCommand": ""
  },
  "host": "your-host.com:5432",
  "proxyCommand": "",
  "isGoogle": false,
  "type": "pg"
}
```

Notice how the `gas.url` property has completely stripped the `sslmode=require` query parameters, providing the pristine URL needed for Apps Script.

### Google Cloud SQL CLI Example

If you provide a Google Cloud SQL instance string when the proxy is running locally, `gas-fakes` will detect it and provide the correct internal `jdbc:google:mysql://` format for Live Apps Script, alongside the proxy command and mapped `127.0.0.1` endpoints for your local tests:

```json
{
  "current": "local",
  "gas": {
    "url": "jdbc:google:mysql://gas-fakes-474508:europe-west2:gas-fakes-google-mysql/gas-fakes-test",
    "connectionString": "jdbc:google:mysql://gas-fakes-474508:europe-west2:gas-fakes-google-mysql/gas-fakes-test",
    "user": "gas-fakes-google-mysql",
    "password": "secretPassword",
    "fullConnectionString": "jdbc:google:mysql://gas-fakes-474508:europe-west2:gas-fakes-google-mysql/gas-fakes-test",
    "isCloudSqlConnection": true,
    "proxyCommand": "cloud-sql-proxy gas-fakes-474508:europe-west2:gas-fakes-google-mysql"
  },
  "local": {
    "url": "jdbc:mysql://127.0.0.1:3306/gas-fakes-test",
    "connectionString": "jdbc:mysql://127.0.0.1:3306/gas-fakes-test?user=gas-fakes-google-mysql&password=secretPassword&ssl=false",
    "user": "gas-fakes-google-mysql",
    "password": "secretPassword",
    "fullConnectionString": "jdbc:mysql://127.0.0.1:3306/gas-fakes-test?user=gas-fakes-google-mysql&password=secretPassword&ssl=false",
    "useProxy": true,
    "proxyCommand": "cloud-sql-proxy gas-fakes-474508:europe-west2:gas-fakes-google-mysql"
  },
  "host": "35.234.147.127:3306",
  "proxyCommand": "cloud-sql-proxy gas-fakes-474508:europe-west2:gas-fakes-google-mysql",
  "isGoogle": true,
  "type": "mysql"
}
```

### Understanding the CLI Output Properties

The JSON object provides two distinct contexts: `gas` (for Live Apps Script) and `local` (for Node.js `gas-fakes`). Each context contains properties formatted specifically for how the underlying database drivers on those platforms expect to receive them.

*   **`current`**: Indicates which environment context (`gas` or `local`) is currently executing the code. If you query this in a local test script, it will dynamically return `"local"`.
*   **`url`**: The cleanly formatted base URL of the database *without any embedded credentials or unsupported SSL query parameters*. 
    *   **When to use:** Use this as the first argument in the standard 3-argument connection method: `Jdbc.getConnection(config.url, config.user, config.password)`. This is the recommended approach for almost all Live Apps Script connections.
*   **`user` & `password`**: The cleanly decoded database credentials.
    *   **When to use:** Use these as the second and third arguments in the 3-argument connection method alongside `url`.
*   **`connectionString`**: Similar to `url`, but locally this may include appended SSL flags (like `ssl=false` for proxies or `ssl=true`). 
    *   **When to use:** This is primarily used by the `gas-fakes` internal systems or if you need the naked connection string without auth. On Google Cloud SQL MySQL `gas` contexts, it points to the custom internal `jdbc:google:mysql://` format.
*   **`fullConnectionString`**: The fully assembled database URL containing both the base URL *and* the embedded `user` and `password` inside the query string.
    *   **When to use:** Use this if you are forced to use the single-argument execution method: `Jdbc.getConnection(config.fullConnectionString)`. **Warning:** Single-argument connections are heavily discouraged on Live Apps Script as they frequently cause parsing failures and authentication errors, particularly with Postgres. Use this mainly for local Node.js testing.
*   **`proxyCommand`**: If the connection string points to a Google Cloud SQL instance, this provides the exact `cloud-sql-proxy` terminal command you need to run to expose it locally.
*   **`isCloudSqlConnection`**: True only for Google Cloud SQL MySQL on Live Apps Script, indicating you must use `Jdbc.getCloudSqlConnection()` rather than `Jdbc.getConnection()`.

---

## Required Manifest Scopes (`appsscript.json`)

To successfully use `Jdbc` methods on Live Apps Script, you **must** explicitly define the necessary OAuth scopes in your project's `appsscript.json` manifest file. 

Ensure the following scopes are added to your `oauthScopes` array:

```json
{
  "oauthScopes": [
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/sqlservice"
  ]
}
```

- `script.external_request`: Required for standard JDBC connections to external databases like Aiven, Neon, or CockroachDB.
- `sqlservice`: Required specifically when using `Jdbc.getCloudSqlConnection` to securely connect to internal Google Cloud SQL instances.

---

## Google Cloud SQL Hosted Databases

Google Cloud SQL hosted databases require a few additional steps, most of which are detected and handled automatically by `gas-fakes` during local development.

### Connectivity

For Google Cloud SQL (MySQL and Postgres), you can use the Cloud SQL Proxy or use the external IP address of your database. `gas-fakes` can use either, automatically switching between them depending on whether it detects the Cloud SQL Proxy running in your local environment.

#### Option 1: Using the Cloud SQL Proxy (Recommended for Local Dev)

Install the proxy using gcloud:
```bash
gcloud components install cloud-sql-proxy
```

Let's say your instance is `project-id:region:instance-name`. This is the internal address of a Google host, meaning it is only valid natively when using `Jdbc.getCloudSqlConnection()` (which is currently only valid for MySQL on Apps Script, not Postgres). 

In a separate terminal session, start the proxy to expose your database to your local `gas-fakes` execution:

```bash
cloud-sql-proxy <project-id>:<region>:<instance-name>
```

If `gas-fakes` detects the proxy running, it automatically patches in the `127.0.0.1` localhost address and port to the connection string during local execution, rather than attempting to route through Google's internal network.

#### Option 2: Using the External IP Address

`gas-fakes` will attempt to use the SQL proxy first. If it is not running, it will automatically:
1. Fetch the external IP address of your database from the Cloud SQL API.
2. Interrogate your current local IP address and seamlessly whitelist it on the Cloud SQL instance so you can access it.
3. Modify the connection string you provide to substitute the Google internal instance name with the newly accessible external IP address.

### Resolving Out-of-Date Password Encryption for MySQL

For MySQL, Google Apps Script uses an older Java JDBC driver that is **incompatible** with the default authentication security introduced in MySQL 8.0 and 8.4. 

If you try to connect, `Jdbc.getCloudSqlConnection` or `Jdbc.getConnection` will fail with the error: *"Failed to establish a database connection. Check connection string, username and password."* This happens because MySQL 8.4 uses `caching_sha2_password` (SHA-256) by default, while Apps Script only supports the legacy `mysql_native_password` (SHA-1) handshake.

**How to fix it:**
To allow Apps Script to connect, you must explicitly re-enable the legacy authentication plugin at the server level and update the specific database user.

1. **Enable the Database Flag**
   - Go to Cloud SQL Instances > [Your Instance] > Edit.
   - Navigate to Configuration options > Flags. 
   - Add the flag: `mysql_native_password` and set it to `on`.
   - Save (The instance will restart).

2. **Downgrade the User Authentication**
   Run the following SQL command in your Cloud SQL Query Editor:
   ```sql
   ALTER USER 'your-user'@'%' 
   IDENTIFIED WITH mysql_native_password BY 'your-password';
   
   FLUSH PRIVILEGES;
   ```
   *Note: You must repeat this step whenever you change the user password.*

---

## Apps Script IP Whitelisting

When running from `gas-fakes`, your local IP address is detected and whitelisted automatically. However, when running on Live Apps Script, you must whitelist the IP addresses of the Google data centers that execute the scripts. 

These IPs are documented in the Google Cloud SQL documentation. You can use a script like the one below to quickly append the Google Apps Script execution IP ranges to your Google Cloud SQL authorized networks.

```bash
#!/bin/bash
INSTANCE_NAME="your-cloud-sql-instance-name"

echo "Fetching Google IP ranges..."
# Get Google IP ranges for Apps Script (only IPv4 as Cloud SQL authorized networks generally use IPv4)
GOOGLE_IPS=$(curl -s https://www.gstatic.com/ipranges/goog.json | jq -r '.prefixes[] | select(.ipv4Prefix) | .ipv4Prefix' | paste -sd, -)

# Also get our local IP to add back in case we need it for node tests
LOCAL_IP=$(curl -s https://ifconfig.me)
LOCAL_NETWORK="${LOCAL_IP}/32"

ALL_NETWORKS="${GOOGLE_IPS},${LOCAL_NETWORK}"

echo "Found $(echo $ALL_NETWORKS | tr ',' '\n' | wc -l | xargs) IP ranges."

echo "Attempting to patch instance $INSTANCE_NAME..."
gcloud sql instances patch $INSTANCE_NAME --authorized-networks="${ALL_NETWORKS}" --quiet
```

---

## Sharing Credentials Between Environments

If you are developing locally using `gas-fakes`, your connections will likely be defined in your `.env` file. To avoid duplicating effort and manually configuring the Properties Service on Live Apps Script, `gas-fakes` allows you to directly sync properties. 

By executing a local setup script via `gas-fakes`, you can serialize the clean, stripped connection configurations from your `.env` variables and automatically populate the Live Properties Store via Upstash/DWD synchronization. 

For an exact code-level implementation of how to do this flawlessly across both environments, review the [testjdbc.js](test/testjdbc.js) implementation, which dynamically reads the parsed JSON payload from the Properties Store depending on whether it is running on `ScriptApp.isFake`.

For more details on bridging environments, see [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/). 
## A note on performance

Here's the comparitive test results - this test opens a spreadsheet, creates a table, populates and checks that what was written matches the spreadsheet contents. Note that running locally with a modern client under gas-fakes (without any optimization attempts) is an order of magnitude (50x) faster than running live on Apps Script using its JDBC driver. 

### gas-fakes
```
[Info] Section summary
[Info]  0: Jdbc Basics - Cockroach DB passes:12 failures:0
[Info]  1: Jdbc Basics - Aiven MySQL passes:12 failures:0
[Info]  2: Jdbc Basics - Google Cloud SQL MySQL passes:12 failures:0
[Info]  3: Jdbc Basics - Google Cloud SQL PG passes:12 failures:0
[Info]  4: Jdbc Basics - Neon Postgres passes:12 failures:0
[Info] Total passes 60 (100.0%) Total failures 0 (0.0%)
[Info] ALL TESTS PASSED
[Info] Total elapsed ms 17057
```

### live apps script
```
Info	Section summary
Info	 0: Jdbc Basics - Cockroach DB passes:12 failures:0
Info	 1: Jdbc Basics - Aiven MySQL passes:12 failures:0
Info	 2: Jdbc Basics - Google Cloud SQL MySQL passes:6 failures:0
Info	 3: Jdbc Basics - Google Cloud SQL PG passes:6 failures:0
Info	 4: Jdbc Basics - Neon Postgres passes:12 failures:0
Info	Total passes 48 (100.0%) Total failures 0 (0.0%)
Info	ALL TESTS PASSED
Info	Total elapsed ms 802800
```

See the jdbc section of [oddities.md](oddities.md) for more information on the quirks of the Apps Script JDBC driver.

---

## The MySQL Driver Paradox: Cloud SQL vs. External (Aiven)

One of the most confusing oddities of Apps Script JDBC is that it behaves differently for MySQL depending on whether the database is hosted on Google Cloud SQL or an external provider (like Aiven or AWS).

### The Issue: `Parameter index out of range (1 > 0)`

When connecting to a modern **external** MySQL 8.x database using `Jdbc.getConnection()`, you may find that `prepareStatement()` fails to recognize your `?` placeholders. Even with a valid SQL string like `INSERT INTO table (col) VALUES (?)`, the driver may report that there are `0` parameters.

### Why It Happens
- **Cloud SQL Driver**: When you use `Jdbc.getCloudSqlConnection()`, Apps Script uses a specialized internal driver that is compatible with modern MySQL protocols and server settings.
- **External Driver**: When you use `Jdbc.getConnection()`, Apps Script uses a legacy external MySQL driver. This driver's client-side parser often fails to recognize placeholders when negotiating the protocol with a modern MySQL 8+ server. 

### The Solution: Fallback Pattern

Since you cannot modify the connection properties (Rule 3) to tweak the driver behavior, the only reliable way to handle this is to use a `try/catch` fallback pattern. If `prepareStatement` fails with a "Parameter index" error, fall back to a standard `Statement` with manually escaped values:

```javascript
try {
  var ps = conn.prepareStatement("INSERT INTO table (name) VALUES (?)");
  ps.setBigDecimal(1, myValue);
  ps.executeUpdate();
} catch (e) {
  if (e.message.indexOf("Parameter index") !== -1) {
    // Fallback for buggy legacy driver on external MySQL
    conn.createStatement().execute("INSERT INTO table (name) VALUES (" + myValue + ")");
  } else {
    throw e;
  }
}
```

---

## BigDecimal Object Emulation

In live Apps Script, `JdbcResultSet.getBigDecimal()` returns a `java.math.BigDecimal` proxy object, not a primitive JavaScript `Number`. 

### gas-fakes Implementation
To maintain parity, `gas-fakes` now returns a `FakeJdbcBigDecimal` object which supports:
- `toString()`: Returns the string representation.
- `doubleValue()`: Returns the numeric value.
- `intValue()`: Returns the integer value.
- `toPlainString()`: Returns the string without scientific notation.

When using `setBigDecimal()`, `gas-fakes` accepts both numeric values and `FakeJdbcBigDecimal` objects, correctly converting them for the underlying SQL engine.

---

## Binary Data & ResultSet Method Compatibility

Not all `JdbcResultSet` methods work the same way across all JDBC backends. The following table documents the compatibility of common binary/stream access methods in live Apps Script.

### `getBlob()` vs `getBytes()` by Backend

| Backend | `getBlob()` | `getBytes()` on BYTEA/BLOB | Notes |
|---|---|---|---|
| **Aiven MySQL** | ✅ Works on `BLOB` column | ✅ Works | `BLOB` maps directly to JDBC `Blob` |
| **Google Cloud SQL MySQL** | ✅ Works on `BLOB` column | ✅ Works | Same as Aiven |
| **CockroachDB (PG)** | ❌ Fails on `BYTEA` | ✅ Works on `BYTEA` | `getBlob()` requires OID large object |
| **Neon Postgres** | ❌ Fails on `BYTEA` | ✅ Works on `BYTEA` | Same as CockroachDB |
| **Google Cloud SQL PG** | ❌ Fails on `BYTEA` | ✅ Works on `BYTEA` | Same as CockroachDB |
| **gas-fakes (fake)** | ✅ Works on any column | ✅ Works on any column | Fake is permissive |

### Why `getBlob()` Fails on PostgreSQL

PostgreSQL treats binary large objects as *large objects* stored externally in `pg_largeobject` and referenced by an OID (a 64-bit integer). The PostgreSQL JDBC driver's `getBlob()` calls `getLong()` internally to retrieve that OID. When the column contains a `BYTEA` value (inline binary) or any other non-OID type, the driver throws:

```
Bad value for type long : <value>
```

**Correct approach by backend:**

```javascript
if (type === 'mysql') {
  // MySQL: BLOB columns work with getBlob()
  const blob = rs.getBlob(columnIndex);   // ✅
  const bytes = blob.getBytes(1, blob.length());
} else {
  // PostgreSQL: use BYTEA columns with getBytes()
  const bytes = rs.getBytes(columnIndex); // ✅
  // Convert to string using Utilities (TextDecoder is NOT available in GAS)
  const str = Utilities.newBlob(bytes).getDataAsString();
}
```

### `ResultSet.TYPE_SCROLL_INSENSITIVE` — Scrollable Cursors

Plain `conn.createStatement()` returns a **forward-only** cursor. Calling navigation methods like `last()`, `first()`, `absolute()`, `relative()`, `previous()`, `beforeFirst()`, or `afterLast()` on a forward-only ResultSet throws:

```
Operation requires a scrollable ResultSet, but this ResultSet is FORWARD_ONLY.
```

To get a scrollable cursor, use the two-argument overload:

```javascript
// TYPE_SCROLL_INSENSITIVE = 1004, CONCUR_READ_ONLY = 1007
const stmt = conn.createStatement(1004, 1007);
```

In `gas-fakes`, the parameters are accepted but advisory — results are buffered in memory and all navigation works regardless of the cursor type specified.

### `getFloat()` is 32-bit

`rs.getFloat()` returns an **IEEE 754 single-precision (32-bit) float** in both live GAS and the fake. This means values like `1.1` are stored as `1.100000023841858`. Always compare using `Math.fround()`:

```javascript
t.is(rs.getFloat(col), Math.fround(1.1), "correct float comparison");
```

`rs.getDouble()` returns a full 64-bit double and does not have this issue.

---

# Gas-Fakes Progress Summary

| Service | Classes | Methods | Completed | In Progress | Not Started |
|---|---|---|---|---|---|
| [Base](../progress/base.md) | 17 | 127 | 93 | 2 | 32 |
| [Cache](../progress/cache.md) | 2 | 11 | 7 | 4 | 0 |
| [Calendar](../progress/calendar.md) | 13 | 273 | 273 | 0 | 0 |
| [Charts](../progress/charts.md) | 29 | 238 | 37 | 0 | 201 |
| [Content](../progress/content.md) | 3 | 16 | 16 | 0 | 0 |
| [Document](../progress/document.md) | 47 | 1032 | 880 | 12 | 140 |
| [Drive](../progress/drive.md) | 8 | 164 | 124 | 8 | 32 |
| [Forms](../progress/forms.md) | 41 | 504 | 266 | 0 | 238 |
| [Gmail](../progress/gmail.md) | 6 | 168 | 167 | 0 | 1 |
| [HTML](../progress/html.md) | 6 | 39 | 34 | 0 | 5 |
| [JDBC](../progress/jdbc.md) | 20 | 753 | 311 | 0 | 442 |
| [Lock](../progress/lock.md) | 2 | 7 | 7 | 0 | 0 |
| [Mail](../progress/mail.md) | 1 | 5 | 0 | 0 | 5 |
| [Properties](../progress/properties.md) | 4 | 11 | 6 | 5 | 0 |
| [Script](../progress/script.md) | 16 | 84 | 22 | 0 | 62 |
| [Slides](../progress/slides.md) | 76 | 1288 | 1005 | 0 | 283 |
| [Spreadsheet](../progress/spreadsheet.md) | 108 | 1771 | 1301 | 19 | 451 |
| [URL Fetch](../progress/urlfetch.md) | 2 | 13 | 12 | 0 | 1 |
| [Utilities](../progress/utilities.md) | 5 | 59 | 59 | 0 | 0 |
| [XML](../progress/xml.md) | 14 | 149 | 142 | 0 | 7 |
| **Total** | **420** | **6712** | **4762** | **50** | **1900** |

## <img src="../pngs/logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading



## Watch the gas-fakes intro video

[![Watch the intro video](../pngs/introvideo.png)](https://youtu.be/oEjpIrkYpEM)

## Watch the explainer about delegating work to local LLMs to save token costs

[![Use local LLMs to save tokens](../pngs/hybrid_LLM_Architecture_Overview.png)](https://youtu.be/tcvU2NLEaNE)

## Watch the gf_agent video on natural language automation

[![Use natural language with gf_agent](../pngs/gfagent.png)](https://youtu.be/lujByoX71HU)

## Watch the local webapps and addons development video

[![Local Apps Script Webapp and UI Emulation with gas-fakes](../pngs/srv.jpg)](https://youtu.be/vH9wl7QloZ4)

## Read more docs

- [release notes](../versionnotes/)
- [gas fakes intro video](https://youtu.be/oEjpIrkYpEM)
- [getting started](../GETTING_STARTED.md) - how to handle authentication for Workspace scopes.
- [readme](../README.md)
- [apps script parity](../notes/parity.md)
- [omlx setup](../notes/omlx-setup.md)
- [Natural Language Automation with Gemini Skills & MCP Server](../notes/gemini-skills-mcp.md) - new skills-based agent approach.
- [Add agent skills to gf_agent](https://ramblings.mcpher.com/add-skills-gf_agent/)
- [gf_agent documentation](../../skills/gf_agent/README.md) - instructions for the Gemini CLI automation agent and MCP server.
- [gas fakes cli](../notes/gas-fakes-cli.md)
- [local add-on and webapp development with gas-fakes](../notes/local-web-development.md)
- [Bringing the webapp home](https://ramblings.mcpher.com/local-apps-script-webapp-and-ui-emulation/)
- [Local development example code](https://github.com/brucemcpherson/gf-serve)
- [github actions using adc](https://github.com/brucemcpherson/gas-fakes-actions-adc)
- [github actions using dwd and wif](https://github.com/brucemcpherson/gas-fakes-actions-dwd)
- [ksuite as a back end](../notes/ksuite_poc.md)
- [msgraph as a back end](../notes/msgraph.md)
- [resurrecting scriptDb repo](https://github.com/brucemcpherson/scriptdb-redux)
- [Resurrecting ScriptDb – nosql database for Apps Script](https://ramblings.mcpher.com/resurrecting-scriptdb-nosql-database-for-apps-script/)
- [gas-fakes in serverless containers](https://docs.google.com/presentation/d/1JlXF9T--DD4ERHopyP3WyAMhjRCxxHblgCP5ynxaJ3k/edit?usp=sharing)
- [apps script - a lingua franca for workspace platforms](https://ramblings.mcpher.com/apps-script-a-lingua-franca/)
- [Apps Script: A ‘Lingua Franca’ for the Multi-Cloud Era](https://ramblings.mcpher.com/apps-script-with-ksuite/)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Azure ACA](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Github actions](https://github.com/brucemcpherson/gas-fakes-containers)
- [jdbc notes](../notes/jdbc-notes.md)
- [Yes – you can run native apps script code on Azure ACA as well!](https://ramblings.mcpher.com/yes-you-can-run-native-apps-script-code-on-azure-aca-as-well/)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts - how it all started](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](../collaborators.md) - additional information for collaborators
- [oddities](../notes/oddities.md) - a collection of oddities uncovered during this project
- [named colors](../notes/named-colors.md)
- [sandbox](../notes/sandbox.md)
- [senstive scopes](../notes/workspace_scopes.md)
- [using apps script libraries with gas-fakes](../notes/libraries.md)
- [how libhandler works](../libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](../notes/named-range-identity.md)
- [Workspace scopes with local authentication](../notes/workspace_scopes.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to Workspace scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Power of Google Apps Script: Building MCP Server Tools for Gemini CLI and Google Antigravity in Google Workspace Automation](https://medium.com/google-cloud/power-of-google-apps-script-building-mcp-server-tools-for-gemini-cli-and-google-antigravity-in-71e754e4b740)
- [A New Era for Google Apps Script: Unlocking the Future of Google Workspace Automation with Natural Language](https://medium.com/google-cloud/a-new-era-for-google-apps-script-unlocking-the-future-of-google-workspace-automation-with-natural-a9cecf87b4c6)
- [Next-Generation Google Apps Script Development: Leveraging Antigravity and Gemini 3.0](https://medium.com/google-cloud/next-generation-google-apps-script-development-leveraging-antigravity-and-gemini-3-0-c4d5affbc1a8)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)

