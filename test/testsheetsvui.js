
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { cachePerformance, wrapupTest , getRandomHex, trasher} from './testassist.js';



// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheetsVui = (pack) => {
  const toTrash = [];
  const { unit, fixes } = pack || initTests()

  unit.section("getImages", (t) => {
    const ssId = fixes.TEST_BORDERS_ID
    const ss = SpreadsheetApp.openById(ssId);
    const sheet = ss.getSheetByName("sampleImage1");
    const images = sheet.getImages();
    t.is(images.length, 2);
    const anchorCells = images.map((e) => e.getAnchorCell().getA1Notation());
    t.deepEqual(anchorCells, ["A3", "C6"]);
    const size = images.map((e) => e.getWidth() === e.getHeight());
    t.deepEqual(size, [true, true]);
    if (SpreadsheetApp.isFake) cachePerformance()
  });

  unit.section("TODO - currently skipped - range.getBorder() does work on GAS although it's not documented", t => {
    // TODO figure out how to handle thick/medium etc.

    const rt = sb.getRange("a26:b28")

    // the top of of the first row should be null
    // the bottom of the last row should be null
    // the left of the first column should be null
    // the right of last column should be null
    const topRow = rt.offset(0, 0, 1).getBorder()
    const bottomRow = rt.offset(rt.getNumRows() - 1, 1).getBorder()
    const leftCol = rt.offset(0, 0, rt.getNumRows(), 1).getBorder()
    const rightCol = rt.offset(0, rt.getNumColumns() - 1, rt.getNumRows(), 1).getBorder()


    t.is(topRow.getTop().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(bottomRow.getBottom().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(leftCol.getLeft().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(rightCol.getRight().getColor().getColorType().toString(), 'UNSUPPORTED')
    t.is(topRow.getTop().getBorderStyle(), null)
    t.is(bottomRow.getBottom().getBorderStyle(), null)
    t.is(leftCol.getLeft().getBorderStyle(), null)
    t.is(rightCol.getRight().getBorderStyle(), null)

    if (SpreadsheetApp.isFake) cachePerformance()

  }, { skip: true })


  unit.section("text style extracts, reducers and other exotics", t => {
    // this is an existing test sheet so we need to turn off strict sandbox mode temporarily


    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]
    const flr = sb.getRange("c2:e3")

    // notes 
    const notes = flr.getNotes()
    t.is(notes.length, flr.getNumRows())
    t.is(notes[0].length, flr.getNumColumns())
    t.true(notes.flat().every(f => f === ""))

    const nr = sb.getRange("c30:e30")
    const nrns = nr.getNotes()
    t.is(nrns.length, nr.getNumRows())
    t.is(nrns[0].length, nr.getNumColumns())
    t.is(nrns[0][0].replace(/\n/g, ""), "C30", "drop new line stuff")
    t.is(nrns[0][1], "")
    t.is(nrns[0][2].replace(/\n/g, ""), "E30")


    // text direction all null
    t.is(flr.isChecked(), null)
    const dirs = flr.getTextDirections()
    t.is(dirs.length, flr.getNumRows())
    t.is(dirs[0].length, flr.getNumColumns())
    t.true(dirs.flat().every(is.null))
    t.is(flr.getTextDirection(), dirs[0][0])

    const dirtr = sb.getRange("h29:j29")
    const dirtrs = dirtr.getTextDirections().flat()
    t.is(dirtrs[0], null, "english")
    // this has r-l language via translate but still returns null
    t.is(dirtrs[1], null, "arabic")
    // back to l-r
    t.is(dirtrs[2], null, "japanese")
    // TODO findout how to change to R-L and explicily set l-R

    // 2 checkboxes - non ticked
    const ckr1 = sb.getRange("g2:h2")
    t.is(ckr1.isChecked(), false)

    // 4 cells 2 with unticked checkboxes
    const ckr2 = sb.getRange("f2:i2")
    t.is(ckr2.isChecked(), null)

    // 4 cells , 2 with ticked checkboxes
    const ckr3 = sb.getRange("k2:n2")
    t.is(ckr3.isChecked(), null)

    // 2 cells both ticked
    const ckr4 = sb.getRange("l2:m2")
    t.is(ckr4.isChecked(), true)

    // 4 cells some ticked, some not
    const ckr5 = sb.getRange("l2:m3")
    t.is(ckr5.isChecked(), null)

    // 1 cell ticked
    const ckr6 = sb.getRange("m2")
    t.is(ckr6.isChecked(), true)

    // 1 cell unticked
    const ckr7 = sb.getRange("m3")
    t.is(ckr7.isChecked(), false)

    // cells with some of everything
    const ckr8 = sb.getRange("g2:n3")
    t.is(ckr8.isChecked(), null)

    // do font lines
    const flrss = flr.getFontLines()
    const flrs = flr.getFontLine()
    const flExpect = [
      ['line-through', 'none', 'none'],
      ['none', 'none', 'underline']
    ]
    t.is(flrss.length, flr.getNumRows())
    t.is(flrss[0].length, flr.getNumColumns())
    t.deepEqual(flrss, flExpect)
    t.is(flrs, flrss[0][0])

  })

  unit.section("color objects and builders", t => {

    const builder = SpreadsheetApp.newColor()
    t.is(builder.toString(), "ColorBuilder")
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(t.threw(() => builder.asRgbColor()).message, "Object is not of type RgbColor.")
    t.is(builder.getColorType().toString(), "UNSUPPORTED")
    const rgbColor = getRandomHex()

    builder.setRgbColor(rgbColor)
    t.is(t.threw(() => builder.asThemeColor()).message, "Object is not of type ThemeColor.")
    t.is(builder.getColorType().toString(), "RGB")
    t.is(builder.asRgbColor().toString(), "RgbColor")
    t.is(builder.asRgbColor().asHexString(), rgbColor)
    t.is(builder.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))

    const builtRgb = builder.build()
    t.is(builtRgb.toString(), "Color")
    t.is(builtRgb.getColorType().toString(), "RGB")
    t.is(builtRgb.asRgbColor().toString(), "RgbColor")
    t.is(builtRgb.asRgbColor().getGreen(), parseInt(rgbColor.substring(3, 5), 16))
    t.is(builtRgb.asRgbColor().getBlue(), parseInt(rgbColor.substring(5, 7), 16))
    t.is(builtRgb.asRgbColor().getRed(), parseInt(rgbColor.substring(1, 3), 16))
    t.is(t.threw(() => builtRgb.asThemeColor()).message, "Object is not of type ThemeColor.")

    const themeBuilder = SpreadsheetApp.newColor()
    themeBuilder.setThemeColor(SpreadsheetApp.ThemeColorType.ACCENT1)
    t.is(themeBuilder.getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getColorType().toString(), "THEME")
    t.is(themeBuilder.asThemeColor().getThemeColorType().toString(), "ACCENT1")
    t.is(t.threw(() => themeBuilder.asRgbColor()).message, "Object is not of type RgbColor.")

    const builtTheme = themeBuilder.build()
    t.is(builtTheme.toString(), "Color")
    t.is(builtTheme.getColorType().toString(), "THEME")
    t.is(builtTheme.asThemeColor().getColorType().toString(), "THEME")
    t.is(t.threw(() => builtTheme.asRgbColor()).message, "Object is not of type RgbColor.")
    if (SpreadsheetApp.isFake) cachePerformance()
  })

  unit.section("uses testsheet - checks UI compatible with API sets - spreadsheet ranges method tests", t => {
    // careful with confusion of combining 0 (offset,array indices) and 1 start (range methods)
    // this is an existing test sheet so we need to turn off strict sandbox mode temporarily

    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[1]
    const range = sheet.getRange("c2:$d$4")
    t.false(sheet.isSheetHidden())
    t.is(range.toString(), "Range")
    t.is(range.getGridId(), sheet.getSheetId())
    t.is(range.getA1Notation(), "C2:D4")
    t.is(range.getRow(), 2)
    t.is(range.getColumn(), 3)
    t.is(range.getLastRow(), 4)
    t.is(range.getLastColumn(), 4)
    t.is(range.getCell(1, 1).getA1Notation(), range.offset(0, 0, 1, 1).getA1Notation())
    t.is(range.getCell(2, 2).getColumn(), range.getColumn() + 1)
    t.is(range.getCell(2, 2).getRow(), range.getRow() + 1)
    t.is(range.getWidth(), range.getNumColumns())
    t.is(range.getHeight(), range.getNumRows())
    t.is(range.getNumColumns(), range.getLastColumn() - range.getColumn() + 1)
    t.is(range.getNumRows(), range.getLastRow() - range.getRow() + 1)


    const { values } = Sheets.Spreadsheets.Values.get(sheet.getParent().getId(), sheet.getName())
    const target = values.slice(range.getRow() - 1, range.getLastRow()).map(row => row.slice(range.getColumn() - 1, range.getLastColumn()))
    t.true(is.array(target))
    t.is(target.length, range.getNumRows())
    t.is(target[0].length, range.getNumColumns())
    const tr = `${sheet.getName()}!${range.getA1Notation()}`
    const { values: atv, range: atr } = Sheets.Spreadsheets.Values.get(fixes.TEST_SHEET_ID, tr)
    t.is(atv.length, target.length)
    t.is(atv[0].length, target[0].length)
    t.is(atr, tr)

    const dr = sheet.getDataRange()
    t.is(dr.offset(0, 0).getA1Notation(), dr.getA1Notation())
    t.is(dr.offset(0, 0, 1, 1).getA1Notation(), "A1")
    t.is(dr.offset(1, 1, 1, 1).getA1Notation(), "B2")
    t.is(dr.offset(2, 1).getColumn(), 2)
    t.is(dr.offset(3, 5).getRow(), 4)
    t.is(dr.offset(0, 1).getLastColumn(), dr.getLastColumn() + 1)
    t.is(dr.offset(1, 1).getNumRows(), dr.getNumRows())
    t.is(dr.offset(1, 1).getNumColumns(), dr.getNumColumns())
    t.is(dr.offset(1, 1, 2, 2).getNumRows(), 2)
    t.is(dr.offset(1, 1, 2, 2).getNumColumns(), 2)
    t.is(dr.offset(1, 1, 3).getNumRows(), 3)
    t.is(dr.offset(1, 1, 3, 4).getNumColumns(), 4)

    t.is(range.getValue(), atv[0][0])
    t.is(range.getValue(), atv[0][0])
    t.is(range.offset(1, 1, 1, 1).getValue(), atv[1][1])
    t.is(range.offset(0, 2, 1, 1).getValue(), values[1][2])

    t.is(range.getDisplayValue(), atv[0][0].toString())

    t.rxMatch(t.threw(() => range.offset(0, 0, 0)).message, /number of rows/)
    t.rxMatch(t.threw(() => range.offset(0, 0, 1, 0)).message, /number of columns/)

    // TODO check when we have some formulas in place
    t.true(is.string(range.getFormula()))
    t.true(range.getFormulas().every(r => r.map(f => is.string(f))))
    t.is(range.getFormulas().length, atv.length)
    t.is(range.getFormulas()[0].length, atv[0].length)

    if (SpreadsheetApp.isFake) cachePerformance()

  })

  unit.section("uses testsheet - checks UI compatible with API sets -  basic adv sheets cell formatting fetch fix", t => {
    // this section will work with the testsheet where we have some horizonatl alignment (as opposed to the default which returns nothing)


    const spreadsheetId = fixes.TEST_SHEET_ID
    const ss = Sheets.Spreadsheets.get(spreadsheetId)
    const sheets = ss.sheets
    const sheet = sheets[0]
    const range = `'${sheet.properties.title}'!a1:b3`
    const props = 'effectiveFormat.horizontalAlignment'

    const x = Sheets.Spreadsheets.get(spreadsheetId, {
      ranges: [range],
      fields: `sheets.data.rowData.values.${props}`,
    })
    const { rowData } = x.sheets[0].data[0]

    t.is(rowData.length, 3)
    t.is(rowData[0].values.length, 2)
    if (SpreadsheetApp.isFake) cachePerformance()

  })

  unit.section("uses testsheet - checks UI compatible with API sets - need to update to use batchupdate spreadsheetapp rangelists", t => {


    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[1]
    const rltests = ["a2:c3", "bb4:be12"]
    const rl = sheet.getRangeList(rltests)
    t.is(rl.getRanges().length, rltests.length)
    rl.getRanges().forEach((f, i) => t.is(f.getA1Notation(), rltests[i].toUpperCase()))
    if (SpreadsheetApp.isFake) cachePerformance()


  })

  unit.section("uses testsheet - checks UI compatible with API sets -  spreadsheet exotics", t => {


    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[0]

    t.is(sheet.getColumnWidth(2), ss.getColumnWidth(2))
    t.is(sheet.getRowHeight(1), ss.getRowHeight(1))
    t.true(sheet.getRowHeight(1) > 10)
    t.true(sheet.getColumnWidth(2) > 20)
    t.true(is.nonEmptyString(ss.getRecalculationInterval().toString()))

    const owner = ss.getOwner()
    t.is(owner.getEmail(), fixes.EMAIL)

    const viewers = ss.getViewers()
    t.true(Array.isArray(viewers))
    viewers.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    const editors = ss.getEditors()
    t.true(Array.isArray(editors))
    editors.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    if (SpreadsheetApp.isFake) cachePerformance()

  })

  unit.section("uses testsheet - checks UI compatible with API sets - advanced sheet basics", t => {
    // we're using a known file, so we need to turn off strict sandboxing
    // otherwise the DriveApp access will be blocked

    t.true(is.nonEmptyString(Sheets.toString()))
    t.is(Sheets.getVersion(), 'v4')
    t.is(Drive.isFake, Sheets.isFake, {
      neverUndefined: false
    })
    t.is(Sheets.toString(), Sheets.Spreadsheets.toString())
    const ss = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    t.is(ss.spreadsheetId, fixes.TEST_SHEET_ID)
    t.true(is.nonEmptyObject(ss.properties))
    t.is(ss.properties.title, fixes.TEST_SHEET_NAME)
    t.is(ss.properties.autoRecalc, "ON_CHANGE")
    t.true(is.nonEmptyObject(ss.properties.defaultFormat))
    t.true(is.nonEmptyObject(ss.properties.spreadsheetTheme))
    t.true(is.array(ss.sheets))
    t.truthy(ss.sheets.length)
    t.true(is.nonEmptyString(ss.spreadsheetUrl))
    if (SpreadsheetApp.isFake) cachePerformance()

  })

  unit.section("uses testsheet - checks UI compatible with API sets - spreadsheetapp basics", t => {



    const ass = Sheets.Spreadsheets.get(fixes.TEST_SHEET_ID)
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    t.is(ss.getId(), fixes.TEST_SHEET_ID)
    t.is(ss.getName(), fixes.TEST_SHEET_NAME)
    t.is(ss.getNumSheets(), ass.sheets.length)
    const sheets = ss.getSheets()
    t.is(sheets.length, ass.sheets.length)

    sheets.forEach((s, i) => {
      t.is(s.getName(), ass.sheets[i].properties.title)
      t.is(s.getSheetId(), ass.sheets[i].properties.sheetId)
      t.is(s.getIndex(), i + 1)
      t.true(is.number(s.getSheetId()))
      t.is(s.getName(), s.getSheetName())
      t.is(s.getMaxColumns(), ass.sheets[i].properties.gridProperties.columnCount)
      t.is(s.getMaxRows(), ass.sheets[i].properties.gridProperties.rowCount)
      t.is(s.getType().toString(), ass.sheets[i].properties.sheetType)
      t.is(ss.getSheetById(s.getSheetId()).getName(), s.getName())
      t.is(ss.getSheetByName(s.getName()).getSheetId(), s.getSheetId())

    })


    t.is(ss.getId(), ss.getKey())
    t.is(ss.getSheetId(), sheets[0].getSheetId())
    t.is(ss.getSheetName(), sheets[0].getName())

    const file = DriveApp.getFileById(ss.getId())
    t.is(file.getName(), ss.getName())
    t.is(file.getMimeType(), "application/vnd.google-apps.spreadsheet")
    t.is(file.getOwner().getEmail(), ss.getOwner().getEmail())
    t.is(file.getOwner().getEmail(), fixes.EMAIL)

    t.is(SpreadsheetApp.openByUrl(ss.getUrl()).getId(), ss.getId())
    t.is(SpreadsheetApp.openByKey(ss.getId()).getId(), ss.getId())
    if (SpreadsheetApp.isFake) cachePerformance()



  })


  unit.section("CellImage and CellImageBuilder methods", t => {
    const imgUrl = fixes.RANDOM_IMAGE || "https://picsum.photos/200";
    const title = "Random Image";
    const desc = "A randomly generated placeholder image";

    // Test CellImageBuilder
    const builder = SpreadsheetApp.newCellImage();
    t.is(builder.toString(), "CellImageBuilder", "Builder toString should be CellImageBuilder");
    
    builder.setSourceUrl(imgUrl);
    // On Live GAS, calling getContentUrl on an image not yet processed/hosted by Google throws an error
    t.truthy(t.threw(() => builder.getContentUrl()), "getContentUrl on new Builder should throw on Live GAS");
    
    builder.setAltTextTitle(title);
    t.is(builder.getAltTextTitle(), title, "Builder getAltTextTitle should match");
    
    builder.setAltTextDescription(desc);
    t.is(builder.getAltTextDescription(), desc, "Builder getAltTextDescription should match");

    // Test toBuilder on builder
    const builder2 = builder.toBuilder();
    t.is(builder2.getAltTextTitle(), title, "toBuilder should copy title");
    
    // Test CellImage
    const cellImage = builder.build();
    t.is(cellImage.toString(), "CellImage", "CellImage toString should be CellImage");
    t.truthy(t.threw(() => cellImage.getContentUrl()), "getContentUrl on new CellImage should throw on Live GAS");
    t.is(cellImage.getAltTextTitle(), title, "CellImage getAltTextTitle should match");
    t.is(cellImage.getAltTextDescription(), desc, "CellImage getAltTextDescription should match");

    // Test toBuilder on CellImage
    const builder3 = cellImage.toBuilder();
    t.is(builder3.getAltTextTitle(), title, "CellImage.toBuilder should copy title");
    
    // Test applying it to a range via setValue
    if (SpreadsheetApp.isFake) {
      const ss = SpreadsheetApp.create("temp_cellimage_test");
      const sheet = ss.getSheets()[0];
      const testRange = sheet.getRange("Z99");
      
      testRange.setValue(cellImage);
      
      const formula = testRange.getFormula();
      t.is(formula, `=IMAGE("${imgUrl}")`, "In gas-fakes, setting CellImage should write an =IMAGE() formula");
      
      // Also test setValues
      testRange.setValues([[cellImage]]);
      const formula2 = testRange.getFormula();
      t.is(formula2, `=IMAGE("${imgUrl}")`, "In gas-fakes, setting CellImage via setValues should write an =IMAGE() formula");
      
      // Clean up
      if (fixes.CLEAN) {
        toTrash.push(DriveApp.getFileById(ss.getId()))
      }
    }
  })

  if (fixes.CLEAN) trasher(toTrash);
  return { unit, fixes }
}


wrapupTest(testSheetsVui)