import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PmuHistoryCollectorService } from '../pmu/pmu-history-collector.service';

/**
 * CLI command to collect historical PMU data
 * 
 * Usage:
 *   npm run collect-pmu-history -- --start=2023-01-01 --end=2024-12-31
 *   npm run collect-pmu-history -- --days=365  (collect last 365 days)
 *   npm run collect-pmu-history -- --year=2024 (collect entire year)
 */
async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const collectorService = app.get(PmuHistoryCollectorService);

  // Parse command line arguments
  const args = process.argv.slice(2);
  let startDate: Date;
  let endDate: Date = new Date();

  // Check for --start and --end arguments
  const startArg = args.find(arg => arg.startsWith('--start='));
  const endArg = args.find(arg => arg.startsWith('--end='));
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const yearArg = args.find(arg => arg.startsWith('--year='));

  if (yearArg) {
    // Collect entire year
    const year = parseInt(yearArg.split('=')[1]);
    startDate = new Date(year, 0, 1); // January 1st
    endDate = new Date(year, 11, 31); // December 31st
    console.log(`📅 Collecting data for year ${year}`);
  } else if (daysArg) {
    // Collect last N days
    const days = parseInt(daysArg.split('=')[1]);
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    console.log(`📅 Collecting data for last ${days} days`);
  } else if (startArg && endArg) {
    // Collect specific date range
    startDate = new Date(startArg.split('=')[1]);
    endDate = new Date(endArg.split('=')[1]);
    console.log(`📅 Collecting data from ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  } else {
    // Default: collect last 30 days
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    console.log(`📅 No date range specified, collecting last 30 days`);
  }

  console.log(`🚀 Starting PMU historical data collection...`);
  console.log(`   Start: ${startDate.toISOString().split('T')[0]}`);
  console.log(`   End: ${endDate.toISOString().split('T')[0]}`);
  console.log(`   Days: ${Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))}`);
  console.log('');

  try {
    await collectorService.collectHistoricalData(startDate, endDate);
    console.log('');
    console.log('✅ Collection completed successfully!');
  } catch (error) {
    console.error('');
    console.error('❌ Collection failed:', error.message);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

bootstrap();
