from pymongo import MongoClient
from helpers import db_url, db_database, parse_xls, group_xls, to_int

mongo = MongoClient(db_url)
db = mongo[db_database]

print("Updating IB student numbers (2015)... ")
for school in parse_xls("../data/2015/ks5_subjects.xlsx", "IB Diploma", header_row=2):
    db.schools.update(
        { "_id": str(school["URN"]) },
        { "$set": { "performance.2015.students.ib": to_int(school["Number entered"]) } }
    )

print("Updating AQA Baccalaureate student numbers (2015)... ")
for school in parse_xls("../data/2015/ks5_subjects.xlsx", "AQA Baccalaureate", header_row=2):
    db.schools.update(
        { "_id": str(school["URN"]) },
        { "$set": { "performance.2015.students.aqa-bacc": to_int(school["Number entered"]) } }
    )

mongo.close()

print("\nDone.")
