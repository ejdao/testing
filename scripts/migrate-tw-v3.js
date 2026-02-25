const { readFileSync, writeFileSync, readdirSync, statSync } = require('fs');
const { join } = require('path');

// Recursively get all .tsx files
function getFiles(dir, ext = '.tsx') {
  let results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory() && entry !== 'node_modules' && entry !== '.next') {
      results = results.concat(getFiles(fullPath, ext));
    } else if (entry.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

const projectRoot = '/vercel/share/v0-project';
const files = [
  ...getFiles(join(projectRoot, 'components')),
  ...getFiles(join(projectRoot, 'app')),
];

let totalChanges = 0;

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const original = content;

  // 1. shadow-xs -> shadow-sm
  content = content.replace(/shadow-xs/g, 'shadow-sm');

  // 2. outline-hidden -> outline-none
  content = content.replace(/outline-hidden/g, 'outline-none');

  // 3. rounded-xs -> rounded-sm
  content = content.replace(/rounded-xs/g, 'rounded-sm');

  // 4. Remove origin-(--radix-*) patterns (not supported in v3)
  content = content.replace(/ origin-\([^)]+\)/g, '');

  // 5. Remove max-h-(--radix-*) patterns
  content = content.replace(/ max-h-\(--radix[^)]+\)/g, '');

  // 6. Remove field-sizing-content (not supported in v3)
  content = content.replace(/ field-sizing-content/g, '');

  // 7. has-[>svg] patterns - not well supported in v3
  content = content.replace(/ has-\[>svg\]:[^ '"]+/g, '');

  // 8. outline-ring/50 -> remove (v4-only syntax)
  content = content.replace(/ outline-ring\/50/g, '');

  // 9. *:data-[slot=...] patterns (v4 child selector syntax) - remove all
  content = content.replace(/ \*:data-\[slot=[^\]]+\]:[^ '"]+/g, '');

  // 10. data-[variant=destructive]:*:[svg]:!text-destructive -> simplify
  content = content.replace(/ data-\[variant=destructive\]:\*:\[svg\]:!text-destructive/g, '');

  // 11. has-data-[...] patterns
  content = content.replace(/ has-data-\[[^\]]+\]:[^ '"]+/g, '');

  // 12. size-(--cell-size) -> h-8 w-8
  content = content.replace(/size-\(--cell-size\)/g, 'h-8 w-8');

  // 13. h-(--cell-size) -> h-8
  content = content.replace(/h-\(--cell-size\)/g, 'h-8');

  // 14. w-(--cell-size) -> w-8
  content = content.replace(/w-\(--cell-size\)/g, 'w-8');

  // 15. min-w-(--cell-size) -> min-w-8
  content = content.replace(/min-w-\(--cell-size\)/g, 'min-w-[2rem]');

  // 16. @container/... -> remove
  content = content.replace(/ @container\/[^ '"]+/g, '');

  // 17. [.border-b]:pb-6 -> remove (v4 parent selector syntax)
  content = content.replace(/ \[\.border-[^\]]+\]:[^ '"]+/g, '');

  // 18. has-disabled -> remove (v4 specific)
  content = content.replace(/ has-disabled:[^ '"]+/g, '');

  // 19. **:data-[slot=...] patterns (v4 descendant selector)
  content = content.replace(/ \*\*:data-\[slot=[^\]]+\]:[^ '"]+/g, '');

  // 20. has-[select...]:... complex selectors
  content = content.replace(/ has-\[select[^\]]*\]:\[[^\]]+\]:[^ '"]+/g, '');

  // 21. has-[>[data-slot...]] patterns
  content = content.replace(/ has-\[>\[data-slot=[^\]]+\]\]:[^ '"]+/g, '');
  content = content.replace(/ has-\[>\[data-align=[^\]]+\]\]:[^ '"]+/g, '');

  // 22. has-[[data-slot...]...] patterns
  content = content.replace(/ has-\[\[data-slot[^\]]*\][^\]]*\]:[^ '"]+/g, '');

  // 23. group-has-[>input] patterns
  content = content.replace(/ group-has-\[>[^\]]+\]\/[^ :'"]+:[^ '"]+/g, '');

  // 24. has-focus: -> focus-within: (approximate)
  content = content.replace(/has-focus:/g, 'focus-within:');

  // 25. [&_svg:not([class*='size-'])]:size-4 -> [&_svg]:h-4 [&_svg]:w-4
  content = content.replace(/\[&_svg:not\(\[class\*='size-'\]\)\]:size-(\d+)/g, '[&_svg]:h-$1 [&_svg]:w-$1');

  // 26. Any remaining size-(--...) patterns
  content = content.replace(/size-\(--[^)]+\)/g, 'h-8 w-8');

  // 27. Clean up double/triple spaces from removals
  content = content.replace(/  +/g, ' ');
  
  // 28. Clean up trailing spaces before quotes
  content = content.replace(/ "/g, '"');
  content = content.replace(/ '/g, "'");
  content = content.replace(/ `/g, '`');

  if (content !== original) {
    writeFileSync(file, content);
    totalChanges++;
    console.log('Updated: ' + file.replace(projectRoot + '/', ''));
  }
}

console.log('');
console.log('Total files updated: ' + totalChanges);
