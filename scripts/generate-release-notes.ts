import fs from 'fs';
import path from 'path';

const CHANGELOG_PATH = path.join(process.cwd(), 'docs', 'CHANGELOG_SAFE.md');

const generateReleaseNotes = () => {
  const date = new Date().toISOString().split('T')[0];
  const template = `
## [Unreleased] - ${date}

### 🚀 New Features
- 

### 🐛 Bug Fixes
- 

### 🔧 Improvements
- 

### 🔒 Security
- 
`;

  if (!fs.existsSync(CHANGELOG_PATH)) {
    fs.writeFileSync(CHANGELOG_PATH, '# Changelog\n' + template);
    console.log('Created new CHANGELOG_SAFE.md');
  } else {
    const content = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    // Insert after the header
    const lines = content.split('\n');
    let insertIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('# ')) {
        // header found
      } else if (lines[i].trim() === '') {
        // skip empty lines
      } else {
        insertIndex = i;
        break;
      }
    }

    // Simple prepend after title if possible, or just append for now to be safe,
    // but usually changelogs are reverse chronological.
    // Let's prepend after the first H1 if it exists.

    const headerRegex = /^#\s+.+/;
    const match = content.match(headerRegex);

    if (match) {
      const headerEndIndex = match.index! + match[0].length;
      const newContent =
        content.slice(0, headerEndIndex) +
        '\n' +
        template +
        content.slice(headerEndIndex);
      fs.writeFileSync(CHANGELOG_PATH, newContent);
    } else {
      fs.writeFileSync(CHANGELOG_PATH, template + '\n' + content);
    }

    console.log(`Added template for ${date} to CHANGELOG_SAFE.md`);
  }
};

generateReleaseNotes();
