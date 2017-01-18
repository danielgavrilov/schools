from pymongo import MongoClient
from helpers import db_url, db_database, group_xls, to_int
from subjects import subject_name

mongo = MongoClient(db_url)
db = mongo[db_database]

print("Updating A-level results (2015)...")

A2 = group_xls("../data/2015/ks5_subjects.xlsx", "1.A level",
               group_by="URN",
               extract=["Subject", "Number entered", "Grade A*", "Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "No results"],
               header_row=2)

for school in A2:
    urn = str(school["URN"])
    subjects = {}

    for row in school["rows"]:
        total = int(row["Number entered"])
        subject = subject_name(row["Subject"])

        if total > 5:
            subjects[subject] = {
                "A*": to_int(row["Grade A*"]),
                "A": to_int(row["Grade A"]),
                "B": to_int(row["Grade B"]),
                "C": to_int(row["Grade C"]),
                "D": to_int(row["Grade D"]),
                "E": to_int(row["Grade E"]),
                "NR": to_int(row["No results"]),
                "total": total
            }
        else:
            subjects[subject] = {
                "total": total
            }

    db.schools.update(
        { "_id": urn },
        { "$set": { "performance.2015.results.a-level": subjects } }
    )

mongo.close()

print("\nDone.")
