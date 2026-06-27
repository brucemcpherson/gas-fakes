import '@mcpher/gas-fakes';
import { initTests } from "./testinit.js";
import { wrapupTest } from './testassist.js';

/**
 * Portable synchronous tests for HtmlService.
 * These should run on both Apps Script and gas-fakes.
 */
export const testHtmlService = (pack) => {
  const { unit, fixes } = pack || initTests();

  unit.section("HtmlService basics", t => {
    const output = HtmlService.createHtmlOutput("<h1>Title</h1>");
    t.is(output.getContent(), "<h1>Title</h1>", "getContent works");
    t.is(output.getTitle(), "", "getTitle defaults to empty string");
    output.setTitle("My Page");
    t.is(output.getTitle(), "My Page", "setTitle works");
    output.setHeight(100).setWidth(200);
    t.is(output.getHeight(), 100, "setHeight works");
    t.is(output.getWidth(), 200, "setWidth works");
    
    // Testing new HtmlOutput parity methods
    output.appendUntrusted("<script>alert(1)</script>");
    t.is(output.getContent(), "<h1>Title</h1>&lt;script&gt;alert(1)&lt;/script&gt;", "appendUntrusted escapes HTML");
    
    output.clear();
    t.is(output.getContent(), "", "clear empties content");
    
    output.addMetaTag("viewport", "width=device-width");
    const metas = output.getMetaTags();
    t.is(metas.length, 1, "addMetaTag adds to meta tag list");
    t.is(metas[0].getName(), "viewport", "HtmlOutputMetaTag.getName");
    t.is(metas[0].getContent(), "width=device-width", "HtmlOutputMetaTag.getContent");
    
    output.setSandboxMode(HtmlService.SandboxMode.IFRAME);
    output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    // There are no getters for these in GAS, just test they are chainable and don't throw
    output.setFaviconUrl("http://example.com/icon.ico");
    t.is(output.getFaviconUrl(), "http://example.com/icon.ico", "set/getFaviconUrl");
    
    // Blob and Template conversion
    output.setContent("<b>Blob</b>");
    const blob = output.getBlob();
    t.is(blob.getContentType(), "text/html", "getBlob content type");
    t.is(blob.getDataAsString(), "<b>Blob</b>", "getBlob data");
    
    const asText = output.getAs("text/plain");
    t.is(asText.getContentType(), "text/plain", "getAs content type");
    
    const templateFromOutput = output.asTemplate();
    t.is(templateFromOutput.getRawContent(), "<b>Blob</b>", "asTemplate creates HtmlTemplate");
  });

  unit.section("HtmlTemplate basics", t => {
    const template = HtmlService.createTemplate("Hello <?= name ?>");
    t.is(template.getRawContent(), "Hello <?= name ?>", "getRawContent");
    
    // Test code generation methods (they return strings, just assert they aren't empty)
    t.true(template.getCode().includes("Hello "), "getCode includes template string");
    t.true(template.getCodeWithComments().includes("Hello "), "getCodeWithComments includes template string");

    // Explicit property assignment is portable and works in both environments
    template.name = "Gemini";
    const evaluated = template.evaluate();
    t.is(evaluated.getContent(), "Hello Gemini", "evaluate processes tags");
  });

  unit.section("HtmlTemplate scriptlet types", t => {
    // <?= expr ?> — HTML-escaped output
    const tmplEscaped = HtmlService.createTemplate('<?= val ?>');
    tmplEscaped.val = '<b>bold</b>';
    t.is(tmplEscaped.evaluate().getContent(), '&lt;b&gt;bold&lt;/b&gt;', '<?= ?> escapes HTML entities');

    // <?!= expr ?> — raw/unescaped output
    const tmplRaw = HtmlService.createTemplate('<?!= val ?>');
    tmplRaw.val = '<b>bold</b>';
    t.is(tmplRaw.evaluate().getContent(), '<b>bold</b>', '<?!= ?> outputs raw HTML unescaped');

    // <? code ?> — execute for side effects, no output
    const tmplCode = HtmlService.createTemplate('before<? var x = 42; ?>after');
    t.is(tmplCode.evaluate().getContent(), 'beforeafter', '<? ?> produces no output');

    // <? code ?> side-effect variable accessible in later <?= ?>
    const tmplSideEffect = HtmlService.createTemplate('<? var msg = "hi"; ?><?= msg ?>');
    t.is(tmplSideEffect.evaluate().getContent(), 'hi', 'variable set in <? ?> is accessible in <?= ?>');

    // templateProps: multiple properties resolved in scriptlets
    const tmplMulti = HtmlService.createTemplate('<?= first ?> <?!= second ?>');
    tmplMulti.first = 'Hello';
    tmplMulti.second = '<World>';
    t.is(tmplMulti.evaluate().getContent(), 'Hello <World>', 'multiple templateProps resolve correctly');

    // numeric and boolean props
    const tmplNum = HtmlService.createTemplate('<?= count ?>');
    tmplNum.count = 42;
    t.is(tmplNum.evaluate().getContent(), '42', 'numeric templateProp renders as string');

    // mixed static text and scriptlets
    const tmplMixed = HtmlService.createTemplate('<h1><?= title ?></h1><p><?!= body ?></p>');
    tmplMixed.title = 'My & Title';
    tmplMixed.body = '<em>content</em>';
    t.is(tmplMixed.evaluate().getContent(), '<h1>My &amp; Title</h1><p><em>content</em></p>', 'mixed static and scriptlet output');
  });

  unit.section("HtmlService file loading", t => {
    let error;
    try {
      HtmlService.createHtmlOutputFromFile("does_not_exist");
    } catch (e) {
      error = e;
    }
    t.true(!!error, "createHtmlOutputFromFile throws for missing files");

    let templateError;
    try {
      HtmlService.createTemplateFromFile("does_not_exist");
    } catch (e) {
      templateError = e;
    }
    t.true(!!templateError, "createTemplateFromFile throws for missing files");
  });

  unit.section("HtmlService constants and properties", t => {
    t.true(typeof HtmlService.SandboxMode !== 'undefined', "SandboxMode enum exists");
    t.true(typeof HtmlService.XFrameOptionsMode !== 'undefined', "XFrameOptionsMode enum exists");
    
    const ua = HtmlService.getUserAgent();
    // getUserAgent returns null when not running in a web app context in GAS,
    // or the Node.js emulator string locally.
    t.true(ua === null || typeof ua === 'string', "getUserAgent returns null or string");
  });

  return { unit, fixes };
};

wrapupTest(testHtmlService);
