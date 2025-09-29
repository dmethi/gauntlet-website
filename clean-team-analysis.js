const fs = require('fs');

// Read the file
const filePath = 'apps/web/src/app/stats/stats-content.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the lines to remove
const startMarker = lines.findIndex(line => line.includes('avgOppRank={avgOppRank}'));
const endMarker = lines.findIndex(line => line.includes("TabsContent value='league'"));

if (startMarker === -1 || endMarker === -1) {
  console.log('Could not find markers');
  process.exit(1);
}

console.log(`Found content to remove from line ${startMarker + 2} to ${endMarker - 1}`);
console.log(`Lines to remove: ${endMarker - startMarker - 2}`);

// Remove the old content
const newLines = [
  ...lines.slice(0, startMarker + 1),
  '          />',
  '        </TabsContent>',
  '',
  ...lines.slice(endMarker),
];

// Write back
fs.writeFileSync(filePath, newLines.join('\n'));
console.log('✅ Successfully cleaned up Team Analysis tab');
console.log(`File size reduced from ${lines.length} to ${newLines.length} lines`);
