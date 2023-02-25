const express = require("express");
const mongodb = require("mongodb");
const path = require("path");
const bodyParser = require("body-parser");

//
// Connect to the database.
//
function connectDb(dbHost, dbName) {
  return mongodb.MongoClient.connect(dbHost, { useUnifiedTopology: true }).then(
    (client) => {
      const db = client.db(dbName);
      return {
        // Return an object that represents the database connection.
        db: db, // To access the database...
        close: () => {
          // and later close the connection to it.
          return client.close();
        },
      };
    }
  );
}

//
// Setup event handlers.
//
function setupHandlers(app, db) {
  let adsCollection = db.collection("ads");

  app.get("/getAds", async (req, res) => {
    // Get ads data from db.
    let result;
    try {
      result = await adsCollection.aggregate([
        {
          $sample: {
            size: 1,
          },
        },
        {
          $project: {
            _id: 0,
          },
        },
      ]);
    } catch (e) {
      res.sendStatus(500);
    }

    let responseResult = {};
    for await (const doc of result) {
      responseResult = doc;
      break;
    }
    // Response
    res.json(responseResult);
  });
}

//
// Starts the Express HTTP server.
//
function startHttpServer(dbConn) {
  return new Promise((resolve) => {
    // Wrap in a promise so we can be notified when the server has started.
    const app = express();
    app.use(bodyParser.json()); // Enable JSON body for HTTP requests.
    setupHandlers(app, dbConn.db);

    const port = (process.env.PORT && parseInt(process.env.PORT)) || 3000;
    const server = app.listen(port, () => {
      app.close = () => {
        // Create a function that can be used to close our server and database.
        return new Promise((resolve) => {
          server.close(() => {
            // Close the Express server.
            resolve();
          });
        }).then(() => {
          return dbConn.close(); // Close the database.
        });
      };
      resolve(app);
    });
  });
}

//
// Collect code here that executes when the microservice starts.
//
function startMicroservice(dbHost, dbName) {
  return connectDb(dbHost, dbName) // Connect to the database...
    .then((dbConn) => {
      // then...
      return startHttpServer(dbConn);
    });
}

//
// Application entry point.
//
function main() {
  if (!process.env.DBHOST) {
    process.env.DBHOST = "mongodb://localhost:27017";
  }

  const DBHOST = process.env.DBHOST;

  if (!process.env.DBNAME) {
    // throw new Error(
    //   "Please specify the databse name using environment variable DBNAME."
    // );
    process.env.DBNAME = "advertising";
  }

  const DBNAME = process.env.DBNAME;

  return startMicroservice(DBHOST, DBNAME);
}

if (require.main === module) {
  // Only start the microservice normally if this script is the "main" module.
  main()
    .then(() => console.log("Microservice online."))
    .catch((err) => {
      console.error("Microservice failed to start.");
      console.error((err && err.stack) || err);
    });
} else {
  // Otherwise we are running under test
  module.exports = {
    startMicroservice,
  };
}
