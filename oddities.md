# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Approach, and oddities I've found while creating gas-fakes


Just as on Apps Script, everything is executed synchronously so you don't need to bother with handling Promises/async/await. Note that the intended audience is Apps Script developers who want to run the same code and access the same services in both Node and Apps Script. However I've uncovered quite a few behavioral oddities, inconsistencies (and bugs) in the Apps Script services I've dug into. I'm using this file as a record what I've found and discuss the dilemma of whether I should actually emulate dubious behavior.

If you are using the Advanced services, or the APIS directly, you may also find some of this research of use.

### Where to use (and not use) gas-fakes

If you don't plan on using Apps Script at all, the Node Workspace APIs (which I use in the background for all these services in any case) will be more efficient when operating in their normal asynchronous mode. On the other hand, if you only casually want to access workspace resources from Node, and can't be bothered digging into how the Node Workspace APIs work, you could still use this as part of your node project. Apps Script services are much simpler than the full API. Apps Script advanced services are also available via gas-fakes if you want a hybrid solution.


## Approach

Google have not made details about the GAS run time public (as far as I know). What we do know is that it used to run on a Java based JavaScript emulator [Rhino](https://ramblings.mcpher.com/gassnippets2/what-javascript-engine-is-apps-script-running-on/) but a few years ago moved to a V8 runtime. Beyond that, we don't know anything much other than it runs on Google Servers somewhere.

There were 3 main sticky problems to overcome to get this working

- GAS is entirely synchronous, whereas the replacement calls to Workspace APIS on Node are all asynchrounous.
- GAS handles OAuth initialization from the manifest file automatically, whereas we need some additional coding or alternative approaches on Node.
- The service singletons (eg. DriveApp) are all intialized and available in the global space automatically, whereas in Node they need some post AUTH intialization, sequencing intialization and exposure.
- GAS iterators aren't the same as standard iterators, as they have a hasNext() method and don't behave in the same way.

Beyond that, implementation is just a lot of busy work. If you are interested, here's how I've dealt with these 3 problems.

### Sync versus Async

Although Apps Script supports async/await/promise syntax, it operates in blocking mode. I didn't really want to have to insist on async coding in code targeted at GAS, so I needed to find a way to emulate what the GAS environment probably does.

Since asynchonicity is fundamental to Node, there's no real simple way to convert async to sync. However, there is such a thing as a [child-process](https://nodejs.org/api/child_process.html#child-process) which you can start up to run things, and it features an [execSync](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options) method which delays the return from the child process until the promise queue is all settled. So the simplest solution is to run an async method in a child process, wait till it's done, and return the results synchronously. I found that [Sindre Sorhus](https://github.com/sindresorhus) uses this approach with [make-synchronous](https://github.com/sindresorhus/make-synchronous).However, runnng up a child process in Node is pretty expensive and slow, and each subprocess has to reimport the google apis and go through a reauth chain which can take up to 1.5 secs per call.

#### Worker Update 

Instead of the subprocess approach, I'm now using a worker thread to handle all activities that need to be performed synchronously. It's a lot more tricky to implement and handle exceptions, but worth the effort.

- The worker thread only needs to be authed once on initialization and retains state between each call.
- Control to shared memory is via [Node Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) which gives a mutex style control.
- Node has built in [worker threads](https://nodejs.org/api/worker_threads.html), so there's no need for any external libraries
- Only arguments that can be stringified can be passed to and from a worker - but this is the same limitiation as passing arguments to a subprocess
- To avoid grabbing too much shared memory,I use a temporary file to pass huge amounts of data - but this will be a rarish exception.
- There are lot of async gotchas with workers so your async handling needs to be very precise. I spent a lot of time trying to track down potentially unsettled promises only to discover that worker.unref() is required to prevent the worker from stopping the main process exiting.
- console.log doesnt work reliable in a worker, even if you redirect the workers stdout & stder

```js
worker.stdout.pipe(process.stdout);
worker.stderr.pipe(process.stderr);
```

This is because console.log is async, and never shows. You need a sync version of console.log - as implemented in `./src/support/workersync/synclogger`

The result is a dramatic speed up over the subprocess approach (x5). So much so, that I had to add exponential backup to the worker threads to overcome quota limits on the workspace APIS to be able to run the test suite. Having said that it is still very much slower (x4 but variable) than most of the same calls in Apps Script - which appears to feature some mixture of in memory shadowing, caching and api call bundling - which I don't intend to mimic in this fake enironment (for now anyway) as this is not about improving the speed of Apps Script but about emulating it.

It's additionally slowed down because there are an unnatural amount of rapid, consecutive calls in the test suite which means that we get an unnatural amount of delay waiting for a quota window (sometimes as much as 15 seconds) added due to exponential back off delays when running the full test suite (I assume Apps script doesn't have the same quota restrictions). In normal operation this is unlikely to be problem.

There's an article here, if you want to read more on this [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)

### Global intialization

This was a little problematic to sequence, but I wanted to make sure that any GAS services being imitated were available and initialized on the Node side, just as they are in GAS. At the time of writing these services and classes are partially implemented.

Only a subset of methods are currently available for some of them - the rest are work in progress. You can see the progress by service and method in the [progress folder](./progress)

### Testing coverage

Tests for all methods are added as we go to the cumulative unit tests and run on both Apps Script and Node. The goal is to try to get the behavior as exactly equivalent as possible. There are currently almost 4500 active tests.

#### Proxies and globalThis

Each service has a FakeClass but I needed the Auth cycle to be initiated and done before making them public. Using a proxy was the simplest approach.

In short, the service is registered as an empty object, but when any attempt is made to access it actually returns a different object which handles the request. In the `ScriptApp` example, `ScriptApp` is an empty object, but accessing `ScriptApp.getOAuthToken()` returns an Fake `ScriptApp` object which gets initialized if you try to access it.

There's also a test available to see if you are running in GAS or on Node - `ScriptApp.isFake`. In fact this method 'isFake' is available on any of the implemented services, eg `DriveApp.isFake`.

The proxy also enables the [sandbox service](sandbox.md) to be applied to globally without needing special code in each of the services. Private methods and properties (those that exist only in the fake class) are identified by a prefixed `__` (with the exception of isFake which is present in every fake class). The proxy uses this to  detect and prevent accidental overwriting of any methods. For example range.getValue() = 1 will throw and error, whereas doc.__somefakeproperty = 1 will not.

ScriptApp.__registeredServices (in fact the __registeredServices on any service) will return an array of the services that already been registered. There's generally no need to do this but for collaborators developing services it could be useful

ScriptApp.__loadedServices will return an array of the services that already been loaded and initialized. In other words they've been used at least once.

Initial sandbox behaviors are set in src/services/scriptapp/behavior.js for every registered class.

### Iterators

An iterator created by a generator does not have a `hasNext()` function, whereas GAS iterators do. To get round this, I use a regular Node iterator, but with a wrapper so the constructor actually gets the first one, and `next()` uses the value we've already peeked at.

### Cache and Property services

These services can be backed by two different storage types, configured via the `STORE_TYPE` variable in your `.env` file:
- **`FILE` (Default)**: Implemented using keyv with the keyv-file storage adapter. This stores data in local files, with the path specified in `gasfakes.json`.
- **`UPSTASH`**: Uses Upstash Redis as a cloud-based backend. This requires setting `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in your `.env` file. This option allows for interoperability testing, where data written by `gas-fakes` can be read by a live Apps Script project (and vice-versa) when using a compatible library like `gas-flex-cache`.

#### Script, user and document store varieties

All 3 are supported for both properties and cache.

##### scriptId

The local version may have no knowledge of the Apps ScriptId. If you are using clasp, it's picked up from the .clasp.json file. However if you are not using clasp, or want to use something else, you can set the scriptId in `gasfakes.json`, otherwise it'll create a fake id use that - but that means that each store will be different each time you run it, so the best approach is to add a value unique to the group of scripts that want to share the same stores in gas-fakes.json. All property and cache stores use the scriptId to partition data.

##### userId

The userId is extracted from an accessToken and will match the id derived from Application Default Credentials. This means that you can logon as a different user to test user data isolation. All user level property and cache stores use the scriptId and userId to partition data.

##### documentId

The documentId is only meaningful if you are working on a container bound scrip. We use the the documentId property of gasfakes.json to identify a container file. All document level property and cache stores use the scriptId and documentId to partition data.

### Settings and temporary files

As you will have noticed, there are various local support files for props/caching etc. Be careful that these do not get committed to a public repo if you are adding sensitive values to your stores. Note that the real user Id is not used when creating files, but rather an encrypted version of it. This avoids real user ids being revealed in your file system.


## Noticed differences

In the main, these will be slight differences in error message text, which I'll normalize over time, or where Apps Script has a fundamental obstacle. Please report any differences in behavior you find in the repo issues.

### Tradeoffs

I've come across various Apps Script bugs/issues as I work through this which I've reported to the GAS team, and added workarounds in the gas fakes code - not sure at this point whether to duplicate the buggy behavior or simulate what would seem to be the correct one. This is not a complete list, so any things you come across please use the issues in the repo to report.

## Oddities

Just a few things I've come across when digging into the differences between what the sheets API and Apps Script do. Whether or not you use gas fakes, some of this stuff might be useful if you are using the APIs directly, or indeed the Advanced service. I'll just make a growing list of stuff I've found, in no particular order.

### DriveApp -vs- Drive Advanced services

The Drive.File.export needs an additional parameter (alt:'media') to return converted content. This is missing from the Autocomplete in the IDE. Without this parameter it fails. The service should add it automatically (presumably this is the intention, since the method is useless without it).

In live Apps Script, this works
```
const x= Drive.Files.export ('xxx','application/vnd.google-apps.script+json', {alt: "media"})
```
But according to the docs it does not need the alt parameter.   It's likely that the Apps Script advanced service is mistakenly calling the 'get' method of the API rather than the 'export' method which would likely cause this error
```
GoogleJsonResponseException: API call to drive.files.export failed with error: Export requires alt=media to download the exported content.
```
gas-fakes will accept the alt parameter if provided, but ignore it,, since it uses the export method of the API it isn't needed anway. See https://issuetracker.google.com/issues/468534237 for more details and to track if and when google fix this bug in Advanced Drive service.

#### Invalid field selection createdTime/modifiedTime

Even though `gas-fakes` uses Drive API v3, some files (particularly old files or those created by external applications) occasionally trigger an "Invalid field selection createdTime" (or modifiedTime) error. These fields are standard in v3, but some files seem to only support the v2 equivalents: `createdDate` and `modifiedDate`.

`gas-fakes` handles this by automatically detecting this specific error, translating the requested fields to their v2 equivalents, and retrying the request.

### Named Colors

Apps script and gas-fakes supports named colors - there's a list here [named colors](named-colors.md) - colors supported by Apps Script

### Fake classes

Most Apps script classes will map to a separate fake class file - sometimes more than one. Many of the methods in large classes are generated from various specification files, but the more complex ones and the ones with weird behavior are directly written as methods in the class.

i've tried to avoid adding properties and methods that don't exist in the emulated class, but sometimes it's necessary to have private methods and properties. Since Apps Script doesn't support private properties, I've decided to simply identify these with a leading pair of underscores, eg this.\_\_myProperty.

Although not strictly necessary to avoid real private propertues, since these Fake classes will exist only on Node, I wanted to keep code as compatible with Apps Script.

Most classes have a new method -- eg `newFakeClass(args)`. It's best to use this rather than `new FakeClass(args)`, since they each wrap the instance created in a proxy that detects attempts to access non existent properties, or indeed to set any properties other than private ones.

### Formats and styles

When getting formats with the sheets API, there are 2 types

- userEnteredFormat - any formats a user (or an apps script function) has explicitly set
- effectiveFormat - what rendered format actually looks like

This means that sometimes, for example, a font might be red in the UI, but Apps Script reports it as black. This is because Apps Script uses the userEnteredFormat exclusively (I think). I've implemented the same in Gas Fakes. To get the effectiveFormat, you'll need to use the Fake Advanced Sheets service, just as you would in Apps Script.

### Values

Just as with Formats, the actual value rendered might be different than the value stored. For example the number 1 might be displayed as '1' but returned as 1, and visa versa depending on the effective format for its range. I'm not entrely sure at this point the exact rules that getValues() applies, but this is what I've implemented - which appears to get the results most similar to App Script.

Here is how I've implemented getting and setting values.

- getValues() uses { valueRenderOption: 'UNFORMATTED_VALUE' }
- setValues() uses { valueInputOption: "USER_ENTERED" } 
- getDisplayValues() { valueRenderOption: 'FORMATTED_VALUE' }

### Data Validation

There's quite a few oddities in Data Validation, which turned out to be the most complicated topic I've tackled at the time of writing.

#### Criteria types

A few of the criteria types differ between the Sheets API and Apps Script - for example TEXT_IS_VALID_EMAIL on GAS is equivalent to TEXT_IS_EMAIL on the API, and VALUE_IN_LIST is equivalent to ONE_OF_LIST and a few others. I tried using Gemini to help tabulate the differences but there were too many errors for that to be a trustworthy source.

The file 'fakedatavalidationcriteria.js' has a list of the final mappings between the 2.

#### Relative dates

Both the sheets API and GAS can return either relative dates or actual dates. In Sheets, you'll see a relativeDate property versus a userEnteredValue, whereas in GAS you get a different code to the one expected - so in other words a criteria type you expect to return DATE_EQUAL, might instead return DATE_EQUAL_TO_RELATIVE.

##### Setting a relative date

There are no methods in Apps Script to actually set relative dates in Data Validation - for example you'd expect a method such as requireDateEqualToRelative to exist - but it doesn't - to set you'd need to use the advanced sheets service or the withCriteria method. However this does not work - see this Apps Script issue - https://issuetracker.google.com/issues/418495831

Not all date validations have related RELATIVE versions. See later section for details.

In GAS (and of course also with GasFakes), in theory you would set a relative date like this, which gives the appearance of working, but in fact does nothing. If you follow up by retrieving the just set value, it'll throw an unexpected error.

```js
const rule = SpreadsheetApp.newDataValidation()
  .withCriteria(SpreadsheetApp.DataValidationCriteria.DATE_EQUAL_TO_RELATIVE, [
    SpreadsheetApp.RelativeDate.TODAY,
  ])
  .build();
const range = sheet.getRange("b30");
range.setDataValidation(rule);
```

Because this doesn't work in GAS, I'm not at this point sure whether to handle this or throw an error. Will review once I see whether there is any insight on the reported issue.

##### Getting a relative date

You can of course set a limited set of relative Data Validation via the UI, and GAS supports returning its content. However the criteria type returned from App Script getCriteriaType() is in the form DATE_EQUAL_TO_RELATIVE etc. If you are using the advanced sheets service you can find these values in the relativeDate field, rather than the userEnteredValue field.

This is what the sheets API returns.

```
{"condition":{"type":"DATE_EQ","values":[{"relativeDate":"TODAY"}]}}
```

Which would be translated into a criteria type of DATE_EQUAL_TO_RELATIVE in GAS, with the value SpreadsheetApp.DataValidation.Criteria.TODAY

#### datavalidation enum and relative dates

Despite being able to return a criteriaType of \_RELATIVE, these are not documented in the criteriaType ENUM (https://developers.google.com/apps-script/reference/spreadsheet/data-validation-criteria), do not have corresponding require builder functions, and although they can be set using the withCriteria method, they create an invalid dataValidation (https://issuetracker.google.com/issues/418495831).

These 3 relatives exist as keys of SpreadsheetApp.DataValidationCriteria, but none of the other DATE enum values exist

- DATE_AFTER_RELATIVE
- DATE_BEFORE_RELATIVE
- DATE_EQUAL_TO_RELATIVE

I'll implement these 3 realtives in gasFakes, but treat the others as invalid. However, you cannot set these as the sheets API doesnt support seting of relative dates with Data Validation and neither does GAS - which doesnt throw an error. I believe it should, so I'm going to throw an error if you try.

#### datavalidation with formulas

Normally there's a strict check on the input to .requirexxx methods (for example dates, numbers etc). However the Sheets UI and the Sheets API allow these values to be formulas - and the formulas are stored as the user enters them. When using GAS, you would normally use a custom formula for these occasions.

In other words - here's what happens in GAS when you retrieve a data validation that has had a formula used as its value

```
  console.log (cb.getCriteriaType().toString())    // DATE_EQUAL_TO
  console.log (cb.getCriteriaValues())             // [ '=I1' ]
```

and yet, you get the error 'The parameters (String) don't match the method signature for SpreadsheetApp.DataValidationBuilder.requireDate.' with this.

```
SpreadsheetApp.newDataValidation().requireDate("=i1")
```

Another way to bypass the argument validation is to use withCriteria. For example, this will work, even though the string argument would have been rejected by requireDate()

```
 SpreadsheetApp.newDataValidation().withCriteria(SpreadsheetApp.DataValidationCriteria.DATE_AFTER,['=i1']).build()
```

I'm leaving these same behaviors in place, and you would need to use the same workarounds as you do in GAS.

#### mixing real dates and relative dates

Since only relative versions of single dates are implemented in GAS, there's no need to handle mixed relative and real dates. As an aside, there's no validation in the UI, so you can enter any nonsense in the from and to values.

#### sheets notes

Normally, range.setNote ("takes a string"). However it does allow a numeric argument as well, which it converts to a string. However a normal toString() - for example 25.toString() would give "25". Apps script however returns "25.0" if we use getNotes() on a range whose notes has been set with setNotes() but "25" if the note was set with setNote().

There's an issue reported here - https://issuetracker.google.com/issues/429373214 - for now I'm returing "25.0" in all cases till we see what the actual resolution of this issue should be

#### Locale of dates

CriteriaValues are stored as a string, exactly as typed by the user. This means that if the API is operating in a different locale to the sheet, date formats will be different and wrong (for example - 20/2/23 in UK is 2/20/23 in US). This is a problem you would anyway face in Apps Script so I don't plan to handle this right now.

## Various hints when using the advanced sheets service

I've tried to exactly imitate the behavior of the Sheets advanced service (even though it's often inconvenient and inconsistent), so these following comments apply to both Sheets and FakeSheets. If you are usng the Advanced service, here's a few hints Ive come across that might be helpful.

### Advanced sheets updating cells

The advanced sheets service provides a huge list of builders such as Sheets.newCellData(). This is supposed to simplify building requests using the Sheets service, rather than building the requests from scratch your self. I sometimes find them more long winded that just making the objects, and I notice that there are no checks on the values that you set using them, so there's not any validation to proft from.

In any case, I've implemented them all (note that there are some GAS bugs on some of these) - https://issuetracker.google.com/issues/423737982)

I mainly use them when emulating Apps Script SpreadsheetApp services too as a double check that they are working as intended, but sometimes I build the requests up from scratch if it makes the automation simpler.

If you want to see how these are all generated, see the constructor in services/advsheets/fakeadvsheets.

#### Handling multiple response variations and formats.

If you retrieve a cell format that has been set in the UI (or in Apps Script), you often get a less full response than one that has been set using the API. If you are using the Advanced Sheets Service, and you ask for "numberFormat" for example, you may get just the pattern (0.###) or you may get the full cellformat data { type: "NUMBER", pattern: "0.###""}. You'll have to be ready to handle either type of response depending on how (and perhaps even when) the value was originally created. This could apply to any fetches of format values.

Something like this should do the trick.

```js
const extractPattern = (response) => {
  // a plain pattern entered by UI, apps script or lax api call
  if (is.string(response)) return response;
  // should be { type: "TYPE", pattern: "xxx"}
  if (!is.object(response) || !Reflect.has(response, "pattern")) return null;
  return response.pattern;
};
```

To emulate the regular SpreadsheetApp behavior, `fakeRange.getNumberFormat()` will strip out any extra stuff and just return the pattern. `fakeRange.setNumberFormat("0.###")` will always set the complete cellformat object { type: "NUMBER", pattern: "0.###"}

##### Numberformat default pattern

Normally we can use a null value to reset a format to the default UI value. However, number format will fail messily with a null argument. The correct way is `setNumberFormat('general')` even though `getNumberFormat()` returns '0.###############" or similar. If using Advanced Sheets, you still need to use the 'pattern' approach - { pattern: "general", type: "NUMBER" }

#### Text direction

Unlike other similar functions, `setTextDirection(TextDirection)` takes an enum argument and `getTextDirection()` returns an enum too. `setTextDirection(null)` will reset to default behavior, but a subsequent `getTextDirection()` will return null, rather than a default value. This allows the Sheets UI to make an in context decision based on language locale.

#### Horizontal alignment

The documented acceptable values to `range.setHorizontalAlignment()` are left, center, normal, null. However right is also valid so I'm supporting that too. `range.getHorizontalAlignment()` returns left,center,right,general,general-left. Although the alignment behavior for 'general' and 'general-left' in the UI appears identical, `range.setHorizontalAlignment(null)` returns 'general', whereas `range.setHorizontalAlignment('normal')` returns 'general-left'. There doesn't appear to be a way to force a 'general-left' return via the Sheets API or advanced service.

As with most of these format setting methods, Apps Script will silently ignore invalid arguments. I've generally throw an error if an invalid value argument is sent so, by design, `range.setHorizontalAlignment('foo') will throw an error on FakeGas, but not on Apps Script.

#### Wrap and Wrap strategy

Initially a cell will return OVERFLOW for `getWrapStrategy` and true for `getWrap`. This is wrong as OVERFLOW should be paired with false. Once you set wrapStrategy explicitly to OVERFLOW, it returns the correct value of false.

The Apps Script issue for that is here https://issuetracker.google.com/issues/427134600

#### range.copyValuesToRange

The documentaton for this method says - "Copy the content of the range to the given location. If the destination is larger or smaller than the source range then the source is repeated or truncated accordingly."

This implies that a smaller destination range that the source should only paste a truncated version of the source range. In fact it pastes it all - see issue https://issuetracker.google.com/issues/427192537

So in summary the current behavior of this function in Apps Script doesn't match the documentation in these ways:

- If the target range is smaller than the source range, it does not truncate, but always copies the entire range even if it violates the dimensions of the target range.
- If the target range is larger than the source range, it only duplicates enough times where it can fit the entire source data into what's remaining in the target range.

#### range.copyTo

The variant of copyToRange suffers from the same problems as .copyValuesToRange. But there are others too. I've decided to implement them cleanly in the hope that the issues in Apps Script will one day be fixed - see issue https://issuetracker.google.com/issues/427192537

1. I also note that range.copyTo() has the same behavior

2. the documentation for copyTo says "A destination range to copy to; only the top-left cell position is relevant." - This is not true - since duplication or truncation will happen depending on the size of the output range, just as with range.copyValuesToRange and range.copyFormatToRange().

3. There is no way to pass "transposed" when using the range.copyTo(destination, options) variant.

4. There is no checking on the enum passed as the 2nd argument unless the optional transpose argumment is provided

```
range.copyTo (destination) // valid
range.copyTo (destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES) // valid
range.copyTo (destination, "FOO", true)  // correctly reports FOO as invalid type
range.copyTo (destination, "FOO") // ignores FOO and runs without reporting error
```

5. There is no conflicting option error thrown for

```
range.copyTo(destination, { contentsOnly: true, formatOnly: true }) // should throw error for conflicting options
```

6. Does not check for invalid options

```
range.copyTo(targetRange, { foo: true }) // should throw an error for invalid option
```

7. Paste values can also reset paste formats (doesnt happen with advanced sheets)

```
range.copyTo (destination, SpreadsheetApp.CopyPasteType.PASTE_VALUES)   /// this can also trash formats previously set with PASTE_FORMAT
```

#### checking of invalid arguments

In many cases, Apps Script doesn't check the validity of invalid arguments - for example (sse this issue https://issuetracker.google.com/issues/428869869), it happily accepts invalid colors.

```
  range.setBackground("foo")
  range.setBackground("#gggggg")
```

Generally I type check most arguments, so may throw an error when Apps Script doesn't - but I also raise as an issue with the Apps Script team in the hope they'll fix it one day. As a result you may find some t.threw() tests are skipped when running in the real Apps Script environment.

#### TextRotation

Apps Script returns a `TextRotation` object to `range.getTextRotation()`, which has both an 'isVertical()' and `getDegrees()` method. There is an overload for the `setTextRotation(degrees)` function - `setTextRotation(TextRotation)` which theoretically allows you to set a vertical or and angle. https://developers.google.com/apps-script/reference/spreadsheet/range#settextrotationrotation

However, unlike most objects like this, there is not a `SpreadsheetApp.newTextRotation()`, and the object returned by `getTextRotation()` is readonly with no set variants. Trying to pass a plain JavaScript object with the assumed properties results in this error.

```
Exception: The parameters ((class)) don't match the method signature for SpreadsheetApp.Range.setTextRotation.
```

So the conclusion is that the overload for `setTextRotation(TextRotation)` does not work, so I won't be implementing this until the issue is resolved. `setTextRotation(degrees)` has been implemented of course.

[See this issue for more information ](https://issuetracker.google.com/issues/425390984)


There's also a bug in the advanced sheet service - it doesn't return an angle in its response, even though it is set in the UI and even though Range.getTextRotation() correctly returns the angle. See https://issuetracker.google.com/issues/425390984.

Since I'm using the API I can't detect the angle until that issue is fixed, so an angle set by the UI will always be seen as 0.

#### Dates and sheets advanced service

Dates can be stored in 'Excel dateserial' format in the API. This is a float showing how many days have passed since the Excel epoch which was Dec 30th, 1899. Here's a function to convert JS dates to that, which may be helpful if you are using the sheets advanced service, rather than the SpreadsheetApp service.

```js
const dateToSerial = (date) => {
  if (!is.date(date)) {
    throw new Error(`dateToSerial is expecting a date but got ${is(date)}`);
  }
  // these are held in a serial number like in Excel, rather than JavaScript epoch
  // so the epoch is actually Dec 30 1899 rather than Jan 1 1970
  const epochCorrection = 2209161600000;
  const msPerDay = 24 * 60 * 60 * 1000;
  const adjustedMs = date.getTime() + epochCorrection;
  return adjustedMs / msPerDay;
};
```

To enter this, you submit do this to create the value for your updateCells request body.

```js
const value = Sheets.newExtendedValue().setNumberValue(dateToSerial(value));
```

Note that this simply enters the numeric value of the dateSerial, without mentioning that it actually a date. To fix it as a date, you'll need to follow up with an userEnterFormat request to set the type to a date along with a custom format if required.

#### Protection.getEditors() and the Owner

When you programmatically create a new protection using `sheet.protect()` or `range.protect()`, the spreadsheet owner can always edit the protected range (`protection.canEdit()` will return `true` for the owner).

However, the owner is **not** automatically included in the array of `User` objects returned by `protection.getEditors()`. Therefore, for a newly created protection, `protection.getEditors().length` will correctly be `0`. See this issue - https://issuetracker.google.com/issues/442636162


#### UI settings

Some of the options available in the GAS UI for setting or examining data validation are not available via GAS, and may not be available via Sheets. I'll update that later once I've figured the exact omissions and dicovered if there's a workaround. Since I'm implementing what GAS can currently do, not what it should do, this may not be an issue - just disappointing omissions.

##### examples of UI settings not intuitively settable in GAS service

- allow multiple selections - needs the allowMultipleSelections set to true - you need to you advanced service to set this
- display style - chip - This needs the displayStyle property set to "CHIP" - you need to you advanced service to set this
- color for drop downs - haven't looked into this, but it's not possible via regular gas service.

###### showCustomUI

This API property controls whether to show a drop down as plain text, or to use a fancy display such as chip or arrow. In the UI the default is true, and the displayStyle is "CHIP". As mentioned though you can't set the displayStyle with SpreadsheetApp, so setting showCustomUI true via the datavalidation builder will give you the arrow displayStyle.

In the Apps Script DataValidation builder, setting showCustomUi is achieved via the boolean 2nd argument(known as showDropdown) to requireValueInList() and requireValueInRange().

Despite the various defaults, a missing value for these properties returned via the Sheets API always means false, and a missing displayStyle with showCustomUi set to true default is "ARROW".

### Document API

Getting started on the advanced services of the Document API. These notes are for my TIL (things I learned today), but may be useful if you are digging into the Document API yourself. 

A fundamental discovery I've made is that there is no interoperability between Apps Script DocumentApp  and the Document API (and its own Advanced Service). Apps Script maintains its own 'shadow document' and doesn't commit until you save and close the document. Presumably it uses the Document API behind the scenes to update the document, but it must have access to some private methods that are not available directly to API users, since it is able to dump its document containing structures that are invalid to create using the API directly.

#### Fake shadow document

I've taken a different approach while faking the DocumentApp service. I do have a kind of shadow document, but delegate the maintenance of the document to the API. Elements in the Fake shadow are "simply" a named range tag which is used to track their position in the shadow document. For more information on this technique see [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/



#### Horizonal rule

The api doesnt provide a way to insert a horizontal rule element. Apps Script inserts a specific horizontal rule element, and then uses paragraph styling using a border to create that line. Although we could do all that, we'd still have a missing element. I'm parking this one for now and revisit it later. Here's the reported issue  https://issuetracker.google.com/issues/437825936

https://github.com/brucemcpherson/gas-fakes/issues/43

#### Tables

This is another interoperability issue when using the Docs API and Apps Script together. Althogh you can body.appendTable() with no rows in Apps Script (this creates a table element in the document resource), but the same operation in the docs API returns an execption (rows/columns) must be greater than 0.

Adding a table with one row, then deleting that row works, but the API also deletes the table element, not just the child row elements.

This is yet another point of friction for those who are using the api/advanced services and Apps Script Advanced Docs service interchangeably.

https://issuetracker.google.com/issues/438038924
https://github.com/brucemcpherson/gas-fakes/issues/42

What this means for gas-fakes is .appendTable() with no arguments will create a 1 cell table - this is a divergence from Apps Script which is somehow able to create a table stub element only.

#### Image insertion sizing

There is a significant and inconsistent discrepancy in how the live `DocumentApp` service handles the dimensions of an image when it is inserted using `body.insertImage(image.copy())` or `body.appendImage(image.copy())`.

Our testing has revealed several conflicting behaviors from the live API:

1.  **Intrinsic Size:** Sometimes, the API ignores the dimensions of the copied `InlineImage` object and re-fetches the image from its source URI, using its original intrinsic dimensions (e.g., `544x184` for the Google logo).
2.  **Copied Object Size:** At other times, the API correctly respects the dimensions of the copied `InlineImage` object (e.g., `61x181` in our tests).
3.  **Default/Fixed Size:** On at least one occasion, the API appeared to resize the image to a seemingly arbitrary fixed size (e.g., `240x80`).
4.  **State-Dependent:** The behavior seems to be dependent on the state of the document. A brand-new document might exhibit one behavior, while a reused document (even after `doc.clear()`) exhibits another.

The `gas-fakes` test suite (`testdocsimages.js`) now contains a workaround for this. It forces the creation of a new document for image insertion tests and, for the live environment, verifies the image's **aspect ratio** within a tolerance rather than asserting a brittle, fixed dimension. This is a recommended pattern when dealing with such unpredictable API behavior.


##### matching table element indices with apps script

Adding a table always inserts a preceding 
. This is okay when appending, but not okay when inserting as we end up with an unwanted paragraph compared to what Apps Script does. It turns out that a table must always have a preceding paragraph, or the API throws an error. Of course there would already be a preceding paragraph after deleting this one anyway, but the API still won't let you delete a directly preceding paragraph (This seems like a bug but I won't report it on buganizer for now till I figure out the entire picture of tables). 

So instead we need to delete the 
 from the preceding-1 paragraph (if indeed there is one). So we end up with a bit of hack, both to insert the table and also any insertions that go before a table. It also means that the technique of using namedranges to track already defined elements becomes tricky when tables are invloved because of the side effect of modifyng elements not directly involved in table operations. 

It's a real mindbender to handle this and of course I'm not entirely sure I've swept up all the edge cases yet.

#### `Body.appendFootnote()`

The `Body.appendFootnote()` method does not exist in the live Google Apps Script environment, despite being a logical counterpart to other `Body.append...()` methods and the existence of `Document.getFootnotes()`. This prevents the programmatic creation of footnotes directly via `DocumentApp`.

This has been reported on the Google Issue Tracker: https://issuetracker.google.com/issues/441940310

`gas-fakes` implements `Body.appendFootnote()` to allow for local development and testing of footnote-related features. Tests that use this method are skipped when run against the live environment. The fake implementation will be maintained pending a resolution from Google.


#### `Paragraph.addPositionedImage()`

The `Paragraph.addPositionedImage()` method exists in the live Google Apps Script environment, allowing for the creation of positioned images anchored to a paragraph. However, as of May 2024, there is no corresponding public endpoint in the Google Docs API v1 to programmatically create a `PositionedObject`.

This has been a requested feature, but it appears that the Apps Script service uses a private, non-public API to achieve this functionality.

Because `gas-fakes` relies exclusively on the public Google Workspace APIs, it is not possible to emulate this method. Tests that use `addPositionedImage` are skipped when run in the fake environment.

See this related issue tracker for the API feature request - https://issuetracker.google.com/issues/442065544

#### Align `Document.clear()` Behavior with Live Apps Script and Refactor Test Cleanup

**Labels**: `enhancement`, `emulation-accuracy`, `document-app`, `behavior`

###### Summary

The undocumented `Document.clear()` method in the live Google Apps Script environment only clears the content of the document's `Body`, leaving `HeaderSection` and `FooterSection` elements intact. The `gas-fakes` implementation was initially clearing the entire document, leading to inconsistencies. This has been corrected, and the test cleanup process has been refactored to accommodate this behavior.

##### Live Apps Script Behavior

When `DocumentApp.getActiveDocument().clear()` is called in a live script, only the body content is removed. Any existing headers or footers remain in the document. This method is not officially documented but is present in the live environment.

###### Problem in `gas-fakes`

The initial implementation of `Document.clear()` in `gas-fakes` was designed to provide a completely empty document by deleting the body, headers, and footers. This was useful for test isolation but did not accurately emulate the live environment.

This discrepancy caused tests that relied on re-using documents (like those in `testdocsheaders.js` and `testdocsfooters.js`) to fail, as they expected `doc.clear()` to remove the header/footer from a previous test run.

##### Resolution

To align with the live API and maintain robust test cleanup, the following changes were made:

1.  **`Document.clear()` Refactored**: The `clear()` method in `shadowdocument.js` was modified to only generate `deleteContentRange` requests for the document's body. The logic for deleting headers and footers was removed.

    ```javascript
    // src/services/documentapp/shadowdocument.js
    clear() {
      const { body } = this.__unpackDocumentTab(this.resource);
      const content = body.content;
      const requests = [];
      // ... logic to generate deleteContentRange requests for body ...
      // ... NO logic to delete headers or footers ...
    }
    ```

2.  **`removeFromParent()` Added to Sections**: The live `HeaderSection` and `FooterSection` APIs do not have a `remove()` method. The correct method is `removeFromParent()`. This was implemented on the `FakeSectionElement` base class to generate the appropriate `deleteHeader` or `deleteFooter` API request.

    ```javascript
    // src/services/documentapp/fakesectionelement.js
    removeFromParent() {
      // ...
      if (type === ElementType.HEADER_SECTION) {
        request = { deleteHeader: { headerId: segmentId } };
      } else if (type === ElementType.FOOTER_SECTION) {
        request = { deleteFooter: { footerId: segmentId } };
      }
      // ...
    }
    ```

3.  **Test Helper `maketdoc` Updated**: The `maketdoc` test helper in `testassist.js` was updated to be the single source of truth for creating a "clean" document for tests. It now explicitly removes headers and footers before clearing the body.

    ```javascript
    // test/testassist.js
    export const maketdoc = (toTrash, fixes, clear = true) => {
      // ...
      if (clear) {
        // Explicitly remove headers and footers to ensure a clean slate for tests.
        const header = __mdoc.getHeader();
        if (header) header.removeFromParent();

        const footer = __mdoc.getFooter();
        if (footer) footer.removeFromParent();

        // Now call the emulated doc.clear(), which only affects the body.
        __mdoc.getBody().appendParagraph(''); // Workaround for live bug
        __mdoc.clear();
      }
      // ...
    }
    ```

This approach ensures that `Document.clear()` in `gas-fakes` accurately mimics the live behavior, while the testing framework can still achieve complete document cleanup for reliable, isolated tests.

#### Learnings on Google Apps Script DocumentApp Style Behavior

Through extensive testing and debugging of `testdocsstyles.js` against the live Google Apps Script (GAS) environment, several key behavioral differences and oddities were discovered compared to the `gas-fakes` emulator and general developer expectations.

##### 1. `Element.getAttributes()`

This method's behavior is the most significant and nuanced discovery. It does **not** return the full *computed* style of an element.

*   **General Rule**: For any element (like a `Paragraph`) that has a named style applied (e.g., `HEADING_1`, `HEADING_2`), `getAttributes()` will return `null` for any attribute that is inherited from that style. It only returns a value for attributes that have been set as an **inline override** on that specific element.

*   **The `NORMAL_TEXT` Exception**: Paragraphs with the default `NORMAL_TEXT` style behave differently. For these paragraphs, `getAttributes()` **will** return the computed values for *paragraph-level* attributes (like `HORIZONTAL_ALIGNMENT` and `LINE_SPACING`). However, it still returns `null` for inherited *text-level* attributes (like `FONT_FAMILY`).

*   **Implication**: This makes it difficult to programmatically check the full, rendered style of an element using only `getAttributes()`. You cannot rely on it to tell you the font or alignment of a `HEADING_1` paragraph, as those values will be `null`.

##### 2. `Body.setHeadingAttributes(heading, attributes)`

This method modifies the *definition* of a named style (e.g., `HEADING_1`) for the entire document.

*   **No Effect on Existing Paragraphs**: Calling this method does **not** change the appearance of paragraphs that *already* use the specified heading style. It only affects paragraphs to which the heading is applied *after* the call.

*   **Ignores Text Attributes**: The live API correctly ignores any text-level attributes passed in the `attributes` object. This includes:
    *   `FONT_FAMILY`
    *   `ITALIC`
    *   `BOLD`
    *   `FOREGROUND_COLOR`
    *   etc.

*   **Partial Application of Paragraph Attributes**: This is a key oddity. The live API does not apply all valid paragraph attributes. In our tests:
    *   `SPACING_BEFORE` was **successfully** applied to the style definition.
    *   `HORIZONTAL_ALIGNMENT` was **ignored**.

    This means you cannot reliably set all paragraph-level styles for a heading using this method.

##### 3. `Body.setAttributes(attributes)`

This method is intended to set the default attributes for the body, which affects newly inserted content and can also modify existing content.

*   **Effect on Existing Paragraphs**:
    *   It **applies** text-level attributes (`ITALIC`, `FONT_FAMILY`, etc.) as inline styles to all existing paragraphs in the body.
    *   It does **not** apply paragraph-level attributes (`HORIZONTAL_ALIGNMENT`, etc.) to existing paragraphs.

*   **Effect on New Paragraphs**:
    *   When a new paragraph is appended after `setAttributes` is called, it **inherits** the new default *text-level* attributes.
    *   It does **not** inherit the *paragraph-level* attributes; these fall back to the `NORMAL_TEXT` defaults (e.g., `HORIZONTAL_ALIGNMENT` remains `LEFT`).

##### 4. API Synchronization and Document State

*   **State Discrepancy**: Changes made via the `DocumentApp` service are not always immediately reflected when inspecting the document via the advanced `Docs` service (and vice-versa).

*   **`saveAndClose()` is Key**: The pattern of using `doc.saveAndClose()` followed by `DocumentApp.openById(id)` is a reliable method to force synchronization and ensure that subsequent API calls see the latest state of the document. This is crucial for writing reliable tests that mix both services.

*   **`Document.clear()`**: The `clear()` method only removes the content from the document's `Body`. It does **not** remove or reset headers, footers, or the `documentStyle` (e.g., margins).

##### 5. API Mechanism for Named Style Updates

*   **Inference-Based Updates**: The live Google Docs API does not provide a direct request type like `updateNamedStyle`. Instead, it uses inference. When an `updateParagraphStyle` or `updateTextStyle` request is applied to a `range` of text that has a named style (e.g., `HEADING_1`), the API backend is smart enough to update the *definition* of that named style rather than applying an inline override to the text in the range.

*   **Emulation Limitation**: The `gas-fakes` environment's `batchUpdate` processor does not currently replicate this inference-based behavior. It treats a range-based style update as a simple inline style application, leaving the underlying named style definition unchanged. Because there is no direct API call to modify a named style's definition, methods like `Body.setHeadingAttributes()` cannot be fully emulated and will not update the paragraph properties of the style definition in the fake environment.

##### Conclusion

The live `DocumentApp` service has several non-obvious behaviors, particularly around style inheritance and application. The `getAttributes()` method is not a reliable way to get the full computed style of an element, and methods like `setHeadingAttributes()` have inconsistent effects. Developers should be aware of these quirks and test their style-manipulation code thoroughly against the live environment. For complex style verification, using the advanced `Docs` service to inspect the underlying document resource is often more reliable.

  
#### Tabs

Tabs are a recent addition to Docs, and have added a bit of complication to handling Document responses. Here's what they say happens.

```
[docs](https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get)

suggestionsViewMode     - enum (SuggestionsViewMode)

The suggestions view mode to apply to the document. This allows viewing the document with all suggestions inline, accepted or rejected. If one is not specified, DEFAULT_FOR_CURRENT_ACCESS is used.

includeTabsContent      - boolean

Whether to populate the Document.tabs field instead of the text content fields like body and documentStyle on Document.

When True: Document content populates in the Document.tabs field instead of the text content fields in Document.

When False: The content of the document's first tab populates the content fields in Document excluding Document.tabs. If a document has only one tab, then that tab is used to populate the document content. Document.tabs will be empty.
```

It's actually a little more complicated than that - here are the properties of the each response variation.

##### case 1 {includeTabsContent: false}


Response has these properties:

```
     'revisionId',
     'documentStyle',
     'body',
     'title',
     'suggestionsViewMode',
     'documentId',
     'namedStyles'
```

The body contains just 1 property - `content`

##### case 2 {includeTabsContent: true}

Response has these properties:

```
    'suggestionsViewMode',
    'documentId',
    'tabs',
    'title',
    'revisionId'
```

The tabs property is an array of tabs, the first of which contains these properties

```
  documentTab, tabProperties
```

The documentTab has these properties - so the tab[0] in a document with no tabs isn't exactly the same as the legacy style as implied in the docs, since the document metadata is not repeated in each tab.  
````
  'documentStyle', 'body', 'namedStyles'
````
The tab properties has these properties
````
  'tabId', 'title', 'index'
````

##### case 3 - default

Response includes thes same keys as case 1. As an aside, the property orders are all unpredictable so you can't just compare stringified versions of the response.

```
  'title',
  'body',
  'namedStyles',
  'revisionId',
  'documentId',
  'suggestionsViewMode',
  'documentStyle'
```

All this is fine, but although you can get tabs that have been setup by the UI, there's actually no way to create Tabs with Apps Script or even via the Docs API. See this feature request issue - https://issuetracker.google.com/issues/375867285 which has been open for going on for a year now.

I've set up gas-fakes document app to retrieve tab information and to make requests based on the new 'tab structured' format, but since we can't create them programatically, this makes testing the tab methods impractical. I'm pausing future development on tab related methods until the https://issuetracker.google.com/issues/375867285 issue is resolved.

#### Bookmarks

Rather like various other disconnects between Apps Script and the Docs API, there is no way to create, manage or even detect bookmarks that have been created by Apps Script within the Document resource using the Docs API.

I'm parking the work on Bookmarks until this issue is resolved - https://issuetracker.google.com/issues/441253571

#### Document body

Some oddities in the document body

##### number of children

See issue https://issuetracker.google.com/issues/432432968

If you create a blank document, there are 2 children
- a section break element
- a paragraph element

DocumentApp.getNumChildren() returns the value 1 and ignores the initial section break element

### Forms

There isn't an Apps Script Forms advanced service, but for the sake of consistency I'm creating one in gas-fakes for FormApp to use. After having dug into the Forms API, it's clear that it's not a simple 1:1 mapping with the Apps Script service. I'm suspecting that whoever wrote the Forms API was on acid at the time.

#### Discrepancy between `FormApp.create(title)` and Forms API behavior regarding form title and file name

#### Summary

There is a significant and counter-intuitive discrepancy between the documented behavior of `FormApp.create(title)` in Google Apps Script and the constraints of the underlying Google Forms API. `FormApp.create(title)` sets the Google Drive *file name* to the provided `title`, but leaves the form's internal title (retrieved by `form.getTitle()`) blank.

This makes it impossible to accurately emulate the Apps Script behavior using the public Forms API, as the API requires a non-empty title for both creation and updates.

#### Live Apps Script Behavior

When the following Apps Script code is executed:

```javascript
function testFormCreation() {
  const formName = "foo-form";
  const form = FormApp.create(formName);
  const id = form.getId();
  
  console.log('Internal form title:', form.getTitle()); // Logs: "" (an empty string)
  
  const file = DriveApp.getFileById(id);
  console.log('Drive file name:', file.getName());   // Logs: "foo-form"
  
  // cleanup
  file.setTrashed(true);
}
```

The output demonstrates that `FormApp.create()` uses the argument to set the Drive file name, but the form's own title property remains empty.

#### The Problem with API Emulation

This behavior is problematic to replicate with the v1 Google Forms API for the following reasons:

1.  **Creation**: The `forms.create` method requires a non-empty `info.title`. This title is then used to set both the initial internal title and the `documentTitle` (the Drive file name). There is no way to create a form with a specific file name but a blank internal title in a single step.

2.  **Updating**: The logical next step to emulate the behavior would be to:
    a. Create the form with `info.title` set to the desired file name.
    b. Immediately issue a `batchUpdate` request to set `info.title` to an empty string (""").

However, the `batchUpdate` request fails. The Forms API rejects an attempt to set `info.title` to an empty string, returning a `400 Bad Request` with the error message: `info.title was not provided`.

#### Conclusion

This disconnect means:
- The behavior of `FormApp.create()` is inconsistent with other `create()` methods in the Apps Script ecosystem (like `DocumentApp` or `SpreadsheetApp`), which set both the file name and the internal title.
- It is impossible for developers using the public Forms API to create a form that matches the state of one created by `FormApp.create()`.


The expected behavior would be for `FormApp.create(title)` to set both the Drive file name and the internal form title, or for the API to allow setting the title to an empty string via an update.

https://issuetracker.google.com/issues/442747794

#### Default Choice Values for New Items

There is a notable difference in how the live `FormApp` service and the underlying Google Forms API handle the creation of default choices for new choice-based items like `ListItem`, `CheckboxItem`, and `MultipleChoiceItem`.

##### Live Apps Script Behavior

When you create a choice-based item using the `FormApp` service, it automatically generates a single default choice. The value of this default choice is an empty string (""").

```javascript
// In live Apps Script
const form = FormApp.create("Test");
const item = form.addListItem();
const choices = item.getChoices();
console.log(choices.getValue()); // Logs: ""
```

##### The Problem with API Emulation

The public Google Forms API v1, which `gas-fakes` uses for its backend, has stricter requirements for item creation:

1.  **`options` is Required**: When creating a `ChoiceQuestion` via a `createItem` request, the `options` array must be present and contain at least one choice. Sending an empty array results in a `ChoiceQuestion.options is required` error.
2.  **`value` is Required**: Each choice object within the `options` array must have a non-empty `value` property. Sending a choice with `value: ""` results in an `option.value was not provided` error.

These constraints make it impossible to use the public API to create an item that exactly matches the initial state of one created by `FormApp`.

##### `gas-fakes` Implementation

To satisfy the API's requirements while still providing a default choice, `gas-fakes` creates these items with a single placeholder choice, like `"Option 1"`. This is a necessary divergence to work around the limitations of the public API. Tests that check for this default value must be written conditionally to account for the difference between the live and fake environments.

```javascript
// In the gas-fakes environment
const form = FormApp.create("Test");
const item = form.addListItem();
const choices = item.getChoices();
console.log(choices.getValue()); // Logs: "Option 1"
```
#### Inability to Set PageBreakItem Navigation

A significant discrepancy exists between the Apps Script FormApp service and the public Google Forms API regarding the ability to set the navigation flow after a page break. 

##### Live Apps Script Behavior

In the live Apps Script environment, the PageBreakItem.setGoToPage(navigation) method allows a developer to control what happens after a user completes a page. The form can be directed to continue to the next page, submit the form, or jump to a specific, different page (another PageBreakItem). 

##### The Problem with API Emulation 

The public Google Forms API v1 provides no mechanism to set this "after page" navigation. The PageBreakItem object within the API's Item resource is an empty object ({}), and the parent Item resource itself does not contain any navigation fields (goToAction or goToSectionId) when the item is a page break. This means that while choice-based navigation can be set via the API, page-based navigation cannot. 

##### gas-fakes Implementation 

Because gas-fakes relies exclusively on the public Forms API, it is impossible to emulate the live behavior of PageBreakItem.setGoToPage(). To accurately reflect this limitation and prevent developers from writing code that would only work in the fake environment, the setGoToPage() method on FakePageBreakItem throws a "not supported" error. 

Consequently, FakePageBreakItem.getGoToPage() will always return null, as there is no way to set this value through the API. 

#### `Choice.getGoToPage()` Behavior on `ListItem` Choices

There is a direct contradiction between the official Google Apps Script documentation and the live environment's behavior for the `Choice.getGoToPage()` method.

##### Documented vs. Live Behavior

The official documentation states that `getGoToPage()` applies only to choices from `MultipleChoiceItem` and that "for other choices, it returns `null`."

However, extensive testing against the live environment reveals that when `getGoToPage()` is called on a `Choice` object belonging to a `ListItem`, it does **not** return `null`. Instead, it throws a `TypeError`, stating that the method is not a function.

##### `gas-fakes` Implementation

To ensure the highest fidelity, `gas-fakes` emulates the *live behavior*, not the documented behavior. The `FakeChoice` class will check the type of its parent item. If the parent is a `ListItem`, calling `getGoToPage()` will throw a `TypeError`, just as it does in a live Apps Script environment. This ensures that tests written for `gas-fakes` will behave identically when run against the live service.

This is a critical distinction for developers, as code that defensively checks for a `null` return value (as the documentation would suggest) will behave differently than code that uses a `try...catch` block to handle a potential `TypeError`.


#### Inability to Programmatically Set Published State (`setPublished`)

Another significant limitation of the public Google Forms API is the inability to programmatically change whether a form is accepting responses.

##### Live Apps Script Behavior

In Apps Script, `form.setPublished(false)` successfully closes a form to new responses, and `form.setPublished(true)` re-opens it. This suggests that the `FormApp` service has access to a private API endpoint to modify the form's `state` property (`ACTIVE` or `INACTIVE`).

##### The Problem with API Emulation

The public Google Forms API v1 does **not** expose an endpoint to modify this `state`. Attempts to use the `forms.batchUpdate` method with either an `updateSettings` or `updateFormInfo` request to change the `state` will fail with an `Invalid JSON payload` error, as the API does not recognize the `state` field in these request bodies.

This has been confirmed through experimentation and is a known limitation.

##### `gas-fakes` Implementation

Because `gas-fakes` relies exclusively on public APIs, it is impossible to emulate the live behavior of `setPublished()`. To accurately reflect this limitation of the public API, the `setPublished()` method in the fake `FormApp` service throws a "not yet implemented" error. This prevents developers from writing code that works in the local fake environment but would fail if migrated to a context that uses the public API directly.

#### Inability to Programmatically Submit Responses (`submit`)

A major gap exists between the Apps Script `FormApp` service and the public Google Forms API v1 regarding the ability to submit responses.

##### Live Apps Script Behavior

In Apps Script, `FormResponse.submit()` allows a response to be programmatically submitted to a form. This works even if the form is restricted to a specific domain or requires a login, as the `FormApp` service appears to have internal, privileged access to the form's backend.

##### The Problem with API Emulation

The public Google Forms API v1 provides **no endpoint** to submit a response. It is strictly a management and retrieval API (allowing you to read form structure, watch for responses, or read existing responses).

##### `gas-fakes` Workaround

To provide a working `submit()` method, `gas-fakes` uses a "web submission hack":
1. It identifies the public form submission URL (e.g., swapping `/viewform` for `/formResponse`).
2. It captures the current sharing state of the form file.
3. It **temporarily** makes the form public (`ANYONE_WITH_LINK` / `VIEW`).
4. It scrapes the published form's HTML for essential metadata:
    - **`fbzx`**: A security token required by Google to validate the submission.
    - **`pageHistory`**: A sequence of page indices (e.g., `0,1,2`) that tells the server which pages the user has "visited."
5. It constructs a `POST` request using `UrlFetchApp.fetch`. Crucially, to support **multi-page forms**, it provides a "robust" `pageHistory` fallback (`0,1,2,3,4,5,6,7,8,9,10`). Without this, responses for items on pages other than the first would be silently ignored by Google's servers.
6. It immediately restores the form's original sharing permissions.

This workaround bypasses the API limitation but introduces a brief (milliseconds) "security hole" where the form is public. This is a clear case of a missing capability in the public API compared to the Apps Script environment.

#### Patches for Robust Form Submission

To achieve reliable programmatic submission via the "web submission hack," several critical patches were implemented:

1.  **Metadata Cache Clearing**: The security token `fbzx` must be fresh for certain forms. The `FakeForm` now supports `__clearScrapedMetadata()`, which is called after each successful `submit()` to force a re-scrape for the next response.
2.  **Dynamic Page History**: Multi-page forms often fail with a 400 error if `pageHistory` doesn't match the form's structure. The submission logic now dynamically calculates `pageHistory` based on the actual number of `PAGE_BREAK` items.
3.  **Required Field Handling**: Branching logic or missing optional data in legacy forms can cause submissions to fail if the target form has "Required" fields. The recommended pattern is to temporarily record and disable the `isRequired` status of all items before submission, then restore them in a `finally` block.
4.  **Grid Mapping Robustness**: Grid and Checkbox Grid items are now mapped more robustly by matching row titles (using `cleanTitle`) and column headers, ensuring data aligns correctly even if the underlying row/column order differs between forms.

#### Inability to Programmatically Delete Responses (`deleteAllResponses`)

The Google Forms API v1 does not provide any endpoint to delete form responses.

##### Live Apps Script Behavior

In Apps Script, `Form.deleteAllResponses()` clears all submitted responses from the form.

##### The Problem with API Emulation

Because there is no corresponding endpoint in the public Forms API, `gas-fakes` cannot emulate this behavior reliably.

##### `gas-fakes` Implementation

To reflect this limitation, `Form.deleteAllResponses()` in the fake `FormApp` service throws a detailed error.

### item ids Forms API -vs- FormApp

The Forms API returns item ids as hex strings, while Apps Script FormApp returns them as numbers. This leads to all kinds of complications when using the API and Apps Script interoperably. gas-fakes attempts to bridge this gap by providing returning all Ids from the FormApp emulation as numbers, and converting them to and from hex strings when interacting with the Forms API. This was very tricky as there are all kinds od ids embedded in the forms API responses and requests. It's possible I've missed some so if you get apis errors about id types/mismatches please raise an issue in the repo.

see https://issuetracker.google.com/issues/469115766


## Enums

All Apps Script enums are imitated using a seperate class 'newFakeGasenum()'. A complete write up of that is in [fakegasenum](https://github.com/brucemcpherson/fakegasenum). The same functionality is also available as an Apps Script library if you'd like to make your own enums over on GAS just like you find in Apps Script.

## Auth

Sometime between v144 and v150 of googleapis library, it appeared to become mandatory to include the project id in the auth pattern for API clients. Since we get the project id from the ADC, we actually have to do double auths. One to get the project id (which is async), and another to get an auth with the scopes required for the sheets, drive etc client (which is not async). All this now taken care of during the init phase.

#### logging auth dependency compatibility

I hit a brick wall when installing cloud logging because googleapis and gloud logging apis have different auth-library dependencies. This means we have 2 conflicting version of the auth-library. This works okay locally, but npm does some weird caching thing that causes it to fail when running in node_modules. 

This is the original conflict
````
npm ls google-auth-library

@mcpher/gas-fakes@1.1.3 /Users/brucemcpherson/Documents/repos/gas-fakes
├─┬ @google-cloud/logging@11.2.1
│ ├─┬ @google-cloud/common@5.0.2
│ │ └── google-auth-library@9.15.1 deduped
│ ├── google-auth-library@9.15.1
│ └─┬ google-gax@4.6.1
│   └── google-auth-library@9.15.1 deduped
└─┬ googleapis@161.0.0
  ├── google-auth-library@10.4.0
  └─┬ googleapis-common@8.0.0
    └── google-auth-library@10.4.0
````
I can see that logger is still on 9.15 whereas google apis latest (and v157 also) are both on 10.4. This turned out to be an impasse. Overriding to one version or the other simply made one api or the other fail. After spending days on trying to resolve this, i finally figured that simply using the JSON API instead of the node logging client made all thr troubles go away - so now we are all good.


However the latest version of googleapis, does give another warning nowadays, which presumably google will clear up at some point.

````
The `fromJSON` method is deprecated. Please use the `JWT` constructor instead. For more details, see https://cloud.google.com/docs/authentication/external/externally-sourced-credentials.
````

For now I've patched synchronizer.js to suppress these warnings like this - which we can remove if this ever gets resolved
````

// --- Start: Suppress google-auth-library warnings globally ---
// A regex to match either of the Google Auth deprecation warnings.
const googleAuthWarningRegex = /The `from(Stream|JSON)` method is deprecated/;

// Monkey-patch the main process's write methods to filter output.
const patchStream = (stream) => {
  const originalWrite = stream.write;
  stream.write = (chunk, encoding, callback) => {
    const message = typeof chunk === 'string' ? chunk : chunk.toString();
    if (googleAuthWarningRegex.test(message)) {
      // If it's a warning we want to suppress, do nothing.
      return true;
    }
    // Otherwise, call the original write method.
    return originalWrite.apply(stream, [chunk, encoding, callback]);
  };
};

patchStream(process.stdout);
patchStream(process.stderr);
````

### Active user -vs effective user when using workload identity/service account

When using workload identity/service account, the active user is the user being impersonated by the service account, but the effective user is the user that the service account itself. In ADC mode, the effective user would be the same as the active user as you are not running with a service account. This distinction is important as the access token generated is from the effective user's scoped permissions.

#### Google-auth-library changes

Another issue with 10.4, is we now get this error "Method doesn't allow unregistered callers (callers without established identity)". I believe this is to do with the use of certain scopes being restricted. When we are using ADC for authentication, but we can full it into thinking it's using an internal OAuth client by creating one in the console, then injecting its credentials into the file used by ADC. For a full explanation on setting this up see  this write up on setting up [getting started](GETTING_STARTED.md)

#### Dependency security and overrides
To address high-severity ReDoS vulnerabilities and deprecation warnings in transitive dependencies (specifically `minimatch` and `glob` pulled in via `archiver` and `google-auth-library`), `gas-fakes` uses the `overrides` field in `package.json`. This ensures that secure and supported versions of `minimatch` (>= 10.2.1) and `glob` (>= 13.0.0) are forced across all dependencies, even those that normally request older, vulnerable or deprecated versions.

#### Read-only filesystems and settings persistence
In ephemeral environments like Cloud Run, the filesystem is typically read-only. `gas-fakes` initialization (`sxInit`) is designed to handle this by skipping settings persistence if the write fails. A critical bug was fixed where these operations were not properly awaited, causing unhandled promise rejections that crashed the worker process. All filesystem operations during initialization are now correctly awaited and handled within `try...catch` blocks to ensure graceful degradation in read-only environments.

## Testing

If you want to play with the testing suite , then take a look at the [collaborators](collaborators.md) writeup.

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [senstive scopes](senstive_scopes.md)
- [using apps script libraries with gas-fakes](libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
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
