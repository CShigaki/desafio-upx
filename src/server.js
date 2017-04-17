import path from 'path';
import { Server } from 'http';
import express from 'express';
import React from 'react';
import redis from 'redis'
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import bodyParser from 'body-parser';
import expressSession from 'express-session';
import moment from 'moment';

// Declares and initializes necessary vars and modules.
var app = express();
var server = new Server(app);
var client = redis.createClient();
var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Define the location of the static files we are going to serve.
app.use(express.static(path.join(__dirname, 'static')));
// Initialize the express-session with a random SHA-1 hash.
app.use(expressSession({
  secret: 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
  resave: false,
  saveUninitialized: true,
}));
// Parse the URL as URL encoded data.
app.use(bodyParser.urlencoded({ extended: false }));
// Parse the body as JSON.
app.use(bodyParser.json());

// Starts the server that is going to serve our app.
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});


//////////////
// API URLS //
//////////////

// Sets headers for the api (it will always have content-type as json).
app.get(/api/, function(req, res, next) {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// First call to see if the API is working.
app.get('/api/v1/status', function(req, res) {
  res.status(200);
  res.send(JSON.stringify([{ success: true, message: "Everything works fine!" }]));
});

// Call used by the API to delete the survey it inserts.
app.get('/api/v1/deletetest/', function(req, res) {
  client.get('questions', function(err, reply) {
    var parsedJSON = JSON.parse(reply);
    if (reply == null) {
      res.end(JSON.stringify({
        "success": false,
        "errorMessage": "There's no survey yet. Test failed!",
      }));
    }
    else {
      if (parsedJSON[parsedJSON.length - 1].question === 'Postman Automated Test No Error') {
        parsedJSON.pop();
        client.set('questions', JSON.stringify(parsedJSON));
        res.end(JSON.stringify({
          "success": true,
          "errorMessage": "Everything OK! Save API is working.",
        }));
      }
      else {
        res.end(JSON.stringify({
          "success": false,
          "errorMessage": "Couldn't find added survey. Test failed!",
        }));
      }
    }
  });
});

// Get information about a single survey.
app.get('/api/v1/get/:id', function(req, res) {
  client.get('questions', function(err, reply) {
    // Parses the string retrieved from Redis. 
    var parsedJSON = JSON.parse(reply)
    if (reply == null || parsedJSON[req.params.id - 1] == undefined) {
      // If there are no questions stored or there is no question with the supplied ID.
      res.end(JSON.stringify({
        "errorMessage": "This survey doesn't exist. Use the listing service first.",
      }));
    }
    else {
      // Else, return it to the client.
      res.end(JSON.stringify(parsedJSON[req.params.id - 1]));
    }
  });
});

// List all the surveys.
app.get('/api/v1/list/', function(req, res) {
  client.get('questions', function(err, reply) {
    var parsedJSON = JSON.parse(reply);
    if (reply == null || parsedJSON.length == 0) {
      // If there are no questions stored or there is no question with the supplied ID.
      res.end(JSON.stringify({
        "errorMessage": "There are no surveys created at the moment.",
      }));
    }
    else {
      res.end(reply);
    }
  });
});

app.post('/api/v1/vote/', function(req, res) {
  var body = req.body[0];
  // If the body has the correct number of keys.
  if (Object.keys(body).length == 2) {
    // Get the questions stored in the database.
    client.get('questions', function(err, reply) {
      // If there are none no question store the person is using Postman.
      if (reply == null) {
        res.end(JSON.stringify({
          "success": false,
          "message": "Stop messing with the API!",
        }));
      }
      else {
        // Parse the questions retrieved from the database.
        var questions = JSON.parse(reply);
        // In case the used didn't vote in any survey yet, we initialize the session var, if he did, leave it unchanged.
        req.session.votes = !req.session.votes ? new Array() : req.session.votes;
        // If the survey id sent through the request is no already inside the votes array.
        if (req.session.votes.filter((value) => { return value == body.id - 1;}).length == 0) {
          // We add it to the votes array.
          req.session.votes.push((body.id - 1));
          // Increase the number of votes.
          questions[body.id - 1]['choices'][body.choice].votes++;
          // Store it back to the database.
          client.set('questions', JSON.stringify(questions));
          // And send the success message back to the client.
          res.end(JSON.stringify({ "success": true }));
        }
        else {
          // If the user already voted in this survey, send an error message back to the client.
          res.end(JSON.stringify({ "success": false, "message": "You already voted in this survey!" }));
        }
      }
    });
  }
  else {
    // If the user sent the wrong structure expected, we send back and error message.
    res.end(JSON.stringify({ "success": false, "message": "Please stop messing with the API." }));
  }
});

app.post('/api/v1/save/', function(req, res) {
  var error = false;
  var body = req.body[0];
  // Creates a new timestamp.
  var now = moment();
  var formatted = now.format('YYYY-MM-DD\THH:mm:ssZ');
  var choicesArray = new Array();
  // First of all, we add the value and the number of votes to the choices array.
  for (var key in body.choices) {
    // But we check for empty values in case the user used chrome inspector to remove the HTML5 validation.
    if (body.choices[key].trim().length == 0) {
      error = true;
      break;
    }
    // Add the choices to the array to be sent to the database.
    choicesArray.push({
      "value": key,
      "choice": body.choices[key],
      "votes": 0,
    });
  }

  // Now ened to check the question and description for empty values.
  if (body.question.trim().length == 0 ||
      body.description.trim().length == 0) {
    error = true;
  }

  // Then store everything in the array.
  var storeArray = {
    id: 0,
    question: body.question,
    description: body.description,
    published_at: formatted,
    choices: choicesArray,
  }

  // If we found any error, let the user know and don't store anything in the database.
  if (error) {
    res.end(JSON.stringify({
      "success": false,
      "errorMessage": "Something wrong occured with your request. Please don't mess with the HTML."
    }));
    return;
  }

  client.get('questions', function(err, reply) {
    if (reply == null) {
      // If there are no questions in the database.
      storeArray.id = 1;

      // Set the id as one and then save it.
      client.set('questions', JSON.stringify([storeArray]));
      res.end(JSON.stringify({ "success": true }));
    }
    else {
      // If there is, parse the questions.
      var databaseQuestions = JSON.parse(reply);
      // Update the id of the new question.
      storeArray.id = databaseQuestions.length + 1;
      // And add it to the questions array.
      databaseQuestions.push(storeArray);
      // Then store it again and inform the user of the success.
      client.set('questions', JSON.stringify(databaseQuestions));
      res.end(JSON.stringify({ "success": true }));
    }
  });
});

//////////////
// API URLS //
//////////////


///////////////////
// Frontend URLS //
///////////////////

// The frontend urls are handled by the react-router module.
// TODO: I didn't find any way to handle the API URLs using the react-router. Need to search more.
app.get(/app/, (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {
      let markup;
      if (renderProps) {
        markup = renderToString(<RouterContext {...renderProps}/>);
      }
      return res.render('index', { markup });
    }
  );
});

///////////////////
// Frontend URLS //
///////////////////
