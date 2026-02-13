# [URL Fetch](https://developers.google.com/apps-script/reference/url-fetch)

This service allows scripts to access other resources on the web by fetching URLs. A script can use the UrlFetch service to issue HTTP and HTTPS requests and receive responses. The UrlFetch service uses Google's network infrastructure for efficiency and scaling purposes.

## Class: [HTTPResponse](https://developers.google.com/apps-script/reference/url-fetch/http-response)

This class allows users to access specific information on HTTP responses.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAllHeaders()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getAllHeaders()) | Returns an attribute/value map of headers for the HTTP response, with headers that have multiple values returned as arrays. | Object | a JavaScript key/value map of HTTP headers | completed | [link](../src/services/urlfetchapp/app.js#L19) |
| [getAs(String)](https://developers.google.com/apps-script/reference/url-fetch/http-response#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | Blob | The data as a blob. | completed | [link](../src/services/urlfetchapp/app.js#L71) |
| [getBlob()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getBlob()) | Return the data inside this object as a blob. | Blob | The data as a blob. | completed | [link](../src/services/urlfetchapp/app.js#L23) |
| [getContent()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getContent()) | Gets the raw binary content of an HTTP response. | Byte[] | the content as a raw binary array | completed | [link](../src/services/urlfetchapp/app.js#L21) |
| [getContentText()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getContentText()) | Gets the content of an HTTP response encoded as a string. | String | the content of the HTTP response, as a string | completed | [link](../src/services/urlfetchapp/app.js#L21) |
| [getContentText(String)](https://developers.google.com/apps-script/reference/url-fetch/http-response#getContentText(String)) | Returns the content of an HTTP response encoded as a string of the given charset. | String | the content of the HTTP response, encoded using the given charset | completed | [link](../src/services/urlfetchapp/app.js#L21) |
| [getHeaders()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getHeaders()) | Returns an attribute/value map of headers for the HTTP response. | Object | a JavaScript key/value map of HTTP headers | completed | [link](../src/services/urlfetchapp/app.js#L22) |
| [getResponseCode()](https://developers.google.com/apps-script/reference/url-fetch/http-response#getResponseCode()) | Get the HTTP status code (200 for OK, etc.) of an HTTP response. | Integer | The HTTP response code (for example, 200 for OK). | completed | [link](../src/services/urlfetchapp/app.js#L20) |

## Class: [UrlFetchApp](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app)

Fetch resources and communicate with other hosts over the Internet.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [fetch(String,Object)](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String,Object)) |  |  |  | completed | [link](../src/services/urlfetchapp/app.js#L87) |
| [fetch(String)](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetch(String)) | Makes a request to fetch a URL. | [HTTPResponse](#class-httpresponse) | The HTTP response data. | completed | [link](../src/services/urlfetchapp/app.js#L87) |
| [fetchAll(Object)](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#fetchAll(Object)) | Makes multiple requests to fetch multiple URLs using optional advanced parameters. | [HTTPResponse[]](#class-httpresponse) | An array of HTTP response data from each input request. | completed | [link](../src/services/urlfetchapp/app.js#L105) |
| [getRequest(String,Object)](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#getRequest(String,Object)) |  |  |  | not started |  |
| [getRequest(String)](https://developers.google.com/apps-script/reference/url-fetch/url-fetch-app#getRequest(String)) | Returns the request that is made if the operation was invoked. | Object | A map of Field Name to Value. The map has at least the following keys: url, method, contentType, payload, and headers. | not started |  |

