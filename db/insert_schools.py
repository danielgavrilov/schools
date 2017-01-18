from pymongo import MongoClient
from helpers import db_url, db_database, parse_csv, to_int, to_float

mongo = MongoClient(db_url)
db = mongo[db_database]

print("Updating school information from 2014 data...")
for school in parse_csv("../data/2014/ks5_attainment.csv"):

    # All schools are RECTYPE=1. Other RECTYPEs are used for local averages.
    # Closed schools are ICLOSE=1. We skip them too.
    if (school["RECTYPE"] != "1") or (school["ICLOSE"] == "1"):
        continue

    db.schools.update(
        { "_id": school["URN"] },
        { "$set": {
                "lea": to_int(school["LEA"]),
                "name": school["SCHNAME"],
                "address": [school["ADDRESS1"], school["ADDRESS2"], school["ADDRESS3"]],
                "town": school["TOWN"],
                "postcode": school["PCODE"],
                "phone": school["TELNUM"],
                "type": school["NFTYPE"],
                "religious": school["RELDENOM"],
                "admissions": school["ADMPOL"],
                "gender": school["GENDER1618"].capitalize(),
                "ages": school["AGERANGE"],
                "performance.2014.students": {
                    "16-18": to_int(school["TPUP1618"], True),
                    "ks5": to_int(school["TALLPUPA"]),
                    "academic": to_int(school["TALLPUP_ACADA"]),
                    "vocational": to_int(school["TALLPUP_VQA"]),
                    "a-level": to_int(school["TALLPUP_ALEVA"])
                },
                "performance.2014.aps.a-level": {
                    "student": to_float(school["APSFTE_ALEVA"], True),
                    "entry": to_float(school["TALLPPE_ALEVA"], True)
                }
            }
        },
        upsert=True
    )

    if (school["TPUP1618"] == "NEW"):
        db.schools.update({"_id": school["URN"]}, {"$set": {"new": True}})


mongo.close()

print("\nDone.")