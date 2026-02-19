# <img src="./logo.png" alt="gas-fakes logo" width="50" align="top">  Colors and themes

Apps Script supports named colors as well as hex codes - here's the list I've implemented

## Named Colors

In addition to CSS hex notation (e.g., `#ff0000`), Apps Script methods like `Range.setBackground()` and `Range.setFontColor()` also accept standard CSS color names. The fake environment supports all 147 standard names, which are treated case-insensitively.

| Name                   | Hex Value |
| ---------------------- | --------- |
| `aliceblue`            | `#f0f8ff` |
| `antiquewhite`         | `#faebd7` |
| `aqua`                 | `#00ffff` |
| `aquamarine`           | `#7fffd4` |
| `azure`                | `#f0ffff` |
| `beige`                | `#f5f5dc` |
| `bisque`               | `#ffe4c4` |
| `black`                | `#000000` |
| `blanchedalmond`       | `#ffebcd` |
| `blue`                 | `#0000ff` |
| `blueviolet`           | `#8a2be2` |
| `brown`                | `#a52a2a` |
| `burlywood`            | `#deb887` |
| `cadetblue`            | `#5f9ea0` |
| `chartreuse`           | `#7fff00` |
| `chocolate`            | `#d2691e` |
| `coral`                | `#ff7f50` |
| `cornflowerblue`       | `#6495ed` |
| `cornsilk`             | `#fff8dc` |
| `crimson`              | `#dc143c` |
| `cyan`                 | `#00ffff` |
| `darkblue`             | `#00008b` |
| `darkcyan`             | `#008b8b` |
| `darkgoldenrod`        | `#b8860b` |
| `darkgray`             | `#a9a9a9` |
| `darkgreen`            | `#006400` |
| `darkgrey`             | `#a9a9a9` |
| `darkkhaki`            | `#bdb76b` |
| `darkmagenta`          | `#8b008b` |
| `darkolivegreen`       | `#556b2f` |
| `darkorange`           | `#ff8c00` |
| `darkorchid`           | `#9932cc` |
| `darkred`              | `#8b0000` |
| `darksalmon`           | `#e9967a` |
| `darkseagreen`         | `#8fbc8f` |
| `darkslateblue`        | `#483d8b` |
| `darkslategray`        | `#2f4f4f` |
| `darkslategrey`        | `#2f4f4f` |
| `darkturquoise`        | `#00ced1` |
| `darkviolet`           | `#9400d3` |
| `deeppink`             | `#ff1493` |
| `deepskyblue`          | `#00bfff` |
| `dimgray`              | `#696969` |
| `dimgrey`              | `#696969` |
| `dodgerblue`           | `#1e90ff` |
| `firebrick`            | `#b22222` |
| `floralwhite`          | `#fffaf0` |
| `forestgreen`          | `#228b22` |
| `fuchsia`              | `#ff00ff` |
| `gainsboro`            | `#dcdcdc` |
| `ghostwhite`           | `#f8f8ff` |
| `gold`                 | `#ffd700` |
| `goldenrod`            | `#daa520` |
| `gray`                 | `#808080` |
| `green`                | `#008000` |
| `greenyellow`          | `#adff2f` |
| `grey`                 | `#808080` |
| `honeydew`             | `#f0fff0` |
| `hotpink`              | `#ff69b4` |
| `indianred`            | `#cd5c5c` |
| `indigo`               | `#4b0082` |
| `ivory`                | `#fffff0` |
| `khaki`                | `#f0e68c` |
| `lavender`             | `#e6e6fa` |
| `lavenderblush`        | `#fff0f5` |
| `lawngreen`            | `#7cfc00` |
| `lemonchiffon`         | `#fffacd` |
| `lightblue`            | `#add8e6` |
| `lightcoral`           | `#f08080` |
| `lightcyan`            | `#e0ffff` |
| `lightgoldenrodyellow` | `#fafad2` |
| `lightgray`            | `#d3d3d3` |
| `lightgreen`           | `#90ee90` |
| `lightgrey`            | `#d3d3d3` |
| `lightpink`            | `#ffb6c1` |
| `lightsalmon`          | `#ffa07a` |
| `lightseagreen`        | `#20b2aa` |
| `lightskyblue`         | `#87cefa` |
| `lightslategray`       | `#778899` |
| `lightslategrey`       | `#778899` |
| `lightsteelblue`       | `#b0c4de` |
| `lightyellow`          | `#ffffe0` |
| `lime`                 | `#00ff00` |
| `limegreen`            | `#32cd32` |
| `linen`                | `#faf0e6` |
| `magenta`              | `#ff00ff` |
| `maroon`               | `#800000` |
| `mediumaquamarine`     | `#66cdaa` |
| `mediumblue`           | `#0000cd` |
| `mediumorchid`         | `#ba55d3` |
| `mediumpurple`         | `#9370db` |
| `mediumseagreen`       | `#3cb371` |
| `mediumslateblue`      | `#7b68ee` |
| `mediumspringgreen`    | `#00fa9a` |
| `mediumturquoise`      | `#48d1cc` |
| `mediumvioletred`      | `#c71585` |
| `midnightblue`         | `#191970` |
| `mintcream`            | `#f5fffa` |
| `mistyrose`            | `#ffe4e1` |
| `moccasin`             | `#ffe4b5` |
| `navajowhite`          | `#ffdead` |
| `navy`                 | `#000080` |
| `oldlace`              | `#fdf5e6` |
| `olive`                | `#808000` |
| `olivedrab`            | `#6b8e23` |
| `orange`               | `#ffa500` |
| `orangered`            | `#ff4500` |
| `orchid`               | `#da70d6` |
| `palegoldenrod`        | `#eee8aa` |
| `palegreen`            | `#98fb98` |
| `paleturquoise`        | `#afeeee` |
| `palevioletred`        | `#db7093` |
| `papayawhip`           | `#ffefd5` |
| `peachpuff`            | `#ffdab9` |
| `peru`                 | `#cd853f` |
| `pink`                 | `#ffc0cb` |
| `plum`                 | `#dda0dd` |
| `powderblue`           | `#b0e0e6` |
| `purple`               | `#800080` |
| `red`                  | `#ff0000` |
| `rosybrown`            | `#bc8f8f` |
| `royalblue`            | `#4169e1` |
| `saddlebrown`          | `#8b4513` |
| `salmon`               | `#fa8072` |
| `sandybrown`           | `#f4a460` |
| `seagreen`             | `#2e8b57` |
| `seashell`             | `#fff5ee` |
| `sienna`               | `#a0522d` |
| `silver`               | `#c0c0c0` |
| `skyblue`              | `#87ceeb` |
| `slateblue`            | `#6a5acd` |
| `slategray`            | `#708090` |
| `slategrey`            | `#708090` |
| `snow`                 | `#fffafa` |
| `springgreen`          | `#00ff7f` |
| `steelblue`            | `#4682b4` |
| `tan`                  | `#d2b48c` |
| `teal`                 | `#008080` |
| `thistle`              | `#d8bfd8` |
| `tomato`               | `#ff6347` |
| `turquoise`            | `#40e0d0` |
| `violet`               | `#ee82ee` |
| `wheat`                | `#f5deb3` |
| `white`                | `#ffffff` |
| `whitesmoke`           | `#f5f5f5` |
| `yellow`               | `#ffff00` |
| `yellowgreen`          | `#9acd32` |

