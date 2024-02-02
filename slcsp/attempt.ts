import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as process from 'process';

interface SilverPlan {
  id: string;
  rate_area: [string, string];
  rate: string;
}

const silverPlans: SilverPlan[] = [];
const solvableRateAreas: Set<string> = new Set();
const zipCodesRateAreas: Map<string, Set<string>> = new Map();

function processSlcspFile(): void {
  const stream = fs.createReadStream('slcsp.csv').pipe(csv());
  console.log('zipcode,rate');
  stream.on('data', (row: any) => {
    console.log(`${row['zipcode']},${getRate(row['zipcode'])}`);
  });
}

function getRate(zipcode: string): string {
  const rateAreas = zipCodesRateAreas.get(zipcode);
  if (!rateAreas || rateAreas.size !== 1) {
    return '';
  }
  const rateArea = Array.from(rateAreas)[0];
  if (!solvableRateAreas.has(rateArea)) {
    return '';
  }
  const silverPlansForRateArea = getSilverPlansByRateArea(rateArea);
  const rates = new Set(silverPlansForRateArea.map(plan => plan.rate));
  if (rates.size > 1) {
    return getSlcsp(Array.from(rates));
  } else {
    return '';
  }
}

function getSilverPlansByRateArea(rateArea: string): SilverPlan[] {
  return silverPlans.filter(silverPlan => silverPlan.rate_area.join(',') === rateArea);
}

function getSlcsp(rates: string[]): string {
  const sortedRates = rates.map(rate => parseFloat(rate)).sort((a, b) => a - b);
  return sortedRates[1].toFixed(2);
}

function loadSilverPlans(): void {
  const stream = fs.createReadStream('plans.csv').pipe(csv());
  stream.on('data', (row: any) => {
    if (row['metal_level'] === 'Silver') {
      const rateArea = `${row['state']},${row['rate_area']}`;
      silverPlans.push({
        id: row['plan_id'],
        rate_area: [row['state'], row['rate_area']],
        rate: row['rate'],
      });
      solvableRateAreas.add(rateArea);
    }
  });
}

function loadZipcodesRateAreas(): void {
  const stream = fs.createReadStream('zips.csv').pipe(csv());
  stream.on('data', (row: any) => {
    const rateArea = `${row['state']},${row['rate_area']}`;
    if (!zipCodesRateAreas.has(row['zipcode'])) {
      zipCodesRateAreas.set(row['zipcode'], new Set());
    }
    zipCodesRateAreas.get(row['zipcode'])!.add(rateArea);
  });
}

if (process.argv.length > 2) {
  const zipcode = process.argv[2];
  console.log('zipcode,rate');
  console.log(`${zipcode},${getRate(zipcode)}`);
} else {
  loadSilverPlans();
  loadZipcodesRateAreas();
  processSlcspFile();
}