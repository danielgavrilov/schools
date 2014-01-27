from helpers import db, mongo, parse_csv, to_int, to_float


print("Updating school information from 2013 data...")
for school in parse_csv("../data/2013/ks5_attainment.csv"):

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
                "primary": bool(to_int(school["TABKS2"])),
                "secondary": bool(to_int(school["TAB15"])),
                "performance.2013.students": {
                    "16-18": to_int(school["TPUP1618"]),
                    "ks5": to_int(school["TALLPUPA"]),
                    "academic": to_int(school["TALLPUP_ACADA"]),
                    "vocational": to_int(school["TALLPUP_VQA"]),
                    "a-level": to_int(school["TALLPUP_ALEVA"])
                },
                "performance.2013.aps.a-level": {
                    "student": to_float(school["APSFTE_ALEVA"], True),
                    "entry": to_float(school["TALLPPE_ALEVA"], True)
                }
            }
        },
        upsert=True
    )


# print("Updating school information from 2012 data...")
# for school in parse_csv("../data/2012/ks5_attainment.csv"):

#     # All schools are RECTYPE=1. Other RECTYPEs are used for local averages.
#     # Closed schools are ICLOSE=1. We skip them too.
#     if (school["RECTYPE"] != "1") or (school["ICLOSE"] == "1"):
#         continue

#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": {
#                 "performance.2012.students": {
#                     "16-18": to_int(school["TPUP1618"]),
#                     "ks5": to_int(school["TALLPUPA"]),
#                     "a-level": to_int(school["TALLPUP_ALEVA"])
#                 },
#                 "performance.2012.aps": {
#                     "student": to_float(school["TALLPPSA"], True),
#                     "entry": to_float(school["TALLPPEA"], True)
#                 }
#             }
#         },
#         upsert=False
#     )


# print("Updating school information from 2011 data...")
# for school in parse_csv("../data/2011/ks5_attainment.csv"):

#     if (school["RECTYPE"] != "1") or (school["ICLOSE"] == "1"):
#         continue

#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": {
#                 "performance.2011.students": {
#                     "16-18": to_int(school["TPUP1618"]),
#                     "ks5": to_int(school["TALLPUPA"])
#                 },
#                 "performance.2011.aps": {
#                     "student": to_float(school["TALLPPSA"], True),
#                     "entry": to_float(school["TALLPPEA"], True)
#                 },
#                 "performance.2010.aps": {
#                     "student": to_float(school["TALLPPS10"], True),
#                     "entry": to_float(school["TALLPPE10"], True)
#                 },
#                 "performance.2009.aps": {
#                     "student": to_float(school["TALLPPS09"], True),
#                     "entry": to_float(school["TALLPPE09"], True)
#                 },
#                 "performance.2008.aps": {
#                     "student": to_float(school["TALLPPS08"], True),
#                     "entry": to_float(school["TALLPPE08"], True)
#                 }
#             }
#         },
#         upsert=False
#     )

mongo.disconnect()

print("\nDone.")