##### rebeccapurple

This is an interesting html color name that apps script does not support, so I've omitted that from the color name support. To learn more about this color name see - https://medium.com/@valgaze/the-hidden-purple-memorial-in-your-web-browser-7d84813bb416

#### Banding Themes

The colors used for banding themes can change over time with UI updates from Google. The `gas-fakes` library maintains a map of the current colors to match the live environment. The `Banding Theme Colors Verification` test in `testsheetssets.js` is used to validate these.

| Theme         | Header    | First Band | Second Band | Footer    |
| ------------- | --------- | ---------- | ----------- | --------- |
| `LIGHT_GREY`  | `#bdbdbd` | `#ffffff`  | `#f3f3f3`   | `#dedede` |
| `CYAN`        | `#4dd0e1` | `#ffffff`  | `#e0f7fa`   | `#a2e8f1` |
| `GREEN`       | `#63d297` | `#ffffff`  | `#e7f9ef`   | `#afe9ca` |
| `YELLOW`      | `#f7cb4d` | `#ffffff`  | `#fef8e3`   | `#fce8b2` |
| `ORANGE`      | `#f46524` | `#ffffff`  | `#ffe6dd`   | `#ffccbc` |
| `BLUE`        | `#5b95f9` | `#ffffff`  | `#e8f0fe`   | `#acc9fe` |
| `TEAL`        | `#26a69a` | `#ffffff`  | `#ddf2f0`   | `#8cd3cd` |
| `GREY`        | `#78909c` | `#ffffff`  | `#ebeff1`   | `#bbc8ce` |
| `BROWN`       | `#cca677` | `#ffffff`  | `#f8f2eb`   | `#e6d3ba` |
| `LIGHT_GREEN` | `#8bc34a` | `#ffffff`  | `#eef7e3`   | `#c4e2a0` |
| `INDIGO`      | `#8989eb` | `#ffffff`  | `#e8e7fc`   | `#c4c3f7` |
| `PINK`        | `#e91d63` | `#ffffff`  | `#fddce8`   | `#f68ab0` |

## <img src="./logo.png" alt="gas-fakes logo" width="50" align="top"> Further Reading

