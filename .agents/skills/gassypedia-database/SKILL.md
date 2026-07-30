---
name: gassypedia-database
description: Comprehensive schema reference and natural language query guide for the Gassypedia BigQuery dataset (scrmin.gassypedia) and its central view 'big_join'. Use this to translate user questions into optimized SQL queries or test scripts.
---

# 📚 Gassypedia Database Skill Reference

The `gassypedia-database` skill provides complete context, schema definitions, and query patterns to translate natural language requests into efficient BigQuery SQL.

## 🌐 Overview: What is Gassypedia?

The Gassypedia dataset is a comprehensive analytical snapshot of Google Apps Script (GAS) projects. It aggregates metadata from various sources, primarily GitHub repositories, to provide deep insights into how GAS projects are developed, hosted, and utilized.

The data tracks:
*   **Repositories (`repos`):** The GitHub hosts for the GAS projects.
*   **Files (`files`):** Individual script files within those repositories.
*   **Owners (`owners`):** The GitHub users who own the repositories.
*   **Loads (`loads`):** Temporal snapshots of the entire dataset, allowing for time-series analysis.

The core of this skill is the `big_join` view, which performs complex joins across these underlying tables to create a single, highly denormalized record for every analyzed file, enriched with metadata from its owner, repository, and associated libraries.

## 🛠️ Core Schema: `scrmin.gassypedia.big_join`

The `big_join` view is the primary target for all analytical queries. It is a complex view designed to flatten the relationships between files, repositories, and owners into a single, powerful record.

### 📊 View Structure Definition

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `loadDate` | `DATE` | The date of the data snapshot (when the data was loaded). |
| `libraryInfo` | `STRUCT` | Metadata identifying the script acting as a library. |
| `ownerId` | `INT64` | The ID of the primary owner of the repository. |
| `ownerIsHireable` | `BOOL` | Flag indicating if the owner is marked as hireable on GitHub. |
| `repoInfo` | `STRUCT` | Detailed metadata about the repository itself. |
| `isAddon` | `BOOL` | True if the file content indicates it is a Google Workspace Add-on. |
| `file` | `STRUCT` | The raw metadata of the file itself (e.g., name, size, path). |
| `ownerInfo` | `STRUCT` | Detailed profile information about the repository owner. |
| `addOnInfo` | `STRUCT` | Structured metadata extracted from the file's Add-on configuration (if applicable). |

### 🔍 Detailed Field Breakdown

#### 1. `libraryInfo` (STRUCT)
This struct identifies the script that is being referenced as a library by the current file.
*   `ownerId`: ID of the library owner.
*   `repoId`: ID of the library repository.
*   `gqlId`: GitHub Global ID of the library file.
*   `scriptId`: The ID of the script file acting as the library.

#### 2. `repoInfo` (STRUCT)
Metadata about the repository hosting the file.
*   `createdAt`: Timestamp when the repository was created.
*   `filesAnalyzed`: Total number of files analyzed in the repository.
*   `gassyFiles`: Count of files identified as "gassy" (scripts).
*   `id`: Unique ID of the repository.
*   `manifests`: Count of manifest files.
*   `name`: Name of the repository.
*   `pushedAt`: Timestamp of the last push to the repository.
*   `stargazerCount`: Number of stars the repository has received.
*   `updatedAt`: Timestamp of the last update to the repository.
*   `watchers`: Number of users watching the repository.

#### 3. `ownerInfo` (STRUCT)
Detailed profile information for the repository owner.
*   `id`: GitHub User ID.
*   `login`: GitHub username.
*   `name`: Full name of the user.
*   `email`: User's email address (may be null).
*   `followers`: Number of followers.
*   `company`: User's company affiliation.
*   `isHireable`: Flag indicating if the user is hireable.
*   `stats`: A complex object containing various user statistics.
*   `location`: User's geographical location.
*   `avatarUrl`: URL to the user's avatar.
*   `bio`: User's biography.
*   `createdAt`: Date the user joined GitHub.
*   `updatedAt`: Date the user profile was last updated.
*   `url`: User's profile URL.
*   `twitterUsername`: User's Twitter handle.
*   `blog`: User's blog URL.
*   `publicGists`: Count of public Gists.
*   `publicRepos`: Count of public repositories.
*   `stargazerCount`: Total stars received by the user.

#### 4. `addOnInfo` (STRUCT)
Structured data extracted from the `file.content.addOns` JSON field. This is crucial for identifying the type of Google Workspace Add-on.
*   `logo`: URL of the add-on logo.
*   `isChat`: True if the add-on supports chat functionality.
*   `name`: Name of the add-on.
*   `isCalendar`: True if the add-on supports calendar integration.
*   `isMeet`: True if the add-on supports Google Meet integration.
*   `isDocs`: True if the add-on supports Google Docs integration.
*   `isDrive`: True if the add-on supports Google Drive integration.
*   `isGmail`: True if the add-on supports Gmail integration.
*   `isSlides`: True if the add-on supports Google Slides integration.
*   `isSheets`: True if the add-on supports Google Sheets integration.

