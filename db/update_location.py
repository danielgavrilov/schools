from pymongo import MongoClient, GEOSPHERE
from helpers import db_url, db_database, get_location

mongo = MongoClient(db_url)
db = mongo[db_database]

missing_location = db.schools.find({"location": None}, {"postcode": 1})
not_found = []

for school in missing_location:
    postcode = school["postcode"]
    try:
        location = get_location(postcode)
        db.schools.update({"_id": school["_id"]}, {"$set": {"location": location} })
    except:
        not_found.append(postcode)

if not_found:
    print("\nCouldn't find lat/long for {0} postcodes.".format(str(len(not_found))))
    print(", ".join(not_found))

db.schools.ensure_index([("location", GEOSPHERE)])

mongo.close()
