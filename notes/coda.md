
# Coda vs. Google Drive: Understanding Structural & Organizational Hierarchies

Navigating document management systems requires understanding their underlying mental models. While both **Coda** and **Google Drive** organize information for teams, they approach hierarchy, containers, and data nesting with fundamentally different philosophies.

---

## 1. Core Hierarchy Breakdown

### Google Drive Hierarchy (Directory-Based)
Google Drive operates on a **file-system paradigm**, similar to local storage (macOS Finder or Windows File Explorer).

```text
[ Google Workspace / Drive ]
  └── [ Shared Drive / My Drive ]
        └── [ Folder ]
              └── [ Sub-Folder ]
                    └── [ File / Document / Sheet ]
```

* **Root / Storage Location:** `My Drive` or `Shared Drives`.
* **Folders:** Purely organizational containers that hold files or other folders. Folders cannot contain native text or rich content themselves.
* **Files:** Terminal "leaf" nodes (Docs, Sheets, PDFs). A Google Doc cannot contain another Google Doc inside it.

---

### Coda Hierarchy (Object & Canvas-Based)
Coda operates on a **canvas-first paradigm**. Every document acts as an application container housing infinite nested sub-pages, databases, and canvases.

```text
[ Coda Workspace ]
  └── [ Workspace Folder ]
        └── [ Workspace Sub-Folder ]
              └── [ Coda Document ]  ◄── (Leaf node in Workspace filesystem)
                    ├── [ Canvas Content ]
                    └── [ Sub-Page / Child Page ]
                          ├── [ Table / Database ]
                          └── [ Sub-Sub-Page ]
```

* **Workspace:** The top-level enterprise boundary (equivalent to a company's Google Workspace domain).
* **Workspace Folders:** High-level administrative containers used exclusively to group documents together.
* **Coda Documents (`Doc`):** The boundary line. Outside a Doc, you are organizing files. Inside a Doc, you are constructing interactive pages and applications.

---

## 2. Direct Component Mapping

| Architectural Level | Coda Equivalent | Google Drive Equivalent | Key Structural Differences |
| :--- | :--- | :--- | :--- |
| **Enterprise / Tenant** | Workspace (`ws-...`) | Google Workspace Domain | Organization-level admin and billing boundary. |
| **Top Container** | Workspace Folder (`fl-...`) | Shared Drive / Drive Folder | Contains items, but Coda folders cannot hold rich page text directly. |
| **Document Unit** | Coda Doc (`doc-...`) | Google Doc (`.gdoc`) / File | Coda Docs are full mini-apps; Google Docs are flat text/media files. |
| **Sub-Organization** | Page / Canvas (`canvas-...`) | Nested Sub-Folder *or* Headers | Coda pages act as both folders AND documents simultaneously. |
| **Structured Data** | Coda Table / Control | Google Sheet (`.gsheet`) | Coda tables live inside pages; Google Sheets are separate files. |

---

## 3. Structural Mechanics: Where Mental Models Diverge

### A. Folders vs. Pages (The "Container" Trap)
In **Google Drive**, a folder holds files, and a file holds content. They are strictly separate entities:
* A folder **cannot** contain prose or paragraphs.
* A document **cannot** contain sub-documents.

In **Coda**, the hierarchy changes at the Document boundary:
1. **Above the Doc (Workspace level):** `Folders` hold `Docs`.
2. **Inside the Doc (Canvas level):** `Pages` act as **both** documents and folders.
   * Every Coda page can hold rich content, text, tables, and buttons.
   * At the same time, any Coda page can have **Child Pages** nested beneath it infinitely.

```text
Coda Page: "Engineering Team"  (Acts as a Document with text)
  └── Sub-Page: "Sprint Planning"  (Acts as a child document, but nested inside)
        └── Sub-Page: "Retrospectives"
```

### B. The Coda API View vs. UI View
Understanding this distinction is critical when interacting with Coda programmatically:

* **Workspace API Endpoints (`/workspaces/{ws}/folders`):**
  Used to manipulate the top-level organization.
  * *Field for parent folder:* `parentFolderId`.
  * *Constraint:* You **cannot** place a Workspace Folder inside a Doc or Page.

* **Doc Pages API Endpoints (`/docs/{docId}/pages`):**
  Used to manipulate the inner structure of a document.
  * *Field for parent page:* `parentPageId`.
  * *Constraint:* Pages belong strictly inside a `docId`.

---

## 4. Summary: How to Choose Your Structure

* **Use Google Drive thinking** when organizing high-level access permissions, team departments, and storing external assets (PDFs, images, standalone exports).
* **Use Coda thinking** when building connected workspaces where documentation, project tracking databases, and workflows live side-by-side in a deeply nested, navigable page tree.