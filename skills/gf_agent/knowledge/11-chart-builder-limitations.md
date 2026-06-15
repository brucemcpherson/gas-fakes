### Chart Builder Method Limitations (API Parity)

When generating code that builds Embedded Charts in Google Sheets (`SpreadsheetApp.newChart()`), you must adhere to the following restrictions, as `gas-fakes` maps directly to the Google Sheets REST API v4 which has limitations compared to Live Apps Script:

1. **Method Fragmentation (Range Settings)**: 
   - You MUST NOT use `setXAxisRange()` or `setYAxisRange()` unless you are specifically building a `ScatterChart`. In Live Apps Script, these methods are exclusive to `EmbeddedScatterChartBuilder` and will throw a `TypeError` on other chart types.
   - For all other chart types (Column, Bar, Line, Area), you MUST use the generic `setRange(min, max)` method.

2. **Unimplemented Formatting Methods**: 
   - The REST API v4 lacks direct properties for many granular text-styling and sub-scale formatting options. 
   - You MUST NOT use the following methods as they will throw a `notYetImplemented` error in `gas-fakes`: `useLogScale()`, `setXAxisLogScale()`, `setYAxisLogScale()`, `reverseCategories()`, `reverseDirection()`, `setPointStyle()`, `enablePaging()`, `enableSorting()`, or any method ending in `*TextStyle()` (e.g., `setTitleTextStyle()`).
   - Stick to core configurations: `setColors()`, `setXAxisTitle()`, `setYAxisTitle()`, `setRange()`, `setStacked()`, `setBackgroundColor()`, `setLegendPosition()`, and `set3D()`.

3. **Pie Chart Custom Colors**: 
   - The REST API v4 does not support setting custom slice colors for Pie Charts. Calling `setColors()` on a Pie Chart builder will be silently ignored. Do not attempt to style Pie Chart slices.