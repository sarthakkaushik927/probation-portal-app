const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Apply responsive classes, making sure not to double-apply
  content = content.replace(/(?<!dark:)bg-zinc-950/g, 'bg-white dark:bg-zinc-950');
  content = content.replace(/(?<!dark:)bg-zinc-900/g, 'bg-zinc-100 dark:bg-zinc-900');
  content = content.replace(/(?<!dark:)text-white/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/(?<!dark:)border-zinc-800/g, 'border-black dark:border-white');
  content = content.replace(/(?<!dark:)border-zinc-700/g, 'border-black dark:border-white');
  content = content.replace(/(?<!dark:)text-zinc-400/g, 'text-zinc-600 dark:text-zinc-400');
  
  // Fix the old premium classes that were causing white-on-white text
  content = content.replace(/text-premium-textMuted/g, 'text-zinc-500 dark:text-zinc-400');
  content = content.replace(/text-premium-text/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/bg-premium-surfaceLight/g, 'bg-zinc-100 dark:bg-zinc-900');
  content = content.replace(/bg-premium-surface/g, 'bg-zinc-50 dark:bg-zinc-900 border border-black dark:border-white');
  content = content.replace(/bg-premium-bg/g, 'bg-white dark:bg-zinc-950');
  content = content.replace(/text-\[\#00F0FF\]/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/text-\[\#FFFFFF\]/g, 'text-zinc-900 dark:text-white');
  
  // Retroactively fix the previous replacements to be high-contrast borders
  content = content.replace(/border-zinc-200 dark:border-zinc-800/g, 'border-black dark:border-white');
  content = content.replace(/border-zinc-300 dark:border-zinc-700/g, 'border-black dark:border-white');
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated theme in ${filePath}`);
  }
}

walkDir(path.join(__dirname, '..', 'app'), processFile);
walkDir(path.join(__dirname, '..', 'components'), processFile);
