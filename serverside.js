var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require('url');
var sqlite = require('sqlite3');
const db = new sqlite.Database('./actual.db');
const { sqrt } = require('mathjs');
const { evaluate } = require('mathjs');
const { nthRoot } = require('mathjs');

var activeGamesMinor = [];
var playerNumsMinor = [];

var activeGamesElementary = [];
var playerNumsElementary = [];

var activeGamesMiddle = [];
var playerNumsMiddle = [];

var activeGamesPrivate = [];
var modesPrivate = [];
var numsPrivate = [];


function solutionDigitsGood(solution){

  var allNumbers = ['0', '1', '2', '3', '4' , '5', '6', '7', '8', '9'];
  digitNum = 0;

  for (var i = 0; i < solution.length; i++){

    var char = solution.slice(i, i + 1);
    if (allNumbers.indexOf(char) != -1){
      digitNum++;
      if (digitNum > 1){
        i = solution.length + 1;
      }
    }
    else{
      digitNum = 0;
    }

  }

  if (digitNum > 1){
    return 'no';
  }
  else{
    return 'good';
  }

}




function solutionLengthGood(solution){

  if (solution.length == 1){
    return 'no';
  }
  else{
    return 'yes';
  }

}


function goalLengthGood(goal){

  var trueLength = 0;

  for (var i = 0; i < goal.length; i++){

  var char = goal.slice(i, i + 1);
  if (char != ')' && char != '('){
    trueLength++;
  }

  }

  if (trueLength > 6){
    return 'no';
  }
  else{
    return 'good';
  }


}


function findMatchingBracket(solution, position){

  console.log(solution);

  var char = solution.slice(position, position + 1);

    if (char == ')'){

      var bracketsNeeded = 1;
      var match = '';

      for (var i = position - 1; i > 0; i--){

        var currentChar = solution.slice(i, i + 1);

        if (currentChar == '('){
          bracketsNeeded--;
        }
        else if (currentChar == ')'){
          bracketsNeeded++;
        }

        if (bracketsNeeded == 0){
          match = i;
          i = -1;
        }

      }

      if (match == ''){
        return 'noMatch';
      }
      else{
        return match;
      }

    }
    else{

      var bracketsNeeded = 1;
      var match = '';

      for (var i = position + 1; i < solution.length; i++){

        var currentChar = solution.slice(i, i + 1)

        if (currentChar == ')'){
          bracketsNeeded--;
        }
        else if (currentChar == '('){
          bracketsNeeded++;
        }

        if (bracketsNeeded == 0){
          match = i;
          i = solution.length + 1;
        }

      }

      if (match == ''){
        return 'noMatch';
      }
      else{
        return match;
      }

    }

}






