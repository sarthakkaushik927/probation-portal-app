const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./app').filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  // Skip dashboard because we already did it
  if (f.includes('dashboard.tsx')) return;
  // Skip layouts
  if (f.includes('_layout.tsx')) return;
  // Skip auth
  if (f.includes('(auth)')) return;
  if (f.includes('index.tsx') && f === './app/index.tsx') return;

  let content = fs.readFileSync(f, 'utf8');
  
  if (content.includes('className="flex-1 bg-white dark:bg-zinc-950"')) {
    // 1. Calculate relative path to components
    const depth = f.split('/').length - 2; // './app/(user)/tasks/index.tsx' -> depth 3
    let relativePrefix = '';
    for(let i=0; i<depth; i++) relativePrefix += '../';
    const importStatement = `import Background from '${relativePrefix}components/Background';\n`;

    // Add import at the top
    if (!content.includes('import Background')) {
      const lines = content.split('\n');
      // Find last import
      let lastImportIdx = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIdx = i;
        }
      }
      lines.splice(lastImportIdx + 1, 0, importStatement);
      content = lines.join('\n');
    }

    // 2. Replace the first <View className="flex-1 bg-white dark:bg-zinc-950">
    content = content.replace(/<View className="flex-1 bg-white dark:bg-zinc-950"[^>]*>/, '<Background>');
    
    // 3. Replace the last </View> before the closing brace
    const lastViewIdx = content.lastIndexOf('</View>');
    if (lastViewIdx !== -1) {
      content = content.substring(0, lastViewIdx) + '</Background>' + content.substring(lastViewIdx + 7);
    }

    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
