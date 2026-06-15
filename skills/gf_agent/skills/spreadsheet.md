# Service: spreadsheet

## Class: Banding

Supported Methods:
- `copyTo(Range)`
- `getFirstColumnColorObject()`
- `getFirstRowColorObject()`
- `getFooterColumnColorObject()`
- `getFooterRowColorObject()`
- `getHeaderColumnColorObject()`
- `getHeaderRowColorObject()`
- `getRange()`
- `getSecondColumnColorObject()`
- `getSecondRowColorObject()`
- `remove()`
- `setFirstColumnColor(String)`
- `setFirstColumnColorObject(Color)`
- `setFirstRowColor(String)`
- `setFirstRowColorObject(Color)`
- `setFooterColumnColor(String)`
- `setFooterColumnColorObject(Color)`
- `setFooterRowColor(String)`
- `setFooterRowColorObject(Color)`
- `setHeaderColumnColor(String)`
- `setHeaderColumnColorObject(Color)`
- `setHeaderRowColor(String)`
- `setHeaderRowColorObject(Color)`
- `setRange(Range)`
- `setSecondColumnColor(String)`
- `setSecondColumnColorObject(Color)`
- `setSecondRowColor(String)`
- `setSecondRowColorObject(Color)`

## Class: BigQueryDataSourceSpec

Supported Methods:
- `getDatasetId()`
- `getProjectId()`
- `getRawQuery()`
- `getTableId()`
- `getTableProjectId()`

## Class: BigQueryDataSourceSpecBuilder

Supported Methods:
- `build()`
- `setProjectId(String)`
- `setRawQuery(String)`

## Class: BooleanCondition

Supported Methods:
- `getBackgroundObject()`
- `getBold()`
- `getCriteriaType()`
- `getCriteriaValues()`
- `getFontColorObject()`
- `getItalic()`
- `getStrikethrough()`
- `getUnderline()`

## Class: CellImage

Supported Methods:
- `getAltTextDescription()`
- `getAltTextTitle()`
- `getContentUrl()`
- `toBuilder()`

## Class: CellImageBuilder

Supported Methods:
- `build()`
- `getAltTextDescription()`
- `getAltTextTitle()`
- `getContentUrl()`
- `setAltTextDescription(String)`
- `setAltTextTitle(String)`
- `setSourceUrl(String)`
- `toBuilder()`

## Class: Color

Supported Methods:
- `asRgbColor()`
- `asThemeColor()`
- `getColorType()`

## Class: ColorBuilder

Supported Methods:
- `asRgbColor()`
- `asThemeColor()`
- `build()`
- `getColorType()`
- `setRgbColor(String)`
- `setThemeColor(ThemeColorType)`

## Class: ConditionalFormatRule

Supported Methods:
- `copy()`
- `getBooleanCondition()`
- `getGradientCondition()`
- `getRanges()`

## Class: ConditionalFormatRuleBuilder

Supported Methods:
- `build()`
- `copy()`
- `getBooleanCondition()`
- `getGradientCondition()`
- `getRanges()`
- `setBackground(String)`
- `setBackgroundObject(Color)`
- `setBold(Boolean)`
- `setFontColor(String)`
- `setFontColorObject(Color)`
- `setGradientMaxpoint(String)`
- `setGradientMaxpointObject(Color)`
- `setGradientMaxpointObjectWithValue(Color,InterpolationType,String)`
- `setGradientMaxpointWithValue(String,InterpolationType,String)`
- `setGradientMidpointObjectWithValue(Color,InterpolationType,String)`
- `setGradientMidpointWithValue(String,InterpolationType,String)`
- `setGradientMinpoint(String)`
- `setGradientMinpointObject(Color)`
- `setGradientMinpointObjectWithValue(Color,InterpolationType,String)`
- `setGradientMinpointWithValue(String,InterpolationType,String)`
- `setItalic(Boolean)`
- `setRanges(Range)`
- `setStrikethrough(Boolean)`
- `setUnderline(Boolean)`
- `whenCellEmpty()`
- `whenCellNotEmpty()`
- `whenDateAfter(Date)`
- `whenDateAfter(RelativeDate)`
- `whenDateBefore(Date)`
- `whenDateBefore(RelativeDate)`
- `whenDateEqualTo(Date)`
- `whenDateEqualTo(RelativeDate)`
- `whenFormulaSatisfied(String)`
- `whenNumberBetween(Number,Number)`
- `whenNumberEqualTo(Number)`
- `whenNumberGreaterThan(Number)`
- `whenNumberGreaterThanOrEqualTo(Number)`
- `whenNumberLessThan(Number)`
- `whenNumberLessThanOrEqualTo(Number)`
- `whenNumberNotBetween(Number,Number)`
- `whenNumberNotEqualTo(Number)`
- `whenTextContains(String)`
- `whenTextDoesNotContain(String)`
- `whenTextEndsWith(String)`
- `whenTextEqualTo(String)`
- `whenTextStartsWith(String)`
- `withCriteria(BooleanCriteria,Object)`

