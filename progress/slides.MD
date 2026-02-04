# [Slides](https://developers.google.com/apps-script/reference/slides)

This service allows scripts to create, access, and modify Google Slides files. See also the Google Slides documentation for more details on the underlying features of the Slides service.

## Class: [AffineTransform](https://developers.google.com/apps-script/reference/slides/affine-transform)

A 3x3 matrix used to transform source coordinates (x1, y1) into destination coordinates (x2, y2) according to matrix multiplication:

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getScaleX()](https://developers.google.com/apps-script/reference/slides/affine-transform#getScaleX()) | Gets the X coordinate scaling element. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L18) |
| [getScaleY()](https://developers.google.com/apps-script/reference/slides/affine-transform#getScaleY()) | Gets the Y coordinate scaling element. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L22) |
| [getShearX()](https://developers.google.com/apps-script/reference/slides/affine-transform#getShearX()) | Gets the X coordinate shearing element. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L26) |
| [getShearY()](https://developers.google.com/apps-script/reference/slides/affine-transform#getShearY()) | Gets the Y coordinate shearing element. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L30) |
| [getTranslateX()](https://developers.google.com/apps-script/reference/slides/affine-transform#getTranslateX()) | Gets the X coordinate translation element in points. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L34) |
| [getTranslateY()](https://developers.google.com/apps-script/reference/slides/affine-transform#getTranslateY()) | Gets the Y coordinate translation element in points. |  | Number | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L38) |
| [toBuilder()](https://developers.google.com/apps-script/reference/slides/affine-transform#toBuilder()) | Returns a new AffineTransformBuilder based on this transform. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransform.js#L42) |

## Class: [AffineTransformBuilder](https://developers.google.com/apps-script/reference/slides/affine-transform-builder)

A builder for AffineTransform objects. Defaults to the identity transform.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [build()](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#build()) | Creates an AffineTransform object initialized with the elements set in the builder. |  | AffineTransform | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L20) |
| [setScaleX(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setScaleX(Number)) | Sets the X coordinate scaling element and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L31) |
| [setScaleY(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setScaleY(Number)) | Sets the Y coordinate scaling element and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L36) |
| [setShearX(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setShearX(Number)) | Sets the X coordinate shearing element and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L41) |
| [setShearY(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setShearY(Number)) | Sets the Y coordinate shearing element and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L46) |
| [setTranslateX(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setTranslateX(Number)) | Sets the X coordinate translation element in points, and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L51) |
| [setTranslateY(Number)](https://developers.google.com/apps-script/reference/slides/affine-transform-builder#setTranslateY(Number)) | Sets the Y coordinate translation element in points, and returns the builder. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeaffinetransformbuilder.js#L56) |

## Class: [Autofit](https://developers.google.com/apps-script/reference/slides/autofit)

Describes the autofit settings of a shape. If a change is made that might affect text fitting within its bounding text box:

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [disableAutofit()](https://developers.google.com/apps-script/reference/slides/autofit#disableAutofit()) | Sets the AutofitType of a shape to AutofitType.NONE. | [Autofit](#class-autofit) | The autofit, for chaining. | completed | [link](../src/services/slidesapp/fakeautofit.js#L30) |
| [getAutofitType()](https://developers.google.com/apps-script/reference/slides/autofit#getAutofitType()) | Gets the AutofitType of the shape. | [AutofitType](#enum-autofittype) | The autofit type. | completed | [link](../src/services/slidesapp/fakeautofit.js#L25) |
| [getFontScale()](https://developers.google.com/apps-script/reference/slides/autofit#getFontScale()) | Gets the font scale applied to the shape. For shapes with AutofitType AutofitType.NONE or AutofitType.SHAPE_AUTOFIT, this value is the default value of 1. For AutofitType.TEXT_AUTOFIT, the value returned is what the original font size is multiplied by to fit within the shape. | Number | The font scale. | completed | [link](../src/services/slidesapp/fakeautofit.js#L38) |
| [getLineSpacingReduction()](https://developers.google.com/apps-script/reference/slides/autofit#getLineSpacingReduction()) | Gets the line spacing reduction applied to the shape. For shapes with AutofitType AutofitType.NONE or AutofitType.SHAPE_AUTOFIT, this value is the default value of 0. For AutofitType.TEXT_AUTOFIT, the returned value is the amount of spacing subtracted from the original spacing to make the text fit within the shape. | Number | The line spacing. | completed | [link](../src/services/slidesapp/fakeautofit.js#L42) |

## Class: [AutoText](https://developers.google.com/apps-script/reference/slides/auto-text)

An element of text that is dynamically replaced with content that can change over time, such as a slide number.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAutoTextType()](https://developers.google.com/apps-script/reference/slides/auto-text#getAutoTextType()) | Returns the type of auto text. Returns null if the auto text has been deleted. |  | AutoTextType | completed | [link](../src/services/slidesapp/fakeautotext.js#L22) |
| [getIndex()](https://developers.google.com/apps-script/reference/slides/auto-text#getIndex()) | Returns the index of the auto text. Returns null if the auto text has been deleted. |  | Integer | completed | [link](../src/services/slidesapp/fakeautotext.js#L14) |
| [getRange()](https://developers.google.com/apps-script/reference/slides/auto-text#getRange()) | Returns a TextRange spanning the auto text. Returns null if the auto text has been deleted. |  | TextRange | completed | [link](../src/services/slidesapp/fakeautotext.js#L18) |

## Class: [Border](https://developers.google.com/apps-script/reference/slides/border)

Describes the border around an element.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getDashStyle()](https://developers.google.com/apps-script/reference/slides/border#getDashStyle()) | Gets the DashStyle of the border. |  | DashStyle | not started |  |
| [getLineFill()](https://developers.google.com/apps-script/reference/slides/border#getLineFill()) | Gets the LineFill of the border. |  | LineFill | not started |  |
| [getWeight()](https://developers.google.com/apps-script/reference/slides/border#getWeight()) | Gets the thickness of the border in points. Returns null if the element does not have a border. |  | Number | not started |  |
| [isVisible()](https://developers.google.com/apps-script/reference/slides/border#isVisible()) | Gets whether the border is visible or not. |  | Boolean | not started |  |
| [setDashStyle(DashStyle)](https://developers.google.com/apps-script/reference/slides/border#setDashStyle(DashStyle)) | Sets the DashStyle of the border. |  | Border | not started |  |
| [setTransparent()](https://developers.google.com/apps-script/reference/slides/border#setTransparent()) | Sets the border to be transparent. |  | Border | not started |  |
| [setWeight(Number)](https://developers.google.com/apps-script/reference/slides/border#setWeight(Number)) | Sets the thickness of the border in points. |  | Border | not started |  |

## Class: [Color](https://developers.google.com/apps-script/reference/slides/color)

An opaque color

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [asRgbColor()](https://developers.google.com/apps-script/reference/slides/color#asRgbColor()) | Converts this color to an RgbColor. |  | RgbColor | completed | [link](../src/services/common/fakecolor.js#L25) |
| [asThemeColor()](https://developers.google.com/apps-script/reference/slides/color#asThemeColor()) | Converts this color to a ThemeColor. |  | ThemeColor | completed | [link](../src/services/common/fakecolor.js#L29) |
| [getColorType()](https://developers.google.com/apps-script/reference/slides/color#getColorType()) | Get the type of this color. | ColorType | The color type. | not started |  |

## Class: [ColorScheme](https://developers.google.com/apps-script/reference/slides/color-scheme)

A color scheme defines a mapping from members of ThemeColorType to the actual colors used to render them.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getConcreteColor(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/color-scheme#getConcreteColor(ThemeColorType)) | Returns the concrete Color associated with the ThemeColorType in this color scheme. | [Color](#class-color) | The concrete color corresponding the theme color type in this scheme. | not started |  |
| [getThemeColors()](https://developers.google.com/apps-script/reference/slides/color-scheme#getThemeColors()) | Returns a list of all possible theme color types in a color scheme. | [ThemeColorType[]](#enum-themecolortype) | The possible theme color types in this scheme. | not started |  |
| [setConcreteColor(ThemeColorType,Color)](https://developers.google.com/apps-script/reference/slides/color-scheme#setConcreteColor(ThemeColorType,Color)) |  |  |  | not started |  |
| [setConcreteColor(ThemeColorType,Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/color-scheme#setConcreteColor(ThemeColorType,Integer,Integer,Integer)) |  |  |  | not started |  |
| [setConcreteColor(ThemeColorType,String)](https://developers.google.com/apps-script/reference/slides/color-scheme#setConcreteColor(ThemeColorType,String)) |  |  |  | not started |  |

## Class: [ConnectionSite](https://developers.google.com/apps-script/reference/slides/connection-site)

The connection site on a PageElement that can connect to a connector.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getIndex()](https://developers.google.com/apps-script/reference/slides/connection-site#getIndex()) | Returns the index of the connection site. The index is unique among all the connection sites on the same page element. | Integer | The index of the connection site. | completed | [link](../src/services/slidesapp/fakeconnectionsite.js#L13) |
| [getPageElement()](https://developers.google.com/apps-script/reference/slides/connection-site#getPageElement()) | Returns the PageElement that the connection site is on. | [PageElement](#class-pageelement) | The page element of the connection site. | completed | [link](../src/services/slidesapp/fakeconnectionsite.js#L17) |

## Class: [Fill](https://developers.google.com/apps-script/reference/slides/fill)

Describes the page element's background

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getSolidFill()](https://developers.google.com/apps-script/reference/slides/fill#getSolidFill()) | Get the solid fill of this background, or null if the fill type is not FillType.SOLID. | [SolidFill](#class-solidfill) | The solid fill setting, or null if this fill type is not solid. | not started |  |
| [getType()](https://developers.google.com/apps-script/reference/slides/fill#getType()) | Get the type of this fill. | [FillType](#enum-filltype) | The type of this fill. | not started |  |
| [isVisible()](https://developers.google.com/apps-script/reference/slides/fill#isVisible()) | Whether the background is visible. | Boolean | true if the background is visible; false otherwise. | not started |  |
| [setSolidFill(Color,Number)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(Color,Number)) |  |  |  | not started |  |
| [setSolidFill(Color)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(Color)) | Sets the solid fill to the given Color. |  |  | not started |  |
| [setSolidFill(Integer,Integer,Integer,Number)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(Integer,Integer,Integer,Number)) |  |  |  | not started |  |
| [setSolidFill(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(Integer,Integer,Integer)) |  |  |  | not started |  |
| [setSolidFill(String,Number)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(String,Number)) |  |  |  | not started |  |
| [setSolidFill(String)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(String)) | Sets the solid fill to the given hex color string. |  |  | not started |  |
| [setSolidFill(ThemeColorType,Number)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(ThemeColorType,Number)) |  |  |  | not started |  |
| [setSolidFill(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/fill#setSolidFill(ThemeColorType)) | Sets the solid fill to the given ThemeColorType. |  |  | not started |  |
| [setTransparent()](https://developers.google.com/apps-script/reference/slides/fill#setTransparent()) | Sets the background to transparent. |  |  | not started |  |

## Class: [Group](https://developers.google.com/apps-script/reference/slides/group)

A collection of PageElements joined as a single unit.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/group#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/group#bringForward()) | Brings the page element forward on the page by one element. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/group#bringToFront()) | Brings the page element to the front of the page. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/group#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getChildren()](https://developers.google.com/apps-script/reference/slides/group#getChildren()) | Gets the collection of page elements in the group. The minimum size of a group is 2. | [PageElement[]](#class-pageelement) | The list of page elements in this group. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/group#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/group#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/group#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/group#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/group#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/group#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/group#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/group#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/group#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/group#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/group#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/group#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/group#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/group#getTransform()) | Gets the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/group#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/group#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/group#remove()) | Removes the page element. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/group#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/group#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/group#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/group#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/group#sendBackward()) | Sends the page element backward on the page by one element. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/group#sendToBack()) | Sends the page element to the back of the page. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/group#setDescription(String)) | Sets the page element's alt text description. | [Group](#class-group) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/group#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/group#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/group#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/group#setTitle(String)) | Sets the page element's alt text title. | [Group](#class-group) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/group#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/group#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Group](#class-group) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/group#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Group](#class-group) | This page element, for chaining. | not started |  |
| [ungroup()](https://developers.google.com/apps-script/reference/slides/group#ungroup()) | Ungroups the elements of the group. |  |  | not started |  |

## Class: [Image](https://developers.google.com/apps-script/reference/slides/image)

A PageElement representing an image.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/image#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/image#bringForward()) | Brings the page element forward on the page by one element. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/image#bringToFront()) | Brings the page element to the front of the page. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/image#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getAs(String)](https://developers.google.com/apps-script/reference/slides/image#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | Blob | The data as a blob. | not started |  |
| [getBlob()](https://developers.google.com/apps-script/reference/slides/image#getBlob()) | Return the data inside this image as a blob. | Blob | The image data as a blob. | not started |  |
| [getBorder()](https://developers.google.com/apps-script/reference/slides/image#getBorder()) | Returns the Border of the image. | [Border](#class-border) | The border of the image. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/image#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getContentUrl()](https://developers.google.com/apps-script/reference/slides/image#getContentUrl()) | Gets a URL to the image. |  | String | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/image#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/image#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/image#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/image#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/image#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getLink()](https://developers.google.com/apps-script/reference/slides/image#getLink()) | Returns the Link or null if there is no link. | [Link](#class-link) | The Link or null if there is no link. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/image#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/image#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/image#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/image#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getParentPlaceholder()](https://developers.google.com/apps-script/reference/slides/image#getParentPlaceholder()) | Returns the parent page element of the placeholder. Returns null if the image is not a placeholder or has no parent. | [PageElement](#class-pageelement) | The parent page element of this image placeholder, or null if this image is not a placeholder or doesn't have a parent. | not started |  |
| [getPlaceholderIndex()](https://developers.google.com/apps-script/reference/slides/image#getPlaceholderIndex()) | Returns the index of the placeholder image. If two or more placeholder images on the same page are the same type, they each have a unique index value. Returns null if the image isn't a placeholder. | Integer | This image's placeholder index, or null if the image isn't a placeholder. | not started |  |
| [getPlaceholderType()](https://developers.google.com/apps-script/reference/slides/image#getPlaceholderType()) | Returns the placeholder type of the image, or PlaceholderType.NONE if the shape is not a placeholder. | [PlaceholderType](#enum-placeholdertype) | The placeholder type of this image. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/image#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getSourceUrl()](https://developers.google.com/apps-script/reference/slides/image#getSourceUrl()) | Gets the image's source URL, if available. | String | The image URL or null if the image does not have a source URL. | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/image#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/image#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/image#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/image#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/image#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/image#remove()) | Removes the page element. |  |  | not started |  |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/image#removeLink()) | Removes a Link. |  |  | not started |  |
| [replace(BlobSource,Boolean)](https://developers.google.com/apps-script/reference/slides/image#replace(BlobSource,Boolean)) |  |  |  | not started |  |
| [replace(BlobSource)](https://developers.google.com/apps-script/reference/slides/image#replace(BlobSource)) | Replaces this image with an image described by a BlobSource object. | [Image](#class-image) | This Image after the replacement. | not started |  |
| [replace(String,Boolean)](https://developers.google.com/apps-script/reference/slides/image#replace(String,Boolean)) |  |  |  | not started |  |
| [replace(String)](https://developers.google.com/apps-script/reference/slides/image#replace(String)) | Replaces this image with another image downloaded from the provided URL. | [Image](#class-image) | This Image after the replacement. | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/image#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/image#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/image#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/image#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/image#sendBackward()) | Sends the page element backward on the page by one element. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/image#sendToBack()) | Sends the page element to the back of the page. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/image#setDescription(String)) | Sets the page element's alt text description. | [Image](#class-image) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/image#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/image#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/image#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/image#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/image#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/image#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. | [Link](#class-link) | The Link that was set. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/image#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/image#setTitle(String)) | Sets the page element's alt text title. | [Image](#class-image) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/image#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/image#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Image](#class-image) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/image#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Image](#class-image) | This page element, for chaining. | not started |  |

## Class: [Layout](https://developers.google.com/apps-script/reference/slides/layout)

A layout in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getBackground()](https://developers.google.com/apps-script/reference/slides/layout#getBackground()) | Gets the page's background. | [PageBackground](#class-pagebackground) | The page's background. | not started |  |
| [getColorScheme()](https://developers.google.com/apps-script/reference/slides/layout#getColorScheme()) | Gets the ColorScheme associated with the page. | [ColorScheme](#class-colorscheme) | The page's color scheme. | not started |  |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/layout#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/layout#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLayoutName()](https://developers.google.com/apps-script/reference/slides/layout#getLayoutName()) | Gets the name of the layout. |  | String | not started |  |
| [getLines()](https://developers.google.com/apps-script/reference/slides/layout#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getMaster()](https://developers.google.com/apps-script/reference/slides/layout#getMaster()) | Gets the master that the layout is based on. |  | Master | completed | [link](../src/services/slidesapp/fakelayout.js#L23) |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/layout#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | completed | [link](../src/services/slidesapp/fakelayout.js#L32) |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/layout#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/layout#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | not started |  |
| [getPageType()](https://developers.google.com/apps-script/reference/slides/layout#getPageType()) | Gets the type of the page. | [PageType](#enum-pagetype) | The page type. | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/layout#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/layout#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/layout#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/layout#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/layout#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/layout#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/layout#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/layout#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |
| [group(PageElement)](https://developers.google.com/apps-script/reference/slides/layout#group(PageElement)) | Groups all the specified page elements. | [Group](#class-group) | The new group. | not started |  |
| [insertGroup(Group)](https://developers.google.com/apps-script/reference/slides/layout#insertGroup(Group)) | Inserts a copy of the provided Group on the page. | [Group](#class-group) | The inserted group. | not started |  |
| [insertImage(BlobSource,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertImage(BlobSource,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(BlobSource)](https://developers.google.com/apps-script/reference/slides/layout#insertImage(BlobSource)) | Inserts an image at the top left corner of the page with a default size from the specified image blob. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(Image)](https://developers.google.com/apps-script/reference/slides/layout#insertImage(Image)) | Inserts a copy of the provided Image on the page. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertImage(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(String)](https://developers.google.com/apps-script/reference/slides/layout#insertImage(String)) | Inserts an image at the top left corner of the page with a default size from the provided URL. | [Image](#class-image) | The inserted image. | not started |  |
| [insertLine(Line)](https://developers.google.com/apps-script/reference/slides/layout#insertLine(Line)) | Inserts a copy of the provided Line on the page. | [Line](#class-line) | The inserted line. | not started |  |
| [insertLine(LineCategory,ConnectionSite,ConnectionSite)](https://developers.google.com/apps-script/reference/slides/layout#insertLine(LineCategory,ConnectionSite,ConnectionSite)) |  |  |  | not started |  |
| [insertLine(LineCategory,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertLine(LineCategory,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertPageElement(PageElement)](https://developers.google.com/apps-script/reference/slides/layout#insertPageElement(PageElement)) | Inserts a copy of the provided PageElement on the page. | [PageElement](#class-pageelement) | The inserted page element. | not started |  |
| [insertShape(Shape)](https://developers.google.com/apps-script/reference/slides/layout#insertShape(Shape)) | Inserts a copy of the provided Shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertShape(ShapeType,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertShape(ShapeType,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertShape(ShapeType)](https://developers.google.com/apps-script/reference/slides/layout#insertShape(ShapeType)) | Inserts a shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChart(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/layout#insertSheetsChart(EmbeddedChart)) | Inserts a Google Sheets chart on the page. | [SheetsChart](#class-sheetschart) | The inserted chart in the page. | not started |  |
| [insertSheetsChart(SheetsChart)](https://developers.google.com/apps-script/reference/slides/layout#insertSheetsChart(SheetsChart)) | Inserts a copy of the provided SheetsChart on the page. | [SheetsChart](#class-sheetschart) | The inserted sheets chart. | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/layout#insertSheetsChartAsImage(EmbeddedChart)) | Inserts a Google Sheets chart as an Image on the page. | [Image](#class-image) | The inserted image of the chart in the page. | not started |  |
| [insertTable(Integer,Integer,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertTable(Integer,Integer,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTable(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/layout#insertTable(Integer,Integer)) |  |  |  | not started |  |
| [insertTable(Table)](https://developers.google.com/apps-script/reference/slides/layout#insertTable(Table)) | Inserts a copy of the provided Table on the page. | [Table](#class-table) | The inserted table. | not started |  |
| [insertTextBox(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertTextBox(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTextBox(String)](https://developers.google.com/apps-script/reference/slides/layout#insertTextBox(String)) | Inserts a text box Shape containing the provided string on the page. | [Shape](#class-shape) | The inserted text box shape. | not started |  |
| [insertVideo(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/layout#insertVideo(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertVideo(String)](https://developers.google.com/apps-script/reference/slides/layout#insertVideo(String)) | Inserts a video at the top left corner of the page with a default size. | [Video](#class-video) | The inserted video. | not started |  |
| [insertVideo(Video)](https://developers.google.com/apps-script/reference/slides/layout#insertVideo(Video)) | Inserts a copy of the provided Video on the page. | [Video](#class-video) | The inserted video. | not started |  |
| [insertWordArt(WordArt)](https://developers.google.com/apps-script/reference/slides/layout#insertWordArt(WordArt)) | Inserts a copy of the provided WordArt on the page. | [WordArt](#class-wordart) | The inserted word art. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/layout#remove()) | Removes the page. |  |  | not started |  |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/layout#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/layout#replaceAllText(String,String)) |  |  |  | not started |  |
| [selectAsCurrentPage()](https://developers.google.com/apps-script/reference/slides/layout#selectAsCurrentPage()) | Selects the Page in the active presentation as the current page selection and removes any previous selection. |  |  | not started |  |

## Class: [Line](https://developers.google.com/apps-script/reference/slides/line)

A PageElement representing a line.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/line#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/line#bringForward()) | Brings the page element forward on the page by one element. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/line#bringToFront()) | Brings the page element to the front of the page. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/line#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/line#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | completed | [link](../src/services/slidesapp/fakeline.js#L142) |
| [getDashStyle()](https://developers.google.com/apps-script/reference/slides/line#getDashStyle()) | Gets the DashStyle of the line. | [DashStyle](#enum-dashstyle) | The style of the dashing used with this line. | completed | [link](../src/services/slidesapp/fakeline.js#L47) |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/line#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getEnd()](https://developers.google.com/apps-script/reference/slides/line#getEnd()) | Returns the end point of the line, measured from the upper-left corner of the page. | [Point](#class-point) | The ending point of the line. | completed | [link](../src/services/slidesapp/fakeline.js#L67) |
| [getEndArrow()](https://developers.google.com/apps-script/reference/slides/line#getEndArrow()) | Gets the ArrowStyle of the arrow at the end of the line. | [ArrowStyle](#enum-arrowstyle) | The style of the arrow at the end of this line. | completed | [link](../src/services/slidesapp/fakeline.js#L67) |
| [getEndConnection()](https://developers.google.com/apps-script/reference/slides/line#getEndConnection()) | Returns the connection at the end of the line, or null if there is no connection. | [ConnectionSite](#class-connectionsite) | The connection at the end of the line. | completed | [link](../src/services/slidesapp/fakeline.js#L148) |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/line#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | completed | [link](../src/services/slidesapp/fakeline.js#L103) |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/line#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/line#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/line#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | completed | [link](../src/services/slidesapp/fakeline.js#L81) |
| [getLineCategory()](https://developers.google.com/apps-script/reference/slides/line#getLineCategory()) | Gets the LineCategory of the line. | [LineCategory](#enum-linecategory) | The line category. | completed | [link](../src/services/slidesapp/fakeline.js#L22) |
| [getLineFill()](https://developers.google.com/apps-script/reference/slides/line#getLineFill()) | Gets the LineFill of the line. | [LineFill](#class-linefill) | The fill setting of this line. | completed | [link](../src/services/slidesapp/fakeline.js#L34) |
| [getLineType()](https://developers.google.com/apps-script/reference/slides/line#getLineType()) | Gets the LineType of the line. | [LineType](#enum-linetype) | The type of this line. | completed | [link](../src/services/slidesapp/fakeline.js#L26) |
| [getLink()](https://developers.google.com/apps-script/reference/slides/line#getLink()) | Returns the Link or null if there is no link. | [Link](#class-link) | The Link or null if there is no link. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/line#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | completed | [link](../src/services/slidesapp/fakeline.js#L138) |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/line#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/line#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/line#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/line#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getStart()](https://developers.google.com/apps-script/reference/slides/line#getStart()) | Returns the start point of the line, measured from the upper-left corner of the page. | [Point](#class-point) | The starting point of the line. | completed | [link](../src/services/slidesapp/fakeline.js#L57) |
| [getStartArrow()](https://developers.google.com/apps-script/reference/slides/line#getStartArrow()) | Gets the ArrowStyle of the arrow at the beginning of the line. | [ArrowStyle](#enum-arrowstyle) | The style of the arrow at the beginning of this line. | completed | [link](../src/services/slidesapp/fakeline.js#L57) |
| [getStartConnection()](https://developers.google.com/apps-script/reference/slides/line#getStartConnection()) | Returns the connection at the beginning of the line, or null if there is no connection. | [ConnectionSite](#class-connectionsite) | The connection at the beginning of the line. | completed | [link](../src/services/slidesapp/fakeline.js#L133) |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/line#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/line#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | completed | [link](../src/services/slidesapp/fakeline.js#L81) |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/line#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWeight()](https://developers.google.com/apps-script/reference/slides/line#getWeight()) | Returns the thickness of the line in points. | Number | The thickness of the line in points. | completed | [link](../src/services/slidesapp/fakeline.js#L38) |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/line#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | completed | [link](../src/services/slidesapp/fakeline.js#L103) |
| [isConnector()](https://developers.google.com/apps-script/reference/slides/line#isConnector()) | Returns true if the line is a connector, or false if not. | Boolean | True if the line is a connector, or false if not. | completed | [link](../src/services/slidesapp/fakeline.js#L30) |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/line#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/line#remove()) | Removes the page element. |  |  | not started |  |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/line#removeLink()) | Removes a Link. |  |  | not started |  |
| [reroute()](https://developers.google.com/apps-script/reference/slides/line#reroute()) | Reroutes the start and end of the line to the closest two connection sites on the connected page elements. The start and end of the line must be connected to different page elements. | [Line](#class-line) | The line. | completed | [link](../src/services/slidesapp/fakeline.js#L124) |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/line#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/line#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/line#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/line#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/line#sendBackward()) | Sends the page element backward on the page by one element. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/line#sendToBack()) | Sends the page element to the back of the page. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [setDashStyle(DashStyle)](https://developers.google.com/apps-script/reference/slides/line#setDashStyle(DashStyle)) | Sets the DashStyle of the line. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L52) |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/line#setDescription(String)) | Sets the page element's alt text description. | [Line](#class-line) | This page element. | not started |  |
| [setEnd(Number,Number)](https://developers.google.com/apps-script/reference/slides/line#setEnd(Number,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakeline.js#L72) |
| [setEnd(Point)](https://developers.google.com/apps-script/reference/slides/line#setEnd(Point)) | Sets the position of the end point of the line. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L72) |
| [setEndArrow(ArrowStyle)](https://developers.google.com/apps-script/reference/slides/line#setEndArrow(ArrowStyle)) | Sets the ArrowStyle of the arrow at the end of the line. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L72) |
| [setEndConnection(ConnectionSite)](https://developers.google.com/apps-script/reference/slides/line#setEndConnection(ConnectionSite)) | Sets the connection at the end of the line. It moves the end of the line to the specified connection site while keeping the other end intact. | [Line](#class-line) | The line. | completed | [link](../src/services/slidesapp/fakeline.js#L171) |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/line#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L120) |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/line#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [setLineCategory(LineCategory)](https://developers.google.com/apps-script/reference/slides/line#setLineCategory(LineCategory)) | Sets the LineCategory of the line. | [Line](#class-line) | The line. | not started |  |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/line#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/line#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/line#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/line#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. | [Link](#class-link) | The Link that was set. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/line#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [setStart(Number,Number)](https://developers.google.com/apps-script/reference/slides/line#setStart(Number,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakeline.js#L62) |
| [setStart(Point)](https://developers.google.com/apps-script/reference/slides/line#setStart(Point)) | Sets the position of the start point of the line. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L62) |
| [setStartArrow(ArrowStyle)](https://developers.google.com/apps-script/reference/slides/line#setStartArrow(ArrowStyle)) | Sets the ArrowStyle of the arrow at the beginning of the line. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L62) |
| [setStartConnection(ConnectionSite)](https://developers.google.com/apps-script/reference/slides/line#setStartConnection(ConnectionSite)) | Sets the connection at the beginning of the line. It moves the start of the line to the specified connection site while keeping the other end intact. | [Line](#class-line) | The line. | completed | [link](../src/services/slidesapp/fakeline.js#L161) |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/line#setTitle(String)) | Sets the page element's alt text title. | [Line](#class-line) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/line#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/line#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Line](#class-line) | This element, for chaining. | not started |  |
| [setWeight(Number)](https://developers.google.com/apps-script/reference/slides/line#setWeight(Number)) | Sets the thickness of the line in points. | [Line](#class-line) | This line, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L42) |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/line#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Line](#class-line) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakeline.js#L119) |

## Class: [LineFill](https://developers.google.com/apps-script/reference/slides/line-fill)

Describes the fill of a line or outline

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getFillType()](https://developers.google.com/apps-script/reference/slides/line-fill#getFillType()) | Gets the type of the line fill. |  | LineFillType | completed | [link](../src/services/slidesapp/fakelinefill.js#L12) |
| [getSolidFill()](https://developers.google.com/apps-script/reference/slides/line-fill#getSolidFill()) | Gets the solid fill of the line, or null if the fill type is not LineFillType.SOLID. |  | SolidFill | completed | [link](../src/services/slidesapp/fakelinefill.js#L16) |
| [setSolidFill(Color,Number)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(Color,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(Color)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(Color)) | Sets the solid fill to the given Color. |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(Integer,Integer,Integer,Number)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(Integer,Integer,Integer,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(Integer,Integer,Integer)) |  |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(String,Number)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(String,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(String)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(String)) | Sets the solid fill to the given hex color string. |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(ThemeColorType,Number)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(ThemeColorType,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |
| [setSolidFill(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/line-fill#setSolidFill(ThemeColorType)) | Sets the solid fill to the given ThemeColorType. |  |  | completed | [link](../src/services/slidesapp/fakelinefill.js#L22) |

## Class: [Link](https://developers.google.com/apps-script/reference/slides/link)

A hypertext link.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getLinkedSlide()](https://developers.google.com/apps-script/reference/slides/link#getLinkedSlide()) | Returns the linked Slide for non-URL links types, if it exists. Returns null if the slide doesn't exist in the presentation, or if the LinkType is LinkType.URL. |  | Slide | not started |  |
| [getLinkType()](https://developers.google.com/apps-script/reference/slides/link#getLinkType()) | Returns the LinkType. |  | LinkType | completed | [link](../src/services/slidesapp/fakelink.js#L12) |
| [getSlideId()](https://developers.google.com/apps-script/reference/slides/link#getSlideId()) | Returns the ID of the linked Slide or null if the LinkType is not LinkType.SLIDE_ID. |  | String | completed | [link](../src/services/slidesapp/fakelink.js#L24) |
| [getSlideIndex()](https://developers.google.com/apps-script/reference/slides/link#getSlideIndex()) | Returns the zero-based index of the linked Slide or null if the LinkType is not LinkType.SLIDE_INDEX. |  | Integer | not started |  |
| [getSlidePosition()](https://developers.google.com/apps-script/reference/slides/link#getSlidePosition()) | Returns the SlidePosition of the linked Slide or null if the LinkType is not LinkType.SLIDE_POSITION. |  | SlidePosition | not started |  |
| [getUrl()](https://developers.google.com/apps-script/reference/slides/link#getUrl()) | Returns the URL to the external web page or null if the LinkType is not LinkType.URL. |  | String | completed | [link](../src/services/slidesapp/fakelink.js#L20) |

## Class: [List](https://developers.google.com/apps-script/reference/slides/list)

A list in the text.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getListId()](https://developers.google.com/apps-script/reference/slides/list#getListId()) | Returns the ID of the list. |  | String | not started |  |
| [getListParagraphs()](https://developers.google.com/apps-script/reference/slides/list#getListParagraphs()) | Returns all the Paragraphs in the list. |  | Paragraph[] | not started |  |

## Class: [ListStyle](https://developers.google.com/apps-script/reference/slides/list-style)

The list styling for a range of text.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [applyListPreset(ListPreset)](https://developers.google.com/apps-script/reference/slides/list-style#applyListPreset(ListPreset)) | Applies the specified ListPreset to all of the paragraphs that overlap with the text. |  | ListStyle | not started |  |
| [getGlyph()](https://developers.google.com/apps-script/reference/slides/list-style#getGlyph()) | Returns the rendered glyph for the text. Returns null if the text spans more than one paragraph or the text is not in a list. |  | String | not started |  |
| [getList()](https://developers.google.com/apps-script/reference/slides/list-style#getList()) | Returns the List the text is in, or null if none of the text is in a list, or part of the text is in a list, or the text is in multiple lists. Call isInList() to determine whether the text is in a list. |  | List | not started |  |
| [getNestingLevel()](https://developers.google.com/apps-script/reference/slides/list-style#getNestingLevel()) | Returns the 0-based nesting level of the text. Returns null if the text is not in a list or there are mixed values. |  | Integer | not started |  |
| [isInList()](https://developers.google.com/apps-script/reference/slides/list-style#isInList()) | Returns true if the text is in exactly one list, false if none of the text is in a list, and null if only some of the text is in a list or if the text is in multiple lists. |  | Boolean | not started |  |
| [removeFromList()](https://developers.google.com/apps-script/reference/slides/list-style#removeFromList()) | Removes the paragraphs that overlap with the text from any lists. |  | ListStyle | not started |  |

## Class: [Master](https://developers.google.com/apps-script/reference/slides/master)

A master in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getBackground()](https://developers.google.com/apps-script/reference/slides/master#getBackground()) | Gets the page's background. | [PageBackground](#class-pagebackground) | The page's background. | not started |  |
| [getColorScheme()](https://developers.google.com/apps-script/reference/slides/master#getColorScheme()) | Gets the ColorScheme associated with the page. | [ColorScheme](#class-colorscheme) | The page's color scheme. | not started |  |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/master#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/master#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLayouts()](https://developers.google.com/apps-script/reference/slides/master#getLayouts()) | Gets this master's layouts. |  | Layout[] | not started |  |
| [getLines()](https://developers.google.com/apps-script/reference/slides/master#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/master#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | completed | [link](../src/services/slidesapp/fakemaster.js#L22) |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/master#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/master#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | not started |  |
| [getPageType()](https://developers.google.com/apps-script/reference/slides/master#getPageType()) | Gets the type of the page. | [PageType](#enum-pagetype) | The page type. | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/master#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/master#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/master#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/master#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/master#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/master#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/master#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/master#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |
| [group(PageElement)](https://developers.google.com/apps-script/reference/slides/master#group(PageElement)) | Groups all the specified page elements. | [Group](#class-group) | The new group. | not started |  |
| [insertGroup(Group)](https://developers.google.com/apps-script/reference/slides/master#insertGroup(Group)) | Inserts a copy of the provided Group on the page. | [Group](#class-group) | The inserted group. | not started |  |
| [insertImage(BlobSource,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertImage(BlobSource,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(BlobSource)](https://developers.google.com/apps-script/reference/slides/master#insertImage(BlobSource)) | Inserts an image at the top left corner of the page with a default size from the specified image blob. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(Image)](https://developers.google.com/apps-script/reference/slides/master#insertImage(Image)) | Inserts a copy of the provided Image on the page. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertImage(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(String)](https://developers.google.com/apps-script/reference/slides/master#insertImage(String)) | Inserts an image at the top left corner of the page with a default size from the provided URL. | [Image](#class-image) | The inserted image. | not started |  |
| [insertLine(Line)](https://developers.google.com/apps-script/reference/slides/master#insertLine(Line)) | Inserts a copy of the provided Line on the page. | [Line](#class-line) | The inserted line. | not started |  |
| [insertLine(LineCategory,ConnectionSite,ConnectionSite)](https://developers.google.com/apps-script/reference/slides/master#insertLine(LineCategory,ConnectionSite,ConnectionSite)) |  |  |  | not started |  |
| [insertLine(LineCategory,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertLine(LineCategory,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertPageElement(PageElement)](https://developers.google.com/apps-script/reference/slides/master#insertPageElement(PageElement)) | Inserts a copy of the provided PageElement on the page. | [PageElement](#class-pageelement) | The inserted page element. | not started |  |
| [insertShape(Shape)](https://developers.google.com/apps-script/reference/slides/master#insertShape(Shape)) | Inserts a copy of the provided Shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertShape(ShapeType,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertShape(ShapeType,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertShape(ShapeType)](https://developers.google.com/apps-script/reference/slides/master#insertShape(ShapeType)) | Inserts a shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChart(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/master#insertSheetsChart(EmbeddedChart)) | Inserts a Google Sheets chart on the page. | [SheetsChart](#class-sheetschart) | The inserted chart in the page. | not started |  |
| [insertSheetsChart(SheetsChart)](https://developers.google.com/apps-script/reference/slides/master#insertSheetsChart(SheetsChart)) | Inserts a copy of the provided SheetsChart on the page. | [SheetsChart](#class-sheetschart) | The inserted sheets chart. | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/master#insertSheetsChartAsImage(EmbeddedChart)) | Inserts a Google Sheets chart as an Image on the page. | [Image](#class-image) | The inserted image of the chart in the page. | not started |  |
| [insertTable(Integer,Integer,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertTable(Integer,Integer,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTable(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/master#insertTable(Integer,Integer)) |  |  |  | not started |  |
| [insertTable(Table)](https://developers.google.com/apps-script/reference/slides/master#insertTable(Table)) | Inserts a copy of the provided Table on the page. | [Table](#class-table) | The inserted table. | not started |  |
| [insertTextBox(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertTextBox(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTextBox(String)](https://developers.google.com/apps-script/reference/slides/master#insertTextBox(String)) | Inserts a text box Shape containing the provided string on the page. | [Shape](#class-shape) | The inserted text box shape. | not started |  |
| [insertVideo(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/master#insertVideo(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertVideo(String)](https://developers.google.com/apps-script/reference/slides/master#insertVideo(String)) | Inserts a video at the top left corner of the page with a default size. | [Video](#class-video) | The inserted video. | not started |  |
| [insertVideo(Video)](https://developers.google.com/apps-script/reference/slides/master#insertVideo(Video)) | Inserts a copy of the provided Video on the page. | [Video](#class-video) | The inserted video. | not started |  |
| [insertWordArt(WordArt)](https://developers.google.com/apps-script/reference/slides/master#insertWordArt(WordArt)) | Inserts a copy of the provided WordArt on the page. | [WordArt](#class-wordart) | The inserted word art. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/master#remove()) | Removes the page. |  |  | not started |  |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/master#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/master#replaceAllText(String,String)) |  |  |  | not started |  |
| [selectAsCurrentPage()](https://developers.google.com/apps-script/reference/slides/master#selectAsCurrentPage()) | Selects the Page in the active presentation as the current page selection and removes any previous selection. |  |  | not started |  |

## Class: [NotesMaster](https://developers.google.com/apps-script/reference/slides/notes-master)

A notes master in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/notes-master#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/notes-master#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLines()](https://developers.google.com/apps-script/reference/slides/notes-master#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/notes-master#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | not started |  |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/notes-master#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/notes-master#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/notes-master#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/notes-master#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/notes-master#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/notes-master#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/notes-master#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/notes-master#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/notes-master#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/notes-master#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |

## Class: [NotesPage](https://developers.google.com/apps-script/reference/slides/notes-page)

A notes page in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/notes-page#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/notes-page#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLines()](https://developers.google.com/apps-script/reference/slides/notes-page#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/notes-page#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | not started |  |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/notes-page#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/notes-page#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/notes-page#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/notes-page#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/notes-page#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/notes-page#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/notes-page#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getSpeakerNotesShape()](https://developers.google.com/apps-script/reference/slides/notes-page#getSpeakerNotesShape()) | Gets the shape containing the speaker notes on the page. |  | Shape | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/notes-page#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/notes-page#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/notes-page#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/notes-page#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/notes-page#replaceAllText(String,String)) |  |  |  | not started |  |

## Class: [Page](https://developers.google.com/apps-script/reference/slides/page)

A page in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [asLayout()](https://developers.google.com/apps-script/reference/slides/page#asLayout()) | Returns the page as a layout. | [Layout](#class-layout) | The page as a layout. | not started |  |
| [asMaster()](https://developers.google.com/apps-script/reference/slides/page#asMaster()) | Returns the page as a master. | [Master](#class-master) | The page as a master. | not started |  |
| [asSlide()](https://developers.google.com/apps-script/reference/slides/page#asSlide()) | Returns the page as a slide. | [Slide](#class-slide) | The page as a slide. | not started |  |
| [getBackground()](https://developers.google.com/apps-script/reference/slides/page#getBackground()) | Gets the page's background. | [PageBackground](#class-pagebackground) | The page's background. | not started |  |
| [getColorScheme()](https://developers.google.com/apps-script/reference/slides/page#getColorScheme()) | Gets the ColorScheme associated with the page. | [ColorScheme](#class-colorscheme) | The page's color scheme. | not started |  |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/page#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/page#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLines()](https://developers.google.com/apps-script/reference/slides/page#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/page#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | not started |  |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/page#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/page#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | not started |  |
| [getPageType()](https://developers.google.com/apps-script/reference/slides/page#getPageType()) | Gets the type of the page. | [PageType](#enum-pagetype) | The page type. | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/page#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/page#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/page#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/page#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/page#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/page#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/page#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/page#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |
| [group(PageElement)](https://developers.google.com/apps-script/reference/slides/page#group(PageElement)) | Groups all the specified page elements. | [Group](#class-group) | The new group. | not started |  |
| [insertGroup(Group)](https://developers.google.com/apps-script/reference/slides/page#insertGroup(Group)) | Inserts a copy of the provided Group on the page. | [Group](#class-group) | The inserted group. | not started |  |
| [insertImage(BlobSource,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertImage(BlobSource,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(BlobSource)](https://developers.google.com/apps-script/reference/slides/page#insertImage(BlobSource)) | Inserts an image at the top left corner of the page with a default size from the specified image blob. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(Image)](https://developers.google.com/apps-script/reference/slides/page#insertImage(Image)) | Inserts a copy of the provided Image on the page. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertImage(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(String)](https://developers.google.com/apps-script/reference/slides/page#insertImage(String)) | Inserts an image at the top left corner of the page with a default size from the provided URL. | [Image](#class-image) | The inserted image. | not started |  |
| [insertLine(Line)](https://developers.google.com/apps-script/reference/slides/page#insertLine(Line)) | Inserts a copy of the provided Line on the page. | [Line](#class-line) | The inserted line. | not started |  |
| [insertLine(LineCategory,ConnectionSite,ConnectionSite)](https://developers.google.com/apps-script/reference/slides/page#insertLine(LineCategory,ConnectionSite,ConnectionSite)) |  |  |  | not started |  |
| [insertLine(LineCategory,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertLine(LineCategory,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertPageElement(PageElement)](https://developers.google.com/apps-script/reference/slides/page#insertPageElement(PageElement)) | Inserts a copy of the provided PageElement on the page. | [PageElement](#class-pageelement) | The inserted page element. | not started |  |
| [insertShape(Shape)](https://developers.google.com/apps-script/reference/slides/page#insertShape(Shape)) | Inserts a copy of the provided Shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertShape(ShapeType,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertShape(ShapeType,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertShape(ShapeType)](https://developers.google.com/apps-script/reference/slides/page#insertShape(ShapeType)) | Inserts a shape on the page. | [Shape](#class-shape) | The inserted shape. | not started |  |
| [insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChart(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/page#insertSheetsChart(EmbeddedChart)) | Inserts a Google Sheets chart on the page. | [SheetsChart](#class-sheetschart) | The inserted chart in the page. | not started |  |
| [insertSheetsChart(SheetsChart)](https://developers.google.com/apps-script/reference/slides/page#insertSheetsChart(SheetsChart)) | Inserts a copy of the provided SheetsChart on the page. | [SheetsChart](#class-sheetschart) | The inserted sheets chart. | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/page#insertSheetsChartAsImage(EmbeddedChart)) | Inserts a Google Sheets chart as an Image on the page. | [Image](#class-image) | The inserted image of the chart in the page. | not started |  |
| [insertTable(Integer,Integer,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertTable(Integer,Integer,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTable(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/page#insertTable(Integer,Integer)) |  |  |  | not started |  |
| [insertTable(Table)](https://developers.google.com/apps-script/reference/slides/page#insertTable(Table)) | Inserts a copy of the provided Table on the page. | [Table](#class-table) | The inserted table. | not started |  |
| [insertTextBox(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertTextBox(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTextBox(String)](https://developers.google.com/apps-script/reference/slides/page#insertTextBox(String)) | Inserts a text box Shape containing the provided string on the page. | [Shape](#class-shape) | The inserted text box shape. | not started |  |
| [insertVideo(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/page#insertVideo(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertVideo(String)](https://developers.google.com/apps-script/reference/slides/page#insertVideo(String)) | Inserts a video at the top left corner of the page with a default size. | [Video](#class-video) | The inserted video. | not started |  |
| [insertVideo(Video)](https://developers.google.com/apps-script/reference/slides/page#insertVideo(Video)) | Inserts a copy of the provided Video on the page. | [Video](#class-video) | The inserted video. | not started |  |
| [insertWordArt(WordArt)](https://developers.google.com/apps-script/reference/slides/page#insertWordArt(WordArt)) | Inserts a copy of the provided WordArt on the page. | [WordArt](#class-wordart) | The inserted word art. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/page#remove()) | Removes the page. |  |  | not started |  |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/page#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/page#replaceAllText(String,String)) |  |  |  | not started |  |
| [selectAsCurrentPage()](https://developers.google.com/apps-script/reference/slides/page#selectAsCurrentPage()) | Selects the Page in the active presentation as the current page selection and removes any previous selection. |  |  | not started |  |

## Class: [PageBackground](https://developers.google.com/apps-script/reference/slides/page-background)

Describes the page's background

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getPictureFill()](https://developers.google.com/apps-script/reference/slides/page-background#getPictureFill()) | Get the stretched picture fill of this background, or null if the background fill type is not PageBackgroundType.PICTURE. |  | PictureFill | not started |  |
| [getSolidFill()](https://developers.google.com/apps-script/reference/slides/page-background#getSolidFill()) | Get the solid fill of this background, or null if the background fill type is not PageBackgroundType.SOLID. |  | SolidFill | not started |  |
| [getType()](https://developers.google.com/apps-script/reference/slides/page-background#getType()) | Get the type of this page background. |  | PageBackgroundType | not started |  |
| [isVisible()](https://developers.google.com/apps-script/reference/slides/page-background#isVisible()) | Whether the background is visible. |  | Boolean | not started |  |
| [setPictureFill(BlobSource)](https://developers.google.com/apps-script/reference/slides/page-background#setPictureFill(BlobSource)) | Sets an image from the specified image blob as the page background. The image is stretched to match the dimensions of the page. |  |  | not started |  |
| [setPictureFill(String)](https://developers.google.com/apps-script/reference/slides/page-background#setPictureFill(String)) | Sets the image at the provided URL as the page background. The image is stretched to match the dimensions of the page. |  |  | not started |  |
| [setSolidFill(Color,Number)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(Color,Number)) |  |  |  | not started |  |
| [setSolidFill(Color)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(Color)) | Sets the solid fill to the given Color. |  |  | not started |  |
| [setSolidFill(Integer,Integer,Integer,Number)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(Integer,Integer,Integer,Number)) |  |  |  | not started |  |
| [setSolidFill(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(Integer,Integer,Integer)) |  |  |  | not started |  |
| [setSolidFill(String,Number)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(String,Number)) |  |  |  | not started |  |
| [setSolidFill(String)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(String)) | Sets the solid fill to the given hex color string. |  |  | not started |  |
| [setSolidFill(ThemeColorType,Number)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(ThemeColorType,Number)) |  |  |  | not started |  |
| [setSolidFill(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/page-background#setSolidFill(ThemeColorType)) | Sets the solid fill to the given ThemeColorType. |  |  | not started |  |
| [setTransparent()](https://developers.google.com/apps-script/reference/slides/page-background#setTransparent()) | Sets the background to transparent. |  |  | not started |  |

## Class: [PageElement](https://developers.google.com/apps-script/reference/slides/page-element)

A visual element rendered on a page.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/page-element#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L180) |
| [asGroup()](https://developers.google.com/apps-script/reference/slides/page-element#asGroup()) | Returns the page element as a group. | [Group](#class-group) | This page element as a group. | not started |  |
| [asImage()](https://developers.google.com/apps-script/reference/slides/page-element#asImage()) | Returns the page element as an image. | [Image](#class-image) | This page element as an image. | not started |  |
| [asLine()](https://developers.google.com/apps-script/reference/slides/page-element#asLine()) | Returns the page element as a line. | [Line](#class-line) | This page element as a line. | completed | [link](../src/services/slidesapp/fakepageelement.js#L59) |
| [asShape()](https://developers.google.com/apps-script/reference/slides/page-element#asShape()) | Returns the page element as a shape. | [Shape](#class-shape) | This page element as a shape. | completed | [link](../src/services/slidesapp/fakepageelement.js#L47) |
| [asSheetsChart()](https://developers.google.com/apps-script/reference/slides/page-element#asSheetsChart()) | Returns the page element as a linked chart embedded from Google Sheets. | [SheetsChart](#class-sheetschart) | The page element as a chart. | not started |  |
| [asSpeakerSpotlight()](https://developers.google.com/apps-script/reference/slides/page-element#asSpeakerSpotlight()) | Returns the page element as a speaker spotlight. | [SpeakerSpotlight](#class-speakerspotlight) | The page element as a speaker spotlight. | not started |  |
| [asTable()](https://developers.google.com/apps-script/reference/slides/page-element#asTable()) | Returns the page element as a table. | [Table](#class-table) | This page element as a table. | not started |  |
| [asVideo()](https://developers.google.com/apps-script/reference/slides/page-element#asVideo()) | Returns the page element as a video. | [Video](#class-video) | This page element as a video. | not started |  |
| [asWordArt()](https://developers.google.com/apps-script/reference/slides/page-element#asWordArt()) | Returns the page element as word art. | [WordArt](#class-wordart) | This page element as word art. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/page-element#bringForward()) | Brings the page element forward on the page by one element. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L229) |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/page-element#bringToFront()) | Brings the page element to the front of the page. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L234) |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/page-element#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/page-element#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | completed | [link](../src/services/slidesapp/fakepageelement.js#L382) |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/page-element#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | completed | [link](../src/services/slidesapp/fakepageelement.js#L197) |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/page-element#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | completed | [link](../src/services/slidesapp/fakepageelement.js#L129) |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/page-element#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/page-element#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/page-element#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | completed | [link](../src/services/slidesapp/fakepageelement.js#L100) |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/page-element#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | completed | [link](../src/services/slidesapp/fakepageelement.js#L39) |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/page-element#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | completed | [link](../src/services/slidesapp/fakepageelement.js#L71) |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/page-element#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | completed | [link](../src/services/slidesapp/fakepageelement.js#L214) |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/page-element#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | completed | [link](../src/services/slidesapp/fakepageelement.js#L210) |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/page-element#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | completed | [link](../src/services/slidesapp/fakepageelement.js#L140) |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/page-element#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | completed | [link](../src/services/slidesapp/fakepageelement.js#L192) |
| [getTop()](https://developers.google.com/apps-script/reference/slides/page-element#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | completed | [link](../src/services/slidesapp/fakepageelement.js#L109) |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/page-element#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | completed | [link](../src/services/slidesapp/fakepageelement.js#L151) |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/page-element#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | completed | [link](../src/services/slidesapp/fakepageelement.js#L118) |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/page-element#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L175) |
| [remove()](https://developers.google.com/apps-script/reference/slides/page-element#remove()) | Removes the page element. |  |  | completed | [link](../src/services/slidesapp/fakepageelement.js#L220) |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/page-element#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/page-element#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/page-element#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/page-element#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/page-element#sendBackward()) | Sends the page element backward on the page by one element. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L239) |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/page-element#sendToBack()) | Sends the page element to the back of the page. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L244) |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/page-element#setDescription(String)) | Sets the page element's alt text description. | [PageElement](#class-pageelement) | This page element. | completed | [link](../src/services/slidesapp/fakepageelement.js#L205) |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/page-element#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L135) |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/page-element#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L104) |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/page-element#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L146) |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/page-element#setTitle(String)) | Sets the page element's alt text title. | [PageElement](#class-pageelement) | This page element. | completed | [link](../src/services/slidesapp/fakepageelement.js#L196) |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/page-element#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L113) |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/page-element#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [PageElement](#class-pageelement) | This element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L163) |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/page-element#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [PageElement](#class-pageelement) | This page element, for chaining. | completed | [link](../src/services/slidesapp/fakepageelement.js#L124) |

## Class: [PageElementRange](https://developers.google.com/apps-script/reference/slides/page-element-range)

A collection of one or more PageElement instances.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/page-element-range#getPageElements()) | Returns the list of PageElement instances. |  | PageElement[] | not started |  |

## Class: [PageRange](https://developers.google.com/apps-script/reference/slides/page-range)

A collection of one or more Page instances.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getPages()](https://developers.google.com/apps-script/reference/slides/page-range#getPages()) | Returns the list of Page instances. |  | Page[] | not started |  |

## Class: [Paragraph](https://developers.google.com/apps-script/reference/slides/paragraph)

A segment of text terminated by a newline character.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getIndex()](https://developers.google.com/apps-script/reference/slides/paragraph#getIndex()) | Returns the index of the paragraph's newline. Returns null if the newline has been deleted. |  | Integer | completed | [link](../src/services/slidesapp/fakeparagraph.js#L25) |
| [getRange()](https://developers.google.com/apps-script/reference/slides/paragraph#getRange()) | Returns a TextRange spanning the text in the paragraph ended by this object's newline character. Returns null if the paragraph's newline has been deleted. |  | TextRange | completed | [link](../src/services/slidesapp/fakeparagraph.js#L17) |

## Class: [ParagraphStyle](https://developers.google.com/apps-script/reference/slides/paragraph-style)

The styles of text that apply to entire paragraphs.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getIndentEnd()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getIndentEnd()) | Returns the text end indentation for paragraphs in the TextRange in points, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getIndentFirstLine()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getIndentFirstLine()) | Returns the indentation for the first line of paragraphs in the TextRange in points, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getIndentStart()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getIndentStart()) | Returns the text start indentation for paragraphs in the TextRange in points, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getLineSpacing()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getLineSpacing()) | Returns the line spacing, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getParagraphAlignment()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getParagraphAlignment()) | Returns the ParagraphAlignment of paragraphs in the TextRange, or null if there are multiple paragraph styles on the given text. |  | ParagraphAlignment | not started |  |
| [getSpaceAbove()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getSpaceAbove()) | Returns the extra space above paragraphs in the TextRange in points, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getSpaceBelow()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getSpaceBelow()) | Returns the extra space below paragraphs in the TextRange in points, or null if there are multiple paragraph styles on the given text. |  | Number | not started |  |
| [getSpacingMode()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getSpacingMode()) | Returns the SpacingMode for paragraphs in the TextRange, or null if there are multiple paragraph styles on the given text. |  | SpacingMode | not started |  |
| [getTextDirection()](https://developers.google.com/apps-script/reference/slides/paragraph-style#getTextDirection()) | Returns the TextDirection for paragraphs in the TextRange, or null if there are multiple paragraph styles on the given text. |  | TextDirection | not started |  |
| [setIndentEnd(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setIndentEnd(Number)) | Sets the text end indentation for paragraphs in the TextRange in points. |  | ParagraphStyle | not started |  |
| [setIndentFirstLine(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setIndentFirstLine(Number)) | Sets the indentation for the first line of paragraphs in the TextRange in points. |  | ParagraphStyle | not started |  |
| [setIndentStart(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setIndentStart(Number)) | Sets the text start indentation for paragraphs in the TextRange in points. |  | ParagraphStyle | not started |  |
| [setLineSpacing(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setLineSpacing(Number)) | Sets the line spacing. |  | ParagraphStyle | not started |  |
| [setParagraphAlignment(ParagraphAlignment)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setParagraphAlignment(ParagraphAlignment)) | Sets the ParagraphAlignment of paragraphs in the TextRange. |  | ParagraphStyle | not started |  |
| [setSpaceAbove(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setSpaceAbove(Number)) | Sets the extra space above paragraphs in the TextRange in points. |  | ParagraphStyle | not started |  |
| [setSpaceBelow(Number)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setSpaceBelow(Number)) | Sets the extra space below paragraphs in the TextRange in points. |  | ParagraphStyle | not started |  |
| [setSpacingMode(SpacingMode)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setSpacingMode(SpacingMode)) | Sets the SpacingMode for paragraphs in the TextRange. |  | ParagraphStyle | not started |  |
| [setTextDirection(TextDirection)](https://developers.google.com/apps-script/reference/slides/paragraph-style#setTextDirection(TextDirection)) | Sets the TextDirection for paragraphs in the TextRange. |  | ParagraphStyle | not started |  |

## Class: [PictureFill](https://developers.google.com/apps-script/reference/slides/picture-fill)

A fill that renders an image that's stretched to the dimensions of its container.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAs(String)](https://developers.google.com/apps-script/reference/slides/picture-fill#getAs(String)) | Return the data inside this object as a blob converted to the specified content type. This method adds the appropriate extension to the filename—for example, "myfile.pdf". However, it assumes that the part of the filename that follows the last period (if any) is an existing extension that should be replaced. Consequently, "ShoppingList.12.25.2014" becomes "ShoppingList.12.25.pdf". | Blob | The data as a blob. | not started |  |
| [getBlob()](https://developers.google.com/apps-script/reference/slides/picture-fill#getBlob()) | Return the data inside this object as a blob. | Blob | The data as a blob. | not started |  |
| [getContentUrl()](https://developers.google.com/apps-script/reference/slides/picture-fill#getContentUrl()) | Gets a URL to the image. |  | String | not started |  |
| [getSourceUrl()](https://developers.google.com/apps-script/reference/slides/picture-fill#getSourceUrl()) | Gets the image's source URL, if available. | String | the image URL or null if the image does not have a source URL | not started |  |

## Class: [Point](https://developers.google.com/apps-script/reference/slides/point)

A point representing a location.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getX()](https://developers.google.com/apps-script/reference/slides/point#getX()) | Gets the horizontal coordinate, measured in points. |  | Number | completed | [link](../src/services/slidesapp/fakepoint.js#L13) |
| [getY()](https://developers.google.com/apps-script/reference/slides/point#getY()) | Gets the vertical coordinate, measured in points. |  | Number | completed | [link](../src/services/slidesapp/fakepoint.js#L17) |

## Class: [Presentation](https://developers.google.com/apps-script/reference/slides/presentation)

A presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [addEditor(String)](https://developers.google.com/apps-script/reference/slides/presentation#addEditor(String)) | Adds the given user to the list of editors for the Presentation. If the user was already on the list of viewers, this method promotes the user out of the list of viewers. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [addEditor(User)](https://developers.google.com/apps-script/reference/slides/presentation#addEditor(User)) | Adds the given user to the list of editors for the Presentation. If the user was already on the list of viewers, this method promotes the user out of the list of viewers. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [addEditors(String)](https://developers.google.com/apps-script/reference/slides/presentation#addEditors(String)) | Adds the given array of users to the list of editors for the Presentation. If any of the users were already on the list of viewers, this method promotes them out of the list of viewers. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [addViewer(String)](https://developers.google.com/apps-script/reference/slides/presentation#addViewer(String)) | Adds the given user to the list of viewers for the Presentation. If the user was already on the list of editors, this method has no effect. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [addViewer(User)](https://developers.google.com/apps-script/reference/slides/presentation#addViewer(User)) | Adds the given user to the list of viewers for the Presentation. If the user was already on the list of editors, this method has no effect. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [addViewers(String)](https://developers.google.com/apps-script/reference/slides/presentation#addViewers(String)) | Adds the given array of users to the list of viewers for the Presentation. If any of the users were already on the list of editors, this method has no effect for them. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [appendSlide()](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide()) | Appends a slide to the end of the presentation using the PredefinedLayout.BLANK predefined layout based on the current master. The current master is one of the following: | [Slide](#class-slide) | The new slide that is appended. | completed | [link](../src/services/slidesapp/fakepresentation.js#L75) |
| [appendSlide(Layout)](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide(Layout)) | Appends a slide to the end of the presentation using the specified layout based on the current master. The current master is one of the following: | [Slide](#class-slide) | The new slide that is appended. | completed | [link](../src/services/slidesapp/fakepresentation.js#L75) |
| [appendSlide(PredefinedLayout)](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide(PredefinedLayout)) | Appends a slide to the end of the presentation using the specified predefined layout based on the current master. The current master is one of the following: | [Slide](#class-slide) | The new slide that is appended. | completed | [link](../src/services/slidesapp/fakepresentation.js#L75) |
| [appendSlide(Slide,SlideLinkingMode)](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide(Slide,SlideLinkingMode)) |  |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L75) |
| [appendSlide(Slide)](https://developers.google.com/apps-script/reference/slides/presentation#appendSlide(Slide)) | Appends a copy of the provided Slide to the end of the presentation. | [Slide](#class-slide) | The new slide that is appended. | completed | [link](../src/services/slidesapp/fakepresentation.js#L75) |
| [getEditors()](https://developers.google.com/apps-script/reference/slides/presentation#getEditors()) | Gets the list of editors for this Presentation. | User[] | An array of users with edit permission. | not started |  |
| [getId()](https://developers.google.com/apps-script/reference/slides/presentation#getId()) | Gets the presentation's unique identifier. The presentation ID is used with SlidesApp.openById() to open a specific presentation instance. | String | The ID of this presentation. | completed | [link](../src/services/slidesapp/fakepresentation.js#L33) |
| [getLayouts()](https://developers.google.com/apps-script/reference/slides/presentation#getLayouts()) | Gets the layouts in the presentation. | [Layout[]](#class-layout) | The list of layouts in this presentation. | not started |  |
| [getMasters()](https://developers.google.com/apps-script/reference/slides/presentation#getMasters()) | Gets the masters in the presentation. | [Master[]](#class-master) | The list of masters in this presentation. | not started |  |
| [getName()](https://developers.google.com/apps-script/reference/slides/presentation#getName()) | Gets the name or title of the presentation. | String | The title of this presentation. | completed | [link](../src/services/slidesapp/fakepresentation.js#L41) |
| [getNotesMaster()](https://developers.google.com/apps-script/reference/slides/presentation#getNotesMaster()) | Gets the notes master of the presentation. | [NotesMaster](#class-notesmaster) | The notes master of the presentation. | not started |  |
| [getNotesPageHeight()](https://developers.google.com/apps-script/reference/slides/presentation#getNotesPageHeight()) | Gets the page height of the notes master and notes pages in the presentation in points. They all have the same page height. | Number | The notes page height in points. | not started |  |
| [getNotesPageWidth()](https://developers.google.com/apps-script/reference/slides/presentation#getNotesPageWidth()) | Gets the page width of the notes master and notes pages in the presentation in points. They all have the same page width. | Number | The notes page width in points. | not started |  |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/presentation#getPageElementById(String)) | Returns the PageElement with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageHeight()](https://developers.google.com/apps-script/reference/slides/presentation#getPageHeight()) | Gets the page height of the slides, layouts, and masters in the presentation in points. They all have the same page height. | Number | The page height in points. | not started |  |
| [getPageWidth()](https://developers.google.com/apps-script/reference/slides/presentation#getPageWidth()) | Gets the page width of the slides, layouts, and masters in the presentation in points. They all have the same page width. | Number | The page width in points. | not started |  |
| [getSelection()](https://developers.google.com/apps-script/reference/slides/presentation#getSelection()) | Gets the user’s selection in the active presentation. A script can only access the selection of the user who is running the script, and only if the script is bound to the presentation. | [Selection](#class-selection) | A representation of the user's selection, or null if the script is not bound to the presentation or if there is no valid user selection. | not started |  |
| [getSlideById(String)](https://developers.google.com/apps-script/reference/slides/presentation#getSlideById(String)) | Returns the Slide with the given ID, or null if none exists. | [Slide](#class-slide) | The slide with the given ID. | completed | [link](../src/services/slidesapp/fakepresentation.js#L66) |
| [getSlides()](https://developers.google.com/apps-script/reference/slides/presentation#getSlides()) | Gets the slides in the presentation. | [Slide[]](#class-slide) | The list of slides in this presentation. | completed | [link](../src/services/slidesapp/fakepresentation.js#L57) |
| [getUrl()](https://developers.google.com/apps-script/reference/slides/presentation#getUrl()) | Retrieves the URL to access this presentation. | String | The URL to access the current presentation. | completed | [link](../src/services/slidesapp/fakepresentation.js#L49) |
| [getViewers()](https://developers.google.com/apps-script/reference/slides/presentation#getViewers()) | Gets the list of viewers and commenters for this Presentation. | User[] | An array of users with view or comment permission. | not started |  |
| [insertSlide(Integer,Layout)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer,Layout)) |  |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L98) |
| [insertSlide(Integer,PredefinedLayout)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer,PredefinedLayout)) |  |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L98) |
| [insertSlide(Integer,Slide,SlideLinkingMode)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer,Slide,SlideLinkingMode)) |  |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L98) |
| [insertSlide(Integer,Slide)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer,Slide)) |  |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L98) |
| [insertSlide(Integer)](https://developers.google.com/apps-script/reference/slides/presentation#insertSlide(Integer)) | Inserts a slide at the specified index in the presentation using the PredefinedLayout.BLANK predefined layout based on the current master. The current master is one of the following: | [Slide](#class-slide) | The new slide that is inserted. | completed | [link](../src/services/slidesapp/fakepresentation.js#L98) |
| [removeEditor(String)](https://developers.google.com/apps-script/reference/slides/presentation#removeEditor(String)) | Removes the given user from the list of editors for the Presentation. This method doesn't block users from accessing the Presentation if they belong to a class of users who have general access—for example, if the Presentation is shared with the user's entire domain, or if the Presentation is in a shared drive that the user can access. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [removeEditor(User)](https://developers.google.com/apps-script/reference/slides/presentation#removeEditor(User)) | Removes the given user from the list of editors for the Presentation. This method doesn't block users from accessing the Presentation if they belong to a class of users who have general access—for example, if the Presentation is shared with the user's entire domain, or if the Presentation is in a shared drive that the user can access. | [Presentation](#class-presentation) | This Presentation, for chaining. | not started |  |
| [removeViewer(String)](https://developers.google.com/apps-script/reference/slides/presentation#removeViewer(String)) | Removes the given user from the list of viewers and commenters for the Presentation. This method has no effect if the user is an editor, not a viewer or commenter. This method also doesn't block users from accessing the Presentation if they belong to a class of users who have general access—for example, if the Presentation is shared with the user's entire domain, or if the Presentation is in a shared drive that the user can access. | [Presentation](#class-presentation) | This Presentation for chaining. | not started |  |
| [removeViewer(User)](https://developers.google.com/apps-script/reference/slides/presentation#removeViewer(User)) | Removes the given user from the list of viewers and commenters for the Presentation. This method has no effect if the user is an editor, not a viewer. This method also doesn't block users from accessing the Presentation if they belong to a class of users who have general access—for example, if the Presentation is shared with the user's entire domain, or if the Presentation is in a shared drive that the user can access. | [Presentation](#class-presentation) | This Presentation for chaining. | not started |  |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/presentation#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/presentation#replaceAllText(String,String)) |  |  |  | not started |  |
| [saveAndClose()](https://developers.google.com/apps-script/reference/slides/presentation#saveAndClose()) | Saves the current Presentation. Causes pending updates to be flushed and applied. |  |  | completed | [link](../src/services/slidesapp/fakepresentation.js#L26) |
| [setName(String)](https://developers.google.com/apps-script/reference/slides/presentation#setName(String)) | Sets the name or title of the presentation. |  |  | not started |  |

## Class: [Selection](https://developers.google.com/apps-script/reference/slides/selection)

The user's selection in the active presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getCurrentPage()](https://developers.google.com/apps-script/reference/slides/selection#getCurrentPage()) | Returns the currently active Page or null if there is no active page. |  | Page | not started |  |
| [getPageElementRange()](https://developers.google.com/apps-script/reference/slides/selection#getPageElementRange()) | Returns the PageElementRange collection of PageElement instances that are selected or null if there are no PageElement instances selected. |  | PageElementRange | not started |  |
| [getPageRange()](https://developers.google.com/apps-script/reference/slides/selection#getPageRange()) | Returns the PageRange a collection of Page instances in the flimstrip that are selected or null if the selection is not of type SelectionType.PAGE. |  | PageRange | not started |  |
| [getSelectionType()](https://developers.google.com/apps-script/reference/slides/selection#getSelectionType()) | Returns the SelectionType. |  | SelectionType | not started |  |
| [getTableCellRange()](https://developers.google.com/apps-script/reference/slides/selection#getTableCellRange()) | Returns the TableCellRange collection of TableCell instances that are selected or null if there are no TableCell instances selected. |  | TableCellRange | not started |  |
| [getTextRange()](https://developers.google.com/apps-script/reference/slides/selection#getTextRange()) | Returns the TextRange that is selected or null if the selection is not of type SelectionType.TEXT. |  | TextRange | not started |  |

## Class: [Shape](https://developers.google.com/apps-script/reference/slides/shape)

A PageElement representing a generic shape that does not have a more specific classification. Includes text boxes, rectangles, and other predefined shapes.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/shape#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/shape#bringForward()) | Brings the page element forward on the page by one element. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/shape#bringToFront()) | Brings the page element to the front of the page. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/shape#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getAutofit()](https://developers.google.com/apps-script/reference/slides/shape#getAutofit()) | Returns the Autofit of the text within this shape. This is null if the shape doesn't allow text. | [Autofit](#class-autofit) | The autofit of the text within this shape. | completed | [link](../src/services/slidesapp/fakeshape.js#L32) |
| [getBorder()](https://developers.google.com/apps-script/reference/slides/shape#getBorder()) | Returns the Border of the shape. | [Border](#class-border) | The border setting of this shape. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/shape#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | completed | [link](../src/services/slidesapp/fakeshape.js#L40) |
| [getContentAlignment()](https://developers.google.com/apps-script/reference/slides/shape#getContentAlignment()) | Returns the ContentAlignment of the text in the shape. | [ContentAlignment](#enum-contentalignment) | The alignment of text within this shape. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/shape#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getFill()](https://developers.google.com/apps-script/reference/slides/shape#getFill()) | Returns the Fill of the shape. | [Fill](#class-fill) | The fill setting of this shape. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/shape#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/shape#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/shape#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/shape#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getLink()](https://developers.google.com/apps-script/reference/slides/shape#getLink()) | Returns the Link or null if there is no link. | [Link](#class-link) | The Link or null if there is no link. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/shape#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/shape#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/shape#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/shape#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getParentPlaceholder()](https://developers.google.com/apps-script/reference/slides/shape#getParentPlaceholder()) | Returns the parent page element of the placeholder. Returns null if the shape is not a placeholder or has no parent. | [PageElement](#class-pageelement) | The parent page element of this shape placeholder, or null if this shape is not a placeholder or doesn't have a parent. | not started |  |
| [getPlaceholderIndex()](https://developers.google.com/apps-script/reference/slides/shape#getPlaceholderIndex()) | Returns the placeholder index of the shape. If two or more instances of the same placeholder types are present in the same page, they each have their own unique index value. Returns null if the shape is not a placeholder. | Integer | This shape's placeholder index, or null if the shape is not a placeholder. | not started |  |
| [getPlaceholderType()](https://developers.google.com/apps-script/reference/slides/shape#getPlaceholderType()) | Returns the placeholder type of the shape, or PlaceholderType.NONE if the shape is not a placeholder. | [PlaceholderType](#enum-placeholdertype) | The placeholder type of this shape. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/shape#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getShapeType()](https://developers.google.com/apps-script/reference/slides/shape#getShapeType()) | Returns the type of the shape. | [ShapeType](#enum-shapetype) | The type of this shape. | not started |  |
| [getText()](https://developers.google.com/apps-script/reference/slides/shape#getText()) | Returns the text content of the shape. | [TextRange](#class-textrange) | The text content of this shape. | completed | [link](../src/services/slidesapp/fakeshape.js#L28) |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/shape#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/shape#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/shape#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/shape#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/shape#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/shape#remove()) | Removes the page element. |  |  | not started |  |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/shape#removeLink()) | Removes a Link. |  |  | not started |  |
| [replaceWithImage(BlobSource,Boolean)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithImage(BlobSource,Boolean)) |  |  |  | not started |  |
| [replaceWithImage(BlobSource)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithImage(BlobSource)) | Replaces this shape with an image provided by a BlobSource. | [Image](#class-image) | The Image that replaced the shape. | not started |  |
| [replaceWithImage(String,Boolean)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithImage(String,Boolean)) |  |  |  | not started |  |
| [replaceWithImage(String)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithImage(String)) | Replaces this shape with an image. | [Image](#class-image) | The Image that replaced the shape. | not started |  |
| [replaceWithSheetsChart(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithSheetsChart(EmbeddedChart)) | Replaces this shape with a Google Sheets chart. | [SheetsChart](#class-sheetschart) | The chart that replaced the shape. | not started |  |
| [replaceWithSheetsChartAsImage(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/shape#replaceWithSheetsChartAsImage(EmbeddedChart)) | Replaces this shape with an image of a Google Sheets chart. | [Image](#class-image) | The image of the chart that replaced the shape. | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/shape#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/shape#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/shape#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/shape#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/shape#sendBackward()) | Sends the page element backward on the page by one element. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/shape#sendToBack()) | Sends the page element to the back of the page. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [setContentAlignment(ContentAlignment)](https://developers.google.com/apps-script/reference/slides/shape#setContentAlignment(ContentAlignment)) | Sets the ContentAlignment of the text in the shape. | [Shape](#class-shape) | This shape, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/shape#setDescription(String)) | Sets the page element's alt text description. | [Shape](#class-shape) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/shape#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/shape#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/shape#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/shape#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/shape#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/shape#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. | [Link](#class-link) | The Link that was set. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/shape#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/shape#setTitle(String)) | Sets the page element's alt text title. | [Shape](#class-shape) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/shape#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/shape#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Shape](#class-shape) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/shape#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Shape](#class-shape) | This page element, for chaining. | not started |  |

## Class: [SheetsChart](https://developers.google.com/apps-script/reference/slides/sheets-chart)

A PageElement representing a linked chart embedded from Google Sheets.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/sheets-chart#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [asImage()](https://developers.google.com/apps-script/reference/slides/sheets-chart#asImage()) | Returns the chart as an image or null if the chart is not an embedded image. | [Image](#class-image) | This chart as an image, or null if the chart is not an embedded image. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/sheets-chart#bringForward()) | Brings the page element forward on the page by one element. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/sheets-chart#bringToFront()) | Brings the page element to the front of the page. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/sheets-chart#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getChartId()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getChartId()) | Gets the ID of the specific chart in the Google Sheets spreadsheet that is embedded. | Integer | The ID of the embedded chart. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getEmbedType()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getEmbedType()) | Returns the embed type of the Sheets chart. | [SheetsChartEmbedType](#enum-sheetschartembedtype) | The embed type of this chart. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getLink()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getLink()) | Returns the Link or null if there is no link. | [Link](#class-link) | The Link or null if there is no link. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getSpreadsheetId()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getSpreadsheetId()) | Gets the ID of the Google Sheets spreadsheet that contains the source chart. | String | The ID of the spreadsheet that contains the source chart. | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/sheets-chart#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/sheets-chart#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [refresh()](https://developers.google.com/apps-script/reference/slides/sheets-chart#refresh()) | Refreshes the chart by replacing it with the latest version of the chart from Google Sheets. If the chart is already up to date, does not make any change to the chart in the presentation. |  |  | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/sheets-chart#remove()) | Removes the page element. |  |  | not started |  |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/sheets-chart#removeLink()) | Removes a Link. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/sheets-chart#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/sheets-chart#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/sheets-chart#sendBackward()) | Sends the page element backward on the page by one element. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/sheets-chart#sendToBack()) | Sends the page element to the back of the page. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setDescription(String)) | Sets the page element's alt text description. | [SheetsChart](#class-sheetschart) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. | [Link](#class-link) | The Link that was set. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setTitle(String)) | Sets the page element's alt text title. | [SheetsChart](#class-sheetschart) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [SheetsChart](#class-sheetschart) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/sheets-chart#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [SheetsChart](#class-sheetschart) | This page element, for chaining. | not started |  |

## Class: [Slide](https://developers.google.com/apps-script/reference/slides/slide)

A slide in a presentation.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/slide#duplicate()) | Duplicates the slide. | [Slide](#class-slide) | The duplicated slide. | completed | [link](../src/services/slidesapp/fakeslide.js#L215) |
| [getBackground()](https://developers.google.com/apps-script/reference/slides/slide#getBackground()) | Gets the page's background. | [PageBackground](#class-pagebackground) | The page's background. | completed | [link](../src/services/slidesapp/fakeslide.js#L84) |
| [getColorScheme()](https://developers.google.com/apps-script/reference/slides/slide#getColorScheme()) | Gets the ColorScheme associated with the page. | [ColorScheme](#class-colorscheme) | The page's color scheme. | not started |  |
| [getGroups()](https://developers.google.com/apps-script/reference/slides/slide#getGroups()) | Returns the list of Group objects on the page. |  | Group[] | not started |  |
| [getImages()](https://developers.google.com/apps-script/reference/slides/slide#getImages()) | Returns the list of Image objects on the page. |  | Image[] | not started |  |
| [getLayout()](https://developers.google.com/apps-script/reference/slides/slide#getLayout()) | Gets the layout that the slide is based on or null if the slide is not based on a layout. |  | Layout | completed | [link](../src/services/slidesapp/fakeslide.js#L59) |
| [getLines()](https://developers.google.com/apps-script/reference/slides/slide#getLines()) | Returns the list of Line objects on the page. |  | Line[] | not started |  |
| [getNotesPage()](https://developers.google.com/apps-script/reference/slides/slide#getNotesPage()) | Returns the notes page associated with the slide. |  | NotesPage | completed | [link](../src/services/slidesapp/fakeslide.js#L50) |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/slide#getObjectId()) | Gets the unique ID for the page. Object IDs used by pages and page elements share the same namespace. |  | String | completed | [link](../src/services/slidesapp/fakeslide.js#L42) |
| [getPageElementById(String)](https://developers.google.com/apps-script/reference/slides/slide#getPageElementById(String)) | Returns the PageElement on the page with the given ID, or null if none exists. | [PageElement](#class-pageelement) | The page element with the given ID. | not started |  |
| [getPageElements()](https://developers.google.com/apps-script/reference/slides/slide#getPageElements()) | Returns the list of PageElement objects rendered on the page. |  | PageElement[] | completed | [link](../src/services/slidesapp/fakeslide.js#L76) |
| [getPageType()](https://developers.google.com/apps-script/reference/slides/slide#getPageType()) | Gets the type of the page. | [PageType](#enum-pagetype) | The page type. | not started |  |
| [getPlaceholder(PlaceholderType,Integer)](https://developers.google.com/apps-script/reference/slides/slide#getPlaceholder(PlaceholderType,Integer)) |  |  |  | not started |  |
| [getPlaceholder(PlaceholderType)](https://developers.google.com/apps-script/reference/slides/slide#getPlaceholder(PlaceholderType)) | Returns the placeholder PageElement object for a specified PlaceholderType or null if a matching placeholder is not present. |  | PageElement | not started |  |
| [getPlaceholders()](https://developers.google.com/apps-script/reference/slides/slide#getPlaceholders()) | Returns the list of placeholder PageElement objects in the page. |  | PageElement[] | not started |  |
| [getShapes()](https://developers.google.com/apps-script/reference/slides/slide#getShapes()) | Returns the list of Shape objects on the page. |  | Shape[] | not started |  |
| [getSheetsCharts()](https://developers.google.com/apps-script/reference/slides/slide#getSheetsCharts()) | Returns the list of SheetsChart objects on the page. |  | SheetsChart[] | not started |  |
| [getSlideLinkingMode()](https://developers.google.com/apps-script/reference/slides/slide#getSlideLinkingMode()) | Returns a SlideLinkingMode indicating if the slide is linked to another slide. | [SlideLinkingMode](#enum-slidelinkingmode) | The slide linking mode. | not started |  |
| [getSourcePresentationId()](https://developers.google.com/apps-script/reference/slides/slide#getSourcePresentationId()) | Returns the source Presentation ID or null if the slide is not linked. | String | The source presentation ID or null. | not started |  |
| [getSourceSlideObjectId()](https://developers.google.com/apps-script/reference/slides/slide#getSourceSlideObjectId()) | Returns the source slide ID or null if the slide is not linked. | String | The source slide ID or null. | not started |  |
| [getTables()](https://developers.google.com/apps-script/reference/slides/slide#getTables()) | Returns the list of Table objects on the page. |  | Table[] | not started |  |
| [getVideos()](https://developers.google.com/apps-script/reference/slides/slide#getVideos()) | Returns the list of Video objects on the page. |  | Video[] | not started |  |
| [getWordArts()](https://developers.google.com/apps-script/reference/slides/slide#getWordArts()) | Returns the list of WordArt objects on the page. |  | WordArt[] | not started |  |
| [group(PageElement)](https://developers.google.com/apps-script/reference/slides/slide#group(PageElement)) | Groups all the specified page elements. | [Group](#class-group) | The new group. | not started |  |
| [insertGroup(Group)](https://developers.google.com/apps-script/reference/slides/slide#insertGroup(Group)) | Inserts a copy of the provided Group on the page. | [Group](#class-group) | The inserted group. | not started |  |
| [insertImage(BlobSource,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertImage(BlobSource,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(BlobSource)](https://developers.google.com/apps-script/reference/slides/slide#insertImage(BlobSource)) | Inserts an image at the top left corner of the page with a default size from the specified image blob. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(Image)](https://developers.google.com/apps-script/reference/slides/slide#insertImage(Image)) | Inserts a copy of the provided Image on the page. | [Image](#class-image) | The inserted image. | not started |  |
| [insertImage(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertImage(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertImage(String)](https://developers.google.com/apps-script/reference/slides/slide#insertImage(String)) | Inserts an image at the top left corner of the page with a default size from the provided URL. | [Image](#class-image) | The inserted image. | not started |  |
| [insertLine(Line)](https://developers.google.com/apps-script/reference/slides/slide#insertLine(Line)) | Inserts a copy of the provided Line on the page. | [Line](#class-line) | The inserted line. | completed | [link](../src/services/slidesapp/fakeslide.js#L179) |
| [insertLine(LineCategory,ConnectionSite,ConnectionSite)](https://developers.google.com/apps-script/reference/slides/slide#insertLine(LineCategory,ConnectionSite,ConnectionSite)) |  |  |  | completed | [link](../src/services/slidesapp/fakeslide.js#L179) |
| [insertLine(LineCategory,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertLine(LineCategory,Number,Number,Number,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakeslide.js#L179) |
| [insertPageElement(PageElement)](https://developers.google.com/apps-script/reference/slides/slide#insertPageElement(PageElement)) | Inserts a copy of the provided PageElement on the page. | [PageElement](#class-pageelement) | The inserted page element. | not started |  |
| [insertShape(Shape)](https://developers.google.com/apps-script/reference/slides/slide#insertShape(Shape)) | Inserts a copy of the provided Shape on the page. | [Shape](#class-shape) | The inserted shape. | completed | [link](../src/services/slidesapp/fakeslide.js#L115) |
| [insertShape(ShapeType,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertShape(ShapeType,Number,Number,Number,Number)) |  |  |  | completed | [link](../src/services/slidesapp/fakeslide.js#L115) |
| [insertShape(ShapeType)](https://developers.google.com/apps-script/reference/slides/slide#insertShape(ShapeType)) | Inserts a shape on the page. | [Shape](#class-shape) | The inserted shape. | completed | [link](../src/services/slidesapp/fakeslide.js#L115) |
| [insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertSheetsChart(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChart(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/slide#insertSheetsChart(EmbeddedChart)) | Inserts a Google Sheets chart on the page. | [SheetsChart](#class-sheetschart) | The inserted chart in the page. | not started |  |
| [insertSheetsChart(SheetsChart)](https://developers.google.com/apps-script/reference/slides/slide#insertSheetsChart(SheetsChart)) | Inserts a copy of the provided SheetsChart on the page. | [SheetsChart](#class-sheetschart) | The inserted sheets chart. | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertSheetsChartAsImage(EmbeddedChart,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertSheetsChartAsImage(EmbeddedChart)](https://developers.google.com/apps-script/reference/slides/slide#insertSheetsChartAsImage(EmbeddedChart)) | Inserts a Google Sheets chart as an Image on the page. | [Image](#class-image) | The inserted image of the chart in the page. | not started |  |
| [insertTable(Integer,Integer,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertTable(Integer,Integer,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTable(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/slide#insertTable(Integer,Integer)) |  |  |  | not started |  |
| [insertTable(Table)](https://developers.google.com/apps-script/reference/slides/slide#insertTable(Table)) | Inserts a copy of the provided Table on the page. | [Table](#class-table) | The inserted table. | not started |  |
| [insertTextBox(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertTextBox(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertTextBox(String)](https://developers.google.com/apps-script/reference/slides/slide#insertTextBox(String)) | Inserts a text box Shape containing the provided string on the page. | [Shape](#class-shape) | The inserted text box shape. | not started |  |
| [insertVideo(String,Number,Number,Number,Number)](https://developers.google.com/apps-script/reference/slides/slide#insertVideo(String,Number,Number,Number,Number)) |  |  |  | not started |  |
| [insertVideo(String)](https://developers.google.com/apps-script/reference/slides/slide#insertVideo(String)) | Inserts a video at the top left corner of the page with a default size. | [Video](#class-video) | The inserted video. | not started |  |
| [insertVideo(Video)](https://developers.google.com/apps-script/reference/slides/slide#insertVideo(Video)) | Inserts a copy of the provided Video on the page. | [Video](#class-video) | The inserted video. | not started |  |
| [insertWordArt(WordArt)](https://developers.google.com/apps-script/reference/slides/slide#insertWordArt(WordArt)) | Inserts a copy of the provided WordArt on the page. | [WordArt](#class-wordart) | The inserted word art. | not started |  |
| [isSkipped()](https://developers.google.com/apps-script/reference/slides/slide#isSkipped()) | Returns whether the slide is skipped in the presentation mode. | Boolean | True if the slide is skipped in the presentation mode. | not started |  |
| [move(Integer)](https://developers.google.com/apps-script/reference/slides/slide#move(Integer)) | Move the slide to the specified index. |  |  | completed | [link](../src/services/slidesapp/fakeslide.js#L92) |
| [refreshSlide()](https://developers.google.com/apps-script/reference/slides/slide#refreshSlide()) | Refreshes the slide to reflect any changes made to the linked source slide. If this slide is not linked, returns without making any changes. |  |  | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/slide#remove()) | Removes the page. |  |  | completed | [link](../src/services/slidesapp/fakeslide.js#L92) |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/slide#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/slide#replaceAllText(String,String)) |  |  |  | not started |  |
| [selectAsCurrentPage()](https://developers.google.com/apps-script/reference/slides/slide#selectAsCurrentPage()) | Selects the Page in the active presentation as the current page selection and removes any previous selection. |  |  | not started |  |
| [setSkipped(Boolean)](https://developers.google.com/apps-script/reference/slides/slide#setSkipped(Boolean)) | Sets whether the slide is skipped in the presentation mode. |  |  | not started |  |
| [unlink()](https://developers.google.com/apps-script/reference/slides/slide#unlink()) | Unlinks the current Slide from its source slide. If this slide is not linked, returns without making any changes. |  |  | not started |  |

## Class: [SlidesApp](https://developers.google.com/apps-script/reference/slides/slides-app)

Creates and opens Presentations that can be edited.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [create(String)](https://developers.google.com/apps-script/reference/slides/slides-app#create(String)) | Creates and opens a new Presentation. | [Presentation](#class-presentation) | the presentation with the given name. | completed | [link](../src/services/slidesapp/fakeslidesapp.js#L66) |
| [getActivePresentation()](https://developers.google.com/apps-script/reference/slides/slides-app#getActivePresentation()) | Returns the currently active presentation to which the script is container-bound, or null if there is no active presentation. To interact with a presentation to which the script is not container-bound, use openById(id) instead. |  | Presentation | completed | [link](../src/services/slidesapp/fakeslidesapp.js#L79) |
| [getUi()](https://developers.google.com/apps-script/reference/slides/slides-app#getUi()) | Returns an instance of the presentation's user-interface environment that allows the script to add features like menus, dialogs, and sidebars. A script can only interact with the UI for the current instance of an open presentation, and only if the script is bound to the presentation. For more information, see the guides to menus and dialogs and sidebars. |  | Ui | not started |  |
| [newAffineTransformBuilder()](https://developers.google.com/apps-script/reference/slides/slides-app#newAffineTransformBuilder()) | Returns a new AffineTransformBuilder to build an AffineTransform. The builder is preset with the identity affine transform. |  | AffineTransformBuilder | completed | [link](../src/services/slidesapp/fakeslidesapp.js#L57) |
| [openById(String)](https://developers.google.com/apps-script/reference/slides/slides-app#openById(String)) | Opens the Presentation with the given ID. | [Presentation](#class-presentation) | the presentation with the given ID | completed | [link](../src/services/slidesapp/fakeslidesapp.js#L85) |
| [openByUrl(String)](https://developers.google.com/apps-script/reference/slides/slides-app#openByUrl(String)) | Opens the Presentation with the given URL. | [Presentation](#class-presentation) | the presentation with the given URL | completed | [link](../src/services/slidesapp/fakeslidesapp.js#L107) |

## Class: [SolidFill](https://developers.google.com/apps-script/reference/slides/solid-fill)

A solid color fill.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getAlpha()](https://developers.google.com/apps-script/reference/slides/solid-fill#getAlpha()) | Get the opacity of the color, in the interval from [0, 1.0], where 1.0 means fully opaque. |  | Number | not started |  |
| [getColor()](https://developers.google.com/apps-script/reference/slides/solid-fill#getColor()) | Get the color of the fill. |  | Color | not started |  |

## Class: [SpeakerSpotlight](https://developers.google.com/apps-script/reference/slides/speaker-spotlight)

A PageElement representing a speaker spotlight.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#bringForward()) | Brings the page element forward on the page by one element. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#bringToFront()) | Brings the page element to the front of the page. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getBorder()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getBorder()) | Returns the Border of the speaker spotlight. | [Border](#class-border) | The border of the speaker spotlight. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getMaskShapeType()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getMaskShapeType()) | Returns the ShapeType of the mask applied to the speaker spotlight, or null if there is no mask. | [ShapeType](#enum-shapetype) | The shape type of the speaker spotlight mask. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#remove()) | Removes the page element. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#sendBackward()) | Sends the page element backward on the page by one element. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#sendToBack()) | Sends the page element to the back of the page. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setDescription(String)) | Sets the page element's alt text description. | [SpeakerSpotlight](#class-speakerspotlight) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setTitle(String)) | Sets the page element's alt text title. | [SpeakerSpotlight](#class-speakerspotlight) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [SpeakerSpotlight](#class-speakerspotlight) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/speaker-spotlight#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [SpeakerSpotlight](#class-speakerspotlight) | This page element, for chaining. | not started |  |

## Class: [Table](https://developers.google.com/apps-script/reference/slides/table)

A PageElement representing a table.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/table#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [appendColumn()](https://developers.google.com/apps-script/reference/slides/table#appendColumn()) | Appends a new column to the right of the last column of the table. | [TableColumn](#class-tablecolumn) | The new appended column. | not started |  |
| [appendRow()](https://developers.google.com/apps-script/reference/slides/table#appendRow()) | Appends a new row below the last row of the table. | [TableRow](#class-tablerow) | The new appended row. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/table#bringForward()) | Brings the page element forward on the page by one element. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/table#bringToFront()) | Brings the page element to the front of the page. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/table#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getCell(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/table#getCell(Integer,Integer)) |  |  |  | not started |  |
| [getColumn(Integer)](https://developers.google.com/apps-script/reference/slides/table#getColumn(Integer)) | Returns the specified column in the table. | [TableColumn](#class-tablecolumn) | The table column retrieved. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/table#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/table#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/table#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/table#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/table#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/table#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getNumColumns()](https://developers.google.com/apps-script/reference/slides/table#getNumColumns()) | Returns the number of columns in the table. | Integer | The number fo columns in this table. | not started |  |
| [getNumRows()](https://developers.google.com/apps-script/reference/slides/table#getNumRows()) | Returns the number of rows in the table. | Integer | The number of rows in this table. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/table#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/table#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/table#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/table#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/table#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getRow(Integer)](https://developers.google.com/apps-script/reference/slides/table#getRow(Integer)) | Returns the specified row in the table. | [TableRow](#class-tablerow) | The table row retrieved. | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/table#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/table#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/table#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/table#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [insertColumn(Integer)](https://developers.google.com/apps-script/reference/slides/table#insertColumn(Integer)) | Inserts a new column at the specified index of the table. | [TableColumn](#class-tablecolumn) | The new inserted column. | not started |  |
| [insertRow(Integer)](https://developers.google.com/apps-script/reference/slides/table#insertRow(Integer)) | Inserts a new row at the specified index of the table. | [TableRow](#class-tablerow) | The new inserted row. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/table#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/table#remove()) | Removes the page element. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/table#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/table#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/table#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/table#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/table#sendBackward()) | Sends the page element backward on the page by one element. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/table#sendToBack()) | Sends the page element to the back of the page. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/table#setDescription(String)) | Sets the page element's alt text description. | [Table](#class-table) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/table#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/table#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/table#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/table#setTitle(String)) | Sets the page element's alt text title. | [Table](#class-table) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/table#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/table#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Table](#class-table) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/table#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Table](#class-table) | This page element, for chaining. | not started |  |

## Class: [TableCell](https://developers.google.com/apps-script/reference/slides/table-cell)

A cell in a table.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getColumnIndex()](https://developers.google.com/apps-script/reference/slides/table-cell#getColumnIndex()) | Returns the 0-based column index of the table cell. |  | Integer | not started |  |
| [getColumnSpan()](https://developers.google.com/apps-script/reference/slides/table-cell#getColumnSpan()) | Returns the column span of the table cell. |  | Integer | not started |  |
| [getContentAlignment()](https://developers.google.com/apps-script/reference/slides/table-cell#getContentAlignment()) | Returns the ContentAlignment of the text in the table cell. |  | ContentAlignment | not started |  |
| [getFill()](https://developers.google.com/apps-script/reference/slides/table-cell#getFill()) | Returns the fill of the table cell. |  | Fill | not started |  |
| [getHeadCell()](https://developers.google.com/apps-script/reference/slides/table-cell#getHeadCell()) | Returns the head cell of this table cell. Returns null if this cell has not been merged or if this cell is the head cell. |  | TableCell | not started |  |
| [getMergeState()](https://developers.google.com/apps-script/reference/slides/table-cell#getMergeState()) | Returns the merge state of the table cell. |  | CellMergeState | not started |  |
| [getParentColumn()](https://developers.google.com/apps-script/reference/slides/table-cell#getParentColumn()) | Returns the table column containing the current cell. |  | TableColumn | not started |  |
| [getParentRow()](https://developers.google.com/apps-script/reference/slides/table-cell#getParentRow()) | Returns the table row containing the current cell. |  | TableRow | not started |  |
| [getParentTable()](https://developers.google.com/apps-script/reference/slides/table-cell#getParentTable()) | Returns the table containing the current cell. |  | Table | not started |  |
| [getRowIndex()](https://developers.google.com/apps-script/reference/slides/table-cell#getRowIndex()) | Returns the 0-based row index of the table cell. |  | Integer | not started |  |
| [getRowSpan()](https://developers.google.com/apps-script/reference/slides/table-cell#getRowSpan()) | Returns the row span of the table cell. |  | Integer | not started |  |
| [getText()](https://developers.google.com/apps-script/reference/slides/table-cell#getText()) | Returns the text content of the table cell. Returns null if the cell is merged but is not a head cell. |  | TextRange | not started |  |
| [setContentAlignment(ContentAlignment)](https://developers.google.com/apps-script/reference/slides/table-cell#setContentAlignment(ContentAlignment)) | Sets the ContentAlignment of the text in the table cell. |  | TableCell | not started |  |

## Class: [TableCellRange](https://developers.google.com/apps-script/reference/slides/table-cell-range)

A collection of one or more TableCell instances.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getTableCells()](https://developers.google.com/apps-script/reference/slides/table-cell-range#getTableCells()) | Returns the list of TableCell instances. |  | TableCell[] | not started |  |

## Class: [TableColumn](https://developers.google.com/apps-script/reference/slides/table-column)

A column in a table. A column consists of a list of table cells. A column is identified by the column index.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getCell(Integer)](https://developers.google.com/apps-script/reference/slides/table-column#getCell(Integer)) | Returns the cell at the specified index. |  | TableCell | not started |  |
| [getIndex()](https://developers.google.com/apps-script/reference/slides/table-column#getIndex()) | Returns the 0-based index of the column. |  | Integer | not started |  |
| [getNumCells()](https://developers.google.com/apps-script/reference/slides/table-column#getNumCells()) | Returns the number of cells in this column. |  | Integer | not started |  |
| [getParentTable()](https://developers.google.com/apps-script/reference/slides/table-column#getParentTable()) | Returns the table containing the current column. |  | Table | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/table-column#getWidth()) | Returns the width of the column in points. |  | Number | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/table-column#remove()) | Removes the table column. |  |  | not started |  |

## Class: [TableRow](https://developers.google.com/apps-script/reference/slides/table-row)

A row in a table. A row consists of a list of table cells. A row is identified by the row index.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getCell(Integer)](https://developers.google.com/apps-script/reference/slides/table-row#getCell(Integer)) | Returns the cell at the specified index. | [TableCell](#class-tablecell) | the cell. | not started |  |
| [getIndex()](https://developers.google.com/apps-script/reference/slides/table-row#getIndex()) | Returns the 0-based index of the row. |  | Integer | not started |  |
| [getMinimumHeight()](https://developers.google.com/apps-script/reference/slides/table-row#getMinimumHeight()) | Returns the minimum height of the row in points. The actual height depends on the length of the content of the cell. |  | Number | not started |  |
| [getNumCells()](https://developers.google.com/apps-script/reference/slides/table-row#getNumCells()) | Returns the number of cells in this row. |  | Integer | not started |  |
| [getParentTable()](https://developers.google.com/apps-script/reference/slides/table-row#getParentTable()) | Returns the table containing the current row. |  | Table | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/table-row#remove()) | Removes the table row. |  |  | not started |  |

## Class: [TextRange](https://developers.google.com/apps-script/reference/slides/text-range)

A segment of the text contents of a Shape or a TableCell.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [appendParagraph(String)](https://developers.google.com/apps-script/reference/slides/text-range#appendParagraph(String)) | Appends a paragraph at the end of the text range. The paragraph maintains the styling of the end of the current text range. | [Paragraph](#class-paragraph) | The appended Paragraph. | not started |  |
| [appendRange(TextRange,Boolean)](https://developers.google.com/apps-script/reference/slides/text-range#appendRange(TextRange,Boolean)) |  |  |  | not started |  |
| [appendRange(TextRange)](https://developers.google.com/apps-script/reference/slides/text-range#appendRange(TextRange)) | Appends a copy of the provided text range to the end of the current text range. | [TextRange](#class-textrange) | The text range representing the appended text. | not started |  |
| [appendText(String)](https://developers.google.com/apps-script/reference/slides/text-range#appendText(String)) | Appends text at the end of the text range. The text maintains the styling of the end of the existing text. | [TextRange](#class-textrange) | The text range representing the appended text. | not started |  |
| [asRenderedString()](https://developers.google.com/apps-script/reference/slides/text-range#asRenderedString()) | Returns the rendered text bounded by this range of the associated shape or table cell in a format appropriate to display to end users. | String | The rendered text in the range. | completed | [link](../src/services/slidesapp/faketextrange.js#L65) |
| [asString()](https://developers.google.com/apps-script/reference/slides/text-range#asString()) | Returns the raw text bounded by this range of the associated shape or table cell. | String | The raw text in the range. | completed | [link](../src/services/slidesapp/faketextrange.js#L37) |
| [clear()](https://developers.google.com/apps-script/reference/slides/text-range#clear()) | Clears the text bounded by this range. |  |  | completed | [link](../src/services/slidesapp/faketextrange.js#L126) |
| [clear(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/text-range#clear(Integer,Integer)) |  |  |  | completed | [link](../src/services/slidesapp/faketextrange.js#L126) |
| [find(String,Integer)](https://developers.google.com/apps-script/reference/slides/text-range#find(String,Integer)) |  |  |  | completed | [link](../src/services/slidesapp/faketextrange.js#L182) |
| [find(String)](https://developers.google.com/apps-script/reference/slides/text-range#find(String)) | Returns all the ranges matching the search pattern in the current text range. The search is case sensitive. | [TextRange[]](#class-textrange) | A list of text ranges. | completed | [link](../src/services/slidesapp/faketextrange.js#L182) |
| [getAutoTexts()](https://developers.google.com/apps-script/reference/slides/text-range#getAutoTexts()) | Returns the auto texts within the current text range. | [AutoText[]](#class-autotext) | A list of auto texts. | completed | [link](../src/services/slidesapp/faketextrange.js#L176) |
| [getEndIndex()](https://developers.google.com/apps-script/reference/slides/text-range#getEndIndex()) | Returns the exclusive, 0-based index for the last character in this range. If the start and end indices are equal, the range is considered to be empty. | Integer | The end index of the range. | completed | [link](../src/services/slidesapp/faketextrange.js#L31) |
| [getLength()](https://developers.google.com/apps-script/reference/slides/text-range#getLength()) | Returns the number of characters in this range. | Integer | The number of characters in this range. | not started |  |
| [getLinks()](https://developers.google.com/apps-script/reference/slides/text-range#getLinks()) | Returns a collection of text ranges that correspond to all Links within the current text range or overlapping the current text range. | [TextRange[]](#class-textrange) | A list of text ranges. | not started |  |
| [getListParagraphs()](https://developers.google.com/apps-script/reference/slides/text-range#getListParagraphs()) | Returns the paragraphs in lists that overlap the current text range. | [Paragraph[]](#class-paragraph) | A list of paragraphs in lists. | not started |  |
| [getListStyle()](https://developers.google.com/apps-script/reference/slides/text-range#getListStyle()) | Returns the ListStyle of the current text range. | [ListStyle](#class-liststyle) | The list style of the current text range. | not started |  |
| [getParagraphs()](https://developers.google.com/apps-script/reference/slides/text-range#getParagraphs()) | Returns the paragraphs that overlap the current text range. | [Paragraph[]](#class-paragraph) | A list of paragraphs. | completed | [link](../src/services/slidesapp/faketextrange.js#L34) |
| [getParagraphStyle()](https://developers.google.com/apps-script/reference/slides/text-range#getParagraphStyle()) | Returns the ParagraphStyle of the current text range. | [ParagraphStyle](#class-paragraphstyle) | The paragraph style of the current text range. | not started |  |
| [getRange(Integer,Integer)](https://developers.google.com/apps-script/reference/slides/text-range#getRange(Integer,Integer)) |  |  |  | not started |  |
| [getRuns()](https://developers.google.com/apps-script/reference/slides/text-range#getRuns()) | Returns the text runs that overlap the current text range. A text run is a segment of text where all the characters have the same text style. | [TextRange[]](#class-textrange) | A list of text ranges. | not started |  |
| [getStartIndex()](https://developers.google.com/apps-script/reference/slides/text-range#getStartIndex()) | Returns the inclusive, 0-based index for the first character in this range. If the start and end indices are equal, the range is considered to be empty. | Integer | The start index of the range. | completed | [link](../src/services/slidesapp/faketextrange.js#L26) |
| [getTextStyle()](https://developers.google.com/apps-script/reference/slides/text-range#getTextStyle()) | Returns the text style of the range, or null if the range is empty. | [TextStyle](#class-textstyle) | The text style of the range. | not started |  |
| [insertParagraph(Integer,String)](https://developers.google.com/apps-script/reference/slides/text-range#insertParagraph(Integer,String)) |  |  |  | not started |  |
| [insertRange(Integer,TextRange,Boolean)](https://developers.google.com/apps-script/reference/slides/text-range#insertRange(Integer,TextRange,Boolean)) |  |  |  | not started |  |
| [insertRange(Integer,TextRange)](https://developers.google.com/apps-script/reference/slides/text-range#insertRange(Integer,TextRange)) |  |  |  | not started |  |
| [insertText(Integer,String)](https://developers.google.com/apps-script/reference/slides/text-range#insertText(Integer,String)) |  |  |  | completed | [link](../src/services/slidesapp/faketextrange.js#L105) |
| [isEmpty()](https://developers.google.com/apps-script/reference/slides/text-range#isEmpty()) | Returns true if there are no characters in this range, and returns false otherwise. | Boolean | true if there are no characters in this range, and returns false otherwise. | completed | [link](../src/services/slidesapp/faketextrange.js#L246) |
| [replaceAllText(String,String,Boolean)](https://developers.google.com/apps-script/reference/slides/text-range#replaceAllText(String,String,Boolean)) |  |  |  | not started |  |
| [replaceAllText(String,String)](https://developers.google.com/apps-script/reference/slides/text-range#replaceAllText(String,String)) |  |  |  | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/text-range#select()) | Selects only the TextRange in the active presentation and removes any previous selection. |  |  | not started |  |
| [setText(String)](https://developers.google.com/apps-script/reference/slides/text-range#setText(String)) | Sets the text bounded by this range of the associated shape or table cell. The text maintains the styling of the start of the existing text. | [TextRange](#class-textrange) | The text range representing the set text. | completed | [link](../src/services/slidesapp/faketextrange.js#L74) |

## Class: [TextStyle](https://developers.google.com/apps-script/reference/slides/text-style)

The style of text.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getBackgroundColor()](https://developers.google.com/apps-script/reference/slides/text-style#getBackgroundColor()) | Returns the background color of the text, or null if there are multiple styles on the text. |  | Color | not started |  |
| [getBaselineOffset()](https://developers.google.com/apps-script/reference/slides/text-style#getBaselineOffset()) | Returns the vertical offset of text from its normal position, or null if there are multiple styles on the text. |  | TextBaselineOffset | not started |  |
| [getFontFamily()](https://developers.google.com/apps-script/reference/slides/text-style#getFontFamily()) | Returns the font family of the text, or null if there are multiple styles on the text. |  | String | completed | [link](../src/services/common/faketextstyle.js#L37) |
| [getFontSize()](https://developers.google.com/apps-script/reference/slides/text-style#getFontSize()) | Returns the font size of the text in points, or null if there are multiple styles on the text. |  | Number | completed | [link](../src/services/common/faketextstyle.js#L34) |
| [getFontWeight()](https://developers.google.com/apps-script/reference/slides/text-style#getFontWeight()) | Returns the font weight of the text, or null if there are multiple styles on the text. |  | Integer | not started |  |
| [getForegroundColor()](https://developers.google.com/apps-script/reference/slides/text-style#getForegroundColor()) | Returns the foreground color of the text, or null if there are multiple styles on the text. |  | Color | completed | [link](../src/services/common/faketextstyle.js#L40) |
| [getLink()](https://developers.google.com/apps-script/reference/slides/text-style#getLink()) | Returns the Link on the text, or null if there is no link or if the link is on part of the text or if there are multiple links. Call hasLink() to determine whether the text has no link. |  | Link | completed | [link](../src/services/common/faketextstyle.js#L46) |
| [hasLink()](https://developers.google.com/apps-script/reference/slides/text-style#hasLink()) | Returns true if there is link on the text, false if not, or null if the link is on part of the text or there are multiple links. |  | Boolean | not started |  |
| [isBackgroundTransparent()](https://developers.google.com/apps-script/reference/slides/text-style#isBackgroundTransparent()) | Returns true if the background of the text is transparent, false if not, or null if there are multiple styles on the text. |  | Boolean | not started |  |
| [isBold()](https://developers.google.com/apps-script/reference/slides/text-style#isBold()) | Returns true if the text is rendered as bold, false if not, or null if there are multiple styles on the text. |  | Boolean | completed | [link](../src/services/common/faketextstyle.js#L22) |
| [isItalic()](https://developers.google.com/apps-script/reference/slides/text-style#isItalic()) | Returns true if the text is italicized, false if not, or null if there are multiple styles on the text. |  | Boolean | completed | [link](../src/services/common/faketextstyle.js#L25) |
| [isSmallCaps()](https://developers.google.com/apps-script/reference/slides/text-style#isSmallCaps()) | Returns true if the text is in small capital letters, false if not, or null if there are multiple styles on the text. |  | Boolean | not started |  |
| [isStrikethrough()](https://developers.google.com/apps-script/reference/slides/text-style#isStrikethrough()) | Returns true if the text is struck through, false if not, or null if there are multiple styles on the text. |  | Boolean | completed | [link](../src/services/common/faketextstyle.js#L31) |
| [isUnderline()](https://developers.google.com/apps-script/reference/slides/text-style#isUnderline()) | Returns true if the text is underlined, false if not, or null if there are multiple styles on the text. |  | Boolean | completed | [link](../src/services/common/faketextstyle.js#L28) |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/text-style#removeLink()) | Removes a Link. |  | TextStyle | not started |  |
| [setBackgroundColor(Color)](https://developers.google.com/apps-script/reference/slides/text-style#setBackgroundColor(Color)) | Sets the background color of the text. |  | TextStyle | not started |  |
| [setBackgroundColor(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/text-style#setBackgroundColor(Integer,Integer,Integer)) |  |  |  | not started |  |
| [setBackgroundColor(String)](https://developers.google.com/apps-script/reference/slides/text-style#setBackgroundColor(String)) | Sets the background color of the text to the given hex color string. |  | TextStyle | not started |  |
| [setBackgroundColor(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/text-style#setBackgroundColor(ThemeColorType)) | Sets the background color of the text to the given ThemeColorType. |  | TextStyle | not started |  |
| [setBackgroundColorTransparent()](https://developers.google.com/apps-script/reference/slides/text-style#setBackgroundColorTransparent()) | Sets the background color of the text to transparent. |  | TextStyle | not started |  |
| [setBaselineOffset(TextBaselineOffset)](https://developers.google.com/apps-script/reference/slides/text-style#setBaselineOffset(TextBaselineOffset)) | Sets the vertical offset of the text relative to its normal position. |  | TextStyle | not started |  |
| [setBold(Boolean)](https://developers.google.com/apps-script/reference/slides/text-style#setBold(Boolean)) | Sets whether the text should be rendered as bold. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L54) |
| [setFontFamily(String)](https://developers.google.com/apps-script/reference/slides/text-style#setFontFamily(String)) | Sets the font family of the text . |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L58) |
| [setFontFamilyAndWeight(String,Integer)](https://developers.google.com/apps-script/reference/slides/text-style#setFontFamilyAndWeight(String,Integer)) |  |  |  | not started |  |
| [setFontSize(Number)](https://developers.google.com/apps-script/reference/slides/text-style#setFontSize(Number)) | Sets the font size of the text, in points. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L57) |
| [setForegroundColor(Color)](https://developers.google.com/apps-script/reference/slides/text-style#setForegroundColor(Color)) | Sets the foreground color of the text. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L59) |
| [setForegroundColor(Integer,Integer,Integer)](https://developers.google.com/apps-script/reference/slides/text-style#setForegroundColor(Integer,Integer,Integer)) |  |  |  | completed | [link](../src/services/common/faketextstyle.js#L59) |
| [setForegroundColor(String)](https://developers.google.com/apps-script/reference/slides/text-style#setForegroundColor(String)) | Sets the foreground color of the text to the given hex color string. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L59) |
| [setForegroundColor(ThemeColorType)](https://developers.google.com/apps-script/reference/slides/text-style#setForegroundColor(ThemeColorType)) | Sets the foreground color of the text to the given ThemeColorType. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L59) |
| [setItalic(Boolean)](https://developers.google.com/apps-script/reference/slides/text-style#setItalic(Boolean)) | Sets the whether the text is italicized. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L53) |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/text-style#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. |  | TextStyle | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/text-style#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. |  | TextStyle | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/text-style#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. |  | TextStyle | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/text-style#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. |  | TextStyle | not started |  |
| [setSmallCaps(Boolean)](https://developers.google.com/apps-script/reference/slides/text-style#setSmallCaps(Boolean)) | Sets whether the text is rendered in small capital letters. |  | TextStyle | not started |  |
| [setStrikethrough(Boolean)](https://developers.google.com/apps-script/reference/slides/text-style#setStrikethrough(Boolean)) | Sets whether the text is struck through. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L56) |
| [setUnderline(Boolean)](https://developers.google.com/apps-script/reference/slides/text-style#setUnderline(Boolean)) | Sets whether the text is underlined. |  | TextStyle | completed | [link](../src/services/common/faketextstyle.js#L55) |

## Class: [ThemeColor](https://developers.google.com/apps-script/reference/slides/theme-color)

A color that refers to an entry in the page's ColorScheme.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [getColorType()](https://developers.google.com/apps-script/reference/slides/theme-color#getColorType()) | Get the type of this color. | ColorType | The color type. | completed | [link](../src/services/common/fakethemecolor.js#L26) |
| [getThemeColorType()](https://developers.google.com/apps-script/reference/slides/theme-color#getThemeColorType()) | Get the theme color type of this color. |  | ThemeColorType | completed | [link](../src/services/common/fakethemecolor.js#L34) |

## Class: [Video](https://developers.google.com/apps-script/reference/slides/video)

A PageElement representing a video.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/video#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/video#bringForward()) | Brings the page element forward on the page by one element. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/video#bringToFront()) | Brings the page element to the front of the page. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/video#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getBorder()](https://developers.google.com/apps-script/reference/slides/video#getBorder()) | Returns the Border of the video. | [Border](#class-border) | The border setting for this video. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/video#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/video#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/video#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/video#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/video#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/video#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/video#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/video#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/video#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/video#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/video#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getSource()](https://developers.google.com/apps-script/reference/slides/video#getSource()) | Gets the video source. | [VideoSourceType](#enum-videosourcetype) | The source of this video. | not started |  |
| [getThumbnailUrl()](https://developers.google.com/apps-script/reference/slides/video#getThumbnailUrl()) | Gets an URL to the video thumbnail. This URL is tagged with the account of the requester. Anyone with the URL effectively accesses the thumbnail as the original requester. Access to the thumbnail may be lost if the presentation's sharing settings change. The URL expires after a short period of time. | String | The URL of the video thumbnail. | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/video#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/video#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/video#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getUrl()](https://developers.google.com/apps-script/reference/slides/video#getUrl()) | Gets an URL to the video. The URL is valid as long as the source video exists and sharing settings do not change. Returns null when the video source is not supported. | String | The URL of this video, or null if the video source is not supported. | not started |  |
| [getVideoId()](https://developers.google.com/apps-script/reference/slides/video#getVideoId()) | Gets the video source's unique identifier for this video. | String | The source ID for this video. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/video#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/video#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/video#remove()) | Removes the page element. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/video#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/video#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/video#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/video#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/video#sendBackward()) | Sends the page element backward on the page by one element. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/video#sendToBack()) | Sends the page element to the back of the page. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/video#setDescription(String)) | Sets the page element's alt text description. | [Video](#class-video) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/video#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/video#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/video#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/video#setTitle(String)) | Sets the page element's alt text title. | [Video](#class-video) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/video#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/video#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [Video](#class-video) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/video#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [Video](#class-video) | This page element, for chaining. | not started |  |

## Class: [WordArt](https://developers.google.com/apps-script/reference/slides/word-art)

A PageElement representing word art.

| Method | Description | Return Type | Return Description | Status | Implementation |
|--- |--- |--- |--- |--- |--- |
| [alignOnPage(AlignmentPosition)](https://developers.google.com/apps-script/reference/slides/word-art#alignOnPage(AlignmentPosition)) | Aligns the element to the specified alignment position on the page. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [bringForward()](https://developers.google.com/apps-script/reference/slides/word-art#bringForward()) | Brings the page element forward on the page by one element. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [bringToFront()](https://developers.google.com/apps-script/reference/slides/word-art#bringToFront()) | Brings the page element to the front of the page. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [duplicate()](https://developers.google.com/apps-script/reference/slides/word-art#duplicate()) | Duplicates the page element. | [PageElement](#class-pageelement) | The new duplicate of this page element. | not started |  |
| [getConnectionSites()](https://developers.google.com/apps-script/reference/slides/word-art#getConnectionSites()) | Returns the list of ConnectionSites on the page element, or an empty list if the page element does not have any connection sites. | [ConnectionSite[]](#class-connectionsite) | The connection sites list, which may be empty if this element has no connection sites. | not started |  |
| [getDescription()](https://developers.google.com/apps-script/reference/slides/word-art#getDescription()) | Returns the page element's alt text description. The description is combined with the title to display and read alt text. | String | The page element's alt text description. | not started |  |
| [getHeight()](https://developers.google.com/apps-script/reference/slides/word-art#getHeight()) | Gets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentHeight()](https://developers.google.com/apps-script/reference/slides/word-art#getInherentHeight()) | Returns the element's inherent height in points. | Number | The page element's inherent height in points, or null if the page element does not have a height. | not started |  |
| [getInherentWidth()](https://developers.google.com/apps-script/reference/slides/word-art#getInherentWidth()) | Returns the element's inherent width in points. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [getLeft()](https://developers.google.com/apps-script/reference/slides/word-art#getLeft()) | Returns the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's horizontal position in points, from the upper-left corner of the page. | not started |  |
| [getLink()](https://developers.google.com/apps-script/reference/slides/word-art#getLink()) | Returns the Link or null if there is no link. | [Link](#class-link) | The Link or null if there is no link. | not started |  |
| [getObjectId()](https://developers.google.com/apps-script/reference/slides/word-art#getObjectId()) | Returns the unique ID for this object. Object IDs used by pages and page elements share the same namespace. | String | The unique ID for this object. | not started |  |
| [getPageElementType()](https://developers.google.com/apps-script/reference/slides/word-art#getPageElementType()) | Returns the page element's type, represented as a PageElementType enum. | [PageElementType](#enum-pageelementtype) | The page element's type. | not started |  |
| [getParentGroup()](https://developers.google.com/apps-script/reference/slides/word-art#getParentGroup()) | Returns the group this page element belongs to, or null if the element is not in a group. | [Group](#class-group) | The group this page element belongs to, or null. | not started |  |
| [getParentPage()](https://developers.google.com/apps-script/reference/slides/word-art#getParentPage()) | Returns the page this page element is on. | [Page](#class-page) | The page this element resides on. | not started |  |
| [getRenderedText()](https://developers.google.com/apps-script/reference/slides/word-art#getRenderedText()) | Gets the text that is rendered as word art. | String | The text that is rendered as this word art. | not started |  |
| [getRotation()](https://developers.google.com/apps-script/reference/slides/word-art#getRotation()) | Returns the element's clockwise rotation angle around its center in degrees, where zero degrees means no rotation. | Number | The rotation angle in degrees between 0 (inclusive) and 360 (exclusive). | not started |  |
| [getTitle()](https://developers.google.com/apps-script/reference/slides/word-art#getTitle()) | Returns the page element's alt text title. The title is combined with the description to display and read alt text. | String | The page element's alt text title. | not started |  |
| [getTop()](https://developers.google.com/apps-script/reference/slides/word-art#getTop()) | Gets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | Number | This element's vertical position in points, from the upper-left corner of the page. | not started |  |
| [getTransform()](https://developers.google.com/apps-script/reference/slides/word-art#getTransform()) | Returns the page element's transform. | [AffineTransform](#class-affinetransform) | The page element's transform. | not started |  |
| [getWidth()](https://developers.google.com/apps-script/reference/slides/word-art#getWidth()) | Returns the element's width in points, which is the width of the element's bounding box when the element has no rotation. | Number | The page element's inherent width in points, or null if the page element does not have a width. | not started |  |
| [preconcatenateTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/word-art#preconcatenateTransform(AffineTransform)) | Preconcatenates the provided transform to the existing transform of the page element. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [remove()](https://developers.google.com/apps-script/reference/slides/word-art#remove()) | Removes the page element. |  |  | not started |  |
| [removeLink()](https://developers.google.com/apps-script/reference/slides/word-art#removeLink()) | Removes a Link. |  |  | not started |  |
| [scaleHeight(Number)](https://developers.google.com/apps-script/reference/slides/word-art#scaleHeight(Number)) | Scales the element's height by the specified ratio. The element's height is the height of its bounding box when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [scaleWidth(Number)](https://developers.google.com/apps-script/reference/slides/word-art#scaleWidth(Number)) | Scales the element's width by the specified ratio. The element's width is the width of its bounding box when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [select()](https://developers.google.com/apps-script/reference/slides/word-art#select()) | Selects only the PageElement in the active presentation and removes any previous selection. This is the same as calling select(replace) with true. |  |  | not started |  |
| [select(Boolean)](https://developers.google.com/apps-script/reference/slides/word-art#select(Boolean)) | Selects the PageElement in the active presentation. |  |  | not started |  |
| [sendBackward()](https://developers.google.com/apps-script/reference/slides/word-art#sendBackward()) | Sends the page element backward on the page by one element. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [sendToBack()](https://developers.google.com/apps-script/reference/slides/word-art#sendToBack()) | Sends the page element to the back of the page. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [setDescription(String)](https://developers.google.com/apps-script/reference/slides/word-art#setDescription(String)) | Sets the page element's alt text description. | [WordArt](#class-wordart) | This page element. | not started |  |
| [setHeight(Number)](https://developers.google.com/apps-script/reference/slides/word-art#setHeight(Number)) | Sets the element's height in points, which is the height of the element's bounding box when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [setLeft(Number)](https://developers.google.com/apps-script/reference/slides/word-art#setLeft(Number)) | Sets the element's horizontal position in points, measured from the upper-left corner of the page when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [setLinkSlide(Integer)](https://developers.google.com/apps-script/reference/slides/word-art#setLinkSlide(Integer)) | Sets a Link to the given Slide using the zero-based index of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(Slide)](https://developers.google.com/apps-script/reference/slides/word-art#setLinkSlide(Slide)) | Sets a Link to the given Slide, the link is set by the given slide ID. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkSlide(SlidePosition)](https://developers.google.com/apps-script/reference/slides/word-art#setLinkSlide(SlidePosition)) | Sets a Link to the given Slide using the relative position of the slide. | [Link](#class-link) | The Link that was set. | not started |  |
| [setLinkUrl(String)](https://developers.google.com/apps-script/reference/slides/word-art#setLinkUrl(String)) | Sets a Link to the given non-empty URL string. | [Link](#class-link) | The Link that was set. | not started |  |
| [setRotation(Number)](https://developers.google.com/apps-script/reference/slides/word-art#setRotation(Number)) | Sets the element's clockwise rotation angle around its center in degrees. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [setTitle(String)](https://developers.google.com/apps-script/reference/slides/word-art#setTitle(String)) | Sets the page element's alt text title. | [WordArt](#class-wordart) | This page element. | not started |  |
| [setTop(Number)](https://developers.google.com/apps-script/reference/slides/word-art#setTop(Number)) | Sets the element's vertical position in points, measured from the upper-left corner of the page when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |
| [setTransform(AffineTransform)](https://developers.google.com/apps-script/reference/slides/word-art#setTransform(AffineTransform)) | Sets the transform of the page element with the provided transform. | [WordArt](#class-wordart) | This element, for chaining. | not started |  |
| [setWidth(Number)](https://developers.google.com/apps-script/reference/slides/word-art#setWidth(Number)) | Sets the element's width in points, which is the width of the element's bounding box when the element has no rotation. | [WordArt](#class-wordart) | This page element, for chaining. | not started |  |

## Enum: [AlignmentPosition](https://developers.google.com/apps-script/reference/slides/alignment-position)

The alignment position to apply.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CENTER | Align to the center. | completed | [link](../src/services/enums/slidesenums.js#L4) |
| HORIZONTAL_CENTER | Align to the horizontal center. | completed | [link](../src/services/enums/slidesenums.js#L5) |
| VERTICAL_CENTER | Align to the vertical center. | completed | [link](../src/services/enums/slidesenums.js#L6) |

## Enum: [ArrowStyle](https://developers.google.com/apps-script/reference/slides/arrow-style)

The kinds of start and end forms with which linear geometry can be rendered.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| FILL_ARROW | Filled arrow. Corresponds to ECMA-376 ST_LineEndType value 'triangle'. | completed | [link](../src/services/enums/slidesenums.js#L13) |
| FILL_CIRCLE | Filled circle. Corresponds to ECMA-376 ST_LineEndType value 'oval'. | completed | [link](../src/services/enums/slidesenums.js#L14) |
| FILL_DIAMOND | Filled diamond. Corresponds to ECMA-376 ST_LineEndType value 'diamond'. | completed | [link](../src/services/enums/slidesenums.js#L16) |
| FILL_SQUARE | Filled square. | completed | [link](../src/services/enums/slidesenums.js#L15) |
| NONE | No arrow. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| OPEN_ARROW | Hollow arrow. | completed | [link](../src/services/enums/slidesenums.js#L17) |
| OPEN_CIRCLE | Hollow circle. | completed | [link](../src/services/enums/slidesenums.js#L18) |
| OPEN_DIAMOND | Hollow diamond. | completed | [link](../src/services/enums/slidesenums.js#L20) |
| OPEN_SQUARE | Hollow square. | completed | [link](../src/services/enums/slidesenums.js#L19) |
| STEALTH_ARROW | Arrow with notched back. Corresponds to ECMA-376 ST_LineEndType value 'stealth'. | completed | [link](../src/services/enums/slidesenums.js#L12) |
| UNSUPPORTED | An arrow style that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [AutofitType](https://developers.google.com/apps-script/reference/slides/autofit-type)

The autofit types.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NONE | Autofit isn't applied. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| SHAPE_AUTOFIT | Resizes the shape to fit the text. | completed | [link](../src/services/enums/slidesenums.js#L34) |
| TEXT_AUTOFIT | Shrinks the text on overflow. | completed | [link](../src/services/enums/slidesenums.js#L33) |
| UNSUPPORTED | An autofit type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [AutoTextType](https://developers.google.com/apps-script/reference/slides/auto-text-type)

The types of auto text.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| SLIDE_NUMBER | A slide number. | completed | [link](../src/services/enums/slidesenums.js#L28) |
| UNSUPPORTED | An auto text type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [CellMergeState](https://developers.google.com/apps-script/reference/slides/cell-merge-state)

The table cell merge states.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| HEAD | The cell is merged and it is the head (i.e. upper left) cell within the merged set of cells. As an example, assume the following table. ------------------- |(0,0)|(0,1)|(0,2)| ------------------- If the first two cells are merged to form the following table, cell (0,0) is the head cell and (0,1) is a merged cell. ------------------- |(0,0) |(0,2)| ------------------- | completed | [link](../src/services/enums/slidesenums.js#L38) |
| MERGED | The cell is merged but is not the head (i.e. upper left) cell. As an example, assume the following table. ------------------- |(0,0)|(0,1)|(0,2)| ------------------- If the first two cells are merged to form the following table, cell (0,0) is the head cell and (0,1) is a merged cell. ------------------- |(0,0) |(0,2)| ------------------- | completed | [link](../src/services/enums/slidesenums.js#L39) |
| NORMAL | The cell is not merged. | completed | [link](../src/services/enums/slidesenums.js#L37) |

## Enum: [ContentAlignment](https://developers.google.com/apps-script/reference/slides/content-alignment)

The content alignments for a Shape or TableCell. The supported alignments correspond to predefined text anchoring types from the ECMA-376 standard.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BOTTOM | Aligns the content to the bottom of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 'b'. | completed | [link](../src/services/enums/slidesenums.js#L50) |
| MIDDLE | Aligns the content to the middle of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 'ctr'. | completed | [link](../src/services/enums/slidesenums.js#L49) |
| TOP | Aligns the content to the top of the content holder. Corresponds to ECMA-376 ST_TextAnchoringType 't'. | completed | [link](../src/services/enums/slidesenums.js#L48) |
| UNSUPPORTED | A content alignment that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [DashStyle](https://developers.google.com/apps-script/reference/slides/dash-style)

The kinds of dashes with which linear geometry can be rendered. These values are based on the "ST_PresetLineDashVal" simple type described in section 20.1.10.48 of "Office Open XML File Formats - Fundamentals and Markup Language Reference", part 1 of ECMA-376 5th edition.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| DASH | Dashed line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'dash'. | completed | [link](../src/services/enums/slidesenums.js#L53) |
| DASH_DOT | Alternating dashes and dots. Corresponds to ECMA-376 ST_PresetLineDashVal value 'dashDot'. | completed | [link](../src/services/enums/slidesenums.js#L58) |
| DOT | Dotted line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'dot'. | completed | [link](../src/services/enums/slidesenums.js#L56) |
| LONG_DASH | Line with large dashes. Corresponds to ECMA-376 ST_PresetLineDashVal value 'lgDash'. | completed | [link](../src/services/enums/slidesenums.js#L59) |
| LONG_DASH_DOT | Alternating large dashes and dots. Corresponds to ECMA-376 ST_PresetLineDashVal value 'lgDashDot'. | completed | [link](../src/services/enums/slidesenums.js#L60) |
| SOLID | Solid line. Corresponds to ECMA-376 ST_PresetLineDashVal value 'solid'. This is the default dash style. | completed | [link](../src/services/enums/slidesenums.js#L55) |
| UNSUPPORTED | A dash style that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [FillType](https://developers.google.com/apps-script/reference/slides/fill-type)

The kinds of fill.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NONE | No fill, so the background is transparent. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| SOLID | A solid color fill. | completed | [link](../src/services/enums/slidesenums.js#L55) |
| UNSUPPORTED | A fill type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [LineCategory](https://developers.google.com/apps-script/reference/slides/line-category)

The line category.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BENT | Bent connectors, including bent connector 2 to 5. | completed | [link](../src/services/enums/slidesenums.js#L72) |
| CURVED | Curved connectors, including curved connector 2 to 5. | completed | [link](../src/services/enums/slidesenums.js#L73) |
| STRAIGHT | Straight connectors, including straight connector 1. | completed | [link](../src/services/enums/slidesenums.js#L71) |
| UNSUPPORTED | A line category that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [LineFillType](https://developers.google.com/apps-script/reference/slides/line-fill-type)

The kinds of line fill.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NONE | No fill, so the line or outline is transparent. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| SOLID | A solid color fill. | completed | [link](../src/services/enums/slidesenums.js#L55) |
| UNSUPPORTED | A line fill type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [LineType](https://developers.google.com/apps-script/reference/slides/line-type)

The line types.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BENT_CONNECTOR_2 | Bent connector 2 form. Corresponds to ECMA-376 ST_ShapeType 'bentConnector2'. | completed | [link](../src/services/enums/slidesenums.js#L84) |
| BENT_CONNECTOR_3 | Bent connector 3 form. Corresponds to ECMA-376 ST_ShapeType 'bentConnector3'. | completed | [link](../src/services/enums/slidesenums.js#L85) |
| BENT_CONNECTOR_4 | Bent connector 4 form. Corresponds to ECMA-376 ST_ShapeType 'bentConnector4'. | completed | [link](../src/services/enums/slidesenums.js#L86) |
| BENT_CONNECTOR_5 | Bent connector 5 form. Corresponds to ECMA-376 ST_ShapeType 'bentConnector5'. | completed | [link](../src/services/enums/slidesenums.js#L87) |
| CURVED_CONNECTOR_2 | Curved connector 2 form. Corresponds to ECMA-376 ST_ShapeType 'curvedConnector2'. | completed | [link](../src/services/enums/slidesenums.js#L88) |
| CURVED_CONNECTOR_3 | Curved connector 3 form. Corresponds to ECMA-376 ST_ShapeType 'curvedConnector3'. | completed | [link](../src/services/enums/slidesenums.js#L89) |
| CURVED_CONNECTOR_4 | Curved connector 4 form. Corresponds to ECMA-376 ST_ShapeType 'curvedConnector4'. | completed | [link](../src/services/enums/slidesenums.js#L90) |
| CURVED_CONNECTOR_5 | Curved connector 5 form. Corresponds to ECMA-376 ST_ShapeType 'curvedConnector5'. | completed | [link](../src/services/enums/slidesenums.js#L91) |
| STRAIGHT_CONNECTOR_1 | Straight connector 1 form. Corresponds to ECMA-376 ST_ShapeType 'straightConnector1'. | completed | [link](../src/services/enums/slidesenums.js#L83) |
| STRAIGHT_LINE | Straight line. Corresponds to ECMA-376 ST_ShapeType 'line'. This line type is not a connector. | completed | [link](../src/services/enums/slidesenums.js#L92) |
| UNSUPPORTED | A line type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [LinkType](https://developers.google.com/apps-script/reference/slides/link-type)

The types of a Link.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| SLIDE_ID | A link to a specific slide in this presentation, addressed by its ID. | completed | [link](../src/services/enums/slidesenums.js#L98) |
| SLIDE_INDEX | A link to a specific slide in this presentation, addressed by its zero-based index. | completed | [link](../src/services/enums/slidesenums.js#L99) |
| SLIDE_POSITION | A link to a specific slide in this presentation, addressed by its position. | completed | [link](../src/services/enums/slidesenums.js#L97) |
| UNSUPPORTED | A link type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |
| URL | A link to an external web page. | completed | [link](../src/services/enums/slidesenums.js#L96) |

## Enum: [ListPreset](https://developers.google.com/apps-script/reference/slides/list-preset)

Preset patterns of glyphs for lists in text.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ARROW_DIAMOND_DISC | A list with a `ARROW`, `DIAMOND` and `DISC` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L105) |
| ARROW3D_CIRCLE_SQUARE | A list with a `ARROW3D`, `CIRCLE` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L107) |
| CHECKBOX | A list with `CHECKBOX` glyphs for all list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L104) |
| DIAMOND_CIRCLE_SQUARE | A list with a `DIAMOND`, `CIRCLE` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L110) |
| DIAMONDX_ARROW3D_SQUARE | A list with a `DIAMONDX`, `ARROW3D` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L103) |
| DIAMONDX_HOLLOWDIAMOND_SQUARE | A list with a `DIAMONDX`, `HOLLOWDIAMOND` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L109) |
| DIGIT_ALPHA_ROMAN | A list with `DIGIT`, `ALPHA` and `ROMAN` glyphs for the first 3 list nesting levels, followed by periods. | completed | [link](../src/services/enums/slidesenums.js#L111) |
| DIGIT_ALPHA_ROMAN_PARENS | A list with `DIGIT`, `ALPHA` and `ROMAN` glyphs for the first 3 list nesting levels, followed by parenthesis. | completed | [link](../src/services/enums/slidesenums.js#L112) |
| DIGIT_NESTED | A list with `DIGIT` glyphs separated by periods, where each nesting level uses the previous nesting level's glyph as a prefix. For example: '1.', '1.1.', '2.', '2.2.'. | completed | [link](../src/services/enums/slidesenums.js#L113) |
| DISC_CIRCLE_SQUARE | A list with a `DISC`, `CIRCLE` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L102) |
| LEFTTRIANGLE_DIAMOND_DISC | A list with a `LEFTTRIANGLE`, `DIAMOND` and `DISC` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L108) |
| STAR_CIRCLE_SQUARE | A list with a `STAR`, `CIRCLE` and `SQUARE` glyphs for the first 3 list nesting levels. | completed | [link](../src/services/enums/slidesenums.js#L106) |
| UPPERALPHA_ALPHA_ROMAN | A list with `UPPERALPHA`, `ALPHA` and `ROMAN` glyphs for the first 3 list nesting levels, followed by periods. | completed | [link](../src/services/enums/slidesenums.js#L114) |
| UPPERROMAN_UPPERALPHA_DIGIT | A list with `UPPERROMAN`, `UPPERALPHA` and `DIGIT` glyphs for the first 3 list nesting levels, followed by periods. | completed | [link](../src/services/enums/slidesenums.js#L115) |
| ZERODIGIT_ALPHA_ROMAN | A list with `ZERODIGIT`, `ALPHA` and `ROMAN` glyphs for the first 3 list nesting levels, followed by periods. | completed | [link](../src/services/enums/slidesenums.js#L116) |

## Enum: [PageBackgroundType](https://developers.google.com/apps-script/reference/slides/page-background-type)

The kinds of page backgrounds.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NONE | No fill, so the background is rendered white. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| PICTURE | A picture that is stretched to fill the page. | completed | [link](../src/services/enums/slidesenums.js#L122) |
| SOLID | A solid color fill. | completed | [link](../src/services/enums/slidesenums.js#L55) |
| UNSUPPORTED | A page background type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [PageElementType](https://developers.google.com/apps-script/reference/slides/page-element-type)

The page element type.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| GROUP | Represents a collection of page elements joined as a single unit. | completed | [link](../src/services/enums/slidesenums.js#L133) |
| IMAGE | Represents an image. | completed | [link](../src/services/enums/slidesenums.js#L130) |
| LINE | Represents a line. | completed | [link](../src/services/enums/slidesenums.js#L66) |
| SHAPE | Represents a generic shape that does not have a more specific classification. | completed | [link](../src/services/enums/slidesenums.js#L34) |
| SHEETS_CHART | Represents a linked chart embedded from Google Sheets. | completed | [link](../src/services/enums/slidesenums.js#L136) |
| SPEAKER_SPOTLIGHT | Represents a speaker spotlight. | completed | [link](../src/services/enums/slidesenums.js#L138) |
| TABLE | Represents a table. | completed | [link](../src/services/enums/slidesenums.js#L132) |
| UNSUPPORTED | Represents a page element that is not supported and cannot be further classified. | completed | [link](../src/services/enums/slidesenums.js#L10) |
| VIDEO | Represents a video. | completed | [link](../src/services/enums/slidesenums.js#L131) |
| WORD_ART | Represents word art. | completed | [link](../src/services/enums/slidesenums.js#L135) |

## Enum: [PageType](https://developers.google.com/apps-script/reference/slides/page-type)

The page types.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| LAYOUT | A layout page. | completed | [link](../src/services/enums/slidesenums.js#L144) |
| MASTER | A master page. | completed | [link](../src/services/enums/slidesenums.js#L145) |
| SLIDE | A slide page. | completed | [link](../src/services/enums/slidesenums.js#L28) |
| UNSUPPORTED | A page type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [ParagraphAlignment](https://developers.google.com/apps-script/reference/slides/paragraph-alignment)

The types of text alignment for a paragraph.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CENTER | The paragraph is centered. | completed | [link](../src/services/enums/slidesenums.js#L4) |
| END | The paragraph is aligned to the end of the line. Right-aligned for left-to-right text, left-aligned otherwise. | completed | [link](../src/services/enums/slidesenums.js#L151) |
| JUSTIFIED | The paragraph is justified. | completed | [link](../src/services/enums/slidesenums.js#L152) |
| START | The paragraph is aligned to the start of the line. Left-aligned for left-to-right text, right-aligned otherwise. | completed | [link](../src/services/enums/slidesenums.js#L149) |
| UNSUPPORTED | A paragraph alignment that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [PlaceholderType](https://developers.google.com/apps-script/reference/slides/placeholder-type)

The placeholder types. Many of these placeholder types correspond to placeholder IDs from the ECMA-376 standard. More information on those shapes can be found in the description of the "ST_PlaceholderType" type in section 19.7.10 of "Office Open XML File Formats - Fundamentals and Markup Language Reference", part 1 of ECMA-376 5th edition.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BODY | Body text. | completed | [link](../src/services/enums/slidesenums.js#L158) |
| CENTERED_TITLE | Title centered. | completed | [link](../src/services/enums/slidesenums.js#L161) |
| CHART | Chart or graph. | completed | [link](../src/services/enums/slidesenums.js#L136) |
| CLIP_ART | Clip art image. | completed | [link](../src/services/enums/slidesenums.js#L160) |
| DATE_AND_TIME | Date and time. | completed | [link](../src/services/enums/slidesenums.js#L163) |
| DIAGRAM | Diagram. | completed | [link](../src/services/enums/slidesenums.js#L162) |
| FOOTER | Footer text. | completed | [link](../src/services/enums/slidesenums.js#L164) |
| HEADER | Header text. | completed | [link](../src/services/enums/slidesenums.js#L165) |
| MEDIA | Multimedia. | completed | [link](../src/services/enums/slidesenums.js#L166) |
| NONE | Not a Placeholder. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| OBJECT | Any content type. | completed | [link](../src/services/enums/slidesenums.js#L167) |
| PICTURE | Picture. | completed | [link](../src/services/enums/slidesenums.js#L122) |
| SLIDE_IMAGE | Slide image. | completed | [link](../src/services/enums/slidesenums.js#L173) |
| SLIDE_NUMBER | Number of a slide. | completed | [link](../src/services/enums/slidesenums.js#L28) |
| SUBTITLE | Subtitle. | completed | [link](../src/services/enums/slidesenums.js#L170) |
| TABLE | Table. | completed | [link](../src/services/enums/slidesenums.js#L132) |
| TITLE | Slide title. | completed | [link](../src/services/enums/slidesenums.js#L161) |
| UNSUPPORTED | A placeholder type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [PredefinedLayout](https://developers.google.com/apps-script/reference/slides/predefined-layout)

Predefined layouts. These are commonly found layouts in presentations. However, there is no guarantee that these layouts are present in the current master as they could have been deleted or not part of the used theme. Additionally, the placeholders on each layout may have been changed.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| BIG_NUMBER | Layout with a big number heading. | completed | [link](../src/services/enums/slidesenums.js#L188) |
| BLANK | Blank layout, with no placeholders. | completed | [link](../src/services/enums/slidesenums.js#L178) |
| CAPTION_ONLY | Layout with a caption at the bottom. | completed | [link](../src/services/enums/slidesenums.js#L179) |
| MAIN_POINT | Layout with a main point. | completed | [link](../src/services/enums/slidesenums.js#L187) |
| ONE_COLUMN_TEXT | Layout with one title and one body, arranged in a single column. | completed | [link](../src/services/enums/slidesenums.js#L186) |
| SECTION_HEADER | Layout with a section title. | completed | [link](../src/services/enums/slidesenums.js#L184) |
| SECTION_TITLE_AND_DESCRIPTION | Layout with a title and subtitle on one side and description on the other. | completed | [link](../src/services/enums/slidesenums.js#L185) |
| TITLE | Layout with a title and a subtitle. | completed | [link](../src/services/enums/slidesenums.js#L161) |
| TITLE_AND_BODY | Layout with a title and body. | completed | [link](../src/services/enums/slidesenums.js#L181) |
| TITLE_AND_TWO_COLUMNS | Layout with a title and two columns. | completed | [link](../src/services/enums/slidesenums.js#L182) |
| TITLE_ONLY | Layout with only a title. | completed | [link](../src/services/enums/slidesenums.js#L183) |
| UNSUPPORTED | A layout that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [SelectionType](https://developers.google.com/apps-script/reference/slides/selection-type)

Type of Selection.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| CURRENT_PAGE | Current page selection. | completed | [link](../src/services/enums/slidesenums.js#L217) |
| NONE | No selection. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| PAGE | Page selection in the thumbnail flimstrip. | completed | [link](../src/services/enums/slidesenums.js#L127) |
| PAGE_ELEMENT | Page element selection. | completed | [link](../src/services/enums/slidesenums.js#L127) |
| TABLE_CELL | Table cell selection. | completed | [link](../src/services/enums/slidesenums.js#L214) |
| TEXT | Text selection. | completed | [link](../src/services/enums/slidesenums.js#L33) |
| UNSUPPORTED | A selection type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [ShapeType](https://developers.google.com/apps-script/reference/slides/shape-type)

The shape types. Many of these shapes correspond to predefined shapes from the ECMA-376 standard. More information on those shapes can be found in the description of the "ST_ShapeType" simple type in section 20.1.10.55 of "Office Open XML File Formats - Fundamentals and Markup Language Reference", part 1 of ECMA-376 5th edition.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ARC | Curved arc shape. Corresponds to ECMA-376 ST_ShapeType 'arc'. | completed | [link](../src/services/enums/slidesenums.js#L230) |
| ARROW_EAST | East arrow shape. | completed | [link](../src/services/enums/slidesenums.js#L358) |
| ARROW_NORTH | North arrow shape. | completed | [link](../src/services/enums/slidesenums.js#L359) |
| ARROW_NORTH_EAST | Northeast arrow shape. | completed | [link](../src/services/enums/slidesenums.js#L359) |
| BENT_ARROW | Bent arrow shape. Corresponds to ECMA-376 ST_ShapeType 'bentArrow'. | completed | [link](../src/services/enums/slidesenums.js#L231) |
| BENT_UP_ARROW | Bent up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'bentUpArrow'. | completed | [link](../src/services/enums/slidesenums.js#L232) |
| BEVEL | Bevel shape. Corresponds to ECMA-376 ST_ShapeType 'bevel'. | completed | [link](../src/services/enums/slidesenums.js#L233) |
| BLOCK_ARC | Block arc shape. Corresponds to ECMA-376 ST_ShapeType 'blockArc'. | completed | [link](../src/services/enums/slidesenums.js#L234) |
| BRACE_PAIR | Brace pair shape. Corresponds to ECMA-376 ST_ShapeType 'bracePair'. | completed | [link](../src/services/enums/slidesenums.js#L235) |
| BRACKET_PAIR | Bracket pair shape. Corresponds to ECMA-376 ST_ShapeType 'bracketPair'. | completed | [link](../src/services/enums/slidesenums.js#L236) |
| CAN | Can shape. Corresponds to ECMA-376 ST_ShapeType 'can'. | completed | [link](../src/services/enums/slidesenums.js#L237) |
| CHEVRON | Chevron shape. Corresponds to ECMA-376 ST_ShapeType 'chevron'. | completed | [link](../src/services/enums/slidesenums.js#L238) |
| CHORD | Chord shape. Corresponds to ECMA-376 ST_ShapeType 'chord'. | completed | [link](../src/services/enums/slidesenums.js#L239) |
| CLOUD | Cloud shape. Corresponds to ECMA-376 ST_ShapeType 'cloud'. | completed | [link](../src/services/enums/slidesenums.js#L240) |
| CLOUD_CALLOUT | Callout cloud shape. Corresponds to ECMA-376 ST_ShapeType 'cloudCallout'. | completed | [link](../src/services/enums/slidesenums.js#L366) |
| CORNER | Corner shape. Corresponds to ECMA-376 ST_ShapeType 'corner'. | completed | [link](../src/services/enums/slidesenums.js#L241) |
| CUBE | Cube shape. Corresponds to ECMA-376 ST_ShapeType 'cube'. | completed | [link](../src/services/enums/slidesenums.js#L242) |
| CURVED_DOWN_ARROW | Curved down arrow shape. Corresponds to ECMA-376 ST_ShapeType 'curvedDownArrow'. | completed | [link](../src/services/enums/slidesenums.js#L243) |
| CURVED_LEFT_ARROW | Curved left arrow shape. Corresponds to ECMA-376 ST_ShapeType 'curvedLeftArrow'. | completed | [link](../src/services/enums/slidesenums.js#L244) |
| CURVED_RIGHT_ARROW | Curved right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'curvedRightArrow'. | completed | [link](../src/services/enums/slidesenums.js#L245) |
| CURVED_UP_ARROW | Curved up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'curvedUpArrow'. | completed | [link](../src/services/enums/slidesenums.js#L246) |
| CUSTOM | Custom shape. | completed | [link](../src/services/enums/slidesenums.js#L367) |
| DECAGON | Decagon shape. Corresponds to ECMA-376 ST_ShapeType 'decagon'. | completed | [link](../src/services/enums/slidesenums.js#L247) |
| DIAGONAL_STRIPE | Diagonal stripe shape. Corresponds to ECMA-376 ST_ShapeType 'diagStripe'. | completed | [link](../src/services/enums/slidesenums.js#L248) |
| DIAMOND | Diamond shape. Corresponds to ECMA-376 ST_ShapeType 'diamond'. | completed | [link](../src/services/enums/slidesenums.js#L16) |
| DODECAGON | Dodecagon shape. Corresponds to ECMA-376 ST_ShapeType 'dodecagon'. | completed | [link](../src/services/enums/slidesenums.js#L250) |
| DONUT | Donut shape. Corresponds to ECMA-376 ST_ShapeType 'donut'. | completed | [link](../src/services/enums/slidesenums.js#L251) |
| DOUBLE_WAVE | Double wave shape. Corresponds to ECMA-376 ST_ShapeType 'doubleWave'. | completed | [link](../src/services/enums/slidesenums.js#L252) |
| DOWN_ARROW | Down arrow shape. Corresponds to ECMA-376 ST_ShapeType 'downArrow'. | completed | [link](../src/services/enums/slidesenums.js#L243) |
| DOWN_ARROW_CALLOUT | Callout down arrow shape. Corresponds to ECMA-376 ST_ShapeType 'downArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L254) |
| ELLIPSE | Ellipse shape. Corresponds to ECMA-376 ST_ShapeType 'ellipse'. | completed | [link](../src/services/enums/slidesenums.js#L229) |
| ELLIPSE_RIBBON | Ellipse ribbon shape. Corresponds to ECMA-376 ST_ShapeType 'ellipseRibbon'. | completed | [link](../src/services/enums/slidesenums.js#L364) |
| ELLIPSE_RIBBON_2 | Ellipse ribbon 2 shape. Corresponds to ECMA-376 ST_ShapeType 'ellipseRibbon2'. | completed | [link](../src/services/enums/slidesenums.js#L365) |
| FLOW_CHART_ALTERNATE_PROCESS | Alternate process flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartAlternateProcess'. | completed | [link](../src/services/enums/slidesenums.js#L329) |
| FLOW_CHART_COLLATE | Collate flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartCollate'. | completed | [link](../src/services/enums/slidesenums.js#L330) |
| FLOW_CHART_CONNECTOR | Connector flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartConnector'. | completed | [link](../src/services/enums/slidesenums.js#L331) |
| FLOW_CHART_DECISION | Decision flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartDecision'. | completed | [link](../src/services/enums/slidesenums.js#L332) |
| FLOW_CHART_DELAY | Delay flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartDelay'. | completed | [link](../src/services/enums/slidesenums.js#L333) |
| FLOW_CHART_DISPLAY | Display flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartDisplay'. | completed | [link](../src/services/enums/slidesenums.js#L334) |
| FLOW_CHART_DOCUMENT | Document flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartDocument'. | completed | [link](../src/services/enums/slidesenums.js#L335) |
| FLOW_CHART_EXTRACT | Extract flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartExtract'. | completed | [link](../src/services/enums/slidesenums.js#L336) |
| FLOW_CHART_INPUT_OUTPUT | Input output flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartInputOutput'. | completed | [link](../src/services/enums/slidesenums.js#L337) |
| FLOW_CHART_INTERNAL_STORAGE | Internal storage flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartInternalStorage'. | completed | [link](../src/services/enums/slidesenums.js#L338) |
| FLOW_CHART_MAGNETIC_DISK | Magnetic disk flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartMagneticDisk'. | completed | [link](../src/services/enums/slidesenums.js#L339) |
| FLOW_CHART_MAGNETIC_DRUM | Magnetic drum flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartMagneticDrum'. | completed | [link](../src/services/enums/slidesenums.js#L340) |
| FLOW_CHART_MAGNETIC_TAPE | Magnetic tape flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartMagneticTape'. | completed | [link](../src/services/enums/slidesenums.js#L341) |
| FLOW_CHART_MANUAL_INPUT | Manual input flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartManualInput'. | completed | [link](../src/services/enums/slidesenums.js#L342) |
| FLOW_CHART_MANUAL_OPERATION | Manual operation flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartManualOperation'. | completed | [link](../src/services/enums/slidesenums.js#L343) |
| FLOW_CHART_MERGE | Merge flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartMerge'. | completed | [link](../src/services/enums/slidesenums.js#L344) |
| FLOW_CHART_MULTIDOCUMENT | Multi-document flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartMultidocument'. | completed | [link](../src/services/enums/slidesenums.js#L345) |
| FLOW_CHART_OFFLINE_STORAGE | Offline storage flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartOfflineStorage'. | completed | [link](../src/services/enums/slidesenums.js#L346) |
| FLOW_CHART_OFFPAGE_CONNECTOR | Off-page connector flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartOffpageConnector'. | completed | [link](../src/services/enums/slidesenums.js#L347) |
| FLOW_CHART_ONLINE_STORAGE | Online storage flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartOnlineStorage'. | completed | [link](../src/services/enums/slidesenums.js#L348) |
| FLOW_CHART_OR | Or flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartOr'. | completed | [link](../src/services/enums/slidesenums.js#L349) |
| FLOW_CHART_PREDEFINED_PROCESS | Predefined process flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartPredefinedProcess'. | completed | [link](../src/services/enums/slidesenums.js#L350) |
| FLOW_CHART_PREPARATION | Preparation flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartPreparation'. | completed | [link](../src/services/enums/slidesenums.js#L351) |
| FLOW_CHART_PROCESS | Process flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartProcess'. | completed | [link](../src/services/enums/slidesenums.js#L352) |
| FLOW_CHART_PUNCHED_CARD | Punched card flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartPunchedCard'. | completed | [link](../src/services/enums/slidesenums.js#L353) |
| FLOW_CHART_PUNCHED_TAPE | Punched tape flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartPunchedTape'. | completed | [link](../src/services/enums/slidesenums.js#L354) |
| FLOW_CHART_SORT | Sort flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartSort'. | completed | [link](../src/services/enums/slidesenums.js#L355) |
| FLOW_CHART_SUMMING_JUNCTION | Summing junction flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartSummingJunction'. | completed | [link](../src/services/enums/slidesenums.js#L356) |
| FLOW_CHART_TERMINATOR | Terminator flow shape. Corresponds to ECMA-376 ST_ShapeType 'flowChartTerminator'. | completed | [link](../src/services/enums/slidesenums.js#L357) |
| FOLDED_CORNER | Folded corner shape. Corresponds to ECMA-376 ST_ShapeType 'foldedCorner'. | completed | [link](../src/services/enums/slidesenums.js#L255) |
| FRAME | Frame shape. Corresponds to ECMA-376 ST_ShapeType 'frame'. | completed | [link](../src/services/enums/slidesenums.js#L256) |
| HALF_FRAME | Half frame shape. Corresponds to ECMA-376 ST_ShapeType 'halfFrame'. | completed | [link](../src/services/enums/slidesenums.js#L257) |
| HEART | Heart shape. Corresponds to ECMA-376 ST_ShapeType 'heart'. | completed | [link](../src/services/enums/slidesenums.js#L258) |
| HEPTAGON | Heptagon shape. Corresponds to ECMA-376 ST_ShapeType 'heptagon'. | completed | [link](../src/services/enums/slidesenums.js#L259) |
| HEXAGON | Hexagon shape. Corresponds to ECMA-376 ST_ShapeType 'hexagon'. | completed | [link](../src/services/enums/slidesenums.js#L260) |
| HOME_PLATE | Home plate shape. Corresponds to ECMA-376 ST_ShapeType 'homePlate'. | completed | [link](../src/services/enums/slidesenums.js#L261) |
| HORIZONTAL_SCROLL | Horizontal scroll shape. Corresponds to ECMA-376 ST_ShapeType 'horizontalScroll'. | completed | [link](../src/services/enums/slidesenums.js#L262) |
| IRREGULAR_SEAL_1 | Irregular seal 1 shape. Corresponds to ECMA-376 ST_ShapeType 'irregularSeal1'. | completed | [link](../src/services/enums/slidesenums.js#L263) |
| IRREGULAR_SEAL_2 | Irregular seal 2 shape. Corresponds to ECMA-376 ST_ShapeType 'irregularSeal2'. | completed | [link](../src/services/enums/slidesenums.js#L264) |
| LEFT_ARROW | Left arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftArrow'. | completed | [link](../src/services/enums/slidesenums.js#L244) |
| LEFT_ARROW_CALLOUT | Callout left arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L266) |
| LEFT_BRACE | Left brace shape. Corresponds to ECMA-376 ST_ShapeType 'leftBrace'. | completed | [link](../src/services/enums/slidesenums.js#L267) |
| LEFT_BRACKET | Left bracket shape. Corresponds to ECMA-376 ST_ShapeType 'leftBracket'. | completed | [link](../src/services/enums/slidesenums.js#L268) |
| LEFT_RIGHT_ARROW | Left right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftRightArrow'. | completed | [link](../src/services/enums/slidesenums.js#L269) |
| LEFT_RIGHT_ARROW_CALLOUT | Callout left right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftRightArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L270) |
| LEFT_RIGHT_UP_ARROW | Left right up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftRightUpArrow'. | completed | [link](../src/services/enums/slidesenums.js#L271) |
| LEFT_UP_ARROW | Left up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'leftUpArrow'. | completed | [link](../src/services/enums/slidesenums.js#L272) |
| LIGHTNING_BOLT | Lightning bolt shape. Corresponds to ECMA-376 ST_ShapeType 'lightningBolt'. | completed | [link](../src/services/enums/slidesenums.js#L273) |
| MATH_DIVIDE | Divide math shape. Corresponds to ECMA-376 ST_ShapeType 'mathDivide'. | completed | [link](../src/services/enums/slidesenums.js#L274) |
| MATH_EQUAL | Equal math shape. Corresponds to ECMA-376 ST_ShapeType 'mathEqual'. | completed | [link](../src/services/enums/slidesenums.js#L275) |
| MATH_MINUS | Minus math shape. Corresponds to ECMA-376 ST_ShapeType 'mathMinus'. | completed | [link](../src/services/enums/slidesenums.js#L276) |
| MATH_MULTIPLY | Multiply math shape. Corresponds to ECMA-376 ST_ShapeType 'mathMultiply'. | completed | [link](../src/services/enums/slidesenums.js#L277) |
| MATH_NOT_EQUAL | Not equal math shape. Corresponds to ECMA-376 ST_ShapeType 'mathNotEqual'. | completed | [link](../src/services/enums/slidesenums.js#L278) |
| MATH_PLUS | Plus math shape. Corresponds to ECMA-376 ST_ShapeType 'mathPlus'. | completed | [link](../src/services/enums/slidesenums.js#L279) |
| MOON | Moon shape. Corresponds to ECMA-376 ST_ShapeType 'moon'. | completed | [link](../src/services/enums/slidesenums.js#L280) |
| NO_SMOKING | No smoking shape. Corresponds to ECMA-376 ST_ShapeType 'noSmoking'. | completed | [link](../src/services/enums/slidesenums.js#L281) |
| NOTCHED_RIGHT_ARROW | Notched right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'notchedRightArrow'. | completed | [link](../src/services/enums/slidesenums.js#L282) |
| OCTAGON | Octagon shape. Corresponds to ECMA-376 ST_ShapeType 'octagon'. | completed | [link](../src/services/enums/slidesenums.js#L283) |
| PARALLELOGRAM | Parallelogram shape. Corresponds to ECMA-376 ST_ShapeType 'parallelogram'. | completed | [link](../src/services/enums/slidesenums.js#L284) |
| PENTAGON | Pentagon shape. Corresponds to ECMA-376 ST_ShapeType 'pentagon'. | completed | [link](../src/services/enums/slidesenums.js#L285) |
| PIE | Pie shape. Corresponds to ECMA-376 ST_ShapeType 'pie'. | completed | [link](../src/services/enums/slidesenums.js#L286) |
| PLAQUE | Plaque shape. Corresponds to ECMA-376 ST_ShapeType 'plaque'. | completed | [link](../src/services/enums/slidesenums.js#L287) |
| PLUS | Plus shape. Corresponds to ECMA-376 ST_ShapeType 'plus'. | completed | [link](../src/services/enums/slidesenums.js#L279) |
| QUAD_ARROW | Quad-arrow shape. Corresponds to ECMA-376 ST_ShapeType 'quadArrow'. | completed | [link](../src/services/enums/slidesenums.js#L289) |
| QUAD_ARROW_CALLOUT | Callout quad-arrow shape. Corresponds to ECMA-376 ST_ShapeType 'quadArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L290) |
| RECTANGLE | Rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'rect'. | completed | [link](../src/services/enums/slidesenums.js#L227) |
| RIBBON | Ribbon shape. Corresponds to ECMA-376 ST_ShapeType 'ribbon'. | completed | [link](../src/services/enums/slidesenums.js#L291) |
| RIBBON_2 | Ribbon 2 shape. Corresponds to ECMA-376 ST_ShapeType 'ribbon2'. | completed | [link](../src/services/enums/slidesenums.js#L292) |
| RIGHT_ARROW | Right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'rightArrow'. | completed | [link](../src/services/enums/slidesenums.js#L245) |
| RIGHT_ARROW_CALLOUT | Callout right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'rightArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L270) |
| RIGHT_BRACE | Right brace shape. Corresponds to ECMA-376 ST_ShapeType 'rightBrace'. | completed | [link](../src/services/enums/slidesenums.js#L295) |
| RIGHT_BRACKET | Right bracket shape. Corresponds to ECMA-376 ST_ShapeType 'rightBracket'. | completed | [link](../src/services/enums/slidesenums.js#L296) |
| RIGHT_TRIANGLE | Right triangle shape. Corresponds to ECMA-376 ST_ShapeType 'rtTriangle'. | completed | [link](../src/services/enums/slidesenums.js#L300) |
| ROUND_1_RECTANGLE | One round corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'round1Rect'. | completed | [link](../src/services/enums/slidesenums.js#L297) |
| ROUND_2_DIAGONAL_RECTANGLE | Two diagonal round corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'round2DiagRect'. | completed | [link](../src/services/enums/slidesenums.js#L298) |
| ROUND_2_SAME_RECTANGLE | Two same-side round corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'round2SameRect'. | completed | [link](../src/services/enums/slidesenums.js#L299) |
| ROUND_RECTANGLE | Round corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'roundRect'. | completed | [link](../src/services/enums/slidesenums.js#L228) |
| SMILEY_FACE | Smiley face shape. Corresponds to ECMA-376 ST_ShapeType 'smileyFace'. | completed | [link](../src/services/enums/slidesenums.js#L301) |
| SNIP_1_RECTANGLE | One snip corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'snip1Rect'. | completed | [link](../src/services/enums/slidesenums.js#L302) |
| SNIP_2_DIAGONAL_RECTANGLE | Two diagonal snip corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'snip2DiagRect'. | completed | [link](../src/services/enums/slidesenums.js#L303) |
| SNIP_2_SAME_RECTANGLE | Two same-side snip corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'snip2SameRect'. | completed | [link](../src/services/enums/slidesenums.js#L304) |
| SNIP_ROUND_RECTANGLE | One snip one round corner rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'snipRoundRect'. | completed | [link](../src/services/enums/slidesenums.js#L305) |
| SPEECH | Speech shape. | completed | [link](../src/services/enums/slidesenums.js#L361) |
| STAR_10 | Ten pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star10'. | completed | [link](../src/services/enums/slidesenums.js#L306) |
| STAR_12 | Twelve pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star12'. | completed | [link](../src/services/enums/slidesenums.js#L307) |
| STAR_16 | Sixteen pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star16'. | completed | [link](../src/services/enums/slidesenums.js#L308) |
| STAR_24 | Twenty four pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star24'. | completed | [link](../src/services/enums/slidesenums.js#L309) |
| STAR_32 | Thirty two pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star32'. | completed | [link](../src/services/enums/slidesenums.js#L310) |
| STAR_4 | Four pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star4'. | completed | [link](../src/services/enums/slidesenums.js#L311) |
| STAR_5 | Five pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star5'. | completed | [link](../src/services/enums/slidesenums.js#L312) |
| STAR_6 | Six pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star6'. | completed | [link](../src/services/enums/slidesenums.js#L313) |
| STAR_7 | Seven pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star7'. | completed | [link](../src/services/enums/slidesenums.js#L314) |
| STAR_8 | Eight pointed star shape. Corresponds to ECMA-376 ST_ShapeType 'star8'. | completed | [link](../src/services/enums/slidesenums.js#L315) |
| STARBURST | Star burst shape. | completed | [link](../src/services/enums/slidesenums.js#L362) |
| STRIPED_RIGHT_ARROW | Striped right arrow shape. Corresponds to ECMA-376 ST_ShapeType 'stripedRightArrow'. | completed | [link](../src/services/enums/slidesenums.js#L316) |
| SUN | Sun shape. Corresponds to ECMA-376 ST_ShapeType 'sun'. | completed | [link](../src/services/enums/slidesenums.js#L317) |
| TEARDROP | Teardrop shape. Corresponds to ECMA-376 ST_ShapeType 'teardrop'. | completed | [link](../src/services/enums/slidesenums.js#L363) |
| TEXT_BOX | Text box shape. | completed | [link](../src/services/enums/slidesenums.js#L226) |
| TRAPEZOID | Trapezoid shape. Corresponds to ECMA-376 ST_ShapeType 'trapezoid'. | completed | [link](../src/services/enums/slidesenums.js#L318) |
| TRIANGLE | Triangle shape. Corresponds to ECMA-376 ST_ShapeType 'triangle'. | completed | [link](../src/services/enums/slidesenums.js#L108) |
| UNSUPPORTED | A shape type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |
| UP_ARROW | Up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'upArrow'. | completed | [link](../src/services/enums/slidesenums.js#L232) |
| UP_ARROW_CALLOUT | Callout up arrow shape. Corresponds to ECMA-376 ST_ShapeType 'upArrowCallout'. | completed | [link](../src/services/enums/slidesenums.js#L321) |
| UP_DOWN_ARROW | Up down arrow shape. Corresponds to ECMA-376 ST_ShapeType 'upDownArrow'. | completed | [link](../src/services/enums/slidesenums.js#L322) |
| UTURN_ARROW | U-turn arrow shape. Corresponds to ECMA-376 ST_ShapeType 'uturnArrow'. | completed | [link](../src/services/enums/slidesenums.js#L323) |
| VERTICAL_SCROLL | Vertical scroll shape. Corresponds to ECMA-376 ST_ShapeType 'verticalScroll'. | completed | [link](../src/services/enums/slidesenums.js#L324) |
| WAVE | Wave shape. Corresponds to ECMA-376 ST_ShapeType 'wave'. | completed | [link](../src/services/enums/slidesenums.js#L252) |
| WEDGE_ELLIPSE_CALLOUT | Callout wedge ellipse shape. Corresponds to ECMA-376 ST_ShapeType 'wedgeEllipseCallout'. | completed | [link](../src/services/enums/slidesenums.js#L326) |
| WEDGE_RECTANGLE_CALLOUT | Callout wedge rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'wedgeRectCallout'. | completed | [link](../src/services/enums/slidesenums.js#L327) |
| WEDGE_ROUND_RECTANGLE_CALLOUT | Callout wedge round rectangle shape. Corresponds to ECMA-376 ST_ShapeType 'wedgeRoundRectCallout'. | completed | [link](../src/services/enums/slidesenums.js#L328) |

## Enum: [SheetsChartEmbedType](https://developers.google.com/apps-script/reference/slides/sheets-chart-embed-type)

The Sheets chart's embed type.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| IMAGE | Indicates that the chart is embedded as an image. | completed | [link](../src/services/enums/slidesenums.js#L130) |
| UNSUPPORTED | Represents a chart that is not supported and cannot be further classified. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [SlideLinkingMode](https://developers.google.com/apps-script/reference/slides/slide-linking-mode)

The mode of links between slides.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| LINKED | Indicates that slides are linked. | completed | [link](../src/services/enums/slidesenums.js#L376) |
| NOT_LINKED | Indicates that slides aren't linked. | completed | [link](../src/services/enums/slidesenums.js#L377) |
| UNSUPPORTED | A slide linking mode that isn't supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [SlidePosition](https://developers.google.com/apps-script/reference/slides/slide-position)

The relative position of a Slide.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| FIRST_SLIDE | The first slide in the presentation. | completed | [link](../src/services/enums/slidesenums.js#L382) |
| LAST_SLIDE | The last slide in the presentation. | completed | [link](../src/services/enums/slidesenums.js#L383) |
| NEXT_SLIDE | The next slide. | completed | [link](../src/services/enums/slidesenums.js#L380) |
| PREVIOUS_SLIDE | The previous slide. | completed | [link](../src/services/enums/slidesenums.js#L381) |

## Enum: [SpacingMode](https://developers.google.com/apps-script/reference/slides/spacing-mode)

The different modes for paragraph spacing.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| COLLAPSE_LISTS | Paragraph spacing is skipped between list elements. | completed | [link](../src/services/enums/slidesenums.js#L388) |
| NEVER_COLLAPSE | Paragraph spacing is always rendered. | completed | [link](../src/services/enums/slidesenums.js#L387) |
| UNSUPPORTED | A spacing mode that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [TextBaselineOffset](https://developers.google.com/apps-script/reference/slides/text-baseline-offset)

The text vertical offset from its normal position.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| NONE | The text is not vertically offset. | completed | [link](../src/services/enums/slidesenums.js#L11) |
| SUBSCRIPT | The text is vertically offset downwards. | completed | [link](../src/services/enums/slidesenums.js#L394) |
| SUPERSCRIPT | The text is vertically offset upwards. | completed | [link](../src/services/enums/slidesenums.js#L393) |
| UNSUPPORTED | An text baseline offset that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [TextDirection](https://developers.google.com/apps-script/reference/slides/text-direction)

The directions text can flow in.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| LEFT_TO_RIGHT | The text goes from left to right. | completed | [link](../src/services/enums/slidesenums.js#L398) |
| RIGHT_TO_LEFT | The text goes from right to left. | completed | [link](../src/services/enums/slidesenums.js#L399) |
| UNSUPPORTED | A text direction that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [ThemeColorType](https://developers.google.com/apps-script/reference/slides/theme-color-type)

The name of an entry in the page's color scheme.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| ACCENT1 | Represents the first accent color. | completed | [link](../src/services/enums/slidesenums.js#L407) |
| ACCENT2 | Represents the second accent color. | completed | [link](../src/services/enums/slidesenums.js#L408) |
| ACCENT3 | Represents the third accent color. | completed | [link](../src/services/enums/slidesenums.js#L409) |
| ACCENT4 | Represents the fourth accent color. | completed | [link](../src/services/enums/slidesenums.js#L410) |
| ACCENT5 | Represents the fifth accent color. | completed | [link](../src/services/enums/slidesenums.js#L411) |
| ACCENT6 | Represents the sixth accent color. | completed | [link](../src/services/enums/slidesenums.js#L412) |
| DARK1 | Represents the first dark color. | completed | [link](../src/services/enums/slidesenums.js#L403) |
| DARK2 | Represents the second dark color. | completed | [link](../src/services/enums/slidesenums.js#L405) |
| FOLLOWED_HYPERLINK | Represents the color to use for visited hyperlinks. | completed | [link](../src/services/enums/slidesenums.js#L414) |
| HYPERLINK | Represents the color to use for hyperlinks. | completed | [link](../src/services/enums/slidesenums.js#L413) |
| LIGHT1 | Represents the first light color. | completed | [link](../src/services/enums/slidesenums.js#L404) |
| LIGHT2 | Represents the second light color. | completed | [link](../src/services/enums/slidesenums.js#L406) |
| UNSUPPORTED | Represents a theme color that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |

## Enum: [VideoSourceType](https://developers.google.com/apps-script/reference/slides/video-source-type)

The video source types.

| Property | Description | Status | Implementation |
|--- |--- |--- |--- |
| UNSUPPORTED | A video source type that is not supported. | completed | [link](../src/services/enums/slidesenums.js#L10) |
| YOUTUBE | YouTube video. | completed | [link](../src/services/enums/slidesenums.js#L419) |

