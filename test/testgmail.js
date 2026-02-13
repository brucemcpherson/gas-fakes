
import '@mcpher/gas-fakes';
import is from '@sindresorhus/is';

import { initTests } from './testinit.js';
import { getGmailPerformance, wrapupTest, trasher } from './testassist.js';

export const testGmail = (pack) => {
  const activeEmail = Session.getActiveUser().getEmail();
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("gmailapp createDraft", (t) => {
    const recipient = activeEmail;
    const subject = "Test Draft Subject " + new Date().getTime();
    const body = "Test draft body.";
    const draft = GmailApp.createDraft(recipient, subject, body);
    t.true(is.object(draft), "should create a draft object");
    t.true(is.nonEmptyString(draft.getId()), "draft should have an id");
    t.is(draft.toString(), "GmailDraft", "should be a gmail draft object");
  });

  unit.section('gmail labels', (t) => {
    // get current labels
    const initialLabels = Gmail.Users.Labels.list('me');
    t.true(is.array(initialLabels.labels), 'should get an array of labels');
    const initialCount = initialLabels.labels.length;

    // create a new label
    const labelName = `${fixes.PREFIX}-test-label-${new Date().getTime()}`;
    const newLabelResource = Gmail.newLabel()
      .setName(labelName)
      .setLabelListVisibility('labelShow')
      .setMessageListVisibility('show')
      .setColor(Gmail.newLabelColor().setBackgroundColor('#16a765').setTextColor('#ffffff'));

    const createdLabel = Gmail.Users.Labels.create(newLabelResource, 'me');
    t.is(createdLabel.name, labelName, 'created label should have correct name');
    t.true(is.nonEmptyString(createdLabel.id), 'created label should have an id');
    t.is(createdLabel.color.backgroundColor, '#16a765', 'created label should have correct background color');

    // list again and check count
    const afterCreateLabels = Gmail.Users.Labels.list('me');
    t.is(afterCreateLabels.labels.length, initialCount + 1, 'label count should increase by 1');

    // get the created label by id
    const gotLabel = Gmail.Users.Labels.get('me', createdLabel.id);
    t.is(gotLabel.id, createdLabel.id, 'get should retrieve the correct label');
    t.is(gotLabel.name, labelName, 'retrieved label should have correct name');

    // delete the label
    Gmail.Users.Labels.remove('me', createdLabel.id);

    // list again and check count
    const afterDeleteLabels = Gmail.Users.Labels.list('me');
    t.is(afterDeleteLabels.labels.length, initialCount, 'label count should be back to initial');

    const err = t.threw(() => Gmail.Users.Labels.get('me', createdLabel.id));
    t.rxMatch(err.message, /(404|not found)/i, 'getting a deleted label should throw a 404 or not found error');

    if (Gmail.isFake) console.log('...cumulative gmail cache performance', getGmailPerformance());
  });

  unit.section('GmailApp basic methods', (t) => {
    const labelName = `${fixes.PREFIX}-gmailapp-label-${new Date().getTime()}`;
    let newLabel;
    try {
      newLabel = GmailApp.createLabel(labelName);
      t.is(newLabel.getName(), labelName, 'createLabel should return a label with the correct name');
      t.is(newLabel.toString(), 'GmailLabel', 'label.toString() should be "GmailLabel"');
      t.true(is.nonEmptyString(newLabel.getId()), 'created label should have an ID');

      const labels = GmailApp.getUserLabels();
      t.true(is.array(labels), 'getUserLabels() should return an array');

      const foundLabel = labels.find(l => l.getName() === labelName);
      t.truthy(foundLabel, 'should find the newly created user label in getUserLabels()');
      if (foundLabel) {
        t.is(foundLabel.getId(), newLabel.getId(), 'found label should have the correct ID');
      }
    } finally {
      if (newLabel) {
        newLabel.deleteLabel();
      }
    }
  });

  unit.section("gmailapp createDraft advanced", (t) => {
    const recipient = fixes.EMAIL;
    const subject = "Test Draft Subject advanced " + new Date().getTime();
    const body = "Test draft body.";
    const htmlBody = "<html><body><p>Test draft body with inline image <img src='cid:myImage' /></p></body></html>";
    const attachment = Utilities.newBlob("test attachment", "text/plain", "attachment.txt");
    const inlineImage = UrlFetchApp.fetch(fixes.RANDOM_IMAGE).getBlob();

    const options = {
      htmlBody,
      attachments: [attachment],
      inlineImages: {
        myImage: inlineImage,
      },
      cc: activeEmail,
      bcc: activeEmail,
      from: activeEmail,
      name: fixes.OWNER_NAME,
      replyTo: activeEmail,
    };

    const draft = GmailApp.createDraft(recipient, subject, body, options);
    t.true(is.object(draft), "should create a draft object with advanced options");
    t.true(is.nonEmptyString(draft.getId()), "advanced draft should have an id");
    t.is(draft.toString(), "GmailDraft", "should be a gmail draft object");
  });

  unit.section("gmailapp deleteLabel", (t) => {
    const labelName = `${fixes.PREFIX}-delete-label-${new Date().getTime()}`;
    let newLabel = GmailApp.createLabel(labelName);
    t.is(newLabel.getName(), labelName, 'createLabel should return a label with the correct name for deletion test');

    let labels = GmailApp.getUserLabels();
    t.true(labels.some(l => l.getName() === labelName), 'should find the newly created label before deletion');

    GmailApp.deleteLabel(newLabel);

    labels = GmailApp.getUserLabels();
    t.false(labels.some(l => l.getName() === labelName), 'should not find the deleted label');

    // Deleting a non-existent label should throw an error
    const err = t.threw(() => GmailApp.deleteLabel(newLabel));
    t.rxMatch(err?.message, /(not found|invalid)/i, 'deleting an already deleted label should throw an error');
  });

  unit.section("gmailapp getAliases", (t) => {
    const aliases = GmailApp.getAliases();
    t.true(is.array(aliases), 'getAliases() should return an array');
    
    // a user will always have at least their primary email as an alias
    t.true(aliases.length > 0, 'should return at least one alias');

    // all items should be strings
    t.true(aliases.every(alias => is.string(alias)), 'all aliases should be strings');

    if(ScriptApp.isFake) {
      // the user's primary email should be in the list
      const primaryEmail = Session.getActiveUser().getEmail();
      t.true(aliases.includes(primaryEmail), 'should include the primary email');
    }
  });

  unit.section("gmailapp getDraft", (t) => {
    const recipient = activeEmail;
    const subject = "Test getDraft Subject " + new Date().getTime();
    const body = "Test getDraft body.";
    const createdDraft = GmailApp.createDraft(recipient, subject, body);
    
    t.true(is.object(createdDraft), "createDraft should return a valid draft object");
    t.true(is.nonEmptyString(createdDraft.getId()), "created draft should have an ID");

    const retrievedDraft = GmailApp.getDraft(createdDraft.getId());
    t.true(is.object(retrievedDraft), "getDraft should return a valid draft object");
    t.is(retrievedDraft.getId(), createdDraft.getId(), "retrieved draft ID should match created draft ID");
    
    // Test for non-existent draft
    const nonExistentId = "non_existent_draft_id";
    const err = t.threw(() => GmailApp.getDraft(nonExistentId));
    t.rxMatch(err.message, /(404|not found)/i, 'getting a non-existent draft should throw a 404 or not found error');
  });

  unit.section("gmailapp getDraftMessages", (t) => {
    const initialDrafts = GmailApp.getDraftMessages();
    t.true(is.array(initialDrafts), 'getDraftMessages should return an array initially');
    const initialCount = initialDrafts.length;

    // Create a couple of new drafts
    GmailApp.createDraft(activeEmail, "Draft 1", "Body 1");
    GmailApp.createDraft(activeEmail, "Draft 2", "Body 2");

    const newDrafts = GmailApp.getDraftMessages();
    t.true(is.array(newDrafts), 'getDraftMessages should return an array after creating drafts');
    t.is(newDrafts.length, initialCount + 2, 'should have 2 more drafts');
    
    newDrafts.forEach(draftMessage => {
      t.is(draftMessage.toString(), 'GmailMessage', 'each item should be a GmailMessage');
      t.true(is.nonEmptyString(draftMessage.getId()), 'each draft message should have an ID');
    });
  });

  unit.section("gmailapp getDrafts", (t) => {
    const initialDrafts = GmailApp.getDrafts();
    t.true(is.array(initialDrafts), 'getDrafts should return an array initially');
    const initialCount = initialDrafts.length;

    // Create a couple of new drafts
    GmailApp.createDraft(activeEmail, "Draft 3", "Body 3");
    GmailApp.createDraft(activeEmail, "Draft 4", "Body 4");

    const newDrafts = GmailApp.getDrafts();
    t.true(is.array(newDrafts), 'getDrafts should return an array after creating drafts');
    t.is(newDrafts.length, initialCount + 2, 'should have 2 more drafts');
    
    newDrafts.forEach(draft => {
      t.is(draft.toString(), 'GmailDraft', 'each item should be a GmailDraft');
      t.true(is.nonEmptyString(draft.getId()), 'each draft should have an ID');
    });
  });

  unit.section("gmailapp getInboxThreads", (t) => {
    const inboxThreads = GmailApp.getInboxThreads();
    t.true(is.array(inboxThreads), 'getInboxThreads() should return an array');
  });

  unit.section("gmailapp getInboxUnreadCount", (t) => {
    const unreadCount = GmailApp.getInboxUnreadCount();
    t.true(is.number(unreadCount), 'getInboxUnreadCount() should return a number');
  });

  // Tests for getPriorityInboxThreads
  unit.section("gmailapp getPriorityInboxThreads", (t) => {
    const priorityInboxThreads = GmailApp.getPriorityInboxThreads();
    t.true(is.array(priorityInboxThreads), 'getPriorityInboxThreads() should return an array');
    priorityInboxThreads.forEach(thread => {
      t.is(thread.toString(), 'GmailThread', 'each item should be a GmailThread');
      t.true(is.nonEmptyString(thread.getId()), 'each thread should have an ID');
    });

    const paginatedThreads = GmailApp.getPriorityInboxThreads(0, 1);
    t.true(is.array(paginatedThreads), 'getPriorityInboxThreads(0,1) should return an array');
    t.true(paginatedThreads.length <= 1, 'paginatedThreads length should be <= 1');
  });

  // Tests for getPriorityInboxUnreadCount
  unit.section("gmailapp getPriorityInboxUnreadCount", (t) => {
    const unreadCount = GmailApp.getPriorityInboxUnreadCount();
    t.true(is.number(unreadCount), 'getPriorityInboxUnreadCount() should return a number');
  });

  // Tests for getSpamThreads
  unit.section("gmailapp getSpamThreads", (t) => {
    const spamThreads = GmailApp.getSpamThreads();
    t.true(is.array(spamThreads), 'getSpamThreads() should return an array');
    spamThreads.forEach(thread => {
      t.is(thread.toString(), 'GmailThread', 'each item should be a GmailThread');
      t.true(is.nonEmptyString(thread.getId()), 'each thread should have an ID');
    });

    const paginatedThreads = GmailApp.getSpamThreads(0, 1);
    t.true(is.array(paginatedThreads), 'getSpamThreads(0,1) should return an array');
    t.true(paginatedThreads.length <= 1, 'paginatedThreads length should be <= 1');
  });

  // Tests for getSpamUnreadCount
  unit.section("gmailapp getSpamUnreadCount", (t) => {
    const unreadCount = GmailApp.getSpamUnreadCount();
    t.true(is.number(unreadCount), 'getSpamUnreadCount() should return a number');
  });

  // Tests for getStarredThreads
  unit.section("gmailapp getStarredThreads", (t) => {
    const starredThreads = GmailApp.getStarredThreads();
    t.true(is.array(starredThreads), 'getStarredThreads() should return an array');
    starredThreads.forEach(thread => {
      t.is(thread.toString(), 'GmailThread', 'each item should be a GmailThread');
      t.true(is.nonEmptyString(thread.getId()), 'each thread should have an ID');
    });

    const paginatedThreads = GmailApp.getStarredThreads(0, 1);
    t.true(is.array(paginatedThreads), 'getStarredThreads(0,1) should return an array');
    t.true(paginatedThreads.length <= 1, 'paginatedThreads length should be <= 1');
  });

  // Tests for getStarredUnreadCount
  unit.section("gmailapp getStarredUnreadCount", (t) => {
    const unreadCount = GmailApp.getStarredUnreadCount();
    t.true(is.number(unreadCount), 'getStarredUnreadCount() should return a number');
  });

  // Tests for getTrashThreads
  unit.section("gmailapp getTrashThreads", (t) => {
    const trashThreads = GmailApp.getTrashThreads();
    t.true(is.array(trashThreads), 'getTrashThreads() should return an array');
    trashThreads.forEach(thread => {
      t.is(thread.toString(), 'GmailThread', 'each item should be a GmailThread');
      t.true(is.nonEmptyString(thread.getId()), 'each thread should have an ID');
    });

    const paginatedThreads = GmailApp.getTrashThreads(0, 1);
    t.true(is.array(paginatedThreads), 'getTrashThreads(0,1) should return an array');
    t.true(paginatedThreads.length <= 1, 'paginatedThreads length should be <= 1');
  });

  // Tests for getMessageById
  unit.section("gmailapp getMessageById", (t) => {
    const recipient = activeEmail;
    const subject = "Test MessageById Subject " + new Date().getTime();
    const body = "Test MessageById body.";
    const createdDraft = GmailApp.createDraft(recipient, subject, body);
    const createdMessageId = createdDraft.getMessage().getId();

    const message = GmailApp.getMessageById(createdMessageId);
    t.true(is.object(message), 'getMessageById() should return a message object');
    t.true(is.nonEmptyString(message.getId()), 'message should have an ID');
    t.is(message.toString(), 'GmailMessage', 'message.toString() should be GmailMessage');
    t.is(message.getId(), createdMessageId, 'retrieved message ID should match created message ID');
  });

  // Tests for getThreadById
  unit.section("gmailapp getThreadById", (t) => {
    // For now, let's create a draft and get its thread.
    // In a real scenario, we might need to send an email to create a thread.
    const recipient = activeEmail;
    const subject = "Test ThreadById Subject " + new Date().getTime();
    const body = "Test ThreadById body.";
    const createdDraft = GmailApp.createDraft(recipient, subject, body);
    const createdThreadId = createdDraft.getMessage().getThread().getId();

    const thread = GmailApp.getThreadById(createdThreadId);
    t.true(is.object(thread), 'getThreadById() should return a thread object');
    t.true(is.nonEmptyString(thread.getId()), 'thread should have an ID');
    t.is(thread.toString(), 'GmailThread', 'thread.toString() should be GmailThread');
  });

  // Tests for getMessagesForThread
  unit.section("gmailapp getMessagesForThread", (t) => {
    // Create a thread first
    const recipient = activeEmail;
    const subject = "Test MessagesForThread Subject " + new Date().getTime();
    const body = "Test MessagesForThread body.";
    const createdDraft = GmailApp.createDraft(recipient, subject, body);
    const thread = GmailApp.getThreadById(createdDraft.getMessage().getThread().getId());

    const messages = GmailApp.getMessagesForThread(thread);
    t.true(is.array(messages), 'getMessagesForThread() should return an array');
    t.true(messages.length > 0, 'should return at least one message');
    messages.forEach(message => {
      t.is(message.toString(), 'GmailMessage', 'each item should be a GmailMessage');
      t.true(is.nonEmptyString(message.getId()), 'each message should have an ID');
    });
  });

  // Tests for getMessagesForThreads
  unit.section("gmailapp getMessagesForThreads", (t) => {
    // Create multiple threads
    const createdDraft1 = GmailApp.createDraft(activeEmail, "Test MultiThread 1", "Body 1");
    const createdDraft2 = GmailApp.createDraft(activeEmail, "Test MultiThread 2", "Body 2");
    const thread1 = GmailApp.getThreadById(createdDraft1.getMessage().getThread().getId());
    const thread2 = GmailApp.getThreadById(createdDraft2.getMessage().getThread().getId());

    const threads = [thread1, thread2];
    const messages = GmailApp.getMessagesForThreads(threads);
    t.true(is.array(messages), 'getMessagesForThreads() should return an array');
    t.is(messages.length, 2, 'should return an array of messages for 2 threads');

    messages.forEach(threadMessages => {
      t.true(is.array(threadMessages), 'each item should be an array of messages');
      t.true(threadMessages.length > 0, 'each thread should have at least one message');
      threadMessages.forEach(message => {
        t.is(message.toString(), 'GmailMessage', 'each item should be a GmailMessage');
        t.true(is.nonEmptyString(message.getId()), 'each message should have an ID');
      });
    });
  });






  if (!pack) {
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes };
};

wrapupTest(testGmail);


