# Service: gmail

## Class: GmailApp

Supported Methods:
- `createDraft(String,String,String,Object)`
- `createDraft(String,String,String)`
- `createLabel(String)`
- `deleteLabel(GmailLabel)`
- `getAliases()`
- `getDraft(String)`
- `getDraftMessages()`
- `getDrafts()`
- `getInboxThreads()`
- `getInboxThreads(Integer,Integer)`
- `getInboxUnreadCount()`
- `getMessageById(String)`
- `getMessagesForThread(GmailThread)`
- `getMessagesForThreads(GmailThread)`
- `getPriorityInboxThreads()`
- `getPriorityInboxThreads(Integer,Integer)`
- `getPriorityInboxUnreadCount()`
- `getSpamThreads()`
- `getSpamThreads(Integer,Integer)`
- `getSpamUnreadCount()`
- `getStarredThreads()`
- `getStarredThreads(Integer,Integer)`
- `getStarredUnreadCount()`
- `getThreadById(String)`
- `getTrashThreads()`
- `getTrashThreads(Integer,Integer)`
- `getUserLabelByName(String)`
- `getUserLabels()`
- `markMessageRead(GmailMessage)`
- `markMessagesRead(GmailMessage)`
- `markMessagesUnread(GmailMessage)`
- `markMessageUnread(GmailMessage)`
- `markThreadImportant(GmailThread)`
- `markThreadRead(GmailThread)`
- `markThreadsImportant(GmailThread)`
- `markThreadsRead(GmailThread)`
- `markThreadsUnimportant(GmailThread)`
- `markThreadsUnread(GmailThread)`
- `markThreadUnimportant(GmailThread)`
- `markThreadUnread(GmailThread)`
- `moveMessagesToTrash(GmailMessage)`
- `moveMessageToTrash(GmailMessage)`
- `moveThreadsToArchive(GmailThread)`
- `moveThreadsToInbox(GmailThread)`
- `moveThreadsToSpam(GmailThread)`
- `moveThreadsToTrash(GmailThread)`
- `moveThreadToArchive(GmailThread)`
- `moveThreadToInbox(GmailThread)`
- `moveThreadToSpam(GmailThread)`
- `moveThreadToTrash(GmailThread)`
- `refreshMessage(GmailMessage)`
- `refreshMessages(GmailMessage)`
- `refreshThread(GmailThread)`
- `refreshThreads(GmailThread)`
- `search(String,Integer,Integer)`
- `search(String)`
- `sendEmail(String,String,String,Object)`
- `sendEmail(String,String,String)`
- `setCurrentMessageAccessToken(String)`
- `starMessage(GmailMessage)`
- `starMessages(GmailMessage)`
- `unstarMessage(GmailMessage)`
- `unstarMessages(GmailMessage)`

## Class: GmailAttachment

Supported Methods:
- `copyBlob()`
- `getAs(String)`
- `getBytes()`
- `getContentType()`
- `getDataAsString()`
- `getDataAsString(String)`
- `getHash()`
- `getName()`
- `getSize()`
- `isGoogleType()`
- `setBytes(Byte)`
- `setContentType(String)`
- `setContentTypeFromExtension()`
- `setDataFromString(String,String)`
- `setDataFromString(String)`
- `setName(String)`

## Class: GmailDraft

Supported Methods:
- `deleteDraft()`
- `getId()`
- `getMessage()`
- `getMessageId()`
- `send()`
- `update(String,String,String,Object)`
- `update(String,String,String)`

## Class: GmailLabel

Supported Methods:
- `addToThread(GmailThread)`
- `addToThreads(GmailThread)`
- `deleteLabel()`
- `getId()`
- `getName()`
- `getThreads()`
- `getThreads(Integer,Integer)`
- `getUnreadCount()`
- `removeFromThread(GmailThread)`
- `removeFromThreads(GmailThread)`

## Class: GmailMessage

Supported Methods:
- `createDraftReply(String,Object)`
- `createDraftReply(String)`
- `createDraftReplyAll(String,Object)`
- `createDraftReplyAll(String)`
- `forward(String,Object)`
- `forward(String)`
- `getAttachments()`
- `getAttachments(Object)`
- `getBcc()`
- `getBody()`
- `getCc()`
- `getDate()`
- `getFrom()`
- `getId()`
- `getPlainBody()`
- `getRawContent()`
- `getReplyTo()`
- `getSubject()`
- `getThread()`
- `getTo()`
- `isDraft()`
- `isInChats()`
- `isInInbox()`
- `isInPriorityInbox()`
- `isInTrash()`
- `isStarred()`
- `isUnread()`
- `markRead()`
- `markUnread()`
- `moveToTrash()`
- `refresh()`
- `reply(String,Object)`
- `reply(String)`
- `replyAll(String,Object)`
- `replyAll(String)`
- `star()`
- `unstar()`

## Class: GmailThread

Supported Methods:
- `addLabel(GmailLabel)`
- `createDraftReply(String,Object)`
- `createDraftReply(String)`
- `createDraftReplyAll(String,Object)`
- `createDraftReplyAll(String)`
- `getFirstMessageSubject()`
- `getId()`
- `getLabels()`
- `getLastMessageDate()`
- `getMessageCount()`
- `getMessages()`
- `getPermalink()`
- `hasStarredMessages()`
- `isImportant()`
- `isInChats()`
- `isInInbox()`
- `isInPriorityInbox()`
- `isInSpam()`
- `isInTrash()`
- `isUnread()`
- `markImportant()`
- `markRead()`
- `markUnimportant()`
- `markUnread()`
- `moveToArchive()`
- `moveToInbox()`
- `moveToSpam()`
- `moveToTrash()`
- `refresh()`
- `removeLabel(GmailLabel)`
- `reply(String,Object)`
- `reply(String)`
- `replyAll(String,Object)`
- `replyAll(String)`

