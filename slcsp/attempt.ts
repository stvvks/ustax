// Getting typescript libraries
// fs is for filesystem, process is for command line args, csv is for parsing csvs
import * as fs from 'fs';
import * as csv from 'csv-parser';
import * as process from 'process';

// SilverPlan has properities of id, rate_area, and rate
interface SilverPlan {
  id: string;
  rate_area: [string, string];
  rate: string;
}

// const is a variable thats unchangable, 'silverPlan' is an array that stores 'SilverPlan'
// solvableRateArea is a set the tracks silver plan rate areas
// zipCodesRateArea is a map that corresponds zipcodes & rate area 
const silverPlans: SilverPlan[] = [];
const solvableRateAreas: Set<string> = new Set();
const zipCodesRateAreas: Map<string, Set<string>> = new Map();

// this function parses the slcsp.csv, and prints each zipcode and corresponding rate using the 'getRate' function
function processSlcspFile(): void {
  const stream = fs.createReadStream('slcsp.csv').pipe(csv());
  console.log('zipcode,rate');
  stream.on('data', (row: any) => {
    console.log(`${row['zipcode']},${getRate(row['zipcode'])}`);
  });
}

// 'getRate' function, given a zipcode, it retrieves the rate area associated with it, if its more than 1 rate area, return blank
// if it only 1, then get silver plan and 2nd lowest rate
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

// this function filters silverplan to only return plans that match given rate area
function getSilverPlansByRateArea(rateArea: string): SilverPlan[] {
  return silverPlans.filter(silverPlan => silverPlan.rate_area.join(',') === rateArea);
}

// this function takes the rates, sorts, and returns 2nd lowest formatted to 2 decimal points
function getSlcsp(rates: string[]): string {
  const sortedRates = rates.map(rate => parseFloat(rate)).sort((a, b) => a - b);
  return sortedRates[1].toFixed(2);
}

// this function reads plans.csv, adds data for each row with 'silver' metal_level, adds the silverPlan const var data to the rate area from 'solvableRateArea'
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

// this function reads zips.csv, for each row it adds the 'zipCodesRateArea' const var, with the zipcode and associatied rate area
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

// execution, since no cli args are past, it should run the functions
if (process.argv.length > 2) {
  const zipcode = process.argv[2];
  console.log('zipcode,rate');
  console.log(`${zipcode},${getRate(zipcode)}`);
} else {
  loadSilverPlans();
  loadZipcodesRateAreas();
  processSlcspFile();
}