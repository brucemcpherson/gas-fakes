# Service: forms

## Class: CheckboxGridItem

Supported Methods:
- `createResponse(String)`
- `duplicate()`
- `getColumns()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getRows()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setColumns(String)`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setRows(String)`
- `setTitle(String)`

## Class: CheckboxItem

Supported Methods:
- `createResponse(String)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: Choice

Supported Methods:
- `getPageNavigationType()`
- `getValue()`

## Class: DateItem

Supported Methods:
- `createResponse(Date)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: DateTimeItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: DurationItem

Supported Methods:
- `createResponse(Integer,Integer,Integer)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: Form

Supported Methods:
- `addCheckboxGridItem()`
- `addCheckboxItem()`
- `addDateItem()`
- `addDateTimeItem()`
- `addDurationItem()`
- `addGridItem()`
- `addListItem()`
- `addMultipleChoiceItem()`
- `addPageBreakItem()`
- `addParagraphTextItem()`
- `addScaleItem()`
- `addSectionHeaderItem()`
- `addTextItem()`
- `addTimeItem()`
- `createResponse()`
- `deleteAllResponses()`
- `deleteItem(Integer)`
- `deleteItem(Item)`
- `getDescription()`
- `getDestinationId()`
- `getDestinationType()`
- `getEditUrl()`
- `getId()`
- `getItemById(Integer)`
- `getItems()`
- `getItems(ItemType)`
- `getPublishedUrl()`
- `getResponses()`
- `getResponses(Date)`
- `getTitle()`
- `isAcceptingResponses()`
- `isPublished()`
- `moveItem(Integer,Integer)`
- `moveItem(Item,Integer)`
- `removeDestination()`
- `setAcceptingResponses(Boolean)`
- `setDescription(String)`
- `setDestination(DestinationType,String)`
- `setPublished(Boolean)`
- `setTitle(String)`
- `shortenFormUrl(String)`

## Class: FormApp

Supported Methods:
- `create(String,Boolean)`
- `create(String)`
- `getActiveForm()`
- `getUi()`
- `openById(String)`
- `openByUrl(String)`

## Class: FormResponse

Supported Methods:
- `getId()`
- `getItemResponses()`
- `getRespondentEmail()`
- `getTimestamp()`
- `submit()`
- `withItemResponse(ItemResponse)`

## Class: GridItem

Supported Methods:
- `createResponse(String)`
- `duplicate()`
- `getColumns()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getRows()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setColumns(String)`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setRows(String)`
- `setTitle(String)`

## Class: ImageItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `setHelpText(String)`
- `setTitle(String)`

## Class: ItemResponse

Supported Methods:
- `getItem()`
- `getResponse()`

## Class: ListItem

Supported Methods:
- `createChoice(String,Boolean)`
- `createChoice(String,PageBreakItem)`
- `createChoice(String,PageNavigationType)`
- `createChoice(String)`
- `createResponse(String)`
- `getChoices()`
- `setChoices(Choice)`

## Class: MultipleChoiceItem

Supported Methods:
- `createResponse(String)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: PageBreakItem

Supported Methods:
- `duplicate()`
- `getGoToPage()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getPageNavigationType()`
- `getTitle()`
- `getType()`
- `setGoToPage(PageBreakItem)`
- `setGoToPage(PageNavigationType)`
- `setHelpText(String)`
- `setTitle(String)`

## Class: ParagraphTextItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: RatingItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: ScaleItem

Supported Methods:
- `createResponse(Integer)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getLeftLabel()`
- `getLowerBound()`
- `getRightLabel()`
- `getTitle()`
- `getType()`
- `getUpperBound()`
- `isRequired()`
- `setBounds(Integer,Integer)`
- `setHelpText(String)`
- `setLabels(String,String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: SectionHeaderItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `setHelpText(String)`
- `setTitle(String)`

## Class: TextItem

Supported Methods:
- `createResponse(String)`

## Class: TimeItem

Supported Methods:
- `createResponse(Integer,Integer)`
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `isRequired()`
- `setHelpText(String)`
- `setRequired(Boolean)`
- `setTitle(String)`

## Class: VideoItem

Supported Methods:
- `duplicate()`
- `getHelpText()`
- `getId()`
- `getIndex()`
- `getTitle()`
- `getType()`
- `setHelpText(String)`
- `setTitle(String)`

