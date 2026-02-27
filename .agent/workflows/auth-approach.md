---
description: how to handle auth for multi platforms
---

So far we support 2 kinds of auth
- google - we have dwd or adc options. If using adc we also have an oauth credentials file to support restricted/sensitive scopes. For dwd, the scopes are built into the service account it creates, but it relies on domain wide delegation via the workspace admin console. The set of scopes required can be found in the appsscript.json manifest files accessible at the time of `init`. these scopes are written to the .env file for consumption by the `auth`
- ksuite - via a token from the ksuite ui. in this case the scopes are assigned at the time of creating the token =in the UI. There is current;y no connection or validation possible between the manifest and the ksuite token.


In each case, `gas-fakes init` is should be used to set up the options that the sesssion would 'ever have'. `gas-fakes auth` is used to execute that. 

Both ksuite and one of dwd or adc can be supported simultaneously, so the gas-fakes dialog needs to be able to support selecting either google or ksuite or both. In the future, additional auth options will need to be supported as well. The .env file shouls contain a variable that describes the kind of auth it can support.

When gas-fakes is imported it goes through an auth cycle which reads the .env file, and in the case of a google requirement, compares the scopes in the active manifest versus those that would have been assigned at init time. In the case of ksuite, it assumes the token is properly scoped as it has no way of checking. By default gas-fakes will auth everything it deduces from the .env filewhen starting. It will be possible to modify the platformAuth to a subset of what's in the .env by setting .env variables or setting them in a script before gas-fakes inits. 

Whats' required now:
- support multiple auth variations in auth & init
- the current dialog for adc is clumsy and should be replaced by reading the manifest file, just like the dwd does. Ideally we would be able to detect which scopes would actually need an oauth2 client file (restricted/sensitive) but for now, we'll just give the user the option to provide one in any case and leave the responsibility with them.