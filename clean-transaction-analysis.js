const fs = require('fs');

// Read the file
const filePath = 'src/app/stats/stats-content.tsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the lines to remove - from GradeTxn types to start of main StatsContent component
const startMarker = lines.findIndex(line => line.includes('// Transaction Analysis Types'));
const endMarker = lines.findIndex(line => line.includes('export function StatsContent'));

if (startMarker === -1 || endMarker === -1) {
  console.log('Could not find markers');
  console.log('Start marker (Transaction Analysis Types):', startMarker);
  console.log('End marker (export function StatsContent):', endMarker);
  process.exit(1);
}

console.log(`Found inline components to remove from line ${startMarker + 1} to ${endMarker - 1}`);
console.log(`Lines to remove: ${endMarker - startMarker - 1}`);

// Remove the old content (keep the comment line but remove everything after it until StatsContent)
const newLines = [
  ...lines.slice(0, startMarker + 1), // Keep up to and including the comment
  '',
  ...lines.slice(endMarker), // Keep from StatsContent onwards
];

// Write back
fs.writeFileSync(filePath, newLines.join('\n'));
console.log('✅ Successfully removed inline TransactionAnalysis and related components');
console.log(`File size reduced from ${lines.length} to ${newLines.length} lines`);
