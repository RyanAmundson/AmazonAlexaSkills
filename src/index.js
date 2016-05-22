var http = require('http');

/**
 * App ID for the skill
 */
var APP_ID = undefined;//replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * WiseGuySkill is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var WiseGuySkill = function () {
    AlexaSkill.call(this, APP_ID);
};

// Extend AlexaSkill
WiseGuySkill.prototype = Object.create(AlexaSkill.prototype);
WiseGuySkill.prototype.constructor = WiseGuySkill;

/**
 * Overriden to show that a subclass can override this function to initialize session state.
 */
WiseGuySkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId
        + ", sessionId: " + session.sessionId);

    // Any session init logic would go here.
};

/**
 * If the user launches without specifying an intent, route to the correct function.
 */
WiseGuySkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("WiseGuySkill onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);

    handleIntroIntent(session, response);
};

/**
 * Overriden to show that a subclass can override this function to teardown session state.
 */
WiseGuySkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId
        + ", sessionId: " + session.sessionId);

    //Any session cleanup logic would go here.
};

WiseGuySkill.prototype.intentHandlers = {
    "SynonymIntent": function (intent, session, response) {
        handleSynonymIntent(intent,session, response);
    },
    "DescriptionIntent": function (intent, session, response) {
        handleDescriptionIntent(intent, session, response);
    },
    "IntroIntent": function (intent, session, response) {
        handleIntroIntent(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "";

        switch (session.attributes.stage) {
            case 0:
                speechText = "Knock knock jokes are a fun call and response type of joke. " +
                    "To start the joke, just ask by saying tell me a joke, or you can say exit.";
                break;
            case 1:
                speechText = "You can ask, who's there, or you can say exit.";
                break;
            case 2:
                speechText = "You can ask, who, or you can say exit.";
                break;
            default:
                speechText = "Knock knock jokes are a fun call and response type of joke. " +
                    "To start the joke, just ask by saying tell me a joke, or you can say exit.";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "Goodbye";
        response.tell(speechOutput);
    }
};


function handleIntroIntent(session, response){

  var speechText = "Describe the word or tell me a synonym.";
  var repromptText = speechText;

  var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };
  var repromptOutput = {
      speech: repromptText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };


  response.askWithCard(speechOutput, repromptOutput, "Wise Guy", speechText);


}


function findWords(search, uri, response, callback){
  var results = [];
  var result = "";
  var error = "";
    http.get('http://api.datamuse.com/words?'+uri+'='+search+'&max=5', function (res) {
        console.log('Status Code: ' + res.statusCode);

        res.on('data', function (data) {
            result += data;
        });

        res.on('end', function () {
          result = JSON.parse(result);
          for(x in result){
            results[x] = result[x].word;
          }

          console.log(results);
          callback(error,response,results);

        });
    });

}

var returnResponse = function(error, response, results){
  //handle errors

  var speechText = "Here is what I found.........";
  for(x in results){
    speechText += results[x] + "...";
  }
  var repromptText = speechText;

  var speechOutput = {
      speech: speechText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };
  var repromptOutput = {
      speech: repromptText,
      type: AlexaSkill.speechOutputType.PLAIN_TEXT
  };

  response.askWithCard(speechOutput, repromptOutput, "Wise Guy", speechText);

}
var repeatPhrase = function(phrase, response, callback){
  // var speechText = "you said...."+phrase;
  // var repromptText = "Is that correct?";
  // response.shouldEndSession = false;
  // response.tell(speechText);
  callback();

}

//nouns that are often described by the adjective yellow	/words?rel_jja=yellow
//words with a meaning similar to ringing in the ears	/words?ml=ringing+in+the+ears
//words related to duck that start with the letter b	/words?ml=duck&sp=b*
//words related to Canada that end with the letter a	/words?ml=canada&sp=*a
//rel_[code]
//http://www.datamuse.com/api/
function handleSynonymIntent(intent, session, response){

  var search = intent.slots.synonym.value;
  console.log(session);
  repeatPhrase(search,response, function(){

    var result = "";

    findWords(search,"rel_syn",response,returnResponse);

  });

}


function handleDescriptionIntent(intent,session, response){

  var search = intent.slots.description.value;
  findWords(search, "ml", response, returnResponse);

}




// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    // Create an instance of the WiseGuy Skill.
    var skill = new WiseGuySkill();
    skill.execute(event, context);
};
