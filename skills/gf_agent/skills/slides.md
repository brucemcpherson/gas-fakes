# Service: slides

## Class: AffineTransform

Supported Methods:
- `getScaleX()`
- `getScaleY()`
- `getShearX()`
- `getShearY()`
- `getTranslateX()`
- `getTranslateY()`
- `toBuilder()`

## Class: AffineTransformBuilder

Supported Methods:
- `build()`
- `setScaleX(Number)`
- `setScaleY(Number)`
- `setShearX(Number)`
- `setShearY(Number)`
- `setTranslateX(Number)`
- `setTranslateY(Number)`

## Class: Autofit

Supported Methods:
- `disableAutofit()`
- `getAutofitType()`
- `getFontScale()`
- `getLineSpacingReduction()`

## Class: AutoText

Supported Methods:
- `getAutoTextType()`
- `getIndex()`
- `getRange()`

## Class: Border

Supported Methods:
- `getDashStyle()`
- `getLineFill()`
- `getWeight()`
- `isVisible()`
- `setDashStyle(DashStyle)`
- `setTransparent()`
- `setWeight(Number)`

## Class: Color

Supported Methods:
- `asRgbColor()`
- `asThemeColor()`
- `getColorType()`

## Class: ColorScheme

Supported Methods:
- `getConcreteColor(ThemeColorType)`
- `getThemeColors()`
- `setConcreteColor(ThemeColorType,Color)`
- `setConcreteColor(ThemeColorType,Integer,Integer,Integer)`
- `setConcreteColor(ThemeColorType,String)`

## Class: ConnectionSite

Supported Methods:
- `getIndex()`
- `getPageElement()`

## Class: Fill

Supported Methods:
- `getSolidFill()`
- `getType()`
- `isVisible()`
- `setSolidFill(Color,Number)`
- `setSolidFill(Color)`
- `setSolidFill(Integer,Integer,Integer,Number)`
- `setSolidFill(Integer,Integer,Integer)`
- `setSolidFill(String,Number)`
- `setSolidFill(String)`
- `setSolidFill(ThemeColorType,Number)`
- `setSolidFill(ThemeColorType)`
- `setTransparent()`

## Class: Group

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getChildren()`
- `getConnectionSites()`
- `getDescription()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`
- `ungroup()`

## Class: Image

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getAs(String)`
- `getBlob()`
- `getBorder()`
- `getConnectionSites()`
- `getContentUrl()`
- `getDescription()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getLink()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getParentPlaceholder()`
- `getPlaceholderIndex()`
- `getPlaceholderType()`
- `getRotation()`
- `getSourceUrl()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `removeLink()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setLinkSlide(Integer)`
- `setLinkSlide(Slide)`
- `setLinkSlide(SlidePosition)`
- `setLinkUrl(String)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`

## Class: Layout

Supported Methods:
- `getBackground()`
- `getColorScheme()`
- `getGroups()`
- `getImages()`
- `getLayoutName()`
- `getLines()`
- `getMaster()`
- `getObjectId()`
- `getPageElementById(String)`
- `getPageElements()`
- `getPageType()`
- `getPlaceholder(PlaceholderType,Integer)`
- `getPlaceholder(PlaceholderType)`
- `getPlaceholders()`
- `getShapes()`
- `getSheetsCharts()`
- `getTables()`
- `getVideos()`
- `getWordArts()`
- `insertImage(BlobSource,Number,Number,Number,Number)`
- `insertImage(BlobSource)`
- `insertImage(Image)`
- `insertImage(String,Number,Number,Number,Number)`
- `insertImage(String)`
- `insertLine(Line)`
- `insertLine(LineCategory,ConnectionSite,ConnectionSite)`
- `insertLine(LineCategory,Number,Number,Number,Number)`
- `insertShape(Shape)`
- `insertShape(ShapeType,Number,Number,Number,Number)`
- `insertShape(ShapeType)`
- `insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChart(EmbeddedChart)`
- `insertSheetsChart(SheetsChart)`
- `insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChartAsImage(EmbeddedChart)`
- `insertTable(Integer,Integer,Number,Number,Number,Number)`
- `insertTable(Integer,Integer)`
- `insertTable(Table)`
- `insertTextBox(String,Number,Number,Number,Number)`
- `insertTextBox(String)`
- `insertVideo(String,Number,Number,Number,Number)`
- `insertVideo(String)`
- `insertVideo(Video)`
- `remove()`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`
- `selectAsCurrentPage()`

