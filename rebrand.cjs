const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        filelist = walkSync(path.join(dir, file), filelist);
      }
    }
    else {
      if (
        file.endsWith('.tsx') || file.endsWith('.ts') ||
        file.endsWith('.js') || file.endsWith('.jsx') ||
        file.endsWith('.json') || file.endsWith('.html') ||
        file.endsWith('.md') || file.endsWith('.svg') ||
        file.endsWith('.css')
      ) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const map = [
  { from: /RAHI_40_ROUTES/g, to: 'RAPDO_40_ROUTES' },
  { from: /RAHI_DISCOUNT_TIERS/g, to: 'RAPDO_DISCOUNT_TIERS' },
  { from: /rahi_auth_uid/g, to: 'rapdo_auth_uid' },
  { from: /RAHI/g, to: 'RAPDO' },
  { from: /Rahi/g, to: 'Rapdo' },
  { from: /rahi/g, to: 'rapdo' },
  { from: /#FFD000/gi, to: '#FFC107' },
  { from: /255,208,0/g, to: '255,193,7' },
  { from: /#F5B700/gi, to: '#FFB300' },
  { from: /250,204,21/g, to: '255,193,7' },
];

const files = walkSync('.');
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  map.forEach(replacement => {
    newContent = newContent.replace(replacement.from, replacement.to);
  });

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    count++;
    console.log('Updated: ' + file);
  }
});

console.log('Total files updated: ' + count);
