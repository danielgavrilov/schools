from pymongo import GEOSPHERE
from helpers import db, mongo
import requests
import shelve

cache = shelve.open('cached_postcodes') 

def format_postcode(postcode):
    return postcode.replace(" ", "").upper().encode("ascii")

# def get_coords(postcode):
#     url = "http://maps.googleapis.com/maps/api/geocode/json?address="+postcode+"&sensor=false"
#     response = requests.get(url).json()
#     lng = float(response["results"][0]["geometry"]["location"]["lng"])
#     lat = float(response["results"][0]["geometry"]["location"]["lat"])
#     return [lng, lat]

def get_coords(postcode):
    url = "http://data.ordnancesurvey.co.uk/doc/postcodeunit/" + postcode + ".json"
    response = requests.get(url).json()
    lng = float(response["http://data.ordnancesurvey.co.uk/id/postcodeunit/"+postcode]["http://www.w3.org/2003/01/geo/wgs84_pos#long"][0]['value'])
    lat = float(response["http://data.ordnancesurvey.co.uk/id/postcodeunit/"+postcode]["http://www.w3.org/2003/01/geo/wgs84_pos#lat"][0]['value'])
    return [lng, lat]


def get_location(postcode):
    try:
        return cache[postcode]
    except KeyError:
        print("Requesting coordinates for "+postcode+"...")
        cache[postcode] = {
            "type": "Point",
            "coordinates": get_coords(postcode)
        }
        return cache[postcode]

missing_location = db.schools.find({ "location": None }, { "postcode": 1 })
not_found = []

for school in missing_location:
    postcode = format_postcode(school["postcode"])
    try:
        location = get_location(postcode)
        db.schools.update({"_id": school["_id"]}, {"$set": {"location": location} })
    except:
        not_found.append(postcode)

if not_found:
    print("\nCouldn't find lat/long for "+str(len(not_found))+" postcodes.")
    print(", ".join(not_found))

db.schools.ensure_index([("location", GEOSPHERE)])

cache.close()
mongo.disconnect()