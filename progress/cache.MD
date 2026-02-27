# [Cache](https://developers.google.com/apps-script/reference/cache)

This service allows a script to temporarily cache results that take time to fetch/compute. Public caches are for things that are not dependent on which user is accessing your script. Private caches are for things which are user-specific, like settings or recent activity.

## Class: [Cache](https://developers.google.com/apps-script/reference/cache/cache)

A reference to a particular cache.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [get(String)](https://developers.google.com/apps-script/reference/cache/cache#get(String)) | Gets the cached value for the given key, or null if none is found. | String | the cached value, or null if none was found | completed | [link](../src/services/stores/fakestores.js#L5) |
| [getAll(String)](https://developers.google.com/apps-script/reference/cache/cache#getAll(String)) | Returns a JavaScript Object containing all key/value pairs found in the cache for an array of keys. | Object | a JavaScript Object containing the key/value pairs for all keys found in the cache | in progress | [link](../src/services/stores/fakestores.js#L332) |
| [put(String,String,Integer)](https://developers.google.com/apps-script/reference/cache/cache#put(String,String,Integer)) |  |  |  | completed | [link](../src/services/stores/fakestores.js#L343) |
| [put(String,String)](https://developers.google.com/apps-script/reference/cache/cache#put(String,String)) |  |  |  | completed | [link](../src/services/stores/fakestores.js#L343) |
| [putAll(Object,Integer)](https://developers.google.com/apps-script/reference/cache/cache#putAll(Object,Integer)) |  |  |  | in progress | [link](../src/services/stores/fakestores.js#L348) |
| [putAll(Object)](https://developers.google.com/apps-script/reference/cache/cache#putAll(Object)) | Adds a set of key/value pairs to the cache. |  |  | in progress | [link](../src/services/stores/fakestores.js#L348) |
| [remove(String)](https://developers.google.com/apps-script/reference/cache/cache#remove(String)) | Removes an entry from the cache using the given key. |  |  | completed | [link](../src/services/stores/fakestores.js#L357) |
| [removeAll(String)](https://developers.google.com/apps-script/reference/cache/cache#removeAll(String)) | Removes a set of entries from the cache. |  |  | in progress | [link](../src/services/stores/fakestores.js#L362) |

## Class: [CacheService](https://developers.google.com/apps-script/reference/cache/cache-service)

CacheService allows you to access a cache for short term storage of data.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getDocumentCache()](https://developers.google.com/apps-script/reference/cache/cache-service#getDocumentCache()) | Gets the cache instance scoped to the current document and script. Document caches are specific to the current document which contains the script. Use these to store script information that is specific to the current document. If this method is called outside of the context of a containing document (such as from a standalone script or web app), this method returns null. | [Cache](#class-cache) | a document cache instance, or null if there is no containing document | completed | [link](../src/services/stores/fakestores.js#L156) |
| [getScriptCache()](https://developers.google.com/apps-script/reference/cache/cache-service#getScriptCache()) | Gets the cache instance scoped to the script. Script caches are common to all users of the script. Use these to store information that is not specific to the current user. | [Cache](#class-cache) | a script cache instance | completed | [link](../src/services/stores/fakestores.js#L174) |
| [getUserCache()](https://developers.google.com/apps-script/reference/cache/cache-service#getUserCache()) | Gets the cache instance scoped to the current user and script. User caches are specific to the current user of the script. Use these to store script information that is specific to the current user. | [Cache](#class-cache) | a user cache instance | completed | [link](../src/services/stores/fakestores.js#L166) |

