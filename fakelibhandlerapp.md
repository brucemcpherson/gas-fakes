# `fakelibhandlerapp.js` Documentation

## Overview

The `fakelibhandlerapp.js` module is a key component of the `gas-fakes` environment, designed to simulate Google Apps Script's library management system for local development and testing. Its primary responsibility is to handle the recursive loading and injection of library dependencies defined in a project's `appsscript.json` manifest file.

This allows scripts that depend on one or more libraries (and any libraries *they* might depend on) to be tested locally without needing to be in the Google Apps Script cloud environment.

## `newFakeLibHandlerApp([...args])`

This is the main exported factory function used to create an instance of the `FakeLibHandlerApp` class.

```javascript
export const newFakeLibHandlerApp = (...args) => {
  return Proxies.guard(new FakeLibHandlerApp(...args));
};
```

- It instantiates `FakeLibHandlerApp`.
- It wraps the new instance in a `Proxies.guard`. This is a security measure to prevent direct access to private properties or methods of the instance (those prefixed with `__`), ensuring that interaction with the object goes through its public interface.

## `FakeLibHandlerApp` Class

This class contains the logic for processing and loading the libraries.

### `constructor()`

The constructor initializes a `Map` to store all the unique libraries that are found and loaded. This map, `__libMap`, uses the library's script ID as the key to prevent the same library from being loaded multiple times.

### `load(manifest)`

This is the central method of the class. It orchestrates the process of finding and preparing all required libraries.

```javascript
load(manifest) {
  if (!manifest && !Auth.hasAuth()) {
    Syncit.fxInit();
  }
  manifest = manifest || Auth.getManifest();
  if (!manifest) {
    throw new Error('manifest not found in auth and not provided');
  }
  // ...
}
```

1.  **Manifest Resolution**: It takes an optional `manifest` object. If one isn't provided, it attempts to retrieve the manifest of the current project using `Auth.getManifest()`. If the environment hasn't been initialized yet, it calls `Syncit.fxInit()` to perform lazy initialization, ensuring that the project's `appsscript.json` is loaded.

2.  **Recursive Loading**:
    - It defines an inner function, `recurseManifests`, that processes a given manifest to find its dependencies.
    - Inside this function, `newFakeLibHandler(manifest).fetchLibraries()` is called to extract the list of libraries from the current manifest.
    - It iterates through each discovered library (if any). If the library hasn't already been loaded (by checking its presence in `libMap`), it's added.
    - Crucially, if a newly discovered library itself has dependencies (indicated by the presence of `lib.libraries`), the `recurseManifests` function is called again with that library's manifest. This recursive step ensures that the entire dependency tree is traversed.

3.  **Injection**:
    - After the entire dependency tree has been explored and all unique libraries are collected in `libMap`, the method iterates through the map.
    - For each library, it calls the `lib.inject()` method. This final step is what makes the library's functions and variables available in the global scope of the simulated environment, mimicking how Google Apps Script handles libraries.

### `toString()`

A standard method that returns the string `'LibHandlerApp'`, identifying the object type.
