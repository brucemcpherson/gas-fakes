# [Properties](https://developers.google.com/apps-script/reference/properties)

This service allows scripts to store strings as key-value pairs scoped to one script, one user of a script, or one document in which an editor add-on is used. For more information about when to use each type of property, see the guide to the Properties service.

## Class: [Properties](https://developers.google.com/apps-script/reference/properties/properties)

The properties object acts as the interface to access user, document, or script properties. The specific property type depends on which of the three methods of PropertiesService the script called: PropertiesService.getDocumentProperties(), PropertiesService.getUserProperties(), or PropertiesService.getScriptProperties(). Properties cannot be shared between scripts. For more information about property types, see the guide to the Properties service.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [deleteAllProperties()](https://developers.google.com/apps-script/reference/properties/properties#deleteAllProperties()) | Deletes all properties in the current Properties store. | [Properties](#class-properties) | this Properties store, for chaining | in progress | [link](../src/services/stores/fakestores.js#L279) |
| [deleteProperty(String)](https://developers.google.com/apps-script/reference/properties/properties#deleteProperty(String)) | Deletes the property with the given key in the current Properties store. | [Properties](#class-properties) | this Properties store, for chaining | completed | [link](../src/services/stores/fakestores.js#L287) |
| [getKeys()](https://developers.google.com/apps-script/reference/properties/properties#getKeys()) | Gets all keys in the current Properties store. | String[] | an array of all keys in the current Properties store | in progress | [link](../src/services/stores/fakestores.js#L291) |
| [getProperties()](https://developers.google.com/apps-script/reference/properties/properties#getProperties()) | Gets a copy of all key-value pairs in the current Properties store. Note that the returned object is not a live view of the store. Consequently, changing the properties on the returned object will not automatically update them in storage, or vice versa. | Object | a copy of all key-value pairs in the current Properties store | in progress | [link](../src/services/stores/fakestores.js#L274) |
| [getProperty(String)](https://developers.google.com/apps-script/reference/properties/properties#getProperty(String)) | Gets the value associated with the given key in the current Properties store, or null if no such key exists. | String | the value associated with the given key in the current Properties store | completed | [link](../src/services/stores/fakestores.js#L302) |
| [setProperties(Object,Boolean)](https://developers.google.com/apps-script/reference/properties/properties#setProperties(Object,Boolean)) |  |  |  | in progress | [link](../src/services/stores/fakestores.js#L307) |
| [setProperties(Object)](https://developers.google.com/apps-script/reference/properties/properties#setProperties(Object)) | Sets all key-value pairs from the given object in the current Properties store. | [Properties](#class-properties) | this Properties store, for chaining | in progress | [link](../src/services/stores/fakestores.js#L307) |
| [setProperty(String,String)](https://developers.google.com/apps-script/reference/properties/properties#setProperty(String,String)) |  |  |  | completed | [link](../src/services/stores/fakestores.js#L316) |

## Class: [PropertiesService](https://developers.google.com/apps-script/reference/properties/properties-service)

Allows scripts to store simple data in key-value pairs scoped to one script, one user of a script, or one document in which an add-on is used. Properties cannot be shared between scripts. For more information about when to use each type of property, see the guide to the Properties service.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getDocumentProperties()](https://developers.google.com/apps-script/reference/properties/properties-service#getDocumentProperties()) | Gets a property store (for this script only) that all users can access within the open document, spreadsheet, or form. It is only available if the script is published and executing as an add-on or if it is bound to a Google file type. When document properties are not available this method returns null. Document properties created by a script are not accessible outside that script, even by other scripts accessing the same document. | [Properties](#class-properties) | a property store for this script only that all users of the current document can access, or null if the script is not either an add-on or bound to a Google Workspace file | completed | [link](../src/services/stores/fakestores.js#L120) |
| [getScriptProperties()](https://developers.google.com/apps-script/reference/properties/properties-service#getScriptProperties()) | Gets a property store that all users can access, but only within this script. | [Properties](#class-properties) | a property store that all users of the script can access | completed | [link](../src/services/stores/fakestores.js#L138) |
| [getUserProperties()](https://developers.google.com/apps-script/reference/properties/properties-service#getUserProperties()) | Gets a property store that only the current user can access, and only within this script. | [Properties](#class-properties) | a property store that only the current user of the script can access | completed | [link](../src/services/stores/fakestores.js#L130) |

## Class: [ScriptProperties](https://developers.google.com/apps-script/reference/properties/script-properties)

Deprecated. This class is deprecated and should not be used in new scripts.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |

## Class: [UserProperties](https://developers.google.com/apps-script/reference/properties/user-properties)

Deprecated. This class is deprecated and should not be used in new scripts.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |

