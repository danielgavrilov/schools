# An attempt to calculate the average A-level point score.
# Ended up not being able to.
# 
# Update: Found out AS exam scores are also taken into account, 
# at half the score of A-level. Maybe this will help you determine
# it, if for some weird reason you wanted to.

from pymongo import MongoClient

mongo = MongoClient()
db = mongo.ks5

schools = db.schools.find({
    "performance.2013.aps.a-level.entry": {"$gt": 0},
    "performance.2013.results.a-level": {"$exists": True}
})

success = 0
inaccurate = 0
all_suppressed = 0
no_info = 0

for school in schools:
    try:
        sum_of_scores = 0
        entries = 0
        suppressed = 0
        subjects = school["performance"]["2013"]["results"]["a-level"]

        for name, subject in subjects.items():
            try:
                sum_of_scores += subject["A*"] * 300
                sum_of_scores += subject["A"] * 270
                sum_of_scores += subject["B"] * 240
                sum_of_scores += subject["C"] * 210
                sum_of_scores += subject["D"] * 180
                sum_of_scores += subject["E"] * 150
                entries += subject["total"]
            except KeyError: 
                suppressed += subject["total"]

        if entries:
            real_score = school["performance"]["2013"]["aps"]["a-level"]["entry"]
            calculated_score = float(sum_of_scores) / entries
            if suppressed:
                score_of_suppressed = real_score + (entries / suppressed) * (real_score - calculated_score)
                calculated_score = (suppressed * score_of_suppressed + entries * calculated_score) / (suppressed + entries)
            percentage_error = abs(calculated_score - real_score) / real_score
            if percentage_error < 0.025:
                print("\nReal score: {0}".format(real_score))
                print("Calc score: {0}".format(calculated_score))
                print("Score of suppressed: {0}".format(score_of_suppressed))
                success += 1
            else:
                inaccurate += 1
        else:
            all_suppressed += 1

    except KeyError:
        no_info += 1

print("\n{0} calculated with acceptable error.".format(success))
print("{0} calculated with significant error.".format(inaccurate))
print("{0} schools had only suppressed results.".format(all_suppressed))
print("{0} scohols did not provide information.".format(no_info))

mongo.close()