## Class: ContainerInfo

Supported Methods:
- `getAnchorColumn()`
- `getAnchorRow()`
- `getOffsetX()`
- `getOffsetY()`

## Class: DataSource

Supported Methods:
- `createCalculatedColumn(String,String)`
- `getCalculatedColumnByName(String)`
- `getCalculatedColumns()`
- `getColumns()`
- `getDataSourceSheets()`
- `getSpec()`
- `updateSpec(DataSourceSpec,Boolean)`
- `updateSpec(DataSourceSpec)`

## Class: DataSourceColumn

Supported Methods:
- `getDataSource()`
- `getFormula()`
- `getName()`
- `hasArrayDependency()`
- `isCalculatedColumn()`
- `remove()`
- `setFormula(String)`

## Class: DataSourceParameter

Supported Methods:
- `getName()`
- `getSourceCell()`
- `getType()`

## Class: DataSourceSpec

Supported Methods:
- `asBigQuery()`
- `copy()`
- `getParameters()`
- `getType()`

## Class: DataSourceSpecBuilder

Supported Methods:
- `asBigQuery()`
- `build()`
- `copy()`
- `getParameters()`
- `getType()`
- `removeAllParameters()`
- `removeParameter(String)`
- `setParameterFromCell(String,String)`

## Class: DataValidation

Supported Methods:
- `copy()`
- `getAllowInvalid()`
- `getCriteriaType()`
- `getCriteriaValues()`
- `getHelpText()`

## Class: DataValidationBuilder

Supported Methods:
- `build()`
- `copy()`
- `getAllowInvalid()`
- `getCriteriaType()`
- `getCriteriaValues()`
- `getHelpText()`
- `requireCheckbox()`
- `requireCheckbox(Object,Object)`
- `requireCheckbox(Object)`
- `requireDate()`
- `requireDateAfter(Date)`
- `requireDateBefore(Date)`
- `requireDateBetween(Date,Date)`
- `requireDateEqualTo(Date)`
- `requireDateNotBetween(Date,Date)`
- `requireDateOnOrAfter(Date)`
- `requireDateOnOrBefore(Date)`
- `requireFormulaSatisfied(String)`
- `requireNumberBetween(Number,Number)`
- `requireNumberEqualTo(Number)`
- `requireNumberGreaterThan(Number)`
- `requireNumberGreaterThanOrEqualTo(Number)`
- `requireNumberLessThan(Number)`
- `requireNumberLessThanOrEqualTo(Number)`
- `requireNumberNotBetween(Number,Number)`
- `requireNumberNotEqualTo(Number)`
- `requireTextContains(String)`
- `requireTextDoesNotContain(String)`
- `requireTextEqualTo(String)`
- `requireTextIsEmail()`
- `requireTextIsUrl()`
- `requireValueInList(String,Boolean)`
- `requireValueInList(String)`
- `requireValueInRange(Range,Boolean)`
- `requireValueInRange(Range)`
- `setAllowInvalid(Boolean)`
- `setHelpText(String)`
- `withCriteria(DataValidationCriteria,Object)`

## Class: DeveloperMetadata