- [getting started](GETTING_STARTED.md) - how to handle authentication for restricted scopes.
- [readme](README.md)
- [gas fakes cli](gas-fakes-cli.md)
- [running gas-fakes on google cloud run](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on google kubernetes engine](https://github.com/brucemcpherson/gas-fakes-containers)
- [running gas-fakes on Amazon AWS lambda](https://github.com/brucemcpherson/gas-fakes-containers)
- [Yes – you can run native apps script code on AWS Lambda!](https://ramblings.mcpher.com/apps-script-on-aws-lambda/)
- [initial idea and thoughts](https://ramblings.mcpher.com/a-proof-of-concept-implementation-of-apps-script-environment-on-node/)
- [Inside the volatile world of a Google Document](https://ramblings.mcpher.com/inside-the-volatile-world-of-a-google-document/)
- [Apps Script Services on Node – using apps script libraries](https://ramblings.mcpher.com/apps-script-services-on-node-using-apps-script-libraries/)
- [Apps Script environment on Node – more services](https://ramblings.mcpher.com/apps-script-environment-on-node-more-services/)
- [Turning async into synch on Node using workers](https://ramblings.mcpher.com/turning-async-into-synch-on-node-using-workers/)
- [All about Apps Script Enums and how to fake them](https://ramblings.mcpher.com/all-about-apps-script-enums-and-how-to-fake-them/)
- [colaborators](collaborators.md) - additional information for collaborators
- [oddities](oddities.md) - a collection of oddities uncovered during this project
- [named colors](named-colors.md)
- [sandbox](sandbox.md)
- [senstive scopes](senstive_scopes.md)
- [using apps script libraries with gas-fakes](libraries.md)
- [how libhandler works](libhandler.md)
- [article:using apps script libraries with gas-fakes](https://ramblings.mcpher.com/how-to-use-apps-script-libraries-directly-from-node/)
- [named range identity](named-range-identity.md)
- [adc and restricted scopes](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [push test pull](pull-test-push.md)
- [sharing cache and properties between gas-fakes and live apps script](https://ramblings.mcpher.com/sharing-cache-and-properties-between-gas-fakes-and-live-apps-script/)
- [gas-fakes-cli now has built in mcp server and gemini extension](https://ramblings.mcpher.com/gas-fakes-cli-now-has-built-in-mcp-server-and-gemini-extension/)
- [gas-fakes CLI: Run apps script code directly from your terminal](https://ramblings.mcpher.com/gas-fakes-cli-run-apps-script-code-directly-from-your-terminal/)
- [How to allow access to sensitive scopes with Application Default Credentials](https://ramblings.mcpher.com/how-to-allow-access-to-sensitive-scopes-with-application-default-credentials/)
- [Supercharge Your Google Apps Script Caching with GasFlexCache](https://ramblings.mcpher.com/supercharge-your-google-apps-script-caching-with-gasflexcache/)
- [Fake-Sandbox for Google Apps Script: Granular controls.](https://ramblings.mcpher.com/fake-sandbox-for-google-apps-script-granular-controls/)
- [A Fake-Sandbox for Google Apps Script: Securely Executing Code Generated by Gemini CLI](https://ramblings.mcpher.com/gas-fakes-sandbox/)
- [Power of Google Apps Script: Building MCP Server Tools for Gemini CLI and Google Antigravity in Google Workspace Automation](https://medium.com/google-cloud/power-of-google-apps-script-building-mcp-server-tools-for-gemini-cli-and-google-antigravity-in-71e754e4b740)
- [A New Era for Google Apps Script: Unlocking the Future of Google Workspace Automation with Natural Language](https://medium.com/google-cloud/a-new-era-for-google-apps-script-unlocking-the-future-of-google-workspace-automation-with-natural-a9cecf87b4c6)
- [Next-Generation Google Apps Script Development: Leveraging Antigravity and Gemini 3.0](https://medium.com/google-cloud/next-generation-google-apps-script-development-leveraging-antigravity-and-gemini-3-0-c4d5affbc1a8)
- [Modern Google Apps Script Workflow Building on the Cloud](https://medium.com/google-cloud/modern-google-apps-script-workflow-building-on-the-cloud-2255dbd32ac3)
- [Bridging the Gap: Seamless Integration for Local Google Apps Script Development](https://medium.com/@tanaike/bridging-the-gap-seamless-integration-for-local-google-apps-script-development-9b9b973aeb02)
- [Next-Level Google Apps Script Development](https://medium.com/google-cloud/next-level-google-apps-script-development-654be5153912)
- [Secure and Streamlined Google Apps Script Development with gas-fakes CLI and Gemini CLI Extension](https://medium.com/google-cloud/secure-and-streamlined-google-apps-script-development-with-gas-fakes-cli-and-gemini-cli-extension-67bbce80e2c8)
- [Secure and Conversational Google Workspace Automation: Integrating Gemini CLI with a gas-fakes MCP Server](https://medium.com/google-cloud/secure-and-conversational-google-workspace-automation-integrating-gemini-cli-with-a-gas-fakes-mcp-0a5341559865)
- [A Fake-Sandbox for Google Apps Script: A Feasibility Study on Securely Executing Code Generated by Gemini CL](https://medium.com/google-cloud/a-fake-sandbox-for-google-apps-script-a-feasibility-study-on-securely-executing-code-generated-by-cc985ce5dae3)
