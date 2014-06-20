# A-level schools

A one-page web application for finding and comparing A-level schools, using data provided by the [Department for Education](http://www.education.gov.uk/schools/performance/download_data.html). Check it out at [**alevels.herokuapp.com**](http://alevels.herokuapp.com). Somewhat inspired by Guardian's [GCSE schools guide](http://www.theguardian.com/education/gcse-schools-guide).

## Running the server locally

To run this locally, you will need: 

- Node.js (for the web server)
- MongoDB
- Python (for populating the database)

To set up the database, rename `db/mongo_admin.json.example` to `db/mongo_admin.json` and change both `url` in `mongo_admin.json` and `DATABASE_URL` in `config.js` to the URL of your MongoDB instance. Then, to populate the database, open the console in the `db` folder of this project and run:

    python insert_schools.py
    python update_location.py
    python update_results.py

(You will need the `xlrd` Python package installed. Oh, and populating the database will take a while. It will finish at some point, I promise.)

After that, move to the root folder of this project and install all Node.js dependencies:

    npm install

...build with Grunt by running:

    grunt

...and run the server:

    node app

If nothing went wrong so far, you should be able to access the server at http://localhost:8000.

## Some background

This is my 2013/2014 A-level Computing project. Some bad decisions have been made while building it and its infrastructure is a bit of a mess. I have left it partially unfinished, since some of the features I wanted to implement required a complete rewrite.

If you're making something similar, feel free to make use of whatever "good parts" and ideas you find in this project. Hopefully there are some.