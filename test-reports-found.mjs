import { readFile, readdir, access } from 'fs/promises';
import path from 'path';

const isLegacyReport = (data) => {
  if (!data || typeof data !== 'object') return false;
  const report = data;
  return (
    typeof report.season === 'string' &&
    typeof report.week === 'number' &&
    Array.isArray(report.leagues) &&
    !report.metadata &&
    !report.sections
  );
};

async function main() {
  console.log('\n🔍 Checking for reports...\n');
  
  // Check new format reports
  const newFormatPath = 'apps/web/data/reports/recap/2025';
  try {
    await access(newFormatPath);
    const files = await readdir(newFormatPath);
    const weekFiles = files.filter(f => f.startsWith('week-') && f.endsWith('.json') && !f.includes('backup'));
    console.log(`✅ New format reports found in ${newFormatPath}:`);
    weekFiles.forEach(f => console.log(`   - ${f}`));
  } catch {
    console.log(`⚠️  No new format reports directory: ${newFormatPath}`);
  }
  
  // Check legacy reports
  const legacyPath = 'apps/web/data';
  try {
    const files = await readdir(legacyPath);
    const legacyFiles = files.filter(f => f.startsWith('report-week') && f.endsWith('.json'));
    console.log(`\n✅ Legacy format files found in ${legacyPath}:`);
    
    for (const file of legacyFiles) {
      const filePath = path.join(legacyPath, file);
      const content = await readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      const isLegacy = isLegacyReport(data);
      const status = isLegacy ? '✅ VALID LEGACY' : '❌ NOT LEGACY';
      console.log(`   - ${file}: ${status} (week=${data.week}, hasLeagues=${Array.isArray(data.leagues)})`);
    }
  } catch (error) {
    console.log(`⚠️  Error checking legacy reports: ${error.message}`);
  }
  
  console.log('\n📊 Summary:');
  console.log('Expected reports: weeks 1, 2, 3, 4, 5');
  console.log('Week 1: Hardcoded in getAvailableReports()');
  console.log('Week 5: New format in data/reports/recap/2025/week-5.json');
  console.log('Weeks 2-4: Legacy format in data/report-week{N}.json');
}

main().catch(console.error);

