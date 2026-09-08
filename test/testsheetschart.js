import { initTests } from "./testinit.js";
import { maketss, wrapupTest, cachePerformance  , trasher } from "./testassist.js";

export const testSheetsChart = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests();

  unit.section("Sheet.insertChart() and related methods", (t) => {
    const { sheet } = maketss("insert_chart_test", toTrash, fixes);

    // 1. Create a chart builder
    const builder = sheet.newChart();
    t.is(builder.toString().startsWith("com.google.apps.maestro.server.beans.trix.impl.ChartPropertyApiEmbeddedChartBuilder@"), true, "sheet.newChart() should return a builder with GAS-style toString()");

    // 2. Configure the chart
    const range1 = sheet.getRange("A1:A5");
    const range2 = sheet.getRange("B1:B5");
    builder.addRange(range1)
      .addRange(range2)
      .setChartType(Charts.ChartType.COLUMN)
      .setPosition(1, 4, 0, 0)
      .setOption("title", "Test Chart");

    // 3. Build the chart
    const chart = builder.build();
    t.is(chart.toString(), "EmbeddedChart", "builder.build() should return an EmbeddedChart");
    t.is(chart.modify().getChartType().toString(), "COLUMN", "chart type should be COLUMN");

    // 4. Insert the chart
    sheet.insertChart(chart);
    //console.log("Chart inserted.");

    // 5. Verify it exists
    const charts = sheet.getCharts();
    t.is(charts.length > 0, true, "sheet.getCharts() should contain the new chart");
    const insertedChart = charts.find(c => c.getOptions().get("title") === "Test Chart");
    t.is(!!insertedChart, true, "The inserted chart should be found in getCharts() by title");
    //console.log("Inserted chart ID:", insertedChart.getChartId());
    //console.log("Inserted chart API object:", JSON.stringify(insertedChart.__apiChart, null, 2));

    // 6. Update the chart (move it)
    const updatedChart = insertedChart.modify().setPosition(5, 5, 0, 0).build();
    //console.log("Updated chart ID:", updatedChart.getChartId());
    // Or update via sheet
    sheet.updateChart(updatedChart);
    console.log("Chart updated.");

    // 7. Remove the chart
    sheet.removeChart(insertedChart);
    const chartsAfterRemoval = sheet.getCharts();
    t.is(chartsAfterRemoval.some(c => c.getChartId() === insertedChart.getChartId()), false, "Chart should be removed");
    console.log("Chart removed.");
  });

  unit.section("EmbeddedChart.getContainerInfo()", (t) => {
    const { sheet } = maketss("container_info_test", toTrash, fixes);

    sheet.getRange("A1:B5").setValues([
      ["L", "V"],
      ["A", 1],
      ["B", 2],
      ["C", 3],
      ["D", 4],
    ]);

    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(sheet.getRange("A1:A5"))
      .addRange(sheet.getRange("B1:B5"))
      .setPosition(2, 3, 10, 20)
      .build();

    sheet.insertChart(chart);

    const containerInfo = chart.getContainerInfo();
    t.is(containerInfo.toString(), "ContainerInfo", "containerInfo.toString() should be ContainerInfo");
    t.is(containerInfo.getAnchorRow(), 2, "getAnchorRow() should be 2");
    t.is(containerInfo.getAnchorColumn(), 3, "getAnchorColumn() should be 3");
    t.is(containerInfo.getOffsetX(), 10, "getOffsetX() should be 10");
    t.is(containerInfo.getOffsetY(), 20, "getOffsetY() should be 20");
  });

  unit.section("EmbeddedChart.getRanges()", (t) => {
    const { sheet } = maketss("chart_ranges_test", toTrash, fixes);
    
    sheet.getRange("A1:B5").setValues([
      ["L", "V"],
      ["A", 1],
      ["B", 2],
      ["C", 3],
      ["D", 4],
    ]);

    const range1 = sheet.getRange("A1:A5");
    const range2 = sheet.getRange("B1:B5");
    
    const chart = sheet.newChart()
      .setChartType(Charts.ChartType.COLUMN)
      .addRange(range1)
      .addRange(range2)
      .setPosition(1, 1, 0, 0)
      .build();

    sheet.insertChart(chart);

    const ranges = chart.getRanges();
    t.is(ranges.length, 2, "chart should have 2 ranges");
    // Depending on how addRange works internally, we'll verify the notations.
    // In our implementation of addRange, the first goes to domain, the second to series.
    t.is(ranges.some(r => r.getA1Notation() === "A1:A5"), true, "range A1:A5 should be present");
    t.is(ranges.some(r => r.getA1Notation() === "B1:B5"), true, "range B1:B5 should be present");
  });


  unit.section("EmbeddedChartBuilder specific chart builders and formatting methods", (t) => {
    const { sheet } = maketss("builder_methods_test", toTrash, fixes);

    // Add some data to chart
    sheet.getRange("A1:B5").setValues([
      ["Labels", "Values"],
      ["A", 10],
      ["B", 20],
      ["C", 30],
      ["D", 40],
    ]);

    const builder = sheet.newChart();

    // Test chart type coerions
    t.is(builder.asAreaChart().getChartType(), Charts.ChartType.AREA, "asAreaChart should set type to AREA");
    t.is(builder.asBarChart().getChartType(), Charts.ChartType.BAR, "asBarChart should set type to BAR");
    t.is(builder.asColumnChart().getChartType(), Charts.ChartType.COLUMN, "asColumnChart should set type to COLUMN");
    t.is(builder.asComboChart().getChartType(), Charts.ChartType.COMBO, "asComboChart should set type to COMBO");
    t.is(builder.asHistogramChart().getChartType(), Charts.ChartType.HISTOGRAM, "asHistogramChart should set type to HISTOGRAM");
    t.is(builder.asLineChart().getChartType(), Charts.ChartType.LINE, "asLineChart should set type to LINE");
    t.is(builder.asPieChart().getChartType(), Charts.ChartType.PIE, "asPieChart should set type to PIE");
    t.is(builder.asScatterChart().getChartType(), Charts.ChartType.SCATTER, "asScatterChart should set type to SCATTER");
    t.is(builder.asTableChart().getChartType(), Charts.ChartType.TABLE, "asTableChart should set type to TABLE");

    // Type-specific builder method testing
    const pieBuilder = sheet.newChart().asPieChart();

    // Instead of strictly matching the maestro.server string (which changes depending on the builder type in Live GAS),
    // we just verify that chaining the method returns an object (the builder itself).
    t.is(typeof pieBuilder.setTitle("My Title"), "object", "setTitle should return pie builder");
    t.is(typeof pieBuilder.setLegendPosition(Charts.Position.BOTTOM), "object", "setLegendPosition should return pie builder");
    t.is(typeof pieBuilder.setBackgroundColor("#ff0000"), "object", "setBackgroundColor should return pie builder");
    t.is(typeof pieBuilder.set3D(), "object", "set3D should return pie builder");

    // Note: Live Apps Script throws an "Unexpected error" if you attempt to call setHiddenDimensionStrategy
    // on certain chart types (like Pie or Table charts). We explicitly apply it to a BarChart.

    const barBuilder = sheet.newChart().asBarChart();
    // Test the newly implemented visual formatting methods
    t.is(typeof barBuilder.setColors(["#ff0000", "#00ff00"]), "object", "setColors should return builder");
    t.is(typeof barBuilder.setXAxisTitle("X Axis Title"), "object", "setXAxisTitle should return builder");
    t.is(typeof barBuilder.setYAxisTitle("Y Axis Title"), "object", "setYAxisTitle should return builder");
    t.is(typeof barBuilder.setRange(0, 75), "object", "setRange should return builder");
    t.is(typeof barBuilder.setStacked(), "object", "setStacked should return builder");

    // ScatterChart specific range methods
    const scatterBuilder = sheet.newChart().asScatterChart();
    t.is(typeof scatterBuilder.setXAxisRange(0, 100), "object", "setXAxisRange should return builder");
    t.is(typeof scatterBuilder.setYAxisRange(0, 50), "object", "setYAxisRange should return builder");



    t.is(typeof barBuilder.setHiddenDimensionStrategy(Charts.ChartHiddenDimensionStrategy.IGNORE_COLUMNS), "object", "setHiddenDimensionStrategy should return bar builder");
    // Test range manipulation wrappers (available on generic builder)
    t.is(builder.clearRanges().getRanges().length, 0, "clearRanges should empty the ranges");
    builder.addRange(sheet.getRange("A1"));
    t.is(typeof builder.removeRange(sheet.getRange("A1")), "object", "removeRange should return builder");

    // Actually insert the charts so they are visible in the resulting test sheet!
    pieBuilder.addRange(sheet.getRange("A1:A5"))  // Labels
              .addRange(sheet.getRange("B1:B5"))  // Values
              .setPosition(1, 1, 0, 0);
    sheet.insertChart(pieBuilder.build());

    barBuilder.addRange(sheet.getRange("A1:A5"))  // Labels
              .addRange(sheet.getRange("B1:B5"))  // Values
              .setPosition(15, 1, 0, 0);
    sheet.insertChart(barBuilder.build());

    // --- Visual Comparison Section ---
    // This section renders charts specifically to test the newly implemented visual formatting methods.
    
    // Column Chart (Colors, Axes Titles, Range)
    const columnChart = sheet.newChart().asColumnChart()
      .addRange(sheet.getRange('A1:A5'))
      .addRange(sheet.getRange('B1:B5'))
      .setTitle('Visual Test: Custom Colors, Axis Titles & Y-Range')
      .setColors(['#FF5733']) 
      .setXAxisTitle('Categories')
      .setYAxisTitle('Values ($)')
      .setRange(0, 100) 
      .setPosition(1, 10, 0, 0)
      .build();
    sheet.insertChart(columnChart);

    // Stacked Bar Chart (Stacked, Background Color, Legend Position)
    const stackedBarChart = sheet.newChart().asBarChart()
      .addRange(sheet.getRange('A1:A5'))
      .addRange(sheet.getRange('B1:B5'))
      .setTitle('Visual Test: Stacked Bar, Background & Legend Bottom')
      .setStacked()
      .setBackgroundColor('#F0F8FF')
      .setLegendPosition(Charts.Position.BOTTOM)
      .setPosition(18, 10, 0, 0)
      .build();
    sheet.insertChart(stackedBarChart);

    // 3D Pie Chart (3D, Custom Colors)
    const pieChart3D = sheet.newChart().asPieChart()
      .addRange(sheet.getRange('A1:A5'))
      .addRange(sheet.getRange('B1:B5'))
      .setTitle('Visual Test: 3D Pie Chart with Custom Colors')
      .set3D()
      .setColors(['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF'])
      .setPosition(35, 10, 0, 0)
      .build();
    sheet.insertChart(pieChart3D);

    // Visually generate remaining chart types for manual verification
    const extraBuilders = [
      sheet.newChart().asAreaChart(),
      sheet.newChart().asColumnChart(),
      sheet.newChart().asComboChart(),
      sheet.newChart().asHistogramChart(),
      sheet.newChart().asLineChart(),
      sheet.newChart().asScatterChart()
    ];

    let row = 30;
    extraBuilders.forEach(b => {
      b.addRange(sheet.getRange("A1:A5"))
       .addRange(sheet.getRange("B1:B5"))
       .setPosition(row, 1, 0, 0);
      sheet.insertChart(b.build());
      row += 15;
    });
  });

  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) cachePerformance()
    unit.report();
  }
  if (fixes.CLEAN) trasher(toTrash);
};

wrapupTest(testSheetsChart);
