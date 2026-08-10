const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(srcDir, function(filePath) {
  if (filePath.endsWith('.css') || filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // CSS variables
    content = content.replace(/--accent-gold-2/g, '--accent-silver-2');
    content = content.replace(/--accent-gold-3/g, '--accent-silver-3');
    content = content.replace(/--accent-gold/g, '--accent-silver');
    content = content.replace(/--shadow-gold/g, '--shadow-silver');
    
    // Hex colors
    content = content.replace(/#C9A84C/gi, '#B0B8C4');
    content = content.replace(/#E8D48B/gi, '#E2E8F0');
    content = content.replace(/#A07830/gi, '#8A94A6');
    content = content.replace(/201,168,76/g, '176,184,196'); // RGB format

    // Class names and text
    content = content.replace(/className="gold"/g, 'className="silver"');
    content = content.replace(/shimmerGold/g, 'shimmerSilver');
    
    // Update logo color in Footer if any
    content = content.replace(/rgba\(201,168,76/g, 'rgba(176,184,196');
    
    // In gradients
    content = content.replace(/#f0d060/g, '#CBD5E1');

    if (original !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated:', filePath);
    }
  }
});
