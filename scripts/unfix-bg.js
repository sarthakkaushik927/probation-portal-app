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
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('bg-transparent dark:bg-transparent')) {
    content = content.replace(/bg-transparent dark:bg-transparent/g, 'bg-white dark:bg-zinc-950');
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
