#Need csv library to read/write from the other csv files for HW
import csv

# Defining a function that reads a csv
def read_csv(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        return list(reader)

# Defining a function that writes a CSV
def write_csv(file_path, data):
    with open(file_path, 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows(data)

#Defining a function that will grab slcsp --INCOMPLETE, needed to add more functions
def find_slcsp_rate(plans, zip_code):
    "slcsp function"


# Read the input files
slcsp_data = read_csv('slcsp.csv')
plans_data = read_csv('plans.csv')
zips_data = read_csv('zips.csv')


# Process each row in slcsp_data
for row in plans_data:
    zip_code = row[0]
    
    # Find the rate for the current ZIP code
    slcsp_rate = find_slcsp_rate(plans_data, zip_code)
    
    # Update the slcsp_data with the found rate
    row.append(plans_data)

# Write the output to a new CSV file
write_csv('output.csv', slcsp_data)
