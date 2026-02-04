# [Base](https://developers.google.com/apps-script/reference/base)

This service provides access to user information such as email addresses and user names. It also controls script logs and dialog boxes in Google Workspace applications.

## Class: [Blob](https://developers.google.com/apps-script/reference/base/blob)

A data interchange object for Apps Script services.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [copyBlob()](https://developers.google.com/apps-script/reference/base/blob#copyBlob()) | Returns a copy of this blob. | [Blob](#class-blob) | The new copy. | completed | [link](../src/services/utilities/fakeblob.js#L67) |
| [getAs(String)](https://developers.google.com/apps-script/reference/base/blob#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | [Blob](#class-blob) | The data as a blob. | not started |  |
| [getBytes()](https://developers.google.com/apps-script/reference/base/blob#getBytes()) | Gets the data stored in this blob. | Byte[] | The stored bytes. | completed | [link](../src/services/utilities/fakeblob.js#L47) |
| [getContentType()](https://developers.google.com/apps-script/reference/base/blob#getContentType()) | Gets the content type of the bytes in this blob. | String | The content type of this data, if known, or null. | completed | [link](../src/services/utilities/fakeblob.js#L51) |
| [getDataAsString()](https://developers.google.com/apps-script/reference/base/blob#getDataAsString()) | Gets the data of this blob as a String with UTF-8 encoding. | String | The data as a string. | completed | [link](../src/services/utilities/fakeblob.js#L63) |
| [getDataAsString(String)](https://developers.google.com/apps-script/reference/base/blob#getDataAsString(String)) | Gets the data of this blob as a string with the specified encoding. | String | The data as a string. | completed | [link](../src/services/utilities/fakeblob.js#L63) |
| [getName()](https://developers.google.com/apps-script/reference/base/blob#getName()) | Gets the name of this blob. | String | The name of this data, if known, or null. | completed | [link](../src/services/utilities/fakeblob.js#L55) |
| [isGoogleType()](https://developers.google.com/apps-script/reference/base/blob#isGoogleType()) | Returns whether this blob is a Google Workspace file (Sheets, Docs, etc.). | Boolean | true if this blob is a Google Workspace file; false if not. | completed | [link](../src/services/utilities/fakeblob.js#L3) |
| [setBytes(Byte)](https://developers.google.com/apps-script/reference/base/blob#setBytes(Byte)) | Sets the data stored in this blob. | [Blob](#class-blob) | This blob, for chaining. | completed | [link](../src/services/utilities/fakeblob.js#L71) |
| [setContentType(String)](https://developers.google.com/apps-script/reference/base/blob#setContentType(String)) | Sets the content type of the bytes in this blob. | [Blob](#class-blob) | This blob, for chaining. | completed | [link](../src/services/utilities/fakeblob.js#L76) |
| [setContentTypeFromExtension()](https://developers.google.com/apps-script/reference/base/blob#setContentTypeFromExtension()) | Sets the content type of the bytes in this blob based on the file extension. The contentType is null if it cannot be guessed from its extension. | [Blob](#class-blob) | This blob, for chaining. | completed | [link](../src/services/utilities/fakeblob.js#L81) |
| [setDataFromString(String,String)](https://developers.google.com/apps-script/reference/base/blob#setDataFromString(String,String)) |  |  |  | completed | [link](../src/services/utilities/fakeblob.js#L85) |
| [setDataFromString(String)](https://developers.google.com/apps-script/reference/base/blob#setDataFromString(String)) | Sets the data of this blob from a string with UTF-8 encoding. | [Blob](#class-blob) | This blob, for chaining. | completed | [link](../src/services/utilities/fakeblob.js#L85) |
| [setName(String)](https://developers.google.com/apps-script/reference/base/blob#setName(String)) | Sets the name of this blob. | [Blob](#class-blob) | This blob, for chaining. | completed | [link](../src/services/utilities/fakeblob.js#L89) |

## Class: [Browser](https://developers.google.com/apps-script/reference/base/browser)

This class provides access to dialog boxes specific to Google Sheets.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [inputBox(String,ButtonSet)](https://developers.google.com/apps-script/reference/base/browser#inputBox(String,ButtonSet)) |  |  |  | not started |  |
| [inputBox(String,String,ButtonSet)](https://developers.google.com/apps-script/reference/base/browser#inputBox(String,String,ButtonSet)) |  |  |  | not started |  |
| [inputBox(String)](https://developers.google.com/apps-script/reference/base/browser#inputBox(String)) | Pops up a dialog box with a text input box in the user's browser. | String | The text entered by the user (or 'cancel' for a canceled or dismissed dialog). | not started |  |
| [msgBox(String,ButtonSet)](https://developers.google.com/apps-script/reference/base/browser#msgBox(String,ButtonSet)) |  |  |  | not started |  |
| [msgBox(String,String,ButtonSet)](https://developers.google.com/apps-script/reference/base/browser#msgBox(String,String,ButtonSet)) |  |  |  | not started |  |
| [msgBox(String)](https://developers.google.com/apps-script/reference/base/browser#msgBox(String)) | Pops up a dialog box with the given message and an OK button in the user's browser. | String | The lower case text of the button that is clicked by the user (or 'cancel' for a dismissed dialog). | not started |  |

## Class: [console](https://developers.google.com/apps-script/reference/base/console)

This class allows the developer to write to the Execution log and to Google Cloud Logging if the script is associated with a standard Cloud Project.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [error()](https://developers.google.com/apps-script/reference/base/console#error()) | Outputs a blank ERROR level message to Stackdriver Logging. |  |  | not started |  |
| [error(Object,Object...)](https://developers.google.com/apps-script/reference/base/console#error(Object,Object...)) |  |  |  | not started |  |
| [info()](https://developers.google.com/apps-script/reference/base/console#info()) | Outputs blank INFO level message to Stackdriver Logging. |  |  | not started |  |
| [info(Object,Object...)](https://developers.google.com/apps-script/reference/base/console#info(Object,Object...)) |  |  |  | not started |  |
| [log()](https://developers.google.com/apps-script/reference/base/console#log()) | Outputs a blank DEBUG level message to Stackdriver Logging. |  |  | not started |  |
| [log(Object,Object...)](https://developers.google.com/apps-script/reference/base/console#log(Object,Object...)) |  |  |  | not started |  |
| [time(String)](https://developers.google.com/apps-script/reference/base/console#time(String)) | Starts a timer you can use to track how long an operation takes. |  |  | not started |  |
| [timeEnd(String)](https://developers.google.com/apps-script/reference/base/console#timeEnd(String)) | Stops a timer that was previously started by calling console.time(). The time duration is logged in Stackdriver. |  |  | not started |  |
| [warn()](https://developers.google.com/apps-script/reference/base/console#warn()) | Outputs a blank WARNING level message to Stackdriver Logging. |  |  | not started |  |
| [warn(Object,Object...)](https://developers.google.com/apps-script/reference/base/console#warn(Object,Object...)) |  |  |  | not started |  |

## Class: [Logger](https://developers.google.com/apps-script/reference/base/logger)

This class allows the developer to write to the Execution log and to Google Cloud Logging if the script is associated with a standard Cloud Project. This class is preferred for structured logging and jsonPayload support in Cloud Logging. For time-based logging, use console.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [clear()](https://developers.google.com/apps-script/reference/base/logger#clear()) | Clears the log. |  |  | completed | [link](../src/services/logger/fakelogger.js#L35) |
| [getLog()](https://developers.google.com/apps-script/reference/base/logger#getLog()) | Returns a complete list of messages in the current log. This method can be used to save or email the entire log output generated during script execution. | String | the log from the logging console | completed | [link](../src/services/logger/fakelogger.js#L43) |
| [log(Object)](https://developers.google.com/apps-script/reference/base/logger#log(Object)) | Writes the data to the log. The data can be a string, a JavaScript object, or an object with a message property. | [Logger](#class-logger) | the Logger, for chaining. | completed | [link](../src/services/logger/fakelogger.js#L19) |
| [log(String,Object...)](https://developers.google.com/apps-script/reference/base/logger#log(String,Object...)) |  |  |  | completed | [link](../src/services/logger/fakelogger.js#L19) |

## Class: [Menu](https://developers.google.com/apps-script/reference/base/menu)

A custom menu in an instance of the user interface for a Google App. A script can only interact with the UI for the current instance of an open document or form, and only if the script is container-bound to the document or form. For more information, see the guide to menus.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addItem(String,String)](https://developers.google.com/apps-script/reference/base/menu#addItem(String,String)) |  |  |  | not started |  |
| [addSeparator()](https://developers.google.com/apps-script/reference/base/menu#addSeparator()) | Adds a visual separator to the menu. | [Menu](#class-menu) | This Menu, for chaining. | not started |  |
| [addSubMenu(Menu)](https://developers.google.com/apps-script/reference/base/menu#addSubMenu(Menu)) | Adds a sub-menu to the menu. | [Menu](#class-menu) | This Menu, for chaining. | not started |  |
| [addToUi()](https://developers.google.com/apps-script/reference/base/menu#addToUi()) | Inserts the menu into the instance of the editor's user interface. |  |  | not started |  |

## Class: [PromptResponse](https://developers.google.com/apps-script/reference/base/prompt-response)

A response to a prompt dialog displayed in the user-interface environment for a Google App. The response contains any text the user entered in the dialog's input field and indicates which button the user clicked to dismiss the dialog.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getResponseText()](https://developers.google.com/apps-script/reference/base/prompt-response#getResponseText()) | Gets the text that the user entered in the dialog's input field. The text is available even if the user closed the dialog by clicking a button with a negative connotation, like "Cancel" or the close button in the dialog's title bar. getSelectedButton() can help to determine whether the user intended the response text to be valid. | String | The text that the user entered in the dialog's input field. | not started |  |
| [getSelectedButton()](https://developers.google.com/apps-script/reference/base/prompt-response#getSelectedButton()) | Gets the button that the user clicked to dismiss the dialog. If the user clicked the close button that is included in every dialog's title bar, this method returns Button.CLOSE. | [Button](#enum-button) | The button that the user clicked. | not started |  |

## Class: [RgbColor](https://developers.google.com/apps-script/reference/base/rgb-color)

A color defined by red, green, blue color channels.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [asHexString()](https://developers.google.com/apps-script/reference/base/rgb-color#asHexString()) | Returns the color as a CSS-style 7 character hexadecimal string (#rrggbb) or 9 character hexadecimal string (#aarrggbb). | String | The hex representation of color. | completed | [link](../src/services/common/fakergbcolor.js#L35) |
| [getBlue()](https://developers.google.com/apps-script/reference/base/rgb-color#getBlue()) | The blue channel of this color, as a number from 0 to 255. | Integer | The value of blue channel. | completed | [link](../src/services/common/fakergbcolor.js#L44) |
| [getColorType()](https://developers.google.com/apps-script/reference/base/rgb-color#getColorType()) | Get the type of this color. | [ColorType](#enum-colortype) | The color type. | completed | [link](../src/services/common/fakergbcolor.js#L52) |
| [getGreen()](https://developers.google.com/apps-script/reference/base/rgb-color#getGreen()) | The green channel of this color, as a number from 0 to 255. | Integer | The value of green channel. | completed | [link](../src/services/common/fakergbcolor.js#L60) |
| [getRed()](https://developers.google.com/apps-script/reference/base/rgb-color#getRed()) | The red channel of this color, as a number from 0 to 255. | Integer | The value of red channel. | completed | [link](../src/services/common/fakergbcolor.js#L68) |

## Class: [Session](https://developers.google.com/apps-script/reference/base/session)

The Session class provides access to session information, such as the user's email address (in some circumstances) and language setting.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getActiveUser()](https://developers.google.com/apps-script/reference/base/session#getActiveUser()) | Gets information about the current user. If security policies do not allow access to the user's identity, User.getEmail() returns a blank string. The circumstances in which the email address is available vary: for example, the user's email address is not available in any context that allows a script to run without that user's authorization, like a simple onOpen(e) or onEdit(e) trigger, a custom function in Google Sheets, or a web app deployed to "execute as me" (that is, authorized by the developer instead of the user). However, these restrictions generally do not apply if the developer runs the script themselves or belongs to the same Google Workspace domain as the user. | [User](#class-user) | the current user | completed | [link](../src/services/session/fakesession.js#L12) |
| [getActiveUserLocale()](https://developers.google.com/apps-script/reference/base/session#getActiveUserLocale()) | Gets the language setting of the current user as a string—for example, en for English. | String | a string that represents the user's language setting | completed | [link](../src/services/session/fakesession.js#L25) |
| [getEffectiveUser()](https://developers.google.com/apps-script/reference/base/session#getEffectiveUser()) | Gets information about the user under whose authority the script is running. If the script is a web app set to "execute as me" (the developer), this returns the developer's user account. If the script is running under an installable trigger, this returns the account of the user who created the trigger. In most other scenarios, this returns the same account as getActiveUser(). | [User](#class-user) | the user under whose authority the script is running | completed | [link](../src/services/session/fakesession.js#L19) |
| [getScriptTimeZone()](https://developers.google.com/apps-script/reference/base/session#getScriptTimeZone()) | Gets the time zone of the script. New scripts default to the owner's time zone, but the script's time zone can be changed by clicking File > Project properties in the script editor. Note that spreadsheets have a separate time zone, which can be changed by clicking File > Spreadsheet settings in Google Sheets. Spreadsheet time zones that differ from the script time zone are a frequent source of scripting bugs. | String | the time zone of the script | completed | [link](../src/services/session/fakesession.js#L47) |
| [getTemporaryActiveUserKey()](https://developers.google.com/apps-script/reference/base/session#getTemporaryActiveUserKey()) | Gets a temporary key that is unique to the active user but does not reveal the user identity. The temporary key rotates every 30 days and is unique to the script. | String | the temporary active user key | completed | [link](../src/services/session/fakesession.js#L55) |

## Class: [Ui](https://developers.google.com/apps-script/reference/base/ui)

An instance of the user-interface environment for a Google App that allows the script to add features like menus, dialogs, and sidebars. A script can only interact with the UI for the current instance of an open editor, and only if the script is container-bound to the editor.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alert(String,ButtonSet)](https://developers.google.com/apps-script/reference/base/ui#alert(String,ButtonSet)) |  |  |  | not started |  |
| [alert(String,String,ButtonSet)](https://developers.google.com/apps-script/reference/base/ui#alert(String,String,ButtonSet)) |  |  |  | not started |  |
| [alert(String)](https://developers.google.com/apps-script/reference/base/ui#alert(String)) | Opens a dialog box in the user's editor with the given message and an "OK" button. This method suspends the server-side script while the dialog is open. The script resumes after the user dismisses the dialog, but Jdbc connections and LockService locks don't persist across the suspension. For more information, see the guide to dialogs and sidebars. | [Button](#enum-button) | The button the user clicked. | not started |  |
| [createAddonMenu()](https://developers.google.com/apps-script/reference/base/ui#createAddonMenu()) | Creates a builder that can be used to insert a sub-menu into the editor's Extensions menu. The menu isn't actually be updated until Menu.addToUi() is called. If the script is running as an add-on, the sub-menu name matches the add-on's name in the web store; if the script is bound to the document directly, the sub-menu name matches the script's name. For more information, see the guide to menus. | [Menu](#class-menu) | The new menu builder. | not started |  |
| [createMenu(String)](https://developers.google.com/apps-script/reference/base/ui#createMenu(String)) | Creates a builder that can be used to add a menu to the editor's user interface. The menu isn't actually be added until Menu.addToUi() is called. For more information, see the guide to menus. The label for a top-level menu should be in headline case (all major words capitalized), although the label for a sub-menu should be in sentence case (only the first word capitalized). If the script is published as an add-on, the caption parameter is ignored and the menu is added as a sub-menu of the Extensions menu, equivalent to createAddonMenu(). | [Menu](#class-menu) | The new menu builder. | not started |  |
| [prompt(String,ButtonSet)](https://developers.google.com/apps-script/reference/base/ui#prompt(String,ButtonSet)) |  |  |  | not started |  |
| [prompt(String,String,ButtonSet)](https://developers.google.com/apps-script/reference/base/ui#prompt(String,String,ButtonSet)) |  |  |  | not started |  |
| [prompt(String)](https://developers.google.com/apps-script/reference/base/ui#prompt(String)) | Opens an input dialog box in the user's editor with the given message and an "OK" button. This method suspends the server-side script while the dialog is open. The script resumes after the user dismisses the dialog, but Jdbc connections and LockService locks don't persist across the suspension. For more information, see the guide to dialogs and sidebars. | [PromptResponse](#class-promptresponse) | A representation of the user's response. | not started |  |
| [showModalDialog(Object,String)](https://developers.google.com/apps-script/reference/base/ui#showModalDialog(Object,String)) |  |  |  | not started |  |
| [showModelessDialog(Object,String)](https://developers.google.com/apps-script/reference/base/ui#showModelessDialog(Object,String)) |  |  |  | not started |  |
| [showSidebar(Object)](https://developers.google.com/apps-script/reference/base/ui#showSidebar(Object)) | Opens a sidebar in the user's editor with custom client-side content. This method does not suspend the server-side script while the sidebar is open. To communicate with the server-side script, the client-side component must make asynchronous callbacks using the google.script API for HtmlService. To close the sidebar programmatically, call google.script.host.close() on the client side of an HtmlService web app. For more information, see the guide to dialogs and sidebars. |  |  | not started |  |

## Class: [User](https://developers.google.com/apps-script/reference/base/user)

Representation of a user, suitable for scripting.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getEmail()](https://developers.google.com/apps-script/reference/base/user#getEmail()) | Gets the user's email address, if available. If security policies do not allow access to the user's email address, this method returns a blank string. The circumstances in which the email address is available vary: for example, the user's email address is not available in any context that allows a script to run without that user's authorization, like a simple onOpen(e) or onEdit(e) trigger, a custom function in Google Sheets, or a web app deployed to "execute as me" (that is, authorized by the developer instead of the user). However, these restrictions generally do not apply if the developer runs the script themselves or belongs to the same Google Workspace domain as the user. | String | The user's email's address, or a blank string if security policies do not allow access to the user's email address. | completed | [link](../src/services/common/fakeuser.js#L5) |

## Enum: [Button](https://developers.google.com/apps-script/reference/base/button)

An enum representing predetermined, localized dialog buttons returned by an alert or PromptResponse.getSelectedButton() to indicate which button in a dialog the user clicked. These values cannot be set; to add buttons to an alert or prompt, use ButtonSet instead.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CANCEL | A "Cancel" button, indicating that an operation should not proceed. | not started |  |
| CLOSE | The standard close button displayed in every dialog's title bar. This button is not explicitly added to a dialog, and it cannot be removed. | not started |  |
| NO | A "No" button, indicating a negative response to a question. | not started |  |
| OK | An "OK" button, indicating that an operation should proceed. | not started |  |
| YES | A "Yes" button, indicating a positive response to a question. | not started |  |

## Enum: [ButtonSet](https://developers.google.com/apps-script/reference/base/button-set)

An enum representing predetermined, localized sets of one or more dialog buttons that can be added to an alert or a prompt. To determine which button the user clicked, use Button.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| OK | A single "OK" button, indicating an informational message that can only be dismissed. | not started |  |
| OK_CANCEL | An "OK" button and a "Cancel" button, allowing the user to either proceed with or halt an operation. | not started |  |
| YES_NO | A "Yes" button and a "No" button, allowing the user to answer a yes/no question. | not started |  |
| YES_NO_CANCEL | A "Yes" button, a "No" button, and a "Cancel" button, allowing the user to either answer a yes/no question or halt an operation. | not started |  |

## Enum: [ColorType](https://developers.google.com/apps-script/reference/base/color-type)

The types of Colors

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| RGB | A color defined by red, green, blue color channels. | not started |  |
| THEME | A color that refers to an entry in the theme's color scheme. | not started |  |
| UNSUPPORTED | A color type that is not supported. | not started |  |

## Enum: [MimeType](https://developers.google.com/apps-script/reference/base/mime-type)

An enumeration that provides access to MIME-type declarations without typing the strings explicitly. Methods that expect a MIME type rendered as a string (for example, 'image/png') also accept any of the values below, so long as the method supports the underlying MIME type.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BMP | Representation of MIME type for a BMP image file (typically .bmp). | not started |  |
| CSS | Representation of MIME type for a CSS text file (typically .css). | not started |  |
| CSV | Representation of MIME type for a CSV text file (typically .csv). | not started |  |
| FOLDER | Representation of MIME type for a Google Drive folder. | not started |  |
| GIF | Representation of MIME type for a GIF image file (typically .gif). | not started |  |
| GOOGLE_APPS_SCRIPT | Representation of MIME type for a Google Apps Script project. | not started |  |
| GOOGLE_DOCS | Representation of MIME type for a Google Docs file. | not started |  |
| GOOGLE_DRAWINGS | Representation of MIME type for a Google Drawings file. | not started |  |
| GOOGLE_FORMS | Representation of MIME type for a Google Forms file. | not started |  |
| GOOGLE_SHEETS | Representation of MIME type for a Google Sheets file. | not started |  |
| GOOGLE_SITES | Representation of MIME type for a Google Sites file. | not started |  |
| GOOGLE_SLIDES | Representation of MIME type for a Google Slides file. | not started |  |
| HTML | Representation of MIME type for an HTML text file (typically .html). | not started |  |
| JAVASCRIPT | Representation of MIME type for a JavaScript text file (typically .js). | not started |  |
| JPEG | Representation of MIME type for a JPEG image file (typically .jpg). | not started |  |
| MICROSOFT_EXCEL | Representation of MIME type for a Microsoft Excel spreadsheet file (typically .xlsx). | not started |  |
| MICROSOFT_EXCEL_LEGACY | Representation of MIME type for a Microsoft Excel legacy file (typically .xls). | not started |  |
| MICROSOFT_POWERPOINT | Representation of MIME type for a Microsoft PowerPoint presentation file (typically .pptx). | not started |  |
| MICROSOFT_POWERPOINT_LEGACY | Representation of MIME type for a Microsoft PowerPoint legacy file (typically .ppt). | not started |  |
| MICROSOFT_WORD | Representation of MIME type for a Microsoft Word document file (typically .docx). | not started |  |
| MICROSOFT_WORD_LEGACY | Representation of MIME type for a Microsoft Word legacy file (typically .doc). | not started |  |
| OPENDOCUMENT_GRAPHICS | Representation of MIME type for an OpenDocument graphics file (typically .odg). | not started |  |
| OPENDOCUMENT_PRESENTATION | Representation of MIME type for an OpenDocument presentation file (typically .odp). | not started |  |
| OPENDOCUMENT_SPREADSHEET | Representation of MIME type for an OpenDocument spreadsheet file (typically .ods). | not started |  |
| OPENDOCUMENT_TEXT | Representation of MIME type for an OpenDocument word-processing file (typically .odt). | not started |  |
| PDF | Representation of MIME type for a PDF file (typically .pdf). | not started |  |
| PLAIN_TEXT | Representation of MIME type for a plain text file (typically .txt). | not started |  |
| PNG | Representation of MIME type for a PNG image file (typically .png). | not started |  |
| RTF | Representation of MIME type for a rich text file (typically .rtf). | not started |  |
| SHORTCUT | Representation of MIME type for a Google Drive shortcut. | not started |  |
| SVG | Representation of MIME type for an SVG image file (typically .svg). | not started |  |
| ZIP | Representation of MIME type for a ZIP archive file (typically .zip). | not started |  |

## Enum: [Month](https://developers.google.com/apps-script/reference/base/month)

An enum representing the months of the year.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| APRIL | April (month 4). | not started |  |
| AUGUST | August (month 8). | not started |  |
| DECEMBER | December (month 12). | not started |  |
| FEBRUARY | February (month 2). | not started |  |
| JANUARY | January (month 1). | not started |  |
| JULY | July (month 7). | not started |  |
| JUNE | June (month 6). | not started |  |
| MARCH | March (month 3). | not started |  |
| MAY | May (month 5). | not started |  |
| NOVEMBER | November (month 11). | not started |  |
| OCTOBER | October (month 10). | not started |  |
| SEPTEMBER | September (month 9). | not started |  |

## Enum: [Weekday](https://developers.google.com/apps-script/reference/base/weekday)

An enum representing the days of the week.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| FRIDAY | Friday. | not started |  |
| MONDAY | Monday. | not started |  |
| SATURDAY | Saturday. | not started |  |
| SUNDAY | Sunday. | not started |  |
| THURSDAY | Thursday. | not started |  |
| TUESDAY | Tuesday. | not started |  |
| WEDNESDAY | Wednesday. | not started |  |

## Interface: [BlobSource](https://developers.google.com/apps-script/reference/base/blob-source)

Interface for objects that can export their data as a Blob.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| getAs(String) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | not started |  |
| getBlob() | Return the data inside this object as a blob. | not started |  |