Supported Methods:
- `getId()`
- `getKey()`
- `getLocation()`
- `getValue()`
- `getVisibility()`
- `moveToColumn(Range)`
- `moveToRow(Range)`
- `moveToSheet(Sheet)`
- `moveToSpreadsheet()`
- `remove()`
- `setKey(String)`
- `setValue(String)`
- `setVisibility(DeveloperMetadataVisibility)`

## Class: DeveloperMetadataFinder

Supported Methods:
- `find()`
- `onIntersectingLocations()`
- `withId(Integer)`
- `withKey(String)`
- `withLocationType(DeveloperMetadataLocationType)`
- `withValue(String)`
- `withVisibility(DeveloperMetadataVisibility)`

## Class: DeveloperMetadataLocation

Supported Methods:
- `getColumn()`
- `getLocationType()`
- `getRow()`
- `getSheet()`
- `getSpreadsheet()`

## Class: EmbeddedAreaChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPointStyle(PointStyle)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setStacked()`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedBarChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setStacked()`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedChart

Supported Methods:
- `getChartId()`
- `getContainerInfo()`
- `getOptions()`
- `getRanges()`
- `modify()`

## Class: EmbeddedChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setChartType(ChartType)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setTransposeRowsAndColumns(Boolean)`

## Class: EmbeddedColumnChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setStacked()`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedComboChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setStacked()`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedHistogramChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setStacked()`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedLineChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPointStyle(PointStyle)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setRange(Number,Number)`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`
- `setXAxisTextStyle(TextStyle)`
- `setXAxisTitle(String)`
- `setXAxisTitleTextStyle(TextStyle)`
- `setYAxisTextStyle(TextStyle)`
- `setYAxisTitle(String)`
- `setYAxisTitleTextStyle(TextStyle)`
- `useLogScale()`

## Class: EmbeddedPieChartBuilder

Supported Methods:
- `addRange(Range)`
- `asAreaChart()`
- `asBarChart()`
- `asColumnChart()`
- `asComboChart()`
- `asHistogramChart()`
- `asLineChart()`
- `asPieChart()`
- `asScatterChart()`
- `asTableChart()`
- `build()`
- `clearRanges()`
- `getChartType()`
- `getContainer()`
- `getRanges()`
- `removeRange(Range)`
- `set3D()`
- `setBackgroundColor(String)`
- `setChartType(ChartType)`
- `setColors(String)`
- `setHiddenDimensionStrategy(ChartHiddenDimensionStrategy)`
- `setLegendPosition(Position)`
- `setLegendTextStyle(TextStyle)`
- `setMergeStrategy(ChartMergeStrategy)`
- `setNumHeaders(Integer)`
- `setOption(String,Object)`
- `setPosition(Integer,Integer,Integer,Integer)`
- `setTitle(String)`
- `setTitleTextStyle(TextStyle)`
- `setTransposeRowsAndColumns(Boolean)`

## Class: Filter

Supported Methods:
- `getColumnFilterCriteria(Integer)`
- `getRange()`
- `remove()`
- `removeColumnFilterCriteria(Integer)`
- `setColumnFilterCriteria(Integer,FilterCriteria)`
- `sort(Integer,Boolean)`

## Class: FilterCriteria

Supported Methods:
- `copy()`
- `getCriteriaType()`
- `getCriteriaValues()`
- `getHiddenValues()`
- `getVisibleValues()`

## Class: FilterCriteriaBuilder

Supported Methods:
- `build()`
- `copy()`
- `setHiddenValues(String)`
- `setVisibleValues(String)`
- `whenCellEmpty()`
- `whenCellNotEmpty()`
- `whenDateAfter(Date)`
- `whenDateAfter(RelativeDate)`
- `whenDateBefore(Date)`
- `whenDateBefore(RelativeDate)`
- `whenDateEqualTo(Date)`
- `whenDateEqualTo(RelativeDate)`
- `whenFormulaSatisfied(String)`
- `whenNumberBetween(Number,Number)`
- `whenNumberEqualTo(Number)`
- `whenNumberGreaterThan(Number)`
- `whenNumberGreaterThanOrEqualTo(Number)`
- `whenNumberLessThan(Number)`
- `whenNumberLessThanOrEqualTo(Number)`
- `whenNumberNotBetween(Number,Number)`
- `whenNumberNotEqualTo(Number)`
- `whenTextContains(String)`
- `whenTextDoesNotContain(String)`
- `whenTextEndsWith(String)`
- `whenTextEqualTo(String)`
- `whenTextStartsWith(String)`

