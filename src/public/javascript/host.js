//CODE FOR THE HOST OF THE GAME

//all of the players in the game
var players = [];
//constructor for a new player
function player(name,serverID){
    this.name = name;
    this.serverID = serverID;
    this.points = 0;
    this.answeredThisRound = false;
    do{
        this.id = Math.round(Math.random()*1000);
    } while(!(checkID(this.id)));
    players.push(this);
}

var questionData,gameStarted = false,questionNumber = 0, answers = [0,0,0,0], currentTime = 0,acceptingAnswers = false;

//get the questions.json file
$.getJSON("/static/data/questions.json", function( data ){
    questionData = data;
});

//Check if the player's "unique" id is already taken
function checkID(id){
    for(var i = 0; i < players.length; i ++){
        if(id===players[i].id){
            return false;
        }
    }
    return true;
}

//When a player joins, add thier name to the players list and array
socket.on('join',function(userInfo){
    if(!gameStarted){
        var newPlayer = new player(userInfo.name, userInfo.serverID);
        socket.emit('giveID',newPlayer);
        $("#pList").append("<li id = '"+newPlayer.id+"' playerID='"+newPlayer.id+"'>"+userInfo.name+"</li>");
        initPlayerList();
        if(removePx($(".playerList").css("height")) < removePx($(".playerList ul").css("height"))){
            $(".playerList").css("height",(removePx($(".playerList ul").css("height"))+5)+"px");
        }
    }
});

//remove px from the jQuery height return
function removePx(measure){
    return Math.round(measure.split("px")[0]);
}

//Idea: Add ability to kick players if their name is vulgar
//Implementation: JQuery events and Socket.io emitters

function initPlayerList(){
    //On hover put a strike through the name
    $(".playerList ul li").hover(function(){
        $(this).css("text-decoration","line-through").css("cursor","pointer");
    },function(){
        $(this).css("text-decoration","none");
    });
    
    //On click send message to the user saying they have been kicked
    //and remove them from the game
    $(".playerList ul li").click(function(){
        $(this).remove();
        socket.emit('kick',$(this).attr("playerID"));
    });
}
initPlayerList();

/*Search through an object array (ARRAY, array) to find the object that has the property (STRING, property)
  With the same value as (ANY, value).  (STRING, returnType) is an optional parameter of either "object","position",
  or a property name and it will return which ever one is selected.  If not set it defaults to object.*/
function searchBy(array, property, value, returnType){
    returnType = (returnType==undefined ? "object" : returnType);
    for(var i = 0; i < array.length; i++){
        if(array[i][property] === value){
            if(returnType.toLowerCase()=="object"){
                return array[i];
            } else if(returnType.toLowerCase() == "position"){
                return i;
            } else{
                return array[i][returnType];
            }
        }
    }
    return -1;
}

//Remove a player from the game if they disconnect
socket.on('disconnection',function(ID){
    $("#"+searchBy(players,'serverID',ID,'id')).remove();
    players = players.splice(searchBy(players,'serverID',ID,'position'),1);
});

//When the start game button is clicked
$(".startGame").click(function(){
    //Stop new players from joining
    gameStarted = true;
    $(".home").prop("hidden",true);
    questionNumber--;
    nextRound();
});

//Change the waiting message
function changeWaitMessage(forceMessage){
    if(forceMessage==undefined){
        $(".waitMSG").text(questionData.waitingMessages[Math.floor(Math.random()*questionData.waitingMessages.length)]);
    } else {
        $(".waitMSG").text(forceMessage);
    }
}

