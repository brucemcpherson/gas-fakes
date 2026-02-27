## The idea is to use Apps Script as the 'lingua franca' for workspace type products.

This is a proof of concept, soo we just need to implement a few methods for now to see if it is feasible.

### Defining the platform


Lets start with the drive service of ksuite, The ksuite drive api is described in /Users/brucemcpherson/Documents/repos/gas-fakes/src/support/ksuite/kdrive_api.json

- ScriptApp.__platform: "workspace" (the default) - gas-fakes will operate as now, hitting the workspace api
- ScriptApp.__platform" "ksuite' = the sxdrive /Users/brucemcpherson/Documents/repos/gas-fakes/src/support/sxdrive.js function will have a new job of translating calls to the workspace api to the ksuite api, then tranforming the response to the smae properties that the drive api would have returned (as far as possible)

This means that all that gas-fakes will see is workspace shaped data, but how sxDrive retreives that data and reshapes it will be platform dependent.

### auth

for now lets keep it simple. ScriptApp.getOauthToken should return a token depending on the platform it is using. For the purposes of this test the ksuire token can be found 
```
 get token() {
    const t = process.env.KSUITE_TOKEN
    if (!t) throw new Error('missing KSUITE token')
    return t
  }
```

The ksuite token is already scopes via the ksuite UI, We'll need to improve all that later, but for now just assume the token has the necessary scopes already

### organization

ksuite classes should be created here /Users/brucemcpherson/Documents/repos/gas-fakes/src/support/ksuite, and would probably not be visible to the end user. 