## Class: GradientCondition

Supported Methods:
- `getMaxColorObject()`
- `getMaxType()`
- `getMaxValue()`
- `getMidColorObject()`
- `getMidType()`
- `getMidValue()`
- `getMinColorObject()`
- `getMinType()`
- `getMinValue()`

## Class: NamedRange

Supported Methods:
- `getName()`
- `getRange()`
- `remove()`
- `setName(String)`
- `setRange(Range)`

## Class: OverGridImage

Supported Methods:
- `getAnchorCell()`
- `getAnchorCellXOffset()`
- `getAnchorCellYOffset()`
- `getHeight()`
- `getWidth()`
- `setAltTextDescription(String)`
- `setAltTextTitle(String)`
- `setHeight(Integer)`
- `setWidth(Integer)`

## Class: PivotFilter

Supported Methods:
- `getFilterCriteria()`
- `getPivotTable()`
- `getSourceDataColumn()`
- `remove()`
- `setFilterCriteria(FilterCriteria)`

## Class: PivotGroup

Supported Methods:
- `areLabelsRepeated()`
- `getDimension()`
- `getPivotTable()`
- `getSourceDataColumn()`
- `hideRepeatedLabels()`
- `isSortAscending()`
- `remove()`
- `resetDisplayName()`
- `setDisplayName(String)`
- `showRepeatedLabels()`
- `showTotals(Boolean)`
- `sortAscending()`
- `sortDescending()`
- `totalsAreShown()`

## Class: PivotTable

Supported Methods:
- `addCalculatedPivotValue(String,String)`
- `addColumnGroup(Integer)`
- `addFilter(Integer,FilterCriteria)`
- `addPivotValue(Integer,PivotTableSummarizeFunction)`
- `addRowGroup(Integer)`
- `asDataSourcePivotTable()`
- `getAnchorCell()`
- `getColumnGroups()`
- `getFilters()`
- `getPivotValues()`
- `getRowGroups()`
- `getSourceDataRange()`
- `getValuesDisplayOrientation()`
- `remove()`
- `setValuesDisplayOrientation(Dimension)`

## Class: PivotValue

Supported Methods:
- `getDisplayType()`
- `getFormula()`
- `getPivotTable()`
- `getSourceDataColumn()`
- `getSourceDataSourceColumn()`
- `getSummarizedBy()`
- `remove()`
- `setDisplayName(String)`
- `setFormula(String)`
- `showAs(PivotValueDisplayType)`
- `summarizeBy(PivotTableSummarizeFunction)`

## Class: Protection

Supported Methods:
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addTargetAudience(String)`
- `canDomainEdit()`
- `canEdit()`
- `getDescription()`
- `getEditors()`
- `getProtectionType()`
- `getRange()`
- `getRangeName()`
- `getTargetAudiences()`
- `getUnprotectedRanges()`
- `isWarningOnly()`
- `remove()`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeEditors(String)`
- `removeTargetAudience(String)`
- `setDescription(String)`
- `setDomainEdit(Boolean)`
- `setNamedRange(NamedRange)`
- `setRange(Range)`
- `setRangeName(String)`
- `setUnprotectedRanges(Range)`
- `setWarningOnly(Boolean)`

## Class: Range