/*Bear with me here... I wrote this for reuseability, but this is going to be CRAZY
  (INT, start) is where the timer should start counting down from
  (INT, end) is the number that the countDown should stop at
  (INT,freq) is the amount of milliseconds between each time the timer counts down
  (FUNC, func) is a function that should take in a parameter of the current number,
                   and do whatever it wants with it
  (FUNC, callback) is a function that the timer should call on completion
  (DO NOT USE, currentNum) is for the recursive function to use for it's own purposes
*/
function countDown(start,end,freq,func,callback,currentNum){
    if(currentNum==undefined){
        currentNum = start;
    }
    if(currentNum>end) {
        currentNum--;
        func(currentNum);
        setTimeout(countDown,freq,start,end,freq,func,callback,currentNum);
    }
    if(currentNum==end){
        callback();
    }
}

//A function to call to start the next round in the game
function nextRound(){
    //Reset Round Variables
    questionNumber++;
    answers = [0,0,0,0];
    acceptingAnswers = true;
    for(var i = 0; i < players.length; i ++){
        players[i].answeredThisRound = false;
    }
    //Move on to technical hiding and showing, and server and client stuff
    $(".questionPage").prop("hidden",true);
    changeWaitMessage(questionData.questions[questionNumber].question);
    $(".waiting").prop("hidden",false);
    socket.emit('prepQ',questionData.questions[questionNumber].question);
    countDown(6,0,1000,function(num){
        $(".subMSG").text(num+"...");
    }, function(){
        socket.emit('quesRound','dummyValue');
        $(".waiting").prop("hidden",true);
        $(".question").html("<h1>"+questionData.questions[questionNumber].question+"</h1>");
        $(".questionPage .answer1").html("<h2>"+questionData.questions[questionNumber].ans0+"</h2>");
        $(".questionPage .answer2").html("<h2>"+questionData.questions[questionNumber].ans1+"</h2>");
        $(".questionPage .answer3").html("<h2>"+questionData.questions[questionNumber].ans2+"</h2>");
        $(".questionPage .answer4").html("<h2>"+questionData.questions[questionNumber].ans3+"</h2>");
        countDown(21,0,1000,function(num){
            $(".timer").text(""+num);
            currentTime = num;
        },function(){
            //END OF ROUND HANDLING
            acceptingAnswers = false;
            $(".questionPage").prop("hidden",true);
            drawResults();
            $(".results").prop("hidden",false);
            countDown(6,0,1000,function(num){
                if(num<4){
                    $(".results .answer"+(questionData.questions[questionNumber].correct+1)).parents(".bar").toggleClass("correct");
                }
            },function(){
                //$(".results .answer"+(questionData.questions[questionNumber].correct+1)).parents(".bar").removeClass("correct");
                //TIME TO CALL IN NEWSPAPER ANIMATION
            });
        });
        $(".questionPage").prop("hidden",false);
    });
}

//HANDLE INCOMING ANSWERS
socket.on('submitAns',function(information){
    if((!(searchBy(players,'id',information.id).answeredThisRound))&&(acceptingAnswers)){
        searchBy(players,'id',information.id).answeredThisRound = true;
        answers[information.ans]++;
        //If the player got the correct answer, add points to their score accordingly
        if(information.ans == questionData.questions[questionNumber].correct){
            searchBy(players,'id',information.id).points += (currentTime*100);
        }
    }
});

//Set the % meters on the results page
function drawResults(){
    for(var  i = 0; i < answers.length; i ++){
        $(".results .answer"+(i+1)).css("width",((77.5*(answers[i]/players.length))+1)+"%");
    }
}

/*A function to return the most popular answer
  Favors the correct answer in a tie, and whichever comes
  First if the correct answer is not involved.*/
function determineAns(){
    var sorted = [0,0,0,0];
    for(var i = 0; i < answers.length; i++){
        sorted[i] = answers[i];
    }
    sorted.sort(function(a,b){return b-a});
    var correctAns = questionData.questions[questionNumber].correct;
    if(answers[correctAns]==sorted[0]){
        return correctAns;
    } else {
        for(var i = 0; i < answers.length; i ++){
            if(answers[i] == sorted[0]){
                return i;
            }
        }
    }
}