import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The script is at gf_agent/scripts/builder.js, so the root is one level up
const GF_AGENT_DIR = path.resolve(__dirname, '..');

// Standardize paths relative to the gf_agent directory
const SKILLS_DIR = path.join(GF_AGENT_DIR, 'skills');
const INDEX_FILE = path.join(GF_AGENT_DIR, 'index.md');
const TEMPLATE_FILE = path.join(__dirname, 'SKILL.template.md');
const KNOWLEDGE_DIR = path.join(GF_AGENT_DIR, 'knowledge');
const SKILL_OUTPUT = path.join(GF_AGENT_DIR, 'SKILL.md');

// Use CWD for progress dir to allow user to provide it in a sparse clone/standalone env
const PROGRESS_DIR = path.resolve(process.cwd(), 'progress');

async function build() {
  // Cleanup potential junk from previous runs where paths were relative to CWD 
  // (e.g. if run from within gf_agent/scripts, it might have created gf_agent/scripts/gf_agent)
  try {
    const junkDir = path.join(__dirname, 'gf_agent');
    await fs.rm(junkDir, { recursive: true, force: true });
  } catch (err) {
    // Ignore
  }

  await fs.mkdir(SKILLS_DIR, { recursive: true });

  let masterIndex = '# gf_agent Skills Index\n\nThis index lists all Google Apps Script services and classes supported by `gf_agent` via `gas-fakes`.\n\n';

  try {
    // Check if progress directory exists before attempting to read
    await fs.access(PROGRESS_DIR);
    const files = await fs.readdir(PROGRESS_DIR);
    const mdFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.MD'));
for (const file of mdFiles) {
  const content = await fs.readFile(path.join(PROGRESS_DIR, file), 'utf-8');
  const serviceName = file.replace(/\.md$/i, '');
  const classes = [];

  // Extract sections
  const sections = content.split('## Class:');

      for (const section of sections.slice(1)) {
        const classNameMatch = section.match(/ \[(.*?)\]/);
        if (!classNameMatch) continue;
        const className = classNameMatch[1];
        
        // Find the method table within this section
        const tableMatch = section.match(/\| Method \| Description \| Return Type \| Return Description \| Status \| Implementation \|([\s\S]*?)(\n\n|$)/);
        
        if (tableMatch) {
          const tableContent = tableMatch[1];
          // Extract only completed methods for this specific table
          const methodMatches = tableContent.matchAll(/^\| \[(.*?)\]\(.*?\) \| .*? \| .*? \| .*? \| (completed) \|/gm);
          const methods = Array.from(methodMatches).map(m => m[1]);
          
          if (methods.length > 0) {
            classes.push({ name: className, methods });
          }
        }
      }

      if (classes.length > 0) {
        const skillFile = `${serviceName.toLowerCase()}.md`;
        let skillContent = `# Service: ${serviceName}\n\n`;
        
        classes.forEach(c => {
          skillContent += `## Class: ${c.name}\n\n`;
          skillContent += `Supported Methods:\n`;
          c.methods.forEach(m => {
            skillContent += `- \`${m}\`\n`;
          });
          skillContent += '\n';
        });

        await fs.writeFile(path.join(SKILLS_DIR, skillFile), skillContent);
        masterIndex += `- [${serviceName}](skills/${skillFile})\n`;
      }
    }

    await fs.writeFile(INDEX_FILE, masterIndex);
    console.log(`Skills and Index generated from ${PROGRESS_DIR}`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(`Skipping skills index generation: ${PROGRESS_DIR} not found.`);
    } else {
      console.log(`Skipping skills index generation: ${err.message}`);
    }
    console.log(`(This is expected in a sparse clone environment).`);
  }
  
  // Aggregate knowledge files into SKILL.md
  let skillMarkdown = await fs.readFile(TEMPLATE_FILE, 'utf-8');
  
  try {
    const knowledgeFiles = await fs.readdir(KNOWLEDGE_DIR);
    // Sort files to ensure deterministic aggregation (e.g., 01-drive.md, 02-syntax.md)
    knowledgeFiles.sort();
    
    for (const kFile of knowledgeFiles) {
      if (kFile.endsWith('.md')) {
        const kContent = await fs.readFile(path.join(KNOWLEDGE_DIR, kFile), 'utf-8');
        skillMarkdown += `\n${kContent}\n`;
      }
    }
  } catch (err) {
    console.log(`No knowledge directory found at ${KNOWLEDGE_DIR} or error reading it:`, err.message);
  }

  await fs.writeFile(SKILL_OUTPUT, skillMarkdown);

  console.log(`Build complete! Skills, Index, and monolithic SKILL.md generated at ${SKILL_OUTPUT}`);
}

build().catch(console.error);