Supported Methods:
- `addDeveloperMetadata(String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String)`
- `addDeveloperMetadata(String)`
- `applyColumnBanding()`
- `applyColumnBanding(BandingTheme,Boolean,Boolean)`
- `applyColumnBanding(BandingTheme)`
- `applyRowBanding()`
- `applyRowBanding(BandingTheme,Boolean,Boolean)`
- `applyRowBanding(BandingTheme)`
- `autoFill(Range,AutoFillSeries)`
- `autoFillToNeighbor(AutoFillSeries)`
- `breakApart()`
- `canEdit()`
- `check()`
- `clear()`
- `clear(Object)`
- `clearContent()`
- `clearDataValidations()`
- `clearFormat()`
- `clearNote()`
- `collapseGroups()`
- `copyFormatToRange(Integer,Integer,Integer,Integer,Integer)`
- `copyFormatToRange(Sheet,Integer,Integer,Integer,Integer)`
- `copyTo(Range,CopyPasteType,Boolean)`
- `copyTo(Range,Object)`
- `copyTo(Range)`
- `copyValuesToRange(Integer,Integer,Integer,Integer,Integer)`
- `copyValuesToRange(Sheet,Integer,Integer,Integer,Integer)`
- `createDeveloperMetadataFinder()`
- `createFilter()`
- `createPivotTable(Range)`
- `createTextFinder(String)`
- `deleteCells(Dimension)`
- `expandGroups()`
- `getA1Notation()`
- `getBackground()`
- `getBackgroundObject()`
- `getBackgroundObjects()`
- `getBackgrounds()`
- `getBandings()`
- `getCell(Integer,Integer)`
- `getColumn()`
- `getDataRegion()`
- `getDataRegion(Dimension)`
- `getDataTable()`
- `getDataTable(Boolean)`
- `getDataValidation()`
- `getDataValidations()`
- `getDeveloperMetadata()`
- `getDisplayValue()`
- `getDisplayValues()`
- `getFilter()`
- `getFontColorObject()`
- `getFontColorObjects()`
- `getFontFamilies()`
- `getFontFamily()`
- `getFontLine()`
- `getFontLines()`
- `getFontSize()`
- `getFontSizes()`
- `getFontStyle()`
- `getFontStyles()`
- `getFontWeight()`
- `getFontWeights()`
- `getFormula()`
- `getFormulaR1C1()`
- `getFormulas()`
- `getFormulasR1C1()`
- `getGridId()`
- `getHeight()`
- `getHorizontalAlignment()`
- `getHorizontalAlignments()`
- `getLastColumn()`
- `getLastRow()`
- `getMergedRanges()`
- `getNextDataCell(Direction)`
- `getNote()`
- `getNotes()`
- `getNumberFormat()`
- `getNumberFormats()`
- `getNumColumns()`
- `getNumRows()`
- `getRichTextValue()`
- `getRichTextValues()`
- `getRow()`
- `getRowIndex()`
- `getSheet()`
- `getTextDirection()`
- `getTextDirections()`
- `getTextRotation()`
- `getTextRotations()`
- `getTextStyle()`
- `getTextStyles()`
- `getValue()`
- `getValues()`
- `getVerticalAlignment()`
- `getVerticalAlignments()`
- `getWidth()`
- `getWrap()`
- `getWraps()`
- `getWrapStrategies()`
- `getWrapStrategy()`
- `insertCells(Dimension)`
- `insertCheckboxes()`
- `insertCheckboxes(Object,Object)`
- `insertCheckboxes(Object)`
- `isBlank()`
- `isChecked()`
- `isEndColumnBounded()`
- `isEndRowBounded()`
- `isPartOfMerge()`
- `isStartColumnBounded()`
- `isStartRowBounded()`
- `merge()`
- `mergeAcross()`
- `mergeVertically()`
- `moveTo(Range)`
- `offset(Integer,Integer,Integer,Integer)`
- `offset(Integer,Integer,Integer)`
- `offset(Integer,Integer)`
- `protect()`
- `randomize()`
- `removeCheckboxes()`
- `removeDuplicates()`
- `removeDuplicates(Integer)`
- `setBackground(String)`
- `setBackgroundObject(Color)`
- `setBackgroundObjects(Color)`
- `setBackgroundRGB(Integer,Integer,Integer)`
- `setBackgrounds(String)`
- `setBorder(Boolean,Boolean,Boolean,Boolean,Boolean,Boolean,String,BorderStyle)`
- `setBorder(Boolean,Boolean,Boolean,Boolean,Boolean,Boolean)`
- `setDataValidation(DataValidation)`
- `setDataValidations(DataValidation)`
- `setFontColor(String)`
- `setFontColorObject(Color)`
- `setFontColorObjects(Color)`
- `setFontColors(Object)`
- `setFontFamilies(Object)`
- `setFontFamily(String)`
- `setFontLine(String)`
- `setFontLines(Object)`
- `setFontSize(Integer)`
- `setFontSizes(Object)`
- `setFontStyle(String)`
- `setFontStyles(Object)`
- `setFontWeight(String)`
- `setFontWeights(Object)`
- `setFormula(String)`
- `setFormulaR1C1(String)`
- `setFormulas(String)`
- `setFormulasR1C1(String)`
- `setHorizontalAlignment(String)`
- `setHorizontalAlignments(Object)`
- `setNote(String)`
- `setNotes(Object)`
- `setNumberFormat(String)`
- `setNumberFormats(Object)`
- `setRichTextValue(RichTextValue)`
- `setRichTextValues(RichTextValue)`
- `setShowHyperlink(Boolean)`
- `setTextDirection(TextDirection)`
- `setTextDirections(TextDirection)`
- `setTextRotation(Integer)`
- `setTextRotation(TextRotation)`
- `setTextRotations(TextRotation)`
- `setTextStyle(TextStyle)`
- `setTextStyles(TextStyle)`
- `setValue(Object)`
- `setValues(Object)`
- `setVerticalAlignment(String)`
- `setVerticalAlignments(Object)`
- `setVerticalText(Boolean)`
- `setWrap(Boolean)`
- `setWraps(Object)`
- `setWrapStrategies(WrapStrategy)`
- `setWrapStrategy(WrapStrategy)`
- `shiftColumnGroupDepth(Integer)`
- `shiftRowGroupDepth(Integer)`
- `sort(Object)`
- `splitTextToColumns()`
- `splitTextToColumns(String)`
- `splitTextToColumns(TextToColumnsDelimiter)`
- `trimWhitespace()`
- `uncheck()`

