import path from 'path';
import { Server } from 'http';
import express from 'express';
import React from 'react';
import redis from 'redis'
import { renderToString } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './routes';
import surveys from './data/surveys';
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
app.use(expressSession({ secret: 'da39a3ee5e6b4b0d3255bfef95601890afd80709' }));
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

// Get information about a single survey.
app.get('/api/v1/get/:id', function(req, res) {
  client.get('questions', function(err, reply) {
    // Parses the string retrieved from Redis. 
    var parsedJSON = JSON.parse(reply)
    console.log(parsedJSON);
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
    if (reply == null) {
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
  console.log(Object.keys(body).length);
  console.log(body);
  if (Object.keys(body).length == 2) {
    client.get('questions', function(err, reply) {
      console.log('err');
      console.log(err);
      console.log('reply');
      console.log(reply);
      if (reply == null) {
        res.end(JSON.stringify({
          "success": false,
          "message": "Please stop messing with the API.",
        }));
      }
      else {
        var questions = JSON.parse(reply);
        req.session.votes = !req.session.votes ? new Array() : req.session.votes;
        if (req.session.votes.filter((value) => { return value == body.id - 1;}).length == 0) {
          req.session.votes.push((body.id - 1));
          questions[body.id - 1]['choices'][body.choice].votes++;
          client.set('questions', JSON.stringify(questions));
          res.end(JSON.stringify({ "success": true }));
        }
        else {
          res.end(JSON.stringify({ "success": false, "message": "You already voted in this survey!" }));
        }
      }
    });
  }
  else {
    res.end(JSON.stringify({ "success": false, "message": "Please stop messing with the API." }));
  }
});

app.post('/api/v1/save/', function(req, res) {
  var body = req.body[0];
  var now = moment()
  var formatted = now.format('YYYY-MM-DD HH:mm:ss Z')
  var choicesArray = new Array();
  for (var key in body.choices) {
    choicesArray.push({
      "value": key,
      "choice": body.choices[key],
      "votes": 0,
    });
  }
  var storeArray = {
    id: 0,
    question: body.question,
    description: body.description,
    published_at: formatted,
    choices: choicesArray,
  }

  client.get('questions', function(err, reply) {
    if (reply == null) {
      storeArray.id = 1;

      client.set('questions', JSON.stringify([storeArray]));
      res.end(JSON.stringify({ "success": true }));
    }
    else {
      var databaseQuestions = JSON.parse(reply);
      storeArray.id = databaseQuestions.length + 1;
      databaseQuestions.push(storeArray);
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