function processRoots(solution){

  var returnProcessed = true;

  var processedSolution = [solution];

  console.log('raw: ' + solution);

  for (var i = 0; i < solution.length; i++){

    var pos = solution.indexOf('#', i);

    if (pos == -1){
      i = solution.length + 1;
    }
    else{
      i = pos;

      var nums = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

      var nextChar = solution.slice(pos + 1, pos + 2);
      var previousChar = solution.slice(pos - 1, pos);

      if (nums.indexOf(previousChar) == -1 && previousChar != ')'){

        console.log('its a square root');

        if (nextChar != '('){


          try{

            var stringToReplace = '#' + nextChar;
            var replacement = evaluate('sqrt(' + nextChar + ')').toString();
            if (processedSolution != []){

              var lastIteration = processedSolution[processedSolution.length - 1];
              var newIteration = lastIteration.replace(stringToReplace, replacement);
              processedSolution.push(newIteration);

            }
            else{
              var newstr = solution.replace(stringToReplace, replacement);
              processedSolution.push(newstr);
            }

          }
          catch(err){
            console.log(err)
            i = solution.length + 1;
            returnProcessed = false;
            return 'incorrect';

          }



        }
        else{



          var currentIteration = processedSolution[processedSolution.length - 1];
          var endBracket = findMatchingBracket(currentIteration, pos + 1);

          try{

            var stringToReplace = currentIteration.slice(pos + 1, endBracket + 1);
            var replacement = sqrt(evaluate(stringToReplace));


              var lastIteration = processedSolution[processedSolution.length - 1];
              var newIteration = lastIteration.replace('#' + stringToReplace, replacement);
              processedSolution.push(newIteration);



          }
          catch(err){

            console.log(err);
            return 'incorrect';
            i = solution.length + 1;
            returnProcessed = false;

          }


        }

      }
      else{

        console.log('not a square root');

        var root = '';
        var match = '';

        var number = nums.indexOf(previousChar);

        if (number != -1){

          root = number;
          console.log('root is: ' + root);

        }
        else if (previousChar == ')'){

          match = findMatchingBracket(processedSolution[processedSolution.length - 1], pos - 1);
          try{
            root = evaluate( processedSolution[processedSolution.length - 1].slice(match, pos) );
            console.log('root is calced as: ' + root);
          }
          catch(err){
            console.log(err);
            return 'incorrect';
            i = solution.length + 1;
            returnProcessed = false;
          }

        }

        if (nums.indexOf(nextChar) != -1){

          try{

            if (match == ''){
                var stringToReplace = processedSolution[processedSolution.length - 1].slice(pos - 1, pos + 1);
            }
            else{
                var stringToReplace = processedSolution[processedSolution.length - 1].slice(match, pos + 1);
            }

            var replacement = nthRoot(nextChar, root);
            console.log('calc is: ' + replacement);
            var newIteration = processedSolution[processedSolution.length - 1].replace(stringToReplace, replacement);

            processedSolution.push(newIteration);

          }
          catch(err){
            console.log(err)
            return 'incorrect';
            i = solution.length + 1;
            returnProcessed = false;
          }


        }
        else{

          var endMatch = findMatchingBracket(processedSolution[processedSolution.length - 1], pos + 1);
          var value = '';
          try{

            value = processedSolution[processedSolution.length - 1].slice(pos + 1, endMatch + 1);
            var trueValue = evaluate(value).toString();
            var stringToReplace = processedSolution[processedSolution.length - 1].slice(match, endMatch + 1);
            var replacement = nthRoot(trueValue, root);
            console.log('num is: '  + trueValue)
            console.log('we calced: ' + replacement);
            var newIteration = processedSolution[processedSolution.length - 1].replace(stringToReplace, replacement);
            processedSolution.push(newIteration);


          }
          catch(err){
            console.log(err)
            return 'incorrect';
            returnProcessed = false;
            i = solution.length + 1;
          }



        }




      }

    }



  }

  if (returnProcessed){
    return processedSolution[processedSolution.length - 1];
  }

}






function checkSolutionMinor(solInput, goalInput){

  var conditionsMet = [];
  conditionsMet.push( goalLengthGood(goalInput) );
  conditionsMet.push( solutionLengthGood(solInput) );
  conditionsMet.push( solutionDigitsGood(solInput) );


  var rawSolution = solInput;

  var solution = processRoots(rawSolution);


  var rawGoal = goalInput;

  var goal = processRoots(rawGoal);


  try{

    var solutionOutput = evaluate(solution).toString();
    var goalOutput = evaluate(goal).toString();

    console.log(solutionOutput);
    console.log(goalOutput);

    if (solutionOutput == goalOutput && goal != 'incorrect' && solution != 'incorrect'){
      return 'correct';
    }
    else{
      return 'incorrect';
    }

  }
  catch(err){
    console.log(err);
    return 'incorrect';
  }



}




function createGameCode(){

  var code= "";

  var allNums = ['0','1','2','3','4','5','6','7','8','9'];

  for (var i = 0; i < 6; i++){

    var random = Math.floor(Math.random() * 10);
    if (code == ""){
      code = allNums[random];
    }
    else{
      code = code + allNums[random];
    }

  }

  return code;

}

function get_trophies(username, callback){
  db.get('SELECT trophies FROM users WHERE username=$username',{
    $username: username
  }, (err,row) =>{


    return callback(row);



  });
}

//Peter Schwendeman

function sign_up(username, password, callback){
    db.get('SELECT * FROM users WHERE username=$username',
    {
    $username: username
    }, (err, row) => {
    	if(!row){
        db.run('INSERT INTO users(username, user_password, trophies) VALUES ($username,$password, 0)',
        {
            $username: username,
            $password: password
        });
    		return callback(true);
    	}
    	else{
        return callback(false);
    	}
  });
}