## Class: RichTextValue

Supported Methods:
- `copy()`
- `getEndIndex()`
- `getLinkUrl()`
- `getLinkUrl(Integer,Integer)`
- `getRuns()`
- `getStartIndex()`
- `getText()`
- `getTextStyle()`
- `getTextStyle(Integer,Integer)`

## Class: Sheet

Supported Methods:
- `addDeveloperMetadata(String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String)`
- `addDeveloperMetadata(String)`
- `appendRow(Object)`
- `autoResizeColumn(Integer)`
- `autoResizeColumns(Integer,Integer)`
- `clear()`
- `clear(Object)`
- `clearConditionalFormatRules()`
- `clearContents()`
- `clearFormats()`
- `clearNotes()`
- `createDeveloperMetadataFinder()`
- `createTextFinder(String)`
- `deleteColumn(Integer)`
- `deleteColumns(Integer,Integer)`
- `deleteRow(Integer)`
- `deleteRows(Integer,Integer)`
- `getBandings()`
- `getCharts()`
- `getColumnWidth(Integer)`
- `getConditionalFormatRules()`
- `getDataRange()`
- `getDeveloperMetadata()`
- `getFilter()`
- `getImages()`
- `getIndex()`
- `getLastColumn()`
- `getLastRow()`
- `getMaxColumns()`
- `getMaxRows()`
- `getName()`
- `getNamedRanges()`
- `getParent()`
- `getPivotTables()`
- `getProtections(ProtectionType)`
- `getRange(Integer,Integer,Integer,Integer)`
- `getRange(Integer,Integer,Integer)`
- `getRange(Integer,Integer)`
- `getRange(String)`
- `getRangeList(String)`
- `getRowHeight(Integer)`
- `getSheetId()`
- `getSheetName()`
- `getType()`
- `hideColumn(Range)`
- `hideColumns(Integer,Integer)`
- `hideColumns(Integer)`
- `hideRow(Range)`
- `hideRows(Integer,Integer)`
- `hideRows(Integer)`
- `hideSheet()`
- `insertChart(EmbeddedChart)`
- `insertColumnAfter(Integer)`
- `insertColumnBefore(Integer)`
- `insertColumns(Integer,Integer)`
- `insertColumns(Integer)`
- `insertColumnsAfter(Integer,Integer)`
- `insertColumnsBefore(Integer,Integer)`
- `insertImage(BlobSource,Integer,Integer,Integer,Integer)`
- `insertImage(BlobSource,Integer,Integer)`
- `insertImage(String,Integer,Integer,Integer,Integer)`
- `insertImage(String,Integer,Integer)`
- `insertRowAfter(Integer)`
- `insertRowBefore(Integer)`
- `insertRows(Integer,Integer)`
- `insertRows(Integer)`
- `insertRowsAfter(Integer,Integer)`
- `insertRowsBefore(Integer,Integer)`
- `isColumnHiddenByUser(Integer)`
- `isRowHiddenByFilter(Integer)`
- `isRowHiddenByUser(Integer)`
- `isSheetHidden()`
- `moveColumns(Range,Integer)`
- `moveRows(Range,Integer)`
- `newChart()`
- `protect()`
- `removeChart(EmbeddedChart)`
- `setColumnWidth(Integer,Integer)`
- `setColumnWidths(Integer,Integer,Integer)`
- `setConditionalFormatRules(ConditionalFormatRule)`
- `setFrozenColumns(Integer)`
- `setFrozenRows(Integer)`
- `setName(String)`
- `setRowHeight(Integer,Integer)`
- `setRowHeights(Integer,Integer,Integer)`
- `setRowHeightsForced(Integer,Integer,Integer)`
- `showSheet()`
- `sort(Integer,Boolean)`
- `sort(Integer)`
- `unhideColumn(Range)`
- `unhideRow(Range)`
- `updateChart(EmbeddedChart)`

