# Service: xml

## Class: Attribute

Supported Methods:
- `getName()`
- `getNamespace()`
- `getValue()`
- `setName(String)`
- `setNamespace(Namespace)`
- `setValue(String)`

## Class: Cdata

Supported Methods:
- `append(String)`
- `detach()`
- `getParentElement()`
- `getText()`
- `getValue()`
- `setText(String)`

## Class: Comment

Supported Methods:
- `detach()`
- `getParentElement()`
- `getText()`
- `getValue()`
- `setText(String)`

## Class: DocType

Supported Methods:
- `detach()`
- `getElementName()`
- `getInternalSubset()`
- `getParentElement()`
- `getPublicId()`
- `getSystemId()`
- `getValue()`
- `setElementName(String)`
- `setInternalSubset(String)`
- `setPublicId(String)`
- `setSystemId(String)`

## Class: Document

Supported Methods:
- `addContent(Content)`
- `addContent(Integer,Content)`
- `cloneContent()`
- `detachRootElement()`
- `getAllContent()`
- `getContent(Integer)`
- `getContentSize()`
- `getDescendants()`
- `getDocType()`
- `getRootElement()`
- `hasRootElement()`
- `removeContent()`
- `removeContent(Content)`
- `removeContent(Integer)`
- `setDocType(DocType)`
- `setRootElement(Element)`

## Class: Element

Supported Methods:
- `addContent(Content)`
- `addContent(Integer,Content)`
- `cloneContent()`
- `detach()`
- `getAllContent()`
- `getAttribute(String,Namespace)`
- `getAttribute(String)`
- `getAttributes()`
- `getChild(String,Namespace)`
- `getChild(String)`
- `getChildren()`
- `getChildren(String,Namespace)`
- `getChildren(String)`
- `getChildText(String,Namespace)`
- `getChildText(String)`
- `getContent(Integer)`
- `getContentSize()`
- `getDescendants()`
- `getDocument()`
- `getName()`
- `getNamespace()`
- `getNamespace(String)`
- `getParentElement()`
- `getQualifiedName()`
- `getText()`
- `getValue()`
- `isAncestorOf(Element)`
- `isRootElement()`
- `removeAttribute(Attribute)`
- `removeAttribute(String,Namespace)`
- `removeAttribute(String)`
- `removeContent()`
- `removeContent(Content)`
- `removeContent(Integer)`
- `setAttribute(Attribute)`
- `setAttribute(String,String,Namespace)`
- `setAttribute(String,String)`
- `setName(String)`
- `setNamespace(Namespace)`
- `setText(String)`

## Class: EntityRef

Supported Methods:
- `detach()`
- `getName()`
- `getParentElement()`
- `getPublicId()`
- `getSystemId()`
- `getValue()`
- `setName(String)`
- `setPublicId(String)`
- `setSystemId(String)`

## Class: Format

Supported Methods:
- `format(Document)`
- `format(Element)`
- `setEncoding(String)`
- `setIndent(String)`
- `setLineSeparator(String)`
- `setOmitDeclaration(Boolean)`
- `setOmitEncoding(Boolean)`

## Class: Namespace

Supported Methods:
- `getPrefix()`
- `getURI()`

## Class: ProcessingInstruction

Supported Methods:
- `detach()`
- `getData()`
- `getParentElement()`
- `getTarget()`
- `getValue()`

## Class: Text

Supported Methods:
- `append(String)`
- `detach()`
- `getParentElement()`
- `getText()`
- `getValue()`
- `setText(String)`

## Class: XmlService

Supported Methods:
- `createCdata(String)`
- `createComment(String)`
- `createDocType(String,String,String)`
- `createDocType(String,String)`
- `createDocType(String)`
- `createDocument()`
- `createDocument(Element)`
- `createElement(String,Namespace)`
- `createElement(String)`
- `createText(String)`
- `getCompactFormat()`
- `getNamespace(String,String)`
- `getNamespace(String)`
- `getNoNamespace()`
- `getPrettyFormat()`
- `getRawFormat()`
- `getXmlNamespace()`
- `parse(String)`

