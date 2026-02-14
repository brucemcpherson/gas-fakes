import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const progressDir = path.resolve(__dirname, '../progress');
const outputFile = path.resolve(__dirname, '../progress.md');

const results = [];

const files = fs.readdirSync(progressDir).filter(file => file.toLowerCase().endsWith('.md'));

for (const file of files) {
  const filePath = path.join(progressDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  const serviceNameMatch = content.match(/^#\s*\[?([^\]]+)\]?/);
  const serviceName = serviceNameMatch ? serviceNameMatch[1] : path.basename(file, '.md');

  const classMatches = content.match(/## (Class|Enum|Interface):/g);
  const numClasses = classMatches ? classMatches.length : 0;

  const completedMatches = (content.match(/\| completed \|/g) || []).length;
  const inProgressMatches = (content.match(/\| in progress \|/g) || []).length;
  const notStartedMatches = (content.match(/\| not started \|/g) || []).length;

  const numMethods = completedMatches + inProgressMatches + notStartedMatches;

  results.push({
    fileName: file,
    serviceName,
    numClasses,
    numMethods,
    numCompleted: completedMatches,
    numInProgress: inProgressMatches,
    numNotStarted: notStartedMatches,
  });
}

results.sort((a, b) => a.serviceName.localeCompare(b.serviceName));

const totals = {
  numClasses: 0,
  numMethods: 0,
  numCompleted: 0,
  numInProgress: 0,
  numNotStarted: 0,
};

for (const result of results) {
  totals.numClasses += result.numClasses;
  totals.numMethods += result.numMethods;
  totals.numCompleted += result.numCompleted;
  totals.numInProgress += result.numInProgress;
  totals.numNotStarted += result.numNotStarted;
}

const summaryLines = [
  '# Gas-Fakes Progress Summary',
  '',
  '| Service | Classes | Methods | Completed | In Progress | Not Started |',
  '|---|---|---|---|---|---|',
];

for (const result of results) {
  const encodedFileName = encodeURIComponent(result.fileName);
  const serviceLink = `[${result.serviceName}](./progress/${encodedFileName})`;
  summaryLines.push(`| ${serviceLink} | ${result.numClasses} | ${result.numMethods} | ${result.numCompleted} | ${result.numInProgress} | ${result.numNotStarted} |`);
}

summaryLines.push(`| **Total** | **${totals.numClasses}** | **${totals.numMethods}** | **${totals.numCompleted}** | **${totals.numInProgress}** | **${totals.numNotStarted}** |`);

const summaryContent = summaryLines.join('\n');

fs.writeFileSync(outputFile, summaryContent);

console.log('progress.md generated successfully.');
