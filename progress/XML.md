# [XML](https://developers.google.com/apps-script/reference/xml-service)

This service allows scripts to parse, navigate, and programmatically create XML documents.

## Class: [Attribute](https://developers.google.com/apps-script/reference/xml-service/attribute)

A representation of an XML attribute.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getName()](https://developers.google.com/apps-script/reference/xml-service/attribute#getName()) | Gets the local name of the attribute. If the attribute has a namespace prefix, use getNamespace().getPrefix() to get the prefix. | String | the local name of the attribute | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getNamespace()](https://developers.google.com/apps-script/reference/xml-service/attribute#getNamespace()) | Gets the namespace for the attribute. | [Namespace](#class-namespace) | the namespace for the attribute | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/attribute#getValue()) | Gets the value of the attribute. | String | the value of the attribute | not started |  |
| [setName(String)](https://developers.google.com/apps-script/reference/xml-service/attribute#setName(String)) | Sets the local name of the attribute. To set a namespace prefix for the attribute, use setNamespace(namespace) in conjunction with XmlService.getNamespace(prefix, uri). | [Attribute](#class-attribute) | the attribute, for chaining | not started |  |
| [setNamespace(Namespace)](https://developers.google.com/apps-script/reference/xml-service/attribute#setNamespace(Namespace)) | Sets the namespace for the attribute. The namespace must have a prefix. | [Attribute](#class-attribute) | the attribute, for chaining | not started |  |
| [setValue(String)](https://developers.google.com/apps-script/reference/xml-service/attribute#setValue(String)) | Sets the value of the attribute. | [Attribute](#class-attribute) | the attribute, for chaining | not started |  |

## Class: [Cdata](https://developers.google.com/apps-script/reference/xml-service/cdata)

A representation of an XML CDATASection node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [append(String)](https://developers.google.com/apps-script/reference/xml-service/cdata#append(String)) | Appends the given text to any content that already exists in the node. | [Text](#class-text) | the Text node, for chaining | not started |  |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/cdata#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/cdata#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getText()](https://developers.google.com/apps-script/reference/xml-service/cdata#getText()) | Gets the text value of the Text node. | String | the text value of the Text node | not started |  |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/cdata#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | not started |  |
| [setText(String)](https://developers.google.com/apps-script/reference/xml-service/cdata#setText(String)) | Sets the text value of the Text node. | [Text](#class-text) | the Text node, for chaining | not started |  |

## Class: [Comment](https://developers.google.com/apps-script/reference/xml-service/comment)

A representation of an XML Comment node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/comment#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/comment#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getText()](https://developers.google.com/apps-script/reference/xml-service/comment#getText()) | Gets the text value of the Comment node. | String | the text value of the Comment node | not started |  |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/comment#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | not started |  |
| [setText(String)](https://developers.google.com/apps-script/reference/xml-service/comment#setText(String)) | Sets the text value of the Comment node. | [Comment](#class-comment) | the Comment node, for chaining | not started |  |

## Class: [DocType](https://developers.google.com/apps-script/reference/xml-service/doc-type)

A representation of an XML DocumentType node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/doc-type#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getElementName()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getElementName()) | Gets the name of the root Element node specified in the DocType declaration. | String | the name of the root Element node specified in the DocType declaration | not started |  |
| [getInternalSubset()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getInternalSubset()) | Gets the internal subset data for the DocumentType node. | String | the internal subset data | not started |  |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getPublicId()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getPublicId()) | Gets the public ID of the external subset data for the DocumentType node. | String | the public ID of the external subset data | not started |  |
| [getSystemId()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getSystemId()) | Gets the system ID of the external subset data for the DocumentType node. | String | the system ID of the external subset data | not started |  |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/doc-type#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | not started |  |
| [setElementName(String)](https://developers.google.com/apps-script/reference/xml-service/doc-type#setElementName(String)) | Sets the name of the root Element node to specify in the DocType declaration. | [DocType](#class-doctype) | the DocumentType node, for chaining | not started |  |
| [setInternalSubset(String)](https://developers.google.com/apps-script/reference/xml-service/doc-type#setInternalSubset(String)) | Sets the internal subset data for the DocumentType node. | [DocType](#class-doctype) | the DocumentType node, for chaining | not started |  |
| [setPublicId(String)](https://developers.google.com/apps-script/reference/xml-service/doc-type#setPublicId(String)) | Sets the public ID of the external subset data for the DocumentType node. | [DocType](#class-doctype) | the DocumentType node, for chaining | not started |  |
| [setSystemId(String)](https://developers.google.com/apps-script/reference/xml-service/doc-type#setSystemId(String)) | Sets the system ID of the external subset data for the DocumentType node. | [DocType](#class-doctype) | the DocumentType node, for chaining | not started |  |

## Class: [Document](https://developers.google.com/apps-script/reference/xml-service/document)

A representation of an XML document.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addContent(Content)](https://developers.google.com/apps-script/reference/xml-service/document#addContent(Content)) | Appends the given node to the end of the document. The content argument can be a Content object or any node object that corresponds to a type listed in ContentType. Note, however, that a document can only have one child Element node, which is implicitly the root Element node. | [Document](#class-document) | the document, for chaining | not started |  |
| [addContent(Integer,Content)](https://developers.google.com/apps-script/reference/xml-service/document#addContent(Integer,Content)) |  |  |  | not started |  |
| [cloneContent()](https://developers.google.com/apps-script/reference/xml-service/document#cloneContent()) | Creates unattached copies of all nodes that are immediate children of the document. | [Content[]](#interface-content) | an array of unattached copies of all nodes that are immediate children of the document | not started |  |
| [detachRootElement()](https://developers.google.com/apps-script/reference/xml-service/document#detachRootElement()) | Detaches and returns the document's root Element node. If the document does not have a root Element node, this method returns null. | [Element](#class-element) | the detached Element node, or null if the document does not have a root Element node | not started |  |
| [getAllContent()](https://developers.google.com/apps-script/reference/xml-service/document#getAllContent()) | Gets all nodes that are immediate children of the document. | [Content[]](#interface-content) | an array of all nodes that are immediate children of the document | not started |  |
| [getContent(Integer)](https://developers.google.com/apps-script/reference/xml-service/document#getContent(Integer)) | Gets the node at the given index among all nodes that are immediate children of the document. If there is no node at the given index, this method returns null. | [Content](#interface-content) | the node, or null if there is no node at the given index | not started |  |
| [getContentSize()](https://developers.google.com/apps-script/reference/xml-service/document#getContentSize()) | Gets the number of nodes that are immediate children of the document. | Integer | the number of nodes that are immediate children of the document | not started |  |
| [getDescendants()](https://developers.google.com/apps-script/reference/xml-service/document#getDescendants()) | Gets all nodes that are direct or indirect children of the document, in the order they appear in the document. | [Content[]](#interface-content) | an array of all nodes that are direct or indirect children of the document | not started |  |
| [getDocType()](https://developers.google.com/apps-script/reference/xml-service/document#getDocType()) | Gets the document's DocType declaration. If the document does not have a DocumentType node, this method returns null. | [DocType](#class-doctype) | the DocumentType node, or null if the document does not have a DocumentType node | not started |  |
| [getRootElement()](https://developers.google.com/apps-script/reference/xml-service/document#getRootElement()) | Gets the document's root Element node. If the document does not have a root Element node, this method returns null. | [Element](#class-element) | the root Element node, or null if the document does not have a root Element node | completed | [link](../src/services/xmlservice/fakedocument.js#L13) |
| [hasRootElement()](https://developers.google.com/apps-script/reference/xml-service/document#hasRootElement()) | Determines whether the document has a root Element node. | Boolean | true if the document has a root Element node; false if not | not started |  |
| [removeContent()](https://developers.google.com/apps-script/reference/xml-service/document#removeContent()) | Removes all nodes that are immediate children of the document. | [Content[]](#interface-content) | an array of all nodes that were immediate children of the document before they were removed | not started |  |
| [removeContent(Content)](https://developers.google.com/apps-script/reference/xml-service/document#removeContent(Content)) | Removes the given node, if the node is an immediate child of the document. The content argument can be a Content object or any node object that corresponds to a type listed in ContentType. | Boolean | true if the node was an immediate child and was removed; false if not | not started |  |
| [removeContent(Integer)](https://developers.google.com/apps-script/reference/xml-service/document#removeContent(Integer)) | Removes the node at the given index among all nodes that are immediate children of the document. If there is no node at the given index, this method returns null. | [Content](#interface-content) | the node that was removed, or null if there is no node at the given index | not started |  |
| [setDocType(DocType)](https://developers.google.com/apps-script/reference/xml-service/document#setDocType(DocType)) | Sets the document's DocType declaration. If the document already has a different DocType node, this method overwrites the old node. This method throws an exception if the document already contains the same DocType node that is being set. | [Document](#class-document) | the document, for chaining | not started |  |
| [setRootElement(Element)](https://developers.google.com/apps-script/reference/xml-service/document#setRootElement(Element)) | Sets the document's root Element node. If the document already has a root Element node, this method overwrites the old node. | [Document](#class-document) | the document, for chaining | not started |  |

## Class: [Element](https://developers.google.com/apps-script/reference/xml-service/element)

A representation of an XML Element node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addContent(Content)](https://developers.google.com/apps-script/reference/xml-service/element#addContent(Content)) | Appends the given node as the last child of the Element node. The content argument can be a Element object or any node object that corresponds to a type listed in ContentType. | [Element](#class-element) | the Element node, for chaining | not started |  |
| [addContent(Integer,Content)](https://developers.google.com/apps-script/reference/xml-service/element#addContent(Integer,Content)) |  |  |  | not started |  |
| [cloneContent()](https://developers.google.com/apps-script/reference/xml-service/element#cloneContent()) | Creates unattached copies of all nodes that are immediate children of the {@code Element} node. | [Content[]](#interface-content) | an array of unattached copies of all nodes that are immediate children of the {@code Element} node | not started |  |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/element#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getAllContent()](https://developers.google.com/apps-script/reference/xml-service/element#getAllContent()) | Gets all nodes that are immediate children of the {@code Element} node. | [Content[]](#interface-content) | an array of all nodes that are immediate children of the {@code Element} node | not started |  |
| [getAttribute(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#getAttribute(String,Namespace)) |  |  |  | completed | [link](../src/services/xmlservice/fakeelement.js#L107) |
| [getAttribute(String)](https://developers.google.com/apps-script/reference/xml-service/element#getAttribute(String)) | Gets the attribute for this Element node with the given name and no namespace. If there is no such attribute, this method returns null. | [Attribute](#class-attribute) | the attribute, or null if there is no attribute with the given name and no namespace | completed | [link](../src/services/xmlservice/fakeelement.js#L107) |
| [getAttributes()](https://developers.google.com/apps-script/reference/xml-service/element#getAttributes()) | Gets all attributes for this Element node, in the order they appear in the document. | [Attribute[]](#class-attribute) | an array of all attributes for this Element node | not started |  |
| [getChild(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#getChild(String,Namespace)) |  |  |  | completed | [link](../src/services/xmlservice/fakeelement.js#L57) |
| [getChild(String)](https://developers.google.com/apps-script/reference/xml-service/element#getChild(String)) | Gets the first Element node with the given name and no namespace that is an immediate child of this Element node. If there is no such node, this method returns null. | [Element](#class-element) | the Element node, or null if there is no immediate child Element node with the given name and no namespace | completed | [link](../src/services/xmlservice/fakeelement.js#L57) |
| [getChildren()](https://developers.google.com/apps-script/reference/xml-service/element#getChildren()) | Gets all Element nodes that are immediate children of this Element node, in the order they appear in the document. | [Element[]](#class-element) | an array of all Element nodes that are immediate children of this Element node | completed | [link](../src/services/xmlservice/fakeelement.js#L58) |
| [getChildren(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#getChildren(String,Namespace)) |  |  |  | completed | [link](../src/services/xmlservice/fakeelement.js#L58) |
| [getChildren(String)](https://developers.google.com/apps-script/reference/xml-service/element#getChildren(String)) | Gets all Element nodes with the given name and no namespace that are immediate children of this Element node, in the order they appear in the document. | [Element[]](#class-element) | an array of all Element nodes with the given name and no namespace that are immediate children of this Element node | completed | [link](../src/services/xmlservice/fakeelement.js#L58) |
| [getChildText(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#getChildText(String,Namespace)) |  |  |  | completed | [link](../src/services/xmlservice/fakeelement.js#L123) |
| [getChildText(String)](https://developers.google.com/apps-script/reference/xml-service/element#getChildText(String)) | Gets the text value of the node with the given name and no namespace, if the node is an immediate child of the Element node. If there is no such node, this method returns null. | String | the text value of the child node, or null if there is no immediate child node with the given name and no namespace | completed | [link](../src/services/xmlservice/fakeelement.js#L123) |
| [getContent(Integer)](https://developers.google.com/apps-script/reference/xml-service/element#getContent(Integer)) | Gets the node at the given index among all nodes that are immediate children of the {@code Element} node. If there is no node at the given index, this method returns null. | [Content](#interface-content) | the node, or null if there is no node at the given index | not started |  |
| [getContentSize()](https://developers.google.com/apps-script/reference/xml-service/element#getContentSize()) | Gets the number of nodes that are immediate children of the {@code Element} node. | Integer | the number of nodes that are immediate children of the {@code Element} node | not started |  |
| [getDescendants()](https://developers.google.com/apps-script/reference/xml-service/element#getDescendants()) | Gets all nodes that are direct or indirect children of the {@code Element} node, in the order they appear in the document. | [Content[]](#interface-content) | an array of all nodes that are direct or indirect children of the {@code Element} node | not started |  |
| [getDocument()](https://developers.google.com/apps-script/reference/xml-service/element#getDocument()) | Gets the XML document that contains the {@code Element} node. | [Document](#class-document) | the document that contains the {@code Element} node | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/xml-service/element#getName()) | Gets the local name of the Element node. If the node has a namespace prefix, use getQualifiedName() or getNamespace().getPrefix() to get the prefix. | String | the local name of the Element node | completed | [link](../src/services/xmlservice/fakeelement.js#L18) |
| [getNamespace()](https://developers.google.com/apps-script/reference/xml-service/element#getNamespace()) | Gets the namespace for the Element node. | [Namespace](#class-namespace) | the namespace for the Element node | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getNamespace(String)](https://developers.google.com/apps-script/reference/xml-service/element#getNamespace(String)) | Gets the namespace with the given prefix for the Element node. | [Namespace](#class-namespace) | the namespace with the given prefix for the Element node | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/element#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getQualifiedName()](https://developers.google.com/apps-script/reference/xml-service/element#getQualifiedName()) | Gets the local name and namespace prefix of the Element node, in the form [namespacePrefix]:[localName]. If the node does not have a namespace prefix, use getName(). | String | the local name and namespace prefix of the Element node, in the form [namespacePrefix]:[localName] | completed | [link](../src/services/xmlservice/fakeelement.js#L26) |
| [getText()](https://developers.google.com/apps-script/reference/xml-service/element#getText()) | Gets the text value of the Element node. | String | the text value of the Element node | completed | [link](../src/services/xmlservice/fakeelement.js#L34) |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/element#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | completed | [link](../src/services/xmlservice/fakeelement.js#L47) |
| [isAncestorOf(Element)](https://developers.google.com/apps-script/reference/xml-service/element#isAncestorOf(Element)) | Determines whether this Element node is a direct or indirect parent of a given Element node. | Boolean | true if this Element node is a direct or indirect parent of the given Element node; false if not | not started |  |
| [isRootElement()](https://developers.google.com/apps-script/reference/xml-service/element#isRootElement()) | Determines whether the Element node is the document's root node. | Boolean | true if the Element node is the document's root node; false if not | not started |  |
| [removeAttribute(Attribute)](https://developers.google.com/apps-script/reference/xml-service/element#removeAttribute(Attribute)) | Removes the given attribute for this Element node, if such an attribute exists. | Boolean | true if the attribute existed and was removed; false if not | not started |  |
| [removeAttribute(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#removeAttribute(String,Namespace)) |  |  |  | not started |  |
| [removeAttribute(String)](https://developers.google.com/apps-script/reference/xml-service/element#removeAttribute(String)) | Removes the attribute for this Element node with the given name and no namespace, if such an attribute exists. | Boolean | true if the attribute existed and was removed; false if not | not started |  |
| [removeContent()](https://developers.google.com/apps-script/reference/xml-service/element#removeContent()) | Removes all nodes that are immediate children of the {@code Element} node. | [Content[]](#interface-content) | an array of all nodes that were immediate children of the {@code Element} node before they were removed | not started |  |
| [removeContent(Content)](https://developers.google.com/apps-script/reference/xml-service/element#removeContent(Content)) | Removes the given node, if the node is an immediate child of the {@code Element} node. The content argument can be a Element object or any node object that corresponds to a type listed in ContentType. | Boolean | true if the node was an immediate child and was removed; false if not | not started |  |
| [removeContent(Integer)](https://developers.google.com/apps-script/reference/xml-service/element#removeContent(Integer)) | Removes the node at the given index among all nodes that are immediate children of the {@code Element} node. If there is no node at the given index, this method returns null. | [Content](#interface-content) | the node that was removed, or null if there is no node at the given index | not started |  |
| [setAttribute(Attribute)](https://developers.google.com/apps-script/reference/xml-service/element#setAttribute(Attribute)) | Sets the given attribute for this Element node. | [Element](#class-element) | the Element node, for chaining | not started |  |
| [setAttribute(String,String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#setAttribute(String,String,Namespace)) |  |  |  | not started |  |
| [setAttribute(String,String)](https://developers.google.com/apps-script/reference/xml-service/element#setAttribute(String,String)) |  |  |  | not started |  |
| [setName(String)](https://developers.google.com/apps-script/reference/xml-service/element#setName(String)) | Sets the local name of the Element node. To set a namespace prefix for the node, use setNamespace(namespace) in conjunction with XmlService.getNamespace(prefix, uri). | [Element](#class-element) | the Element node, for chaining | not started |  |
| [setNamespace(Namespace)](https://developers.google.com/apps-script/reference/xml-service/element#setNamespace(Namespace)) | Sets the namespace for the Element node. | [Element](#class-element) | the Element node, for chaining | not started |  |
| [setText(String)](https://developers.google.com/apps-script/reference/xml-service/element#setText(String)) | Sets the text value of the Element node. If the node already contains a text value or any child nodes, this method overwrites the old content. To append or insert content instead, use addContent(content) or addContent(index, content). | [Element](#class-element) | the Element node, for chaining | not started |  |

## Class: [EntityRef](https://developers.google.com/apps-script/reference/xml-service/entity-ref)

A representation of an XML EntityReference node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#getName()) | Gets the name of the EntityReference node. | String | the name of the EntityReference node | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getPublicId()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#getPublicId()) | Gets the public ID of the EntityReference node. If the node does not have a public ID, this method returns null. | String | the public ID of the EntityReference node, or null if it has none | not started |  |
| [getSystemId()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#getSystemId()) | Gets the system ID of the EntityReference node. If the node does not have a system ID, this method returns null. | String | the system ID of the EntityReference node, or null if it has none | not started |  |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/entity-ref#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | not started |  |
| [setName(String)](https://developers.google.com/apps-script/reference/xml-service/entity-ref#setName(String)) | Sets the name of the EntityReference node. | [EntityRef](#class-entityref) | the EntityReference node, for chaining | not started |  |
| [setPublicId(String)](https://developers.google.com/apps-script/reference/xml-service/entity-ref#setPublicId(String)) | Sets the public ID of the EntityReference node. | [EntityRef](#class-entityref) | the EntityReference node, for chaining | not started |  |
| [setSystemId(String)](https://developers.google.com/apps-script/reference/xml-service/entity-ref#setSystemId(String)) | Sets the system ID of the EntityReference node. | [EntityRef](#class-entityref) | the EntityReference node, for chaining | not started |  |

## Class: [Format](https://developers.google.com/apps-script/reference/xml-service/format)

A formatter for outputting an XML document, with three pre-defined formats that can be further customized.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [format(Document)](https://developers.google.com/apps-script/reference/xml-service/format#format(Document)) | Outputs the given Document as a formatted string. | String | the formatted document | not started |  |
| [format(Element)](https://developers.google.com/apps-script/reference/xml-service/format#format(Element)) | Outputs the given Element node as a formatted string. | String | the formatted element | not started |  |
| [setEncoding(String)](https://developers.google.com/apps-script/reference/xml-service/format#setEncoding(String)) | Sets the character encoding that the formatter should use. The encoding argument must be an accepted XML encoding like ISO-8859-1, US-ASCII, UTF-8, or UTF-16. | [Format](#class-format) | the formatter, for chaining | not started |  |
| [setIndent(String)](https://developers.google.com/apps-script/reference/xml-service/format#setIndent(String)) | Sets the string used to indent child nodes relative to their parents. Setting an indent other than null will cause the formatter to insert a line break after every node. | [Format](#class-format) | the formatter, for chaining | not started |  |
| [setLineSeparator(String)](https://developers.google.com/apps-script/reference/xml-service/format#setLineSeparator(String)) | Sets the string to insert whenever the formatter would normally insert a line break. The three pre-defined formatters have different conditions under which they insert a line break. The default line separator is \r\n. | [Format](#class-format) | the formatter, for chaining | not started |  |
| [setOmitDeclaration(Boolean)](https://developers.google.com/apps-script/reference/xml-service/format#setOmitDeclaration(Boolean)) | Sets whether the formatter should omit the XML declaration, such as <?xml version="1.0" encoding="UTF-8"?>. | [Format](#class-format) | the formatter, for chaining | not started |  |
| [setOmitEncoding(Boolean)](https://developers.google.com/apps-script/reference/xml-service/format#setOmitEncoding(Boolean)) | Sets whether the formatter should omit the encoding in the XML declaration, such as the encoding field in <?xml version="1.0" encoding="UTF-8"?>. | [Format](#class-format) | the formatter, for chaining | not started |  |

## Class: [Namespace](https://developers.google.com/apps-script/reference/xml-service/namespace)

A representation of an XML namespace.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getPrefix()](https://developers.google.com/apps-script/reference/xml-service/namespace#getPrefix()) | Gets the prefix for the namespace. | String | the prefix for the namespace | completed | [link](../src/services/xmlservice/fakenamespace.js#L19) |
| [getURI()](https://developers.google.com/apps-script/reference/xml-service/namespace#getURI()) | Gets the URI for the namespace. | String | the URI for the namespace | completed | [link](../src/services/xmlservice/fakenamespace.js#L27) |

## Class: [ProcessingInstruction](https://developers.google.com/apps-script/reference/xml-service/processing-instruction)

A representation of an XML ProcessingInstruction node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/processing-instruction#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getData()](https://developers.google.com/apps-script/reference/xml-service/processing-instruction#getData()) | Gets the raw data for every instruction in the ProcessingInstruction node. | String | the raw data for every instruction in the ProcessingInstruction node | not started |  |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/processing-instruction#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getTarget()](https://developers.google.com/apps-script/reference/xml-service/processing-instruction#getTarget()) | Gets the target for the ProcessingInstruction node. | String | the target for the ProcessingInstruction node | not started |  |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/processing-instruction#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | not started |  |

## Class: [Text](https://developers.google.com/apps-script/reference/xml-service/text)

A representation of an XML Text node.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [append(String)](https://developers.google.com/apps-script/reference/xml-service/text#append(String)) | Appends the given text to any content that already exists in the node. | [Text](#class-text) | the Text node, for chaining | not started |  |
| [detach()](https://developers.google.com/apps-script/reference/xml-service/text#detach()) | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | [Content](#interface-content) | the detached node | not started |  |
| [getParentElement()](https://developers.google.com/apps-script/reference/xml-service/text#getParentElement()) | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | [Element](#class-element) | the parent Element node | not started |  |
| [getText()](https://developers.google.com/apps-script/reference/xml-service/text#getText()) | Gets the text value of the Text node. | String | the text value of the Text node | completed | [link](../src/services/xmlservice/fakeelement.js#L34) |
| [getValue()](https://developers.google.com/apps-script/reference/xml-service/text#getValue()) | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | String | the text value of all nodes that are direct or indirect children of the node | completed | [link](../src/services/xmlservice/fakeelement.js#L47) |
| [setText(String)](https://developers.google.com/apps-script/reference/xml-service/text#setText(String)) | Sets the text value of the Text node. | [Text](#class-text) | the Text node, for chaining | not started |  |

## Class: [XmlService](https://developers.google.com/apps-script/reference/xml-service/xml-service)

This service allows scripts to parse, navigate, and programmatically create XML documents.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [createCdata(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createCdata(String)) | Creates an unattached CDATASection node with the given value. | [Cdata](#class-cdata) | the newly created CDATASection node | not started |  |
| [createComment(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createComment(String)) | Creates an unattached Comment node with the given value. | [Comment](#class-comment) | the newly created Comment node | not started |  |
| [createDocType(String,String,String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createDocType(String,String,String)) |  |  |  | not started |  |
| [createDocType(String,String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createDocType(String,String)) |  |  |  | not started |  |
| [createDocType(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createDocType(String)) | Creates an unattached DocumentType node for the root Element node with the given name. | [DocType](#class-doctype) | the newly created DocumentType node | not started |  |
| [createDocument()](https://developers.google.com/apps-script/reference/xml-service/xml-service#createDocument()) | Creates an empty XML document. | [Document](#class-document) | the newly created document | not started |  |
| [createDocument(Element)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createDocument(Element)) | Creates an XML document with the given root Element node. | [Document](#class-document) | the newly created document | not started |  |
| [createElement(String,Namespace)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createElement(String,Namespace)) |  |  |  | not started |  |
| [createElement(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createElement(String)) | Creates an unattached Element node with the given local name and no namespace. | [Element](#class-element) | the newly created Element node | not started |  |
| [createText(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#createText(String)) | Creates an unattached Text node with the given value. | [Text](#class-text) | the newly created Text node | not started |  |
| [getCompactFormat()](https://developers.google.com/apps-script/reference/xml-service/xml-service#getCompactFormat()) | Creates a Format object for outputting a compact XML document. The formatter defaults to UTF-8 encoding, no indentation, and no additional line breaks, but includes the XML declaration and its encoding. | [Format](#class-format) | the newly created formatter | not started |  |
| [getNamespace(String,String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#getNamespace(String,String)) |  |  |  | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getNamespace(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#getNamespace(String)) | Creates a Namespace with the given URI. | [Namespace](#class-namespace) | the newly created namespace | completed | [link](../src/services/xmlservice/app.js#L41) |
| [getNoNamespace()](https://developers.google.com/apps-script/reference/xml-service/xml-service#getNoNamespace()) | Creates a Namespace that represents the absence of a real namespace. | [Namespace](#class-namespace) | the newly created namespace | not started |  |
| [getPrettyFormat()](https://developers.google.com/apps-script/reference/xml-service/xml-service#getPrettyFormat()) | Creates a Format object for outputting a human-readable XML document. The formatter defaults to UTF-8 encoding, two-space indentation, \r\n line separators after every node, and includes the XML declaration and its encoding. | [Format](#class-format) | the newly created formatter | not started |  |
| [getRawFormat()](https://developers.google.com/apps-script/reference/xml-service/xml-service#getRawFormat()) | Creates a Format object for outputting a raw XML document. The formatter defaults to UTF-8 encoding, no indentation and no line breaks other than those provided in the XML document itself, and includes the XML declaration and its encoding. | [Format](#class-format) | the newly created formatter | not started |  |
| [getXmlNamespace()](https://developers.google.com/apps-script/reference/xml-service/xml-service#getXmlNamespace()) | Creates a Namespace with the standard xml prefix. | [Namespace](#class-namespace) | the newly created namespace | not started |  |
| [parse(String)](https://developers.google.com/apps-script/reference/xml-service/xml-service#parse(String)) | Creates an Document from the given XML, without validating the XML. | [Document](#class-document) | the newly created document | completed | [link](../src/services/xmlservice/app.js#L2) |

## Enum: [ContentType](https://developers.google.com/apps-script/reference/xml-service/content-type)

An enumeration representing the types of XML content nodes.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CDATA | An XML CDATASection node. | not started |  |
| COMMENT | An XML Comment node. | not started |  |
| DOCTYPE | An XML DocumentType node. | not started |  |
| ELEMENT | An XML Element node. | not started |  |
| ENTITYREF | An XML EntityReference node. | not started |  |
| PROCESSINGINSTRUCTION | An XML ProcessingInstruction node. | not started |  |
| TEXT | An XML Text node. | not started |  |

## Interface: [Content](https://developers.google.com/apps-script/reference/xml-service/content)

A representation of a generic XML node.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| asCdata() | Casts the node as a CDATASection node for the purposes of autocomplete. If the node's ContentType is not already CDATA, this method returns null. | not started |  |
| asComment() | Casts the node as a Comment node for the purposes of autocomplete. If the node's ContentType is not already COMMENT, this method returns null. | not started |  |
| asDocType() | Casts the node as a DocumentType node for the purposes of autocomplete. If the node's ContentType is not already DOCTYPE, this method returns null. | not started |  |
| asElement() | Casts the node as an Element node for the purposes of autocomplete. If the node's ContentType is not already ELEMENT, this method returns null. | not started |  |
| asEntityRef() | Casts the node as a EntityReference node for the purposes of autocomplete. If the node's ContentType is not already ENTITYREF, this method returns null. | not started |  |
| asProcessingInstruction() | Casts the node as a ProcessingInstruction node for the purposes of autocomplete. If the node's ContentType is not already PROCESSINGINSTRUCTION, this method returns null. | not started |  |
| asText() | Casts the node as a Text node for the purposes of autocomplete. If the node's ContentType is not already TEXT, this method returns null. | not started |  |
| detach() | Detaches the node from its parent Element node. If the node does not have a parent, this method has no effect. | not started |  |
| getParentElement() | Gets the node's parent Element node. If the node does not have a parent, this method returns null. | not started |  |
| getType() | Gets the node's content type. | not started |  |
| getValue() | Gets the text value of all nodes that are direct or indirect children of the node, in the order they appear in the document. | not started |  |

