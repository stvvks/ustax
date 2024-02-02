# Need to grab certain python libraries for script to work.
# CSV, due to working with CSV files (read/write) and sys for command-line
import csv
import sys

#These are variables that can/will be called on in the script
#Storing the silver plans in a list, having a set for the state/rate area pairs, and a dictionary for the zip codes 
silver_plans = list()
solvable_rate_areas = set()
zip_codes_rate_areas = dict()

#This function will open the slcsp.csv, read it as a dictionary, and print the zipcode & get its rate with the 'get_rate'
def process_slcsp_file():
    with open('slcsp.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        print('zipcode,rate')
        for row in reader:
            print(f"{row['zipcode']},{get_rate(row['zipcode'])}")

#This function will get the rates that are corresponded with the zipcode with conditions defined below
def get_rate(zipcode):
    rate_areas = zip_codes_rate_areas[zipcode]
    # checking if there is only one rate area, return blank
    if len(rate_areas) != 1:
        return ''
# if the rate area isnt in the set, return blank
    rate_area = list(rate_areas)[0]
    if rate_area not in solvable_rate_areas:
        return ''
# creating a list variable from a function/variable 
    silver_plans_for_rate_area = get_silver_plans_by_rate_area(rate_area)
# creating a set varaible from silver plans
    rates = set(map(lambda plan: plan['rate'], silver_plans_for_rate_area))
# If there is more than 1 silver rate plan, then get the 2nd lowest from using the get_slcsp function. if not, return blank
    if len(rates) > 1:
        return get_slcsp((rates))
    else:
        return ''

# defining a function that will return only silver plans with a matching rate area from 'rate_area' variable defined earlier in script
def get_silver_plans_by_rate_area(rate_area):
    return [silver_plan for silver_plan in silver_plans if silver_plan['rate_area'] == rate_area]

# sorting the set of rates defined earlier that are organized and grabbing 2nd to lowest rate. formatted as string
def get_slcsp(rates):
    return '{0:.2f}'.format(float(sorted(rates)[1]))

# defining a function, that opens plans.csv file, checking if a row has 'silver' in its 'metal_level' column, attach/append it to 'silver_plans'
# then add solvable_rate_areas set variable
def load_silver_plans():
    with open('plans.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        next(reader)
        for row in reader:
            if row['metal_level'] == 'Silver':
                silver_plans.append({
                    'id': row['plan_id'],
                    'rate_area': (row['state'], row['rate_area']),
                    'rate': row['rate'],
                })
                solvable_rate_areas.add((row['state'], row['rate_area']))

# creating a function that opens zips.csv, checking if the zipcode is not in the zip_code dictionary defined on top of script
# if not, create an empty set
# then add the rate area to the zip code set
def load_zipcodes_rate_areas():
    with open('zips.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            if row['zipcode'] not in zip_codes_rate_areas.keys():
                zip_codes_rate_areas[row['zipcode']] = set()
            zip_codes_rate_areas[row['zipcode']].add(
                (row['state'], row['rate_area']))

# load data from script, using sys library check if any command-line args are used
#print the 'zipcode,rate'
#print the zipcode variable & get_rate function/zipcode variable
# if not, output the process_slscp_file function
if __name__ == "__main__":
    load_silver_plans()
    load_zipcodes_rate_areas()
    if len(sys.argv) > 1:
        zipcode = sys.argv[1]
        print('zipcode,rate')
        print(f"{zipcode},{get_rate(zipcode)}")
    else:
        process_slcsp_file()