## Class: Line

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getConnectionSites()`
- `getDashStyle()`
- `getDescription()`
- `getEnd()`
- `getEndArrow()`
- `getEndConnection()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getLineCategory()`
- `getLineFill()`
- `getLineType()`
- `getLink()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getStart()`
- `getStartArrow()`
- `getStartConnection()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWeight()`
- `getWidth()`
- `isConnector()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `removeLink()`
- `reroute()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDashStyle(DashStyle)`
- `setDescription(String)`
- `setEnd(Number,Number)`
- `setEnd(Point)`
- `setEndArrow(ArrowStyle)`
- `setEndConnection(ConnectionSite)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setLinkSlide(Integer)`
- `setLinkSlide(Slide)`
- `setLinkSlide(SlidePosition)`
- `setLinkUrl(String)`
- `setRotation(Number)`
- `setStart(Number,Number)`
- `setStart(Point)`
- `setStartArrow(ArrowStyle)`
- `setStartConnection(ConnectionSite)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWeight(Number)`
- `setWidth(Number)`

## Class: LineFill

Supported Methods:
- `getFillType()`
- `getSolidFill()`
- `setSolidFill(Color,Number)`
- `setSolidFill(Color)`
- `setSolidFill(Integer,Integer,Integer,Number)`
- `setSolidFill(Integer,Integer,Integer)`
- `setSolidFill(String,Number)`
- `setSolidFill(String)`
- `setSolidFill(ThemeColorType,Number)`
- `setSolidFill(ThemeColorType)`

## Class: Link

Supported Methods:
- `getLinkedSlide()`
- `getLinkType()`
- `getSlideId()`
- `getSlideIndex()`
- `getSlidePosition()`
- `getUrl()`

## Class: List

Supported Methods:
- `getListId()`
- `getListParagraphs()`

## Class: ListStyle

Supported Methods:
- `applyListPreset(ListPreset)`
- `getGlyph()`
- `getList()`
- `getNestingLevel()`
- `isInList()`
- `removeFromList()`

## Class: Master

Supported Methods:
- `getBackground()`
- `getColorScheme()`
- `getGroups()`
- `getImages()`
- `getLayouts()`
- `getLines()`
- `getObjectId()`
- `getPageElementById(String)`
- `getPageElements()`
- `getPageType()`
- `getPlaceholder(PlaceholderType,Integer)`
- `getPlaceholder(PlaceholderType)`
- `getPlaceholders()`
- `getShapes()`
- `getSheetsCharts()`
- `getTables()`
- `getVideos()`
- `getWordArts()`
- `insertImage(BlobSource,Number,Number,Number,Number)`
- `insertImage(BlobSource)`
- `insertImage(Image)`
- `insertImage(String,Number,Number,Number,Number)`
- `insertImage(String)`
- `insertLine(Line)`
- `insertLine(LineCategory,ConnectionSite,ConnectionSite)`
- `insertLine(LineCategory,Number,Number,Number,Number)`
- `insertShape(Shape)`
- `insertShape(ShapeType,Number,Number,Number,Number)`
- `insertShape(ShapeType)`
- `insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChart(EmbeddedChart)`
- `insertSheetsChart(SheetsChart)`
- `insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChartAsImage(EmbeddedChart)`
- `insertTable(Integer,Integer,Number,Number,Number,Number)`
- `insertTable(Integer,Integer)`
- `insertTable(Table)`
- `insertTextBox(String,Number,Number,Number,Number)`
- `insertTextBox(String)`
- `insertVideo(String,Number,Number,Number,Number)`
- `insertVideo(String)`
- `insertVideo(Video)`
- `remove()`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`
- `selectAsCurrentPage()`

## Class: NotesMaster

Supported Methods:
- `getGroups()`
- `getImages()`
- `getLines()`
- `getObjectId()`
- `getPageElementById(String)`
- `getPageElements()`
- `getPlaceholder(PlaceholderType,Integer)`
- `getPlaceholder(PlaceholderType)`
- `getPlaceholders()`
- `getShapes()`
- `getSheetsCharts()`
- `getTables()`
- `getVideos()`
- `getWordArts()`

## Class: NotesPage

Supported Methods:
- `getGroups()`
- `getImages()`
- `getLines()`
- `getObjectId()`
- `getPageElementById(String)`
- `getPageElements()`
- `getPlaceholder(PlaceholderType,Integer)`
- `getPlaceholder(PlaceholderType)`
- `getPlaceholders()`
- `getShapes()`
- `getSheetsCharts()`
- `getSpeakerNotesShape()`
- `getTables()`
- `getVideos()`
- `getWordArts()`

## Class: PageBackground

Supported Methods:
- `getPictureFill()`
- `getSolidFill()`
- `getType()`
- `isVisible()`
- `setPictureFill(BlobSource)`
- `setPictureFill(String)`
- `setSolidFill(Color,Number)`
- `setSolidFill(Color)`
- `setSolidFill(Integer,Integer,Integer,Number)`
- `setSolidFill(Integer,Integer,Integer)`
- `setSolidFill(String,Number)`
- `setSolidFill(String)`
- `setSolidFill(ThemeColorType,Number)`
- `setSolidFill(ThemeColorType)`
- `setTransparent()`

## Class: PageElement

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `asGroup()`
- `asImage()`
- `asLine()`
- `asShape()`
- `asSpeakerSpotlight()`
- `asTable()`
- `asVideo()`
- `asWordArt()`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getConnectionSites()`
- `getDescription()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`

