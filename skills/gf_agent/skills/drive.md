# Service: drive

## Class: DriveApp

Supported Methods:
- `continueFileIterator(String)`
- `continueFolderIterator(String)`
- `createFile(BlobSource)`
- `createFile(String,String,String)`
- `createFile(String,String)`
- `createFolder(String)`
- `createShortcut(String)`
- `createShortcutForTargetIdAndResourceKey(String,String)`
- `enforceSingleParent(Boolean)`
- `getFileById(String)`
- `getFileByIdAndResourceKey(String,String)`
- `getFiles()`
- `getFilesByName(String)`
- `getFilesByType(String)`
- `getFolderById(String)`
- `getFolderByIdAndResourceKey(String,String)`
- `getFolders()`
- `getFoldersByName(String)`
- `getRootFolder()`
- `getStorageLimit()`
- `getStorageUsed()`
- `getTrashedFiles()`
- `getTrashedFolders()`
- `searchFiles(String)`
- `searchFolders(String)`

## Class: File

Supported Methods:
- `addCommenter(String)`
- `addCommenter(User)`
- `addCommenters(String)`
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `getAccess(String)`
- `getAccess(User)`
- `getDateCreated()`
- `getDescription()`
- `getEditors()`
- `getId()`
- `getLastUpdated()`
- `getName()`
- `getOwner()`
- `getParents()`
- `getSharingAccess()`
- `getSharingPermission()`
- `getSize()`
- `getUrl()`
- `getViewers()`
- `isShareableByEditors()`
- `isStarred()`
- `isTrashed()`
- `moveTo(Folder)`
- `removeCommenter(String)`
- `removeCommenter(User)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `revokePermissions(String)`
- `revokePermissions(User)`
- `setDescription(String)`
- `setName(String)`
- `setOwner(String)`
- `setOwner(User)`
- `setShareableByEditors(Boolean)`
- `setSharing(Access,Permission)`
- `setStarred(Boolean)`
- `setTrashed(Boolean)`

## Class: Folder

Supported Methods:
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `getAccess(String)`
- `getAccess(User)`
- `getDateCreated()`
- `getDescription()`
- `getEditors()`
- `getId()`
- `getLastUpdated()`
- `getName()`
- `getOwner()`
- `getParents()`
- `getSharingAccess()`
- `getSharingPermission()`
- `getSize()`
- `getUrl()`
- `getViewers()`
- `isShareableByEditors()`
- `isStarred()`
- `isTrashed()`
- `moveTo(Folder)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `revokePermissions(String)`
- `revokePermissions(User)`
- `setDescription(String)`
- `setName(String)`
- `setOwner(String)`
- `setOwner(User)`
- `setShareableByEditors(Boolean)`
- `setSharing(Access,Permission)`
- `setStarred(Boolean)`
- `setTrashed(Boolean)`

## Class: User

Supported Methods:
- `getDomain()`
- `getEmail()`
- `getName()`
- `getPhotoUrl()`

