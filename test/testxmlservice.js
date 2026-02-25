
import is from '@sindresorhus/is';
import '@mcpher/gas-fakes'
import { wrapupTest } from './testassist.js';
import { initTests } from './testinit.js'

export const testXmlService = (pack) => {
  const { unit } = pack || initTests()

  unit.section('XmlService.parse', t => {
    const xml = '<root attr="val"><child>text</child><child>more</child><other><grandchild>deep</grandchild></other></root>';
    const doc = XmlService.parse(xml);

    // GAS toString output: [Document:  No DOCTYPE declaration, Root is [Element: <root/>]]
    t.is(doc.toString(), "[Document:  No DOCTYPE declaration, Root is [Element: <root/>]]");

    const root = doc.getRootElement();
    t.is(root.getName(), "root");
    t.is(root.getAttribute("attr").getValue(), "val");

    const children = root.getChildren("child");
    t.is(children.length, 2);
    t.is(children[0].getName(), "child");
    t.is(children[0].getText(), "text");

    const other = root.getChild("other");
    t.is(other.getName(), "other");
    t.is(other.getChild("grandchild").getText(), "deep");
    t.is(other.getChildText("grandchild"), "deep");

    const allChildren = root.getChildren();
    t.is(allChildren.length, 3);
  })

  unit.section('XmlService.parse with namespaces', t => {
    const xml = '<ns:root xmlns:ns="http://example.com"><ns:child>content</ns:child></ns:root>';
    const doc = XmlService.parse(xml);
    const root = doc.getRootElement();

    // In GAS, getName() returns the local name
    t.is(root.getName(), "root");

    // To get namespaced child, we can use the Namespace object
    const ns = XmlService.getNamespace("ns", "http://example.com");
    const child = root.getChild("child", ns);
    t.is(child.getName(), "child");
    t.is(child.getText(), "content");
  })

  if (!pack) {
    unit.report()
  }
  return { unit }
}

wrapupTest(testXmlService)
