import fs from 'fs/promises';
import path from 'path';
import { globSync } from 'glob';

const repoRoot = path.resolve(process.cwd());
const includeFilePath = path.join(repoRoot, '_includes', 'further.md');
const furtherReadingMarkerRegex = /## <img src="(\.\/|\.\.\/)logo\.png" alt="gas-fakes logo" width="50" align="top"> Further Reading/;

async function processMarkdownFiles() {
  try {
    const includeContentBase = await fs.readFile(includeFilePath, 'utf8');

    // Find all .md files in the root, excluding those in node_modules and _includes
    const files = globSync('**/*.md', {
      cwd: repoRoot,
      ignore: ['**/node_modules/**', '_includes/**'],
      absolute: true,
    });

    console.log(`Found ${files.length} markdown files to check.`);

    for (const file of files) {
      if (path.resolve(file) === path.resolve(includeFilePath)) {
        continue;
      }

      let content = await fs.readFile(file, 'utf8');
      const markerMatch = content.match(furtherReadingMarkerRegex);

      if (!markerMatch) {
        console.log(`Skipping ${path.basename(file)}: Marker not found.`);
        continue;
      }

      const markerIndex = markerMatch.index;

      // Calculate depth to determine logo path
      const relativePath = path.relative(repoRoot, file);
      const depth = relativePath.split(path.sep).length - 1;
      const logoPath = depth === 0 ? './logo.png' : '../'.repeat(depth) + 'logo.png';

      // Update include content with correct logo path
      const adjustedIncludeContent = includeContentBase.replace(
        /src="(\.\/|\.\.\/)logo\.png"/,
        `src="${logoPath}"`
      );

      // 1. Remove all content from the marker onwards (the old appended block)
      content = content.substring(0, markerIndex);

      // 2. Normalize the remaining content by trimming all trailing whitespace (including newlines).
      content = content.trimEnd();

      // 3. Append the new content with explicit newlines for separation.
      const newContent = content + '\n\n' + adjustedIncludeContent;

      await fs.writeFile(file, newContent, 'utf8');
      console.log(`Updated ${path.basename(file)} (logo path: ${logoPath})`);
    }

    console.log('All markdown files that contained the marker have been updated.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

processMarkdownFiles();