## 🧠 Natural Language to SQL Translation Guide

This section provides examples of common user queries and their optimized BigQuery SQL translations. Agents should prioritize querying the `big_join` view and use `GROUP BY` and `COUNT()` functions for aggregation.

### Example 1: Owner Activity
**User Query:** "Summarize the number of unique owners by loadid."
**Goal:** Count distinct owners for a specific snapshot.

```sql
SELECT
  loadId,
  COUNT(DISTINCT ownerId) AS unique_owner_count
FROM
  `scrmin.gassypedia.big_join`
GROUP BY
  loadId
ORDER BY
  loadId DESC;
```

### Example 2: Add-on Popularity
**User Query:** "What are the most popular Google Sheets add-ons, ranked by the number of files they contain?"
**Goal:** Count files based on the `isSheets` flag in `addOnInfo`.

```sql
SELECT
  addOnInfo.name,
  COUNT(1) AS file_count
FROM
  `scrmin.gassypedia.big_join`
WHERE
  addOnInfo.isSheets = TRUE
GROUP BY
  addOnInfo.name
ORDER BY
  file_count DESC
LIMIT 10;
```

### Example 3: Repository Health/Activity
**User Query:** "List the top 5 most gassy repositories (repositories with the highest number of gassy files), showing their name and owner login."
**Goal:** Aggregate by repository and count `gassyFiles`.

```sql
SELECT
  repoInfo.name AS repository_name,
  ownerInfo.login AS owner_login,
  repoInfo.gassyFiles
FROM
  `scrmin.gassypedia.big_join`
GROUP BY
  1, 2, 3
ORDER BY
  repoInfo.gassyFiles DESC
LIMIT 5;
```

### Example 4: Library Usage
**User Query:** "Find scripts that act as libraries, grouped by the library owner's name."
**Goal:** Identify files that have a non-null `libraryInfo` struct.

```sql
SELECT
  ownerInfo.name AS library_owner_name,
  COUNT(1) AS total_library_usages
FROM
  `scrmin.gassypedia.big_join`
WHERE
  libraryInfo.gqlId IS NOT NULL
GROUP BY
  1
ORDER BY
  total_library_usages DESC;
```

### Example 5: Specific Feature Search
**User Query:** "Find all files that contain Gmail Add-ons and are owned by a user who is marked as hireable."
**Goal:** Filter based on two nested boolean flags.

```sql
SELECT
  file.name,
  ownerInfo.login,
  addOnInfo.name
FROM
  `scrmin.gassypedia.big_join`
WHERE
  addOnInfo.isGmail = TRUE
  AND ownerIsHireable = TRUE
LIMIT 100;
```

## 🚀 Querying Best Practices

To ensure efficient and reliable data retrieval, adhere to the following guidelines:

1.  **Always Query the View:** Always target `scrmin.gassypedia.big_join`. Do not attempt to join the underlying tables (`files`, `repos`, etc.) manually, as the view handles the complex, optimized joins.
2.  **Use Fully Qualified Names:** Always use the full path: `` `scrmin.gassypedia.big_join` ``.
3.  **Handle Structs Correctly:** When accessing nested data (e.g., `repoInfo.name` or `addOnInfo.isSheets`), remember that the field name is a dot-separated path.
4.  **Avoid `SELECT *`:** While convenient, selecting all columns (`SELECT *`) can be inefficient. Specify only the fields required for the query (e.g., `SELECT ownerInfo.login, repoInfo.name`).
5.  **Filtering on Booleans:** Use explicit boolean checks for flags: `WHERE ownerIsHireable = TRUE` or `WHERE addOnInfo.isGmail = TRUE`.
6.  **Aggregation:** For summary statistics (counts, averages, sums), always use `GROUP BY` and aggregate functions (`COUNT()`, `SUM()`, `AVG()`).
7.  **Synchronous & Optimized Spreadsheet Output:** When converting query results into Google Spreadsheets with `gas-fakes`:
    - **Synchronous Execution**: Always write standard synchronous code without `async`/`await` to preserve native Google Apps Script parity and code transferability.
    - **setValues Optimization**: Collect results into a 2D array and write them in a single batch using `range.setValues(twoDArray)` instead of calling `sheet.appendRow()` in a loop. This avoids rate limits (HTTP 429 quota exceptions) and ensures maximum speed.

