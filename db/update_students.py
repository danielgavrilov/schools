from helpers import db, mongo, parse_xls, group_xls, to_int

# ============================================================================================

print("Updating IB student numbers (2013)... ")
for school in parse_xls("../data/2013/ks5_subjects.xlsx", "IB Diploma", header_row=2):
    db.schools.update(
        { "_id": str(school["URN"]) },
        { "$set": { "performance.2013.students.ib": to_int(school["Number entered"]) } }
    )

# print("Updating IB student numbers (2012)... ")
# for school in parse_xls("../data/2012/ks5_subjects.xls", "IB Diploma", header_row=2):
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2012.students.ib": to_int(school["Number entered "]) } }
#     )

# print("Updating IB student numbers (2011)... ")
# for school in parse_xls("../data/2011/ks5_subjects.xls", "IB Diploma", header_row=2):
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2011.students.ib": to_int(school["Number entered "]) } }
#     )

# ============================================================================================

print("Updating AQA Baccalaureate student numbers (2013)... ")
for school in parse_xls("../data/2013/ks5_subjects.xlsx", "AQA Baccalaureate", header_row=2):
    db.schools.update(
        { "_id": str(school["URN"]) },
        { "$set": { "performance.2013.students.aqa-bacc": to_int(school["Number entered"]) } }
    )

# print("Updating AQA Baccalaureate student numbers (2012)... ")
# for school in parse_xls("../data/2012/ks5_subjects.xls", "AQA Baccalaureate", header_row=2):
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2012.students.aqa-bacc": to_int(school["Number passed "]) } }
#     )

# print("Updating AQA Baccalaureate student numbers (2011)... ")
# for school in parse_xls("../data/2011/ks5_subjects.xls", "AQA Baccalaureate", header_row=2):
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2011.students.aqa-bacc": to_int(school["Number passed "]) } }
#     )

# ============================================================================================

preu2013 = group_xls("../data/2013/ks5_subjects.xlsx", "Pre U", 
                     group_by="URN", 
                     extract=["Number entered"], 
                     header_row=2)

print("Updating Pre U schools (2013)... ")
for school in preu2013:
    db.schools.update(
        { "_id": str(school["URN"]) },
        { "$set": { "performance.2013.students.pre-u": True } }
    )


# preu2012 = group_xls("../data/2012/ks5_subjects.xls", "Pre U", 
#                      group_by="URN", 
#                      extract=["Number entered "], 
#                      header_row=2)

# print("Updating Pre U schools (2012)... ")
# for school in preu2012:
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2012.students.pre-u": True } }
#     )
    

# preu2011 = group_xls("../data/2011/ks5_subjects.xls", "Pre U", 
#                      group_by="URN", 
#                      extract=["Number entered "], 
#                      header_row=2)

# print("Updating Pre U schools (2011)... ")
# for school in preu2011:
#     db.schools.update(
#         { "_id": school["URN"] },
#         { "$set": { "performance.2011.students.pre-u": True } }
#     )



mongo.disconnect();

print("\nDone.")