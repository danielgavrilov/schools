from helpers import db, mongo, group_xls, to_int
from subjects import subject_name



print("Updating A-level results (2013)...")

A2 = group_xls("../data/2013/ks5_subjects.xlsx", "A level", 
               group_by="URN", 
               extract=["Subject", "Number entered", "Grade A*", "Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "No results"], 
               header_row=2)

for school in A2:
    urn = school["URN"]
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
        { "$set": { "performance.2013.results.a-level": subjects } }
    )



# print("Updating AS results (2013)...")

# AS = group_xls("../data/2013/ks5_subjects.xls", "AS", 
#                group_by="URN", 
#                extract=["Subject", "Number entered ", "A", "B", "C", "D", "E", "No result"], 
#                header_row=2)

# for school in AS:
#     urn = school["URN"]
#     subjects = {}

#     for row in school["rows"]:
#         total = int(row["Number entered "])
#         subject = subject_name(row["Subject"])

#         if total > 5:
#             subjects[subject] = {
#                 "A": to_int(row["A"]),
#                 "B": to_int(row["B"]),
#                 "C": to_int(row["C"]),
#                 "D": to_int(row["D"]),
#                 "E": to_int(row["E"]),
#                 "NR": to_int(row["No result"]),
#                 "total": total
#             }
#         else:
#             subjects[subject] = {
#                 "total": total
#             }

#     db.schools.update(
#         { "_id": urn },
#         { "$set": { "performance.2013.results.as": subjects } }
#     )




# print("Updating A-level results (2012)...")

# A2 = group_xls("../data/2012/ks5_subjects.xls", "A level", 
#                group_by="URN", 
#                extract=["Subject", "Number entered ", "A*", "A", "B", "C", "D", "E", "No result"], 
#                header_row=2)

# for school in A2:
#     urn = school["URN"]
#     subjects = {}

#     for row in school["rows"]:
#         total = int(row["Number entered "])
#         subject = subject_name(row["Subject"])

#         if total > 5:
#             subjects[subject] = {
#                 "A*": to_int(row["A*"]),
#                 "A": to_int(row["A"]),
#                 "B": to_int(row["B"]),
#                 "C": to_int(row["C"]),
#                 "D": to_int(row["D"]),
#                 "E": to_int(row["E"]),
#                 "NR": to_int(row["No result"]),
#                 "total": total
#             }
#         else:
#             subjects[subject] = {
#                 "total": total
#             }

#     db.schools.update(
#         { "_id": urn },
#         { "$set": { "performance.2012.results.a-level": subjects } }
#     )



# print("Updating AS results (2012)...")

# AS = group_xls("../data/2012/ks5_subjects.xls", "AS", 
#                group_by="URN", 
#                extract=["Subject", "Number entered ", "A", "B", "C", "D", "E", "No result"], 
#                header_row=2)

# for school in AS:
#     urn = school["URN"]
#     subjects = {}

#     for row in school["rows"]:
#         total = int(row["Number entered "])
#         subject = subject_name(row["Subject"])

#         if total > 5:
#             subjects[subject] = {
#                 "A": to_int(row["A"]),
#                 "B": to_int(row["B"]),
#                 "C": to_int(row["C"]),
#                 "D": to_int(row["D"]),
#                 "E": to_int(row["E"]),
#                 "NR": to_int(row["No result"]),
#                 "total": total
#             }
#         else:
#             subjects[subject] = {
#                 "total": total
#             }

#     db.schools.update(
#         { "_id": urn },
#         { "$set": { "performance.2012.results.as": subjects } }
#     )



# print("Updating A-level results (2011)...")

# subjects2011 = group_xls("../data/2011/ks5_subjects.xls", "A level", 
#                          group_by="URN", 
#                          extract=["Subject", "Number entered ", "A*", "A", "B", "C", "D", "E", "U", "No result"], 
#                          header_row=2)

# for school in subjects2011:
#     urn = school["URN"]
#     subjects = {}

#     for row in school["rows"]:
#         total = int(row["Number entered "])
#         subject = subject_name(row["Subject"])

#         if total > 5:
#             subjects[subject] = {
#                 "A*": to_int(row["A*"]),
#                 "A": to_int(row["A"]),
#                 "B": to_int(row["B"]),
#                 "C": to_int(row["C"]),
#                 "D": to_int(row["D"]),
#                 "E": to_int(row["E"]),
#                 "U": to_int(row["U"]),
#                 "NR": to_int(row["No result"]),
#                 "total": total
#             }
#         else:
#             subjects[subject] = {
#                 "total": total
#             }

#     db.schools.update(
#         { "_id": urn },
#         { "$set": { "performance.2011.results.a-level": subjects } }
#     )


mongo.disconnect();

print("\nDone.")