## Class: PageElementRange

Supported Methods:
- `getPageElements()`

## Class: PageRange

Supported Methods:
- `getPages()`

## Class: Paragraph

Supported Methods:
- `getIndex()`
- `getRange()`

## Class: ParagraphStyle

Supported Methods:
- `getIndentEnd()`
- `getIndentFirstLine()`
- `getIndentStart()`
- `getLineSpacing()`
- `getParagraphAlignment()`
- `getSpaceAbove()`
- `getSpaceBelow()`
- `getSpacingMode()`
- `getTextDirection()`
- `setIndentEnd(Number)`
- `setIndentFirstLine(Number)`
- `setIndentStart(Number)`
- `setLineSpacing(Number)`
- `setParagraphAlignment(ParagraphAlignment)`
- `setSpaceAbove(Number)`
- `setSpaceBelow(Number)`
- `setSpacingMode(SpacingMode)`
- `setTextDirection(TextDirection)`

## Class: PictureFill

Supported Methods:
- `getAs(String)`
- `getBlob()`
- `getContentUrl()`
- `getSourceUrl()`

## Class: Point

Supported Methods:
- `getX()`
- `getY()`

## Class: Presentation

Supported Methods:
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `appendSlide()`
- `appendSlide(Layout)`
- `appendSlide(PredefinedLayout)`
- `appendSlide(Slide,SlideLinkingMode)`
- `appendSlide(Slide)`
- `getEditors()`
- `getId()`
- `getLayouts()`
- `getMasters()`
- `getName()`
- `getNotesMaster()`
- `getNotesPageHeight()`
- `getNotesPageWidth()`
- `getPageElementById(String)`
- `getPageHeight()`
- `getPageWidth()`
- `getSelection()`
- `getSlideById(String)`
- `getSlides()`
- `getUrl()`
- `getViewers()`
- `insertSlide(Integer,Layout)`
- `insertSlide(Integer,PredefinedLayout)`
- `insertSlide(Integer,Slide,SlideLinkingMode)`
- `insertSlide(Integer,Slide)`
- `insertSlide(Integer)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`
- `saveAndClose()`
- `setName(String)`

## Class: Shape

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getAutofit()`
- `getConnectionSites()`
- `getDescription()`
- `getFill()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getLink()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getText()`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `removeLink()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setLinkSlide(Integer)`
- `setLinkSlide(Slide)`
- `setLinkSlide(SlidePosition)`
- `setLinkUrl(String)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`

## Class: Slide

Supported Methods:
- `duplicate()`
- `getBackground()`
- `getColorScheme()`
- `getImages()`
- `getLayout()`
- `getNotesPage()`
- `getObjectId()`
- `getPageElementById(String)`
- `getPageElements()`
- `getShapes()`
- `getTables()`
- `group(PageElement)`
- `insertImage(BlobSource,Number,Number,Number,Number)`
- `insertImage(BlobSource)`
- `insertImage(Image)`
- `insertImage(String,Number,Number,Number,Number)`
- `insertImage(String)`
- `insertLine(Line)`
- `insertLine(LineCategory,ConnectionSite,ConnectionSite)`
- `insertLine(LineCategory,Number,Number,Number,Number)`
- `insertShape(Shape)`
- `insertShape(ShapeType,Number,Number,Number,Number)`
- `insertShape(ShapeType)`
- `insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChart(EmbeddedChart)`
- `insertSheetsChart(SheetsChart)`
- `insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)`
- `insertSheetsChartAsImage(EmbeddedChart)`
- `insertTable(Integer,Integer,Number,Number,Number,Number)`
- `insertTable(Integer,Integer)`
- `insertTable(Table)`
- `insertTextBox(String,Number,Number,Number,Number)`
- `insertTextBox(String)`
- `insertVideo(String,Number,Number,Number,Number)`
- `insertVideo(String)`
- `insertVideo(Video)`
- `move(Integer)`
- `remove()`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`

