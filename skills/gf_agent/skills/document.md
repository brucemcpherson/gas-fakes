# Service: document

## Class: Body

Supported Methods:
- `appendImage(BlobSource)`
- `appendImage(InlineImage)`
- `appendListItem(ListItem)`
- `appendListItem(String)`
- `appendPageBreak()`
- `appendPageBreak(PageBreak)`
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `appendTable()`
- `appendTable(String)`
- `appendTable(Table)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getMarginBottom()`
- `getMarginLeft()`
- `getMarginRight()`
- `getMarginTop()`
- `getNumChildren()`
- `getPageHeight()`
- `getPageWidth()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `insertImage(Integer,BlobSource)`
- `insertImage(Integer,InlineImage)`
- `insertListItem(Integer,ListItem)`
- `insertListItem(Integer,String)`
- `insertPageBreak(Integer,PageBreak)`
- `insertPageBreak(Integer)`
- `insertParagraph(Integer,Paragraph)`
- `insertParagraph(Integer,String)`
- `insertTable(Integer,String)`
- `insertTable(Integer,Table)`
- `insertTable(Integer)`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setHeadingAttributes(ParagraphHeading,Object)`
- `setMarginBottom(Number)`
- `setMarginLeft(Number)`
- `setMarginRight(Number)`
- `setMarginTop(Number)`
- `setPageHeight(Number)`
- `setPageWidth(Number)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: Bookmark

Supported Methods:
- `getId()`
- `getPosition()`
- `remove()`

## Class: ContainerElement

Supported Methods:
- `asBody()`
- `asEquation()`
- `asFooterSection()`
- `asFootnoteSection()`
- `asHeaderSection()`
- `asListItem()`
- `asParagraph()`
- `asTable()`
- `asTableCell()`
- `asTableOfContents()`
- `asTableRow()`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setLinkUrl(String)`
- `setTextAlignment(TextAlignment)`

## Class: Date

Supported Methods:
- `copy()`
- `getAttributes()`
- `getDisplayText()`
- `getLocale()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getTimestamp()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: Document

Supported Methods:
- `addBookmark(Position)`
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addFooter()`
- `addHeader()`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `getBody()`
- `getBookmark(String)`
- `getEditors()`
- `getFooter()`
- `getFootnotes()`
- `getHeader()`
- `getId()`
- `getName()`
- `getTabs()`
- `getUrl()`
- `getViewers()`
- `newPosition(Element,Integer)`
- `newRange()`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `saveAndClose()`
- `setName(String)`

## Class: DocumentApp

Supported Methods:
- `create(String)`
- `getActiveDocument()`
- `getUi()`
- `openById(String)`
- `openByUrl(String)`

## Class: DocumentTab

Supported Methods:
- `addBookmark(Position)`
- `addNamedRange(String,Range)`
- `getBody()`
- `getBookmark(String)`
- `getBookmarks()`
- `getFooter()`
- `getFootnotes()`
- `getHeader()`
- `getNamedRangeById(String)`
- `getNamedRanges()`
- `getNamedRanges(String)`
- `newPosition(Element,Integer)`
- `newRange()`

## Class: Equation

Supported Methods:
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setLinkUrl(String)`
- `setTextAlignment(TextAlignment)`

## Class: EquationFunction

Supported Methods:
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getCode()`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setLinkUrl(String)`
- `setTextAlignment(TextAlignment)`

## Class: EquationFunctionArgumentSeparator

Supported Methods:
- `copy()`
- `getAttributes()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: EquationSymbol

Supported Methods:
- `copy()`
- `getAttributes()`
- `getCode()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: FooterSection

Supported Methods:
- `appendHorizontalRule()`
- `appendImage(BlobSource)`
- `appendImage(InlineImage)`
- `appendListItem(ListItem)`
- `appendListItem(String)`
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `appendTable()`
- `appendTable(String)`
- `appendTable(Table)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `insertHorizontalRule(Integer)`
- `insertImage(Integer,BlobSource)`
- `insertImage(Integer,InlineImage)`
- `insertListItem(Integer,ListItem)`
- `insertListItem(Integer,String)`
- `insertParagraph(Integer,Paragraph)`
- `insertParagraph(Integer,String)`
- `insertTable(Integer,String)`
- `insertTable(Integer,Table)`
- `insertTable(Integer)`
- `removeChild(Element)`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: Footnote

Supported Methods:
- `copy()`
- `getAttributes()`
- `getFootnoteContents()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: FootnoteSection

Supported Methods:
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getNextSibling()`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: HeaderSection

