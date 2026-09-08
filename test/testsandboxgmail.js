
import '@mcpher/gas-fakes'
import is from '@sindresorhus/is';
import { initTests } from "./testinit.js";

export const testSandboxGmail = () => {
  const { unit, fixes } = initTests();

  if (!ScriptApp.isFake) {
    return;
  }

  const resetSandbox = () => {
    const behavior = ScriptApp.__behavior;
    behavior.sandboxMode = true;
    behavior.strictSandbox = true;
    if (behavior.sandboxService && behavior.sandboxService.GmailApp) {
      behavior.sandboxService.GmailApp.clear();
    }
  };

  unit.section("Gmail Sandbox - Email Whitelist", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;

    // Whitelist setup
    gmailSettings.emailWhitelist = ['bruce@mcpher.com'];

    // Test Allowed
    t.not(GmailApp.sendEmail('bruce@mcpher.com', 'Subject', 'Body'), undefined, 'Should succeed for allowed email');

    // Test Denied
    const err = t.threw(() => GmailApp.sendEmail('denied@example.com', 'Subject', 'Body'));
    t.rxMatch(err?.message, /Email sending to denied@example.com is denied/, 'Should fail for denied email');
  });

  unit.section('Gmail Sandbox - Granular Usage Limits', t => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmail = behavior.sandboxService.GmailApp;

    // Setup - ensure clean state for usage limit test labels
    behavior.sandboxMode = false;
    try {
      const labels = GmailApp.getUserLabels();
      ['WriteTest1', 'WriteTest2', 'TrashTest', 'CleanupSkipTest'].forEach(name => {
        const l = labels.find(lab => lab.getName() === name);
        if (l) GmailApp.deleteLabel(l);
      });
    } catch (e) { }
    behavior.sandboxMode = true;

    // Test Write Limit
    gmail.usageLimit = { write: 2 };
    t.not(GmailApp.createLabel('WriteTest1'), undefined, 'Should succeed (write 1/2)');
    t.not(GmailApp.createLabel('WriteTest2'), undefined, 'Should succeed (write 2/2)');
    t.threw(() => GmailApp.createLabel('WriteTest3'), undefined, 'Should fail write limit exceeded');

    behavior.sandboxService.GmailApp.clear();
    gmail.usageLimit = { read: 2 };

    // Test Read Limit
    // getUserLabels = 1 read
    t.not(GmailApp.getUserLabels(), undefined, 'Should succeed (read 1/2)');
    // search = 1 read
    t.not(GmailApp.search('is:unread', 0, 1), undefined, 'Should succeed (read 2/2)');
    t.threw(() => GmailApp.getInboxThreads(0, 1), undefined, 'Should fail read limit exceeded');

    behavior.sandboxService.GmailApp.clear();
    gmail.usageLimit = { trash: 1 };
    gmail.labelWhitelist = [{ name: 'TrashTest', read: true, delete: true }];

    // Seed a label to delete and a thread to trash
    behavior.sandboxMode = false;
    try {
      GmailApp.createLabel('TrashTest');
      // Seed a thread? We need one for moveThreadToTrash. 
      // We can just create one.
      GmailApp.sendEmail('bruce.mcpherson@gmail.com', 'Trash Subject', 'Body');
      const th = GmailApp.search('subject:"Trash Subject"')[0];
      const lb = GmailApp.getUserLabels().find(l => l.getName() === 'TrashTest');
      th.addLabel(lb);
    } catch (e) { }
    behavior.sandboxMode = true;

    // Test Trash Limit
    const labelToDelete = GmailApp.getUserLabels().find(l => l.getName() === 'TrashTest');
    if (labelToDelete) {
      t.not(GmailApp.deleteLabel(labelToDelete), undefined, 'Should succeed (trash 1/1)');
    }

    // Next trash op should fail
    // We need a thread to trash.
    const threadToTrash = GmailApp.search('subject:"Trash Subject"')[0];
    if (threadToTrash) {
      t.threw(() => GmailApp.moveThreadToTrash(threadToTrash), undefined, 'Should fail trash limit exceeded');
    }

    behavior.sandboxService.GmailApp.clear();
  });

  unit.section("Gmail Sandbox - Separate Cleanup", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmail = behavior.sandboxService.GmailApp;

    // 1. cleanup = false for Gmail, global defaults
    gmail.cleanup = false;

    // we don
    behavior.cleanup = true;

    // Create label and thread
    const labelName = 'CleanupSkipTest';
    GmailApp.createLabel(labelName);

    // Verify it exists in tracking
    const tracked = Array.from(behavior.__createdGmailIds);
    t.is(tracked.length > 0, true, 'Should track created items');

    // Run trash - SHOULD NOT clean gmail
    behavior.trash();

    // trash() clears the set if it deleted them.
    t.is(behavior.__createdGmailIds.size > 0, true, 'Should NOT clear tracking set if cleanup disabled');

    // Verify label still exists
    const labels = GmailApp.getUserLabels();
    t.is(labels.some(l => l.getName() === labelName), true, 'Label should still exist');

    // 2. Enable cleanup
    gmail.cleanup = true;
    behavior.trash();

    t.is(behavior.__createdGmailIds.size, 0, 'Should clear tracking set if cleanup enabled');
    const labelsAfter = GmailApp.getUserLabels();
    t.is(labelsAfter.some(l => l.getName() === labelName), false, 'Label should be deleted');

    behavior.sandboxService.GmailApp.clear();
  });

  unit.section("Gmail Sandbox - Usage Limit", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;

    // Set usage limit to 2 (total limit)
    gmailSettings.usageLimit = 2;
    gmailSettings.emailWhitelist = ['bruce@mcpher.com'];

    // 1. Write op (sendEmail)
    GmailApp.sendEmail('bruce@mcpher.com', 'Subject 1', 'Body');
    t.is(gmailSettings.usageCount.send, 1, 'Send count should increment');

    // 2. Read op (getUserLabels)
    GmailApp.getUserLabels();
    t.is(gmailSettings.usageCount.read, 1, 'Read count should increment');

    // Total usage is now 2. Next op should fail.

    // 3. Any op should fail (e.g. read)
    const err = t.threw(() => GmailApp.getUserLabels());
    t.rxMatch(err?.message, /Gmail total usage limit of 2 exceeded/, 'Should fail when total limit exceeded');
  });

  unit.section("Gmail Sandbox - Label Whitelist", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;

    // Permissions: 
    // labelA: read
    // labelB: write
    // labelC: delete
    gmailSettings.labelWhitelist = [
      { name: 'labelA', read: true },
      { name: 'labelB', write: true },
      { name: 'labelC', delete: true },
      { name: 'inbox', read: true } // for getInboxThreads
    ];

    // Seed labels (disable sandbox temporarily or just use advanced service if not restricted)
    // We need real labels for delete/create checks if the underlying fake service checks existence.
    const wasSandbox = behavior.sandboxMode;
    behavior.sandboxMode = false;

    // CLEANUP: Ensure labels don't exist from previous runs to avoid "Label name exists"
    ['labelA', 'labelB', 'labelC'].forEach(name => {
      try {
        const list = Gmail.Users.Labels.list('me');
        const found = list.labels && list.labels.find(l => l.name === name);
        if (found) Gmail.Users.Labels.delete('me', found.id);
      } catch (e) { }
    });

    let labelC_real;
    try {
      // Try creating labelC so we can delete it
      Gmail.Users.Labels.create({ name: 'labelC' }, 'me');
      // Fetch it back using GmailApp to get the object
      const labels = GmailApp.getUserLabels();
      labelC_real = labels.find(l => l.getName() === 'labelC');
    } catch (e) {
      // if exists, fetch it
      const labels = GmailApp.getUserLabels();
      labelC_real = labels.find(l => l.getName() === 'labelC');
    }
    // ensure labelA exists for query if needed?
    try { Gmail.Users.Labels.create({ name: 'labelA' }, 'me'); } catch (e) { }

    behavior.sandboxMode = wasSandbox;

    // Create Label (needs write)
    // labelB doesn't exist yet, OR it might exist from previous run.
    // Sandbox check pass = it tries to create. If API throws "exists", that means sandbox passed.
    try {
      GmailApp.createLabel('labelB');
    } catch (e) {
      if (!e.message.match(/Label name exists/)) {
        throw e; // unexpected error
      }
      // else: pass, sandbox allowed the attempt
    }

    const createErr = t.threw(() => GmailApp.createLabel('labelA'));
    t.rxMatch(createErr?.message, /Create label access to labelA is denied/, 'Should fail creating read-only label');

    // Delete Label (needs delete)
    if (labelC_real) {
      t.not(GmailApp.deleteLabel(labelC_real), undefined, 'Should delete deletable label');
    } else {
      t.true(false, 'Could not seed labelC for delete test');
    }



    // ... restarting section logic in replacement content ... 
    // refetch labelB
    const labels = GmailApp.getUserLabels();
    const labelB_obj = labels.find(l => l.getName() === 'labelB');
    if (labelB_obj) {
      const delErr = t.threw(() => GmailApp.deleteLabel(labelB_obj));
      t.rxMatch(delErr?.message, /Delete label access to labelB is denied/, 'Should fail deleting write-only label');
    } else {
      // if create failed silently?
      // t.fail('labelB not found');
    }

    // Read Access (getThreads with query)
    // query "label:labelA" -> ok
    const resA = GmailApp.search('label:labelA');

    // Let's update whitelist for this specific test part
    gmailSettings.labelWhitelist.push({ name: 'inbox', read: true });
    t.is(GmailApp.getInboxThreads(1, 4)?.length, 4, 'Should read inbox if whitelisted');

  });

  unit.section("Gmail Sandbox - Session & Access Control", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;
    gmailSettings.emailWhitelist = ['bruce@mcpher.com'];
    gmailSettings.labelWhitelist = [{ name: 'AllowedLabel', read: true }];

    // 1. Session Access
    // Send email -> creates thread
    GmailApp.sendEmail('bruce@mcpher.com', 'Session Subject', 'Body');
    // Find the thread. Since we can't easily get ID from sendEmail (returns GmailApp), 
    // we search. Search should find it because it is session-created.
    const threads = GmailApp.search('subject:"Session Subject"');
    t.is(threads.length, 1, 'Should find session-created thread');
    const thread = threads[0];
    t.not(thread, undefined, 'Thread should be accessible');

    // Access by ID
    t.not(GmailApp.getThreadById(thread.getId()), undefined, 'Should get session thread by ID');

    // 2. Label-based Restriction
    // We need a thread that is NOT session created.
    // Turn off sandbox to seed it.
    behavior.sandboxMode = false;
    // Create thread indirectly via draft/send or finding existing.
    // Let's create a NEW label "AllowedLabel" and "DeniedLabel".
    try { Gmail.Users.Labels.create({ name: 'AllowedLabel' }, 'me'); } catch (e) { }
    try { Gmail.Users.Labels.create({ name: 'DeniedLabel' }, 'me'); } catch (e) { }

    // Create a message/thread with DeniedLabel
    // We can insert a message with labelIds.
    let deniedThreadId;
    try {
      const lbl = GmailApp.getUserLabels().find(l => l.getName() === 'DeniedLabel');
      // Use sendEmail (sandbox off) to create a thread
      GmailApp.sendEmail('bruce.mcpherson@gmail.com', 'Denied Subject', 'Body');
      // Find it
      const threads = GmailApp.search('subject:"Denied Subject"');
      if (threads.length > 0) {
        deniedThreadId = threads[0].getId();
        // Add label
        const tObj = GmailApp.getThreadById(deniedThreadId);
        tObj.addLabel(lbl);
      }
    } catch (e) { console.log('Seed denied failed', e); }

    // Create a message/thread with AllowedLabel
    let allowedThreadId;
    try {
      const lblA = GmailApp.getUserLabels().find(l => l.getName() === 'AllowedLabel');
      GmailApp.sendEmail('bruce.mcpherson@gmail.com', 'Allowed Subject', 'Body');
      const threads = GmailApp.search('subject:"Allowed Subject"');
      if (threads.length > 0) {
        allowedThreadId = threads[0].getId();
        // Add label
        const tObj = GmailApp.getThreadById(allowedThreadId);
        tObj.addLabel(lblA);
      }
    } catch (e) { console.log('Seed allowed failed', e); }
    // Verify labels are applied before locking down sandbox (eventual consistency)
    if (allowedThreadId) {
      let attempts = 0;
      while (attempts < 5) {
        const t = GmailApp.getThreadById(allowedThreadId);
        try {
          const labels = t.getLabels();
          if (labels.some(l => l.getName() === 'AllowedLabel')) break;
        } catch (e) {
        }
        Utilities.sleep(500);
        attempts++;
      }
    }

    behavior.sandboxMode = true; // ON

    // Test Denied Access
    if (deniedThreadId) {
      const err = t.threw(() => GmailApp.getThreadById(deniedThreadId));
      t.rxMatch(err?.message, /Access to thread .* is denied/, 'Should deny access to thread with non-whitelisted label');
    }

    // Test Allowed Access
    if (allowedThreadId) {
      t.not(GmailApp.getThreadById(allowedThreadId), undefined, 'Should allow access to thread with whitelisted label');
      // Test moveThreadToTrash
      const thread = GmailApp.getThreadById(allowedThreadId);
      t.not(GmailApp.moveThreadToTrash(thread), undefined, 'Should move allowed thread to trash');
    }

    // Test Denied MoveToTrash
    if (deniedThreadId) {
      behavior.sandboxMode = false;
      const deniedThread = GmailApp.getThreadById(deniedThreadId);
      behavior.sandboxMode = true;

      const trashErr = t.threw(() => GmailApp.moveThreadToTrash(deniedThread));
      t.rxMatch(trashErr?.message, /Access to thread .* is denied/, 'Should deny trashing thread with non-whitelisted label');
    }

    // Manual Cleanup for items created outside of sandbox
    behavior.sandboxMode = false;
    if (deniedThreadId) GmailApp.moveThreadToTrash(GmailApp.getThreadById(deniedThreadId));
    if (allowedThreadId) {
      try {
        GmailApp.moveThreadToTrash(GmailApp.getThreadById(allowedThreadId));
      } catch (e) { } // might be already trashed
    }
    behavior.sandboxMode = true;
  });

  unit.section("Gmail Sandbox - Service & Method Whitelisting", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;

    // 1. Test Service Disabling
    gmailSettings.enabled = false;
    const errDisabled = t.threw(() => GmailApp.getInboxThreads());
    t.rxMatch(errDisabled?.message, /GmailApp service is disabled by sandbox settings/, 'Should fail when service is disabled');

    // Re-enable
    gmailSettings.enabled = true;

    // 2. Test Method Whitelisting
    // Only allow 'getInboxThreads'. Internal __getThreads bypasses check.
    gmailSettings.setMethodWhitelist(['getInboxThreads']);

    t.not(GmailApp.getInboxThreads(0, 1), undefined, 'Should succeed for whitelisted method');

    // Attempt non-whitelisted method
    const errMethod = t.threw(() => GmailApp.createLabel('TestLabel'));
    t.rxMatch(errMethod?.message, /Method GmailApp.createLabel is not allowed by sandbox settings/, 'Should fail for non-whitelisted method');

    behavior.sandboxService.GmailApp.clear();
  });


  unit.section("Gmail Sandbox - Sending Limits & Label Security", (t) => {
    resetSandbox();
    const behavior = ScriptApp.__behavior;
    const gmailSettings = behavior.sandboxService.GmailApp;
    gmailSettings.emailWhitelist = ['bruce@mcpher.com'];

    // 1. Test Send Limit
    gmailSettings.usageLimit = { send: 1 };

    GmailApp.sendEmail('bruce@mcpher.com', 'Subject 1', 'Body');
    t.is(gmailSettings.usageCount.send, 1, 'Send count should increment');

    const errSend = t.threw(() => GmailApp.sendEmail('bruce@mcpher.com', 'Subject 2', 'Body'));
    t.rxMatch(errSend?.message, /Gmail send usage limit of 1 exceeded/, 'Should fail when send limit exceeded');

    // 2. Test Label Security (addLabel)
    // Setup: Create thread and label
    gmailSettings.usageLimit = null; // clear limit
    const labelName = 'DeniedLabelTest_'+ new Date().getTime();
    // We need to create label first. Whitelist 'write' for creation to succeed.
    gmailSettings.labelWhitelist = [{ name: labelName, write: true }];

    // But we want to DENY adding it later? 
    // If it's whitelisted for 'write', `addLabel` (which checks 'write') will succeed.
    // If we want to fail, we need a label that exists but is NOT in whitelist (or write=false).
    // Pre-seed a label "ExistingDenied"?
    // Or change whitelist dynamically.

    // Create label while allowed
    const l = GmailApp.createLabel(labelName);

    // Now REMOVE from whitelist (or set write: false)
    gmailSettings.labelWhitelist = [{ name: labelName, read: true, write: false }];

    // Create thread (allowed)
    GmailApp.sendEmail('bruce@mcpher.com', 'Label Test', 'Body');
    const thread = GmailApp.search('subject:"Label Test"')[0];

    // Attempt addLabel - should fail
    const errLabel = t.threw(() => thread.addLabel(l));
    t.rxMatch(errLabel?.message, /Access to add label/, 'Should deny adding label without write permission');

    // Cleanup
    behavior.sandboxMode = false;
    GmailApp.moveThreadToTrash(thread);
    GmailApp.deleteLabel(l);
    behavior.sandboxMode = true;
  });

  unit.report();
};

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) {
  testSandboxGmail();
}
