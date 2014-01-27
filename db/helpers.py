from pymongo import MongoClient
import xlrd
import csv

mongo = MongoClient()
db = mongo.ks5

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

def parse_csv(filepath):
    with open(filepath, "rb") as csvfile:
        reader = csv.DictReader(csvfile)
        for values in reader:
            yield values

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