Supported Methods:
- `appendHorizontalRule()`
- `appendImage(BlobSource)`
- `appendImage(InlineImage)`
- `appendListItem(ListItem)`
- `appendListItem(String)`
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `appendTable()`
- `appendTable(String)`
- `appendTable(Table)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getImages()`
- `getListItems()`
- `getNumChildren()`
- `getParagraphs()`
- `getParent()`
- `getTables()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `insertHorizontalRule(Integer)`
- `insertImage(Integer,BlobSource)`
- `insertImage(Integer,InlineImage)`
- `insertListItem(Integer,ListItem)`
- `insertListItem(Integer,String)`
- `insertParagraph(Integer,Paragraph)`
- `insertParagraph(Integer,String)`
- `insertTable(Integer,String)`
- `insertTable(Integer,Table)`
- `insertTable(Integer)`
- `removeChild(Element)`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: HorizontalRule

Supported Methods:
- `copy()`
- `getAttributes()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: InlineImage

Supported Methods:
- `copy()`
- `getAltDescription()`
- `getAltTitle()`
- `getAs(String)`
- `getAttributes()`
- `getBlob()`
- `getHeight()`
- `getLinkUrl()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `getWidth()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAltDescription(String)`
- `setAltTitle(String)`
- `setAttributes(Object)`
- `setHeight(Integer)`
- `setLinkUrl(String)`
- `setWidth(Integer)`

## Class: ListItem

Supported Methods:
- `addPositionedImage(BlobSource)`
- `appendInlineImage(BlobSource)`
- `appendInlineImage(InlineImage)`
- `appendText(String)`
- `appendText(Text)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAlignment()`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getGlyphType()`
- `getHeading()`
- `getIndentEnd()`
- `getIndentFirstLine()`
- `getIndentStart()`
- `getLineSpacing()`
- `getLinkUrl()`
- `getListId()`
- `getNestingLevel()`
- `getNextSibling()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getSpacingAfter()`
- `getSpacingBefore()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `insertInlineImage(Integer,BlobSource)`
- `insertInlineImage(Integer,InlineImage)`
- `isAtDocumentEnd()`
- `isLeftToRight()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAlignment(HorizontalAlignment)`
- `setAttributes(Object)`
- `setGlyphType(GlyphType)`
- `setHeading(ParagraphHeading)`
- `setIndentEnd(Number)`
- `setIndentFirstLine(Number)`
- `setIndentStart(Number)`
- `setLeftToRight(Boolean)`
- `setLineSpacing(Number)`
- `setLinkUrl(String)`
- `setListId(ListItem)`
- `setNestingLevel(Integer)`
- `setSpacingAfter(Number)`
- `setSpacingBefore(Number)`
- `setText(String)`
- `setTextAlignment(TextAlignment)`

## Class: PageBreak

Supported Methods:
- `copy()`
- `getAttributes()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: Paragraph

Supported Methods:
- `addPositionedImage(BlobSource)`
- `appendInlineImage(BlobSource)`
- `appendInlineImage(InlineImage)`
- `appendText(String)`
- `appendText(Text)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAlignment()`
- `getAttributes()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getHeading()`
- `getIndentEnd()`
- `getIndentFirstLine()`
- `getIndentStart()`
- `getLineSpacing()`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getSpacingAfter()`
- `getSpacingBefore()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `insertInlineImage(Integer,BlobSource)`
- `insertInlineImage(Integer,InlineImage)`
- `isAtDocumentEnd()`
- `isLeftToRight()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAlignment(HorizontalAlignment)`
- `setAttributes(Object)`
- `setHeading(ParagraphHeading)`
- `setIndentEnd(Number)`
- `setIndentFirstLine(Number)`
- `setIndentStart(Number)`
- `setLeftToRight(Boolean)`
- `setLineSpacing(Number)`
- `setLinkUrl(String)`
- `setSpacingAfter(Number)`
- `setSpacingBefore(Number)`
- `setTextAlignment(TextAlignment)`

## Class: Person

Supported Methods:
- `copy()`
- `getAttributes()`
- `getEmail()`
- `getName()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: Position

Supported Methods:
- `getElement()`
- `getOffset()`
- `insertBookmark()`

## Class: PositionedImage

Supported Methods:
- `getAs(String)`
- `getBlob()`
- `getHeight()`
- `getLayout()`
- `getLeftOffset()`
- `getTopOffset()`
- `getWidth()`

## Class: Range

Supported Methods:
- `getRangeElements()`

## Class: RangeBuilder

Supported Methods:
- `addElement(Element)`
- `addElement(Text,Integer,Integer)`
- `addRange(Range)`
- `build()`

## Class: RangeElement

Supported Methods:
- `getElement()`
- `getEndOffsetInclusive()`
- `getStartOffset()`
- `isPartial()`

## Class: RichLink

Supported Methods:
- `copy()`
- `getAttributes()`
- `getMimeType()`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getTitle()`
- `getType()`
- `getUrl()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `setAttributes(Object)`

## Class: Tab

Supported Methods:
- `asDocumentTab()`
- `getChildTabs()`
- `getId()`
- `getIndex()`
- `getTitle()`

## Class: Table

Supported Methods:
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getBorderColor()`
- `getBorderWidth()`
- `getCell(Integer,Integer)`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getNumRows()`
- `getParent()`
- `getPreviousSibling()`
- `getRow(Integer)`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `isAtDocumentEnd()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setBorderColor(String)`
- `setBorderWidth(Number)`
- `setLinkUrl(String)`
- `setTextAlignment(TextAlignment)`

## Class: TableCell

Supported Methods:
- `appendImage(BlobSource)`
- `appendImage(InlineImage)`
- `appendListItem(ListItem)`
- `appendListItem(String)`
- `appendParagraph(Paragraph)`
- `appendParagraph(String)`
- `appendTable()`
- `appendTable(String)`
- `appendTable(Table)`
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getBackgroundColor()`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getColSpan()`
- `getLinkUrl()`
- `getNextSibling()`
- `getNumChildren()`
- `getPaddingBottom()`
- `getPaddingLeft()`
- `getPaddingRight()`
- `getPaddingTop()`
- `getParent()`
- `getParentRow()`
- `getParentTable()`
- `getPreviousSibling()`
- `getRowSpan()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `getVerticalAlignment()`
- `getWidth()`
- `insertImage(Integer,BlobSource)`
- `insertImage(Integer,InlineImage)`
- `insertListItem(Integer,ListItem)`
- `insertListItem(Integer,String)`
- `insertParagraph(Integer,Paragraph)`
- `insertParagraph(Integer,String)`
- `insertTable(Integer,String)`
- `insertTable(Integer,Table)`
- `insertTable(Integer)`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setBackgroundColor(String)`
- `setLinkUrl(String)`
- `setPaddingBottom(Number)`
- `setPaddingLeft(Number)`
- `setPaddingRight(Number)`
- `setPaddingTop(Number)`
- `setTextAlignment(TextAlignment)`
- `setVerticalAlignment(VerticalAlignment)`
- `setWidth(Number)`

## Class: TableRow

Supported Methods:
- `clear()`
- `copy()`
- `editAsText()`
- `findElement(ElementType,RangeElement)`
- `findElement(ElementType)`
- `findText(String,RangeElement)`
- `findText(String)`
- `getAttributes()`
- `getCell(Integer)`
- `getChild(Integer)`
- `getChildIndex(Element)`
- `getLinkUrl()`
- `getMinimumHeight()`
- `getNextSibling()`
- `getNumCells()`
- `getNumChildren()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getTextAlignment()`
- `getType()`
- `isAtDocumentEnd()`
- `merge()`
- `removeFromParent()`
- `replaceText(String,String)`
- `setAttributes(Object)`
- `setLinkUrl(String)`
- `setMinimumHeight(Number)`
- `setTextAlignment(TextAlignment)`

## Class: Text

Supported Methods:
- `copy()`
- `getAttributes()`
- `getAttributes(Integer)`
- `getBackgroundColor()`
- `getBackgroundColor(Integer)`
- `getFontFamily()`
- `getFontFamily(Integer)`
- `getFontSize()`
- `getFontSize(Integer)`
- `getForegroundColor()`
- `getForegroundColor(Integer)`
- `getLinkUrl()`
- `getLinkUrl(Integer)`
- `getNextSibling()`
- `getParent()`
- `getPreviousSibling()`
- `getText()`
- `getType()`
- `isAtDocumentEnd()`
- `isBold()`
- `isBold(Integer)`
- `isItalic()`
- `isItalic(Integer)`
- `isStrikethrough()`
- `isStrikethrough(Integer)`
- `isUnderline()`
- `isUnderline(Integer)`
- `merge()`
- `removeFromParent()`
- `setAttributes(Integer,Integer,Object)`
- `setAttributes(Object)`
- `setBackgroundColor(Integer,Integer,String)`
- `setBackgroundColor(String)`
- `setBold(Boolean)`
- `setBold(Integer,Integer,Boolean)`
- `setFontFamily(Integer,Integer,String)`
- `setFontFamily(String)`
- `setFontSize(Integer,Integer,Number)`
- `setFontSize(Number)`
- `setForegroundColor(Integer,Integer,String)`
- `setForegroundColor(String)`
- `setItalic(Boolean)`
- `setItalic(Integer,Integer,Boolean)`
- `setLinkUrl(Integer,Integer,String)`
- `setLinkUrl(String)`
- `setStrikethrough(Boolean)`
- `setStrikethrough(Integer,Integer,Boolean)`
- `setUnderline(Boolean)`
- `setUnderline(Integer,Integer,Boolean)`