## Class: SortSpec

Supported Methods:
- `getDimensionIndex()`
- `getSortOrder()`
- `isAscending()`

## Class: Spreadsheet

Supported Methods:
- `addDeveloperMetadata(String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String,DeveloperMetadataVisibility)`
- `addDeveloperMetadata(String,String)`
- `addDeveloperMetadata(String)`
- `addEditor(String)`
- `addEditor(User)`
- `addEditors(String)`
- `addViewer(String)`
- `addViewer(User)`
- `addViewers(String)`
- `appendRow(Object)`
- `autoResizeColumn(Integer)`
- `createDeveloperMetadataFinder()`
- `createTextFinder(String)`
- `deleteActiveSheet()`
- `deleteColumn(Integer)`
- `deleteColumns(Integer,Integer)`
- `deleteRow(Integer)`
- `deleteRows(Integer,Integer)`
- `deleteSheet(Sheet)`
- `duplicateActiveSheet()`
- `getActiveRange()`
- `getActiveRangeList()`
- `getActiveSheet()`
- `getColumnWidth(Integer)`
- `getCurrentCell()`
- `getDataRange()`
- `getDeveloperMetadata()`
- `getEditors()`
- `getFrozenColumns()`
- `getFrozenRows()`
- `getId()`
- `getIterativeCalculationConvergenceThreshold()`
- `getLastColumn()`
- `getLastRow()`
- `getMaxIterativeCalculationCycles()`
- `getName()`
- `getNamedRanges()`
- `getNumSheets()`
- `getOwner()`
- `getProtections(ProtectionType)`
- `getRange(String)`
- `getRangeByName(String)`
- `getRecalculationInterval()`
- `getRowHeight(Integer)`
- `getSelection()`
- `getSheetById(Integer)`
- `getSheetByName(String)`
- `getSheetId()`
- `getSheetName()`
- `getSheets()`
- `getSpreadsheetLocale()`
- `getSpreadsheetTheme()`
- `getSpreadsheetTimeZone()`
- `getUrl()`
- `getViewers()`
- `hideColumn(Range)`
- `hideRow(Range)`
- `insertColumnAfter(Integer)`
- `insertColumnBefore(Integer)`
- `insertColumnsAfter(Integer,Integer)`
- `insertColumnsBefore(Integer,Integer)`
- `insertDataSourceSheet(DataSourceSpec)`
- `insertImage(BlobSource,Integer,Integer,Integer,Integer)`
- `insertImage(BlobSource,Integer,Integer)`
- `insertImage(String,Integer,Integer,Integer,Integer)`
- `insertImage(String,Integer,Integer)`
- `insertRowAfter(Integer)`
- `insertRowBefore(Integer)`
- `insertRowsAfter(Integer,Integer)`
- `insertRowsBefore(Integer,Integer)`
- `isColumnHiddenByUser(Integer)`
- `isIterativeCalculationEnabled()`
- `isRowHiddenByUser(Integer)`
- `removeEditor(String)`
- `removeEditor(User)`
- `removeViewer(String)`
- `removeViewer(User)`
- `rename(String)`
- `renameActiveSheet(String)`
- `resetSpreadsheetTheme()`
- `setActiveRange(Range)`
- `setActiveRangeList(RangeList)`
- `setActiveSelection(Range)`
- `setActiveSelection(String)`
- `setActiveSheet(Sheet,Boolean)`
- `setActiveSheet(Sheet)`
- `setColumnWidth(Integer,Integer)`
- `setCurrentCell(Range)`
- `setFrozenColumns(Integer)`
- `setFrozenRows(Integer)`
- `setIterativeCalculationConvergenceThreshold(Number)`
- `setIterativeCalculationEnabled(Boolean)`
- `setMaxIterativeCalculationCycles(Integer)`
- `setNamedRange(String,Range)`
- `setRecalculationInterval(RecalculationInterval)`
- `setRowHeight(Integer,Integer)`
- `setSpreadsheetLocale(String)`
- `setSpreadsheetTheme(SpreadsheetTheme)`
- `setSpreadsheetTimeZone(String)`
- `show(Object)`
- `toast(String,String,Number)`
- `toast(String,String)`
- `toast(String)`
- `unhideColumn(Range)`
- `unhideRow(Range)`
- `updateMenu(String,Object)`