## Class: SlidesApp

Supported Methods:
- `create(String)`
- `getActivePresentation()`
- `getUi()`
- `newAffineTransformBuilder()`
- `openById(String)`
- `openByUrl(String)`

## Class: SolidFill

Supported Methods:
- `getAlpha()`
- `getColor()`

## Class: Table

Supported Methods:
- `alignOnPage(AlignmentPosition)`
- `appendColumn()`
- `appendRow()`
- `bringForward()`
- `bringToFront()`
- `duplicate()`
- `getCell(Integer,Integer)`
- `getColumn(Integer)`
- `getConnectionSites()`
- `getDescription()`
- `getHeight()`
- `getInherentHeight()`
- `getInherentWidth()`
- `getLeft()`
- `getNumColumns()`
- `getNumRows()`
- `getObjectId()`
- `getPageElementType()`
- `getParentGroup()`
- `getParentPage()`
- `getRotation()`
- `getRow(Integer)`
- `getTitle()`
- `getTop()`
- `getTransform()`
- `getWidth()`
- `insertColumn(Integer)`
- `insertRow(Integer)`
- `preconcatenateTransform(AffineTransform)`
- `remove()`
- `scaleHeight(Number)`
- `scaleWidth(Number)`
- `select()`
- `select(Boolean)`
- `sendBackward()`
- `sendToBack()`
- `setDescription(String)`
- `setHeight(Number)`
- `setLeft(Number)`
- `setRotation(Number)`
- `setTitle(String)`
- `setTop(Number)`
- `setTransform(AffineTransform)`
- `setWidth(Number)`

## Class: TableCell

Supported Methods:
- `getColumnIndex()`
- `getColumnSpan()`
- `getContentAlignment()`
- `getFill()`
- `getHeadCell()`
- `getMergeState()`
- `getParentColumn()`
- `getParentRow()`
- `getParentTable()`
- `getRowIndex()`
- `getRowSpan()`
- `getText()`
- `setContentAlignment(ContentAlignment)`

## Class: TableCellRange

Supported Methods:
- `getTableCells()`

## Class: TableColumn

Supported Methods:
- `getCell(Integer)`
- `getIndex()`
- `getNumCells()`
- `getParentTable()`
- `getWidth()`
- `remove()`

## Class: TableRow

Supported Methods:
- `getCell(Integer)`
- `getIndex()`
- `getMinimumHeight()`
- `getNumCells()`
- `getParentTable()`
- `remove()`

## Class: TextRange

Supported Methods:
- `appendParagraph(String)`
- `appendRange(TextRange,Boolean)`
- `appendRange(TextRange)`
- `appendText(String)`
- `asRenderedString()`
- `asString()`
- `clear()`
- `clear(Integer,Integer)`
- `getAutoTexts()`
- `getEndIndex()`
- `getLength()`
- `getLinks()`
- `getListParagraphs()`
- `getListStyle()`
- `getParagraphs()`
- `getParagraphStyle()`
- `getRange(Integer,Integer)`
- `getRuns()`
- `getStartIndex()`
- `getTextStyle()`
- `insertParagraph(Integer,String)`
- `insertRange(Integer,TextRange,Boolean)`
- `insertRange(Integer,TextRange)`
- `insertText(Integer,String)`
- `isEmpty()`
- `replaceAllText(String,String,Boolean)`
- `replaceAllText(String,String)`
- `select()`
- `setText(String)`

## Class: TextStyle

Supported Methods:
- `getBackgroundColor()`
- `getBaselineOffset()`
- `getFontFamily()`
- `getFontSize()`
- `getFontWeight()`
- `getForegroundColor()`
- `getLink()`
- `hasLink()`
- `isBold()`
- `isItalic()`
- `isSmallCaps()`
- `isStrikethrough()`
- `isUnderline()`
- `setBold(Boolean)`
- `setFontFamily(String)`
- `setFontSize(Number)`
- `setForegroundColor(Color)`
- `setForegroundColor(Integer,Integer,Integer)`
- `setForegroundColor(String)`
- `setForegroundColor(ThemeColorType)`
- `setItalic(Boolean)`
- `setStrikethrough(Boolean)`
- `setUnderline(Boolean)`

## Class: ThemeColor

Supported Methods:
- `getColorType()`
- `getThemeColorType()`

## Class: Video

Supported Methods:
- `getSource()`
- `getThumbnailUrl()`
- `getUrl()`
- `getVideoId()`

## Class: WordArt

Supported Methods:
- `getRenderedText()`

