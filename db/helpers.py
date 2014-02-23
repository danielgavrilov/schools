import os
import xlrd
import csv
import json
import requests
import shelve

with open('mongo_admin.json') as credentials:
    db_url = json.load(credentials)['url']

# Type conversion

def to_int(num, strict=False):
    try:
        return int(num)
    except:
        if strict: return None
        # NE = No Entries = 0
        return 0 if num == "NE" else num

def to_float(num, strict=False):
    try:
        return float(num)
    except:
        if strict: return None
        # NE = No Entries = 0
        return 0 if num == "NE" else num

def to_dict(attrs, values):
    return { attrs[i]: values[i] for i in range(len(attrs)) }

# CSV reader

def parse_csv(filepath):
    with open(filepath, "rb") as csvfile:
        reader = csv.DictReader(csvfile)
        for values in reader:
            yield values

# Excel workbook reader

workbooks = dict()

def open_workbook(filepath):
    try:
        workbooks[filepath]
    except KeyError:
        workbooks[filepath] = xlrd.open_workbook(filepath)
    return workbooks[filepath]

def parse_xls(filepath, sheet, header_row=0):
    workbook = open_workbook(filepath)
    worksheet = workbook.sheet_by_name(sheet)
    headers = worksheet.row_values(header_row)
    for row_number in range(header_row+1, worksheet.nrows):
        values = worksheet.row_values(row_number)
        yield to_dict(headers, values)

def group_xls(filepath, sheet, group_by, extract=None, header_row=0):
    workbook = open_workbook(filepath)
    worksheet = workbook.sheet_by_name(sheet)
    headers = worksheet.row_values(header_row)

    if not extract:
        extract = headers

    accumulator = []

    for row_number in range(header_row+1, worksheet.nrows):
        values = worksheet.row_values(row_number)
        row = to_dict(headers, values)
        current = row[group_by]

        accumulator.append({ key: row[key] for key in extract })

        try:
            next_current = to_dict(headers, worksheet.row_values(row_number+1))[group_by]
        except:
            next_current = ""

        if current != next_current:
            yield {
                group_by: to_int(current),
                "rows": accumulator
            }
            current = next_current
            accumulator = []

# Postcode to lat/lng

cache = shelve.open('cached_postcodes')

def format_postcode(postcode):
    return postcode.replace(" ", "").upper().encode("ascii")

# Using Google Maps API
# def get_coords(postcode):
#     url = "http://maps.googleapis.com/maps/api/geocode/json?address="+postcode+"&sensor=false"
#     response = requests.get(url).json()
#     lng = float(response["results"][0]["geometry"]["location"]["lng"])
#     lat = float(response["results"][0]["geometry"]["location"]["lat"])
#     return [lng, lat]

# Using Ordnance Survey's website data.. sort of a bad way, but works.
def get_coords(postcode):
    url = "http://data.ordnancesurvey.co.uk/doc/postcodeunit/"+postcode+".json"
    response = requests.get(url).json()
    lng = float(response["http://data.ordnancesurvey.co.uk/id/postcodeunit/"+postcode]["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]['value'])
    lat = float(response["http://data.ordnancesurvey.co.uk/id/postcodeunit/"+postcode]["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]['value'])
    return [lng, lat]


def get_location(postcode):
    postcode = format_postcode(postcode)
    try:
        return cache[postcode]
    except KeyError:
        print("Requesting coordinates for {0}...".format(postcode))
        cache[postcode] = {
            "type": "Point",
            "coordinates": get_coords(postcode)
        }
        return cache[postcode]