## Class: SpreadsheetApp

Supported Methods:
- `create(String,Integer,Integer)`
- `create(String)`
- `enableAllDataSourcesExecution()`
- `enableBigQueryExecution()`
- `enableLookerExecution()`
- `flush`
- `flush()`
- `getActiveRange()`
- `getActiveSheet()`
- `getActiveSpreadsheet()`
- `getCurrentCell()`
- `getUi()`
- `newCellImage()`
- `newColor()`
- `newConditionalFormatRule()`
- `newDataSourceSpec()`
- `newDataValidation()`
- `newFilterCriteria()`
- `newRichTextValue()`
- `newTextStyle()`
- `open(File)`
- `openById(String)`
- `openByUrl(String)`
- `setActiveRange(Range)`
- `setActiveRangeList(RangeList)`
- `setActiveSheet(Sheet,Boolean)`
- `setActiveSheet(Sheet)`
- `setActiveSpreadsheet(Spreadsheet)`
- `setCurrentCell(Range)`

## Class: SpreadsheetTheme

Supported Methods:
- `getConcreteColor(ThemeColorType)`
- `getFontFamily()`
- `getThemeColors()`
- `setConcreteColor(ThemeColorType,Color)`
- `setConcreteColor(ThemeColorType,Integer,Integer,Integer)`
- `setFontFamily(String)`

## Class: TextFinder

Supported Methods:
- `findAll()`
- `findNext()`
- `findPrevious()`
- `getCurrentMatch()`
- `ignoreDiacritics(Boolean)`
- `matchCase(Boolean)`
- `matchEntireCell(Boolean)`
- `matchFormulaText(Boolean)`
- `replaceAllWith(String)`
- `replaceWith(String)`
- `startFrom(Range)`
- `useRegularExpression(Boolean)`

## Class: TextRotation

Supported Methods:
- `getDegrees()`
- `isVertical()`

## Class: TextStyle

Supported Methods:
- `copy()`
- `getFontFamily()`
- `getFontSize()`
- `getForegroundColorObject()`
- `isBold()`
- `isItalic()`
- `isStrikethrough()`
- `isUnderline()`

## Class: TextStyleBuilder

Supported Methods:
- `build()`
- `setBold(Boolean)`
- `setFontFamily(String)`
- `setFontSize(Integer)`
- `setForegroundColor(String)`
- `setForegroundColorObject(Color)`
- `setItalic(Boolean)`
- `setStrikethrough(Boolean)`
- `setUnderline(Boolean)`

## Class: ThemeColor

Supported Methods:
- `getColorType()`
- `getThemeColorType()`

