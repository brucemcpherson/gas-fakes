
// all these imports 
// this is loaded by npm, but is a library on Apps Script side

import is from '@sindresorhus/is';
import '../main.js'

// all the fake services are here
//import '@mcpher/gas-fakes/main.js'

import { initTests } from './testinit.js'
import { getSheetsPerformance } from '../src/support/sheetscache.js';
import { maketss, trasher, toHex, rgbToHex, getRandomRgb, getRandomHex, getStuff, BLACK, RED } from './testassist.js';


// this can run standalone, or as part of combined tests if result of inittests is passed over
export const testSheets = (pack) => {

  const { unit, fixes } = pack || initTests()
  const toTrash = []


  unit.section("text Style objects and builders", t => {

    const builder = SpreadsheetApp.newTextStyle()
    t.is(builder.toString(), "TextStyleBuilder")
    const fontFamily = 'Helvetica'
    builder
      .setFontSize(10)
      .setBold(true)
      .setItalic(true)
      .setUnderline(false)
      .setStrikethrough(false)
      .setFontFamily(fontFamily)
    const textStyle = builder.build()
    t.is(textStyle.toString(), "TextStyle")
    t.is(textStyle.getFontSize(), 10)
    t.is(textStyle.getFontFamily(), fontFamily)
    t.is(textStyle.isBold(), true)
    t.is(textStyle.isItalic(), true)
    t.is(textStyle.isUnderline(), false)
    t.is(textStyle.isStrikethrough(), false)


    t.is(textStyle.getForegroundColor(), null)
    t.is(textStyle.getForegroundColorObject(), null)

    const rgbColor = getRandomHex()
    const rgbBuilder = SpreadsheetApp.newTextStyle()
    rgbBuilder.setForegroundColor(rgbColor)
    const rgbStyle = rgbBuilder.build()
    t.is(rgbStyle.getForegroundColor(), rgbColor)
    t.is(rgbStyle.getForegroundColorObject().asRgbColor().asHexString(), rgbColor)

    const tc = 'ACCENT4'
    const tcb = SpreadsheetApp.newColor()
    tcb.setThemeColor(SpreadsheetApp.ThemeColorType[tc]).build()
    const themeBuilder = SpreadsheetApp.newTextStyle().setForegroundColorObject(tcb).build()
    // strangely enough, if it's a theme color it returns the enum for the colortype
    t.is(themeBuilder.getForegroundColor(), tc)
    t.is(themeBuilder.getForegroundColorObject().asThemeColor().getThemeColorType().toString(), tc)


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("text style extracts, reducers and other exotics", t => {
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]
    const flr = sb.getRange("c2:e3")

    // notes 
    const notes = flr.getNotes()
    t.is(notes.length, flr.getNumRows())
    t.is(notes[0].length, flr.getNumColumns())
    t.true(notes.flat().every(f => f === ""))

    const nr = sb.getRange ("c30:e30")
    const nrns = nr.getNotes()
    t.is(nrns.length, nr.getNumRows())
    t.is(nrns[0].length, nr.getNumColumns())
    t.is(nrns[0][0].replace(/\n/g,""),"C30","drop new line stuff")
    t.is(nrns[0][1],"")
    t.is(nrns[0][2].replace(/\n/g,""),"E30")


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


  // range.getBorders() doesn't work on GAS
  // see this issue - https://issuetracker.google.com/issues/329473815
  // we can resurrect this if it ever gets fixed
  unit.section("range borders - there's a bug in GAS range.getBorders so some of this doesnt run there", t => {

    const { sheet } = maketss('borders', toTrash, fixes)

    const range = sheet.getRange("c2:i4")
    const points = ['getTop', 'getLeft', 'getBottom', 'getRight']

    // font lines should be null for newly created sheet
    const fl = range.getFontLine()
    t.is(fl, 'none')
    t.true(range.getFontLines().flat().every(f => f === fl))


    // newly created sheet has all null borders so the borders object should be null
    // TODO remove the skip if getBorders() on GAS is ever fixed
    if (SpreadsheetApp.isFake) {
      t.true(range.getBorders().flat().every(f => is.null(f)))
    }


    // this sheet temporarily has some borders in it - once I have setborders working, I'll eliminate
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]

    // TODO remove the skip if getBorders() on GAS is ever fixed
    if (SpreadsheetApp.isFake) {
      const rb = sb.getRange("a6:b10")
      const b = rb.getBorders()
      t.is(b.length, rb.getNumRows())
      t.is(b[0].length, rb.getNumColumns())

      points.forEach(f => {
        const ps = b.flat().map(g => g[f]())
        t.true(ps.every(g => g.getColor().asRgbColor().asHexString(), BLACK))
        t.true(ps.every(g => g.getBorderStyle().toString(), "SOLID"))
      })

      const rr = sb.getRange("a19:b21")
      const bb = rr.getBorders()
      t.is(bb.length, rr.getNumRows())
      t.is(bb[0].length, rr.getNumColumns())
      points.forEach(f => {
        const ps = bb.flat().map(g => g[f]())
        t.true(ps.every(g => g.getColor().asRgbColor().asHexString(), RED))
        t.true(ps.every(g => g.getBorderStyle().toString(), "SOLID_THICK"))
      })

      const rt = sb.getRange("a26:b28")
      const bt = rt.getBorders()
      t.is(bt.length, rt.getNumRows())
      t.is(bt[0].length, rt.getNumColumns())

      // the top of of the first row should be null
      // the bottom of the last row should be null
      // the left of the first column should be null
      // the right of last column should be null
      const topRow = bt[0]
      const bottomRow = bt[bt.length - 1]
      const leftCol = bt.map(f => f[0])
      const rightCol = bt.map(f => f[f.length - 1])

      // can't really test if this is the correct response till the GAS bug is fixed and investigation is possible
      // but given responses to getBorder() it should be correct
      t.true(topRow.every(r => r.getTop().getColor().getColorType().toString() === 'UNSUPPORTED'))
      t.true(bottomRow.every(r => r.getBottom().getColor().getColorType().toString() === 'UNSUPPORTED'))
      t.true(leftCol.every(r => r.getLeft().getColor().getColorType().toString() === 'UNSUPPORTED'))
      t.true(rightCol.every(r => r.getRight().getColor().getColorType().toString() === 'UNSUPPORTED'))
      t.true(topRow.every(r => r.getTop().getBorderStyle() === null))
      t.true(bottomRow.every(r => r.getBottom().getBorderStyle() === null))
      t.true(leftCol.every(r => r.getLeft().getBorderStyle() === null))
      t.true(rightCol.every(r => r.getRight().getBorderStyle() === null))
    }

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())


  })

  unit.section("range.getBorder() does work on GAS although it's not documented", t => {

    const { sheet } = maketss('borders', toTrash, fixes)
    const range = sheet.getRange("c2:i4")
    const points = ['getTop', 'getLeft', 'getBottom', 'getRight']

    // newly created sheet has all null borders
    t.is(range.getBorder(), null)

    // this sheet temporarily has some borders in it - once I have setborders working, I'll eliminate
    const sp = SpreadsheetApp.openById(fixes.TEST_BORDERS_ID)
    const sb = sp.getSheets()[0]
    const rb = sb.getRange("a6:b10")


    points.forEach(f => {
      t.is(rb.getBorder()[f]().getColor().asRgbColor().asHexString(), BLACK)
      t.is(rb.getBorder()[f]().getBorderStyle().toString(), "SOLID")
    })

    const rr = sb.getRange("a19:b21")
    points.forEach(f => {
      t.is(rr.getBorder()[f]().getColor().asRgbColor().asHexString(), RED)
      t.is(rr.getBorder()[f]().getBorderStyle().toString(), "SOLID_THICK")
    })

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


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

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

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("cell and font backgrounds, styles and alignments", t => {

    const { sheet } = maketss('cells', toTrash, fixes)
    const range = sheet.getRange("a1:b3")

    // text styles - an empty sheet shoud all be defaults
    const txss = range.getTextStyles()
    const txs = range.getTextStyle()
    t.is(txss.length, range.getNumRows())
    t.is(txss[0].length, range.getNumColumns())
    t.is(txs.toString(), "TextStyle")
    t.is(txs.getFontSize(), 10)
    t.is(txs.getFontFamily(), "arial,sans,sans-serif")
    t.is(txs.isBold(), false)
    t.is(txs.isItalic(), false)
    t.is(txs.isUnderline(), false)
    t.is(txs.isStrikethrough(), false)
    t.is(txs.getForegroundColor(), BLACK)
    t.is(txs.getForegroundColorObject().asRgbColor().asHexString(), BLACK)
    t.true(txss.flat().every(f => f.getFontSize() === txs.getFontSize()))
    t.true(txss.flat().every(f => f.getFontFamily() === txs.getFontFamily()))
    t.true(txss.flat().every(f => f.isBold() === txs.isBold()))
    t.true(txss.flat().every(f => f.isItalic() === txs.isItalic()))
    t.true(txss.flat().every(f => f.isUnderline() === txs.isUnderline()))
    t.true(txss.flat().every(f => f.isStrikethrough() === txs.isStrikethrough()))
    t.true(txss.flat().every(f => f.getForegroundColor() === txs.getForegroundColor()))
    t.true(txss.flat().every(
      f => f.getForegroundColorObject().asRgbColor().asHexString() === txs.getForegroundColorObject().asRgbColor().asHexString()))


    // backgrounds
    const backgrounds = range.getBackgrounds()
    const background = range.getBackground()
    t.true(is.nonEmptyString(background))
    t.true(is.array(backgrounds))

    // these 2 i think have just been renamed - they dont exist in the documentation any more
    t.is(range.getBackgroundColor(), background)
    t.deepEqual(range.getBackgroundColors(), backgrounds)

    t.is(backgrounds.length, range.getNumRows())
    t.is(backgrounds[0].length, range.getNumColumns())
    t.is(backgrounds[0][0], background)
    t.true(backgrounds.flat().every(f => is.nonEmptyString(f)))
    t.is(background.substring(0, 1), '#')
    t.is(background.length, 7)
    t.is(background, '#ffffff', 'newly created sheet will have white background')

    const color = getRandomHex()
    range.setBackground(color)
    t.is(range.getBackground(), color)
    t.true(range.getBackgrounds().flat().every(f => f === color))

    const colorRgb = getRandomRgb()
    const color255 = [Math.round(colorRgb.red * 255), Math.round(colorRgb.green * 255), Math.round(colorRgb.blue * 255)]
    range.setBackgroundRGB(...color255)
    t.is(range.getBackground(), rgbToHex(colorRgb))

    // some random colorsas
    const colors = Array.from({
      length: range.getNumRows()
    }, () => Array.from({ length: range.getNumColumns() }, () => getRandomHex()))

    const fontColors = Array.from({
      length: range.getNumRows()
    }, () => Array.from({ length: range.getNumColumns() }, () => getRandomHex()))


    range.setBackgrounds(colors)
    t.deepEqual(range.getBackgrounds(), colors)

    range.setFontColors(fontColors)


    // text rotations
    const rots = range.getTextRotations()
    const rot = range.getTextRotation()
    t.is(rots.length, range.getNumRows())
    t.is(rots[0].length, range.getNumColumns())
    t.true(rots.flat().every(f => f.getDegrees() === 0))
    t.is(rot.getDegrees(), 0)
    t.true(rots.flat().every(f => f.isVertical() === false))
    t.is(rot.isVertical(), false)

    // this is deprec, but we'll implement it anyway
    const fcs = range.getFontColors()
    const fc = range.getFontColor()
    t.is(fcs.length, range.getNumRows())
    t.is(fcs[0].length, range.getNumColumns())
    t.deepEqual(fcs, fontColors)
    t.is(fc, fontColors[0][0])

    // default font family
    const defFamily = "Arial"
    const ffs = range.getFontFamilies()
    const ff = range.getFontFamily()
    t.is(ffs.length, range.getNumRows())
    t.is(ffs[0].length, range.getNumColumns())
    t.true(ffs.flat().every(f => f === ff))
    t.is(ff, defFamily)

    // default font family
    const defFontSize = 10
    const fss = range.getFontSizes()
    const fs = range.getFontSize()
    t.is(fss.length, range.getNumRows())
    t.is(fss[0].length, range.getNumColumns())
    t.true(fss.flat().every(f => f === fs))
    t.is(fs, defFontSize)

    // default wrap
    const defWrap = true
    const fws = range.getWraps()
    const fw = range.getWrap()
    t.is(fws.length, range.getNumRows())
    t.is(fws[0].length, range.getNumColumns())
    t.true(fws.flat().every(f => f === fw))
    t.is(fw, defWrap)

    const defWrapStrategy = "OVERFLOW"
    const wss = range.getWrapStrategies()
    const ws = range.getWrapStrategy()
    t.is(wss.length, range.getNumRows())
    t.is(wss[0].length, range.getNumColumns())
    t.true(wss.flat().every(f => f.toString() === ws.toString()))
    t.is(ws.toString(), defWrapStrategy)



    // the preferred way nowadays
    const fcobs = range.getFontColorObjects()
    const fcob = range.getFontColorObject()
    t.is(fcobs.length, range.getNumRows())
    t.is(fcobs[0].length, range.getNumColumns())
    t.deepEqual(fcobs.flat().map(f => f.asRgbColor().asHexString()), fontColors.flat())
    t.is(fcob.asRgbColor().asHexString(), fontColors[0][0])

    range.setFontColor(getRandomHex())

    // now with rangelists
    const range2 = range.offset(3, 3, 2, 2)
    const rangeList = range.getSheet().getRangeList([range, range2].map(r => r.getA1Notation()))
    rangeList.setBackground(color)
    rangeList.getRanges().forEach(range => t.true(range.getBackgrounds().flat().every(f => f === color)))
    rangeList.getRanges().forEach(range => {
      range.setBackgroundRGB(...color255)
      t.is(range.getBackground(), rgbToHex(colorRgb))
    })

    // now alignments
    const verticalAlignments = range.getVerticalAlignments()
    const verticalAlignment = range.getVerticalAlignment()
    t.is(verticalAlignments.length, range.getNumRows())
    t.is(verticalAlignments[0].length, range.getNumColumns())
    t.true(verticalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(verticalAlignments[0][0], verticalAlignment)
    // sometimes this is upper sometimes lower - havent figured out rule yet
    t.is(verticalAlignment.toUpperCase(), 'BOTTOM', 'newly created sheet will have bottom')

    const horizontalAlignments = range.getHorizontalAlignments()
    const horizontalAlignment = range.getHorizontalAlignment()
    t.is(horizontalAlignments.length, range.getNumRows())
    t.is(horizontalAlignments[0].length, range.getNumColumns())
    t.true(horizontalAlignments.flat().every(f => is.nonEmptyString(f)))
    t.is(horizontalAlignments[0][0], horizontalAlignment)
    t.is(horizontalAlignment, 'general', 'newly created sheet will have general')

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  unit.section("setting and getting color objects}", t => {
    const { sheet } = maketss('colors', toTrash, fixes)
    const range = sheet.getRange("c6:i12")

    // so we can see the colors better if necessary add some random values
    const stuff = getStuff(range)
    range.setValues(stuff)
    t.deepEqual(range.getValues(), stuff)

    const cts = [
      "TEXT",
      "BACKGROUND",
      "ACCENT1",
      "ACCENT2",
      "ACCENT3",
      "ACCENT4",
      "ACCENT5",
      "ACCENT6",
      "LINK"
    ]

    const colorObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setThemeColor(SpreadsheetApp.ThemeColorType[cts[i % cts.length]]).build()))

    t.true(colorObjects.flat().every(f => f.asThemeColor().getColorType().toString() === "THEME"))
    t.true(colorObjects.flat().every(f => f.getColorType().toString() === "THEME"))

    range.setBackgroundObjects(colorObjects)
    const tobs = range.getBackgroundObjects()
    t.true(tobs.flat().every(f => f.getColorType().toString() === "THEME"))
    t.deepEqual(
      tobs.flat().map(f => f.asThemeColor().getThemeColorType().toString()),
      colorObjects.flat().map(f => f.asThemeColor().getThemeColorType().toString())
    )

    // color objects can be rgb too
    const rgbObjects = Array.from({
      length: range.getNumRows()
    },
      _ => Array.from({
        length: range.getNumColumns()
      }, (_, i) => SpreadsheetApp.newColor().setRgbColor(getRandomHex()).build()))

    const rgbRange = range.offset(range.getNumRows() + 1, 0)
    rgbRange.setBackgroundObjects(rgbObjects)
    const robs = rgbRange.getBackgroundObjects()
    t.true(robs.flat().every(f => f.getColorType().toString() === "RGB"))
    t.deepEqual(robs.flat().map(f => f.asRgbColor().asHexString()), rgbObjects.flat().map(f => f.asRgbColor().asHexString()))


    // and they can be mixed
    const mixedRange = rgbRange.offset(rgbRange.getNumRows() + 1, 0)
    const half = Math.floor(mixedRange.getNumRows() / 2)
    const mixed = colorObjects.slice(0, half).concat(rgbObjects.slice(0, mixedRange.getNumRows() - half))
    mixedRange.setBackgroundObjects(mixed)
    const mobs = mixedRange.getBackgroundObjects()
    t.deepEqual(mobs.flat().map(f => f.getColorType().toString()), mixed.flat().map(f => f.getColorType().toString()))

    const singleColor = getRandomHex()
    const singleColorObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    const singleRange = mixedRange.offset(mixedRange.getNumRows() + 1, 0)
    singleRange.setBackgroundObject(singleColorObj)
    const back1 = singleRange.getBackgrounds()
    t.true(back1.flat().every(f => f === singleColor))
    const sobs = singleRange.getBackgroundObjects()
    t.true(sobs.flat().every(f => f.asRgbColor().asHexString() === singleColor))

    const singleRgbRange = singleRange.offset(singleRange.getNumRows() + 1, 0)
    const singleColorRgbObj = SpreadsheetApp.newColor().setRgbColor(singleColor).build()
    singleRgbRange.setBackgroundObject(singleColorRgbObj)
    const back2 = singleRgbRange.getBackgrounds()
    t.true(back2.flat().every(f => f === singleColor))
    const srobs = singleRange.getBackgroundObjects()
    t.true(srobs.flat().every(f => f.asRgbColor().asHexString() === singleColor))
    t.deepEqual(back1, back2)

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })

  unit.section("spreadsheet ranges", t => {
    // careful with confusion of combining 0 (offset,array indices) and 1 start (range methods)
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


    const rv = range.getValues()
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

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })



  unit.section("assorted cell userenteredformats", t => {
    const { sheet } = maketss('assorted', toTrash, fixes)
    const range = sheet.getRange("c2:i4")
    const stuff = getStuff(range)
    range.setValues(stuff)
    t.deepEqual(range.getValues(), stuff)
    const nfs = range.getNumberFormats()
    const nf = range.getNumberFormat()
    t.is(nf, nfs[0][0])
    t.is(nfs.length, range.getNumRows())
    t.is(nfs[0].length, range.getNumColumns())
    // see issue https://github.com/brucemcpherson/gas-fakes/issues/27
    const dfv = "0.###############"
    t.true(nfs.flat().every(f => f === dfv))
    t.is(nf, dfv)

    const fws = range.getFontWeight()
    const fw = range.getFontWeights()
    t.is(fw.length, range.getNumRows())
    t.is(fw[0].length, range.getNumColumns())
    t.true(fw.flat().every(f => is.nonEmptyString(f)))
    t.is(fws, fw[0][0])
    t.is(fws, 'normal')

    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())


  })


  unit.section("basic adv sheets cell formatting fetch fix", t => {
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
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())

  })


  unit.section("spreadsheetapp rangelists", t => {
    const ss = SpreadsheetApp.openById(fixes.TEST_SHEET_ID)
    const sheet = ss.getSheets()[1]
    const rltests = ["a2:c3", "bb4:be12"]
    const rl = sheet.getRangeList(rltests)
    t.is(rl.getRanges().length, rltests.length)
    rl.getRanges().forEach((f, i) => t.is(f.getA1Notation(), rltests[i].toUpperCase()))
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("spreadsheet exotics", t => {
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
    t.truthy(viewers.length)
    viewers.forEach(f => t.true(is.nonEmptyString(f.getEmail())))

    const editors = ss.getEditors()
    t.truthy(editors.length)
    editors.forEach(f => t.true(is.nonEmptyString(f.getEmail())))


    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })


  unit.section("advanced sheet basics", t => {
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
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
  })

  unit.section("spreadsheetapp basics", t => {
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
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())


  })

  // running standalone
  if (!pack) {
    if (SpreadsheetApp.isFake) console.log('...cumulative sheets cache performance', getSheetsPerformance())
    unit.report()

  }

  trasher(toTrash)
  return { unit, fixes }
}

// if we're running this test standalone, on Node - we need to actually kick it off
// the provess.argv should contain "execute" 
// for example node testdrive.js execute
// on apps script we don't want it to run automatically
// when running as part of a consolidated test, we dont want to run it, as the caller will do that

if (ScriptApp.isFake && globalThis.process?.argv.slice(2).includes("execute")) testSheets()