//Peter Schwendeman
//checks if username and password are correct
function sign_in(username, password, callback){
  var row = db.get('SELECT * FROM users WHERE username=$username',
  {
    $username: username
  }, (err, row) => {
    if(!row){
      return callback(false);
    }
    else if(row.user_password === password){
      return callback(true);
    }
    else{
      return callback(false);
    }
  });
}

function add_trophies(username, trophies){


  db.run('UPDATE users SET trophies=$trophies WHERE username=$username',

    {

      $username: username,
      $trophies: trophies


    });


}



app.get('/',function(req,res){
res.sendFile(__dirname + "/clientside.html");
})

io.on('connection',function(socket){

//all events fired from client are below

  socket.on('loginCheck', function(msg){

    //check if login is correct
    //SQL CHECK GOES HERE

    sign_in(msg[1], msg[2], function(response){
			if(response == true){
    		io.emit('loginCheck_response',[msg[0],'yes']);
			}
			else{
    		io.emit('loginCheck_response',[msg[0],'no']);
    	}
		});

  });

  socket.on('signUp',function(msg){

  //check if username is already taken
  //if it is, relay message back to client to find a different name
  //else, add them to database and say that they are all set
//SQL CHECK GOES HERE TOO
  sign_up(msg[1], msg[2], function(response){
    if(response == true){
      io.emit('signUp_response',[msg[0],'yes']);
    }
    else{
      io.emit('signUp_response',[msg[0],'no']);
    }
  });


  });

  socket.on('getHomeInfo',function(msg){

  //get the current trophies for player from database
  //also get leaderboard names and trophies

    get_trophies(msg, function(response){

      var trophies = response.trophies;
      io.emit('getHomeInfo_response',[msg, trophies,'peter','20','bob','10','lilly','6']);

    });




  });


  socket.on('addTrophies', function(msg){

    var player = msg[0];
    var trophiesToAdd = msg[1];

    get_trophies(player, function(response){

    var  currentTrophies = response.trophies;
    var newTrophies = trophiesToAdd + currentTrophies;

    add_trophies(player, newTrophies);


    });




  });


  socket.on('pairGame', function(msg){

   var playerName = msg[0];

   var rawMode = msg[1];
   var mode= "";

   var nums = "";

   if (rawMode == "middle"){
     mode = activeGamesMiddle;
     nums = playerNumsMiddle;
   }
   else if (rawMode == "elementary"){
     mode = activeGamesElementary;
     nums = playerNumsElementary;
   }
   else{
     mode = activeGamesMinor;
     nums = playerNumsMinor;
   }

   if (mode == []){

     var gameCode = createGameCode();
     mode.push(gameCode);
     nums.push(1);
     io.emit('pairGame_response',[playerName, gameCode, 1])

   }
   else{

     var useableGame = "none";

     for (var i = 0; i < mode.length; i++){
       if (nums[i] < 3){
         useableGame = i;
         i = mode.length + 1;
       }
     }

     if (useableGame == 'none'){

       var gameCode = createGameCode();
       mode.push(gameCode);
       nums.push(1);
       io.emit('pairGame_response',[playerName, gameCode, 1]);

     }
     else{

       var gameCodeClone = mode[useableGame];
       nums[useableGame] = nums[useableGame] + 1;
       var playerNum = nums[useableGame];

       io.emit('pairGame_response',[playerName, gameCodeClone, playerNum]);
       io.emit('notification_playerJoined',[gameCodeClone, playerNum]);



     }


   }

    //find an active game
    //if there is none or all are full, create new one
    //else, join one that has less than 3
    //assign player a num and gameNum


  });

  socket.on('createPrivateGame', function(msg){



    var gameCode = createGameCode();
    activeGamesPrivate.push(gameCode);
    modesPrivate.push(msg[1]);
    numsPrivate.push(1);

    io.emit('createPrivateGame_response',[msg[0], gameCode]);



  });

  socket.on('joinPrivateGame', function(msg){

    var givenCode = msg[1];
    var playersName = msg[0];

    var x = activeGamesPrivate.indexOf(givenCode);


    if (x < 0){
      io.emit('joinPrivateGame_response',[playersName, 'nope']);
    }
    else{
      numsPrivate[x] = numsPrivate[x] + 1;
      var playerNum = numsPrivate[x];
      var mode = modesPrivate[x];
      io.emit('joinPrivateGame_response',[playersName,'yes',givenCode, playerNum, mode]);
      io.emit('notification_playerJoinedPrivate',[givenCode, playerNum]);
    }




  });

  socket.on('setupVariations', function(msg){


    if (msg[1] != 'minor'){

      io.emit('setupVariations_response', [msg[0], 1]);

    }
    else{

      io.emit('setupVariations_response',[msg[0], 'none']);

    }

  });

	socket.on('scoreUpdate', function(msg){

    io.emit('scoreUpdate_response', msg);


  });

  socket.on('playerInfo', function(msg){

    io.emit('playerInfo_response', msg);

  });

  socket.on('setupCubes', function(msg){

    var cubes = [];
    for (var i = 0; i < 24; i++){

      cubes[i] = Math.floor(Math.random() * 6);


    }

    io.emit('setupCubes_response', [msg, cubes]);


  });

  socket.on('variationInput', function(msg){

    io.emit('variationInput_response', msg);


  });

  socket.on('changeTurn', function(msg){

    if (msg[1] != 3){

      io.emit('changeTurn_response', [msg[0], msg[1] + 1]);

    }
    else{

      io.emit('changeTurn_response', [msg[0], 1]);

    }



  });

  socket.on('basePicked', function(msg){

    io.emit('basePicked_response', msg);

  });

  socket.on('kPicked', function(msg){

    io.emit('kPicked_response', msg);

  });

  socket.on('submitGoal', function(msg){

    io.emit('submitGoal_response', msg);

  });

  socket.on('chatMessage', function(msg){

    io.emit('chatMessage_response', msg);

  });

  socket.on('moveCube_req', function(msg){

    io.emit('moveCube_req_response', msg);

  });

  socket.on('moveCube_per', function(msg){

    io.emit('moveCube_per_response', msg);

  });

  socket.on('moveCube_for', function(msg){

    io.emit('moveCube_for_response', msg);

  });

  socket.on('skipTurn', function(msg){

    io.emit('skipTurn_response', msg);

  });

  socket.on('challengeNotification', function(msg){

    io.emit('challengeNotification_response',msg);


  });

  socket.on('challengeDecision', function(msg){

    io.emit('challengeDecision_response',msg);


  });

  socket.on('forceoutNotification', function(msg){

    io.emit('forceoutNotification_response', msg);

  });

  socket.on('secondForceoutNotification', function(msg){

    io.emit('secondForceoutNotification_response', msg);

  });

  socket.on('failedCubeAttempt', function(msg){

      io.emit('checkSolutionMinor_response', msg);

  });

  socket.on('failedCubeAttemptForceout', function(msg){

    io.emit('checkForceoutMinor_response', msg);

  });

  socket.on('checkForceout', function(msg){

    console.log(evaluate('sqrt4'))


  });


  socket.on('checkSolution', function(msg){


    console.log(evaluate('sqrt4'))


  });

  socket.on('checkForceoutMinor', function(msg){

    var res = checkSolutionMinor(msg[2], msg[3]);
    io.emit('checkForceoutMinor_response', [msg[0], msg[1], res]);


  });


  socket.on('checkSolutionMinor', function(msg){


    var res = checkSolutionMinor(msg[2], msg[3]);
    io.emit('checkSolutionMinor_response', [msg[0], msg[1], res]);



  });

  socket.on('scoringStateInfo', function(msg){

    io.emit('scoringStateInfo_response', msg);

  });

  socket.on('scoringStateUpdate', function(msg){

    io.emit('scoringStateUpdate_response', msg);

  });




});

http.listen(1757,function(){

console.log("listening on port 1757");
var str = 'HI';
console.log(str.slice(0, 1));
add_trophies('TONY', 0);
add_trophies('Anita', 0);
add_trophies('Joe', 0);

});
