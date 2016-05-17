//CODE FOR THE CLIENT OF THE GAME

//Initialize some variables for later use
var name,id,serverID,questionData, sentAnswer;

//get the questions.json file
$.getJSON("/static/data/questions.json", function( data ){
    questionData = data;
});

//When the player clicks the submit button, send the username to the host
//But only if there is a username.  We don't want unnamed people
$("#submitName").click(function(){
    name = $(".usernameInput").val();
    if(name!=""){
        $(".username").prop("hidden",true);
        changeWaitMessage();
        $(".waiting").prop("hidden",false);
        var information = {name : name, serverID : serverID}
        socket.emit('join',information);
        //Get the player's id to use in future data transfers
        socket.on('giveID',function(player){
           if(player.name === name && id===undefined){
               id = player.id;
           }
        });
    
        socket.on('kick',function(playerID){
            if(playerID==id){
                $(".client").empty().append($("<h1>Sorry, you have been kicked ;(</h1>"));
                $(".client h1").css("text-align","center").css("color","#FFF");
                name  = "mud";
                id="-1";
            }
        });
    }
});

//Get the Server's id assigned to this client
socket.on('newConnection',function(ID){
    if(serverID==undefined){
        serverID = ID;
    }
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
        setTimeout(countDown,freq,start,end,freq,callback,currentNum);
    }
    if(currentNum==end){
        callback();
    }
}

//Prepare the question
socket.on('prepQ',function(question){
    $(".waiting").prop("hidden",false);
    $(".gameButtons").prop("hidden",true);
    changeWaitMessage(question);
    sentAnswer = false;
});

//QUESTION ROUND HANDLING
socket.on('quesRound',function(dummyValue){
    $(".gameButtons").prop("hidden",false);
    $(".waiting").prop("hidden",true);
    $(".gameButtons button").each(function(){
        $(this).click(function(){
            sendAnswer($(this).attr("id"));
        });
    });
});

//Code to send the answer selected by the player
function sendAnswer(ansNum){
    if(!sentAnswer){
        sentAnswer = true;
        $(".gameButtons").prop("hidden",true);
        changeWaitMessage();
        $(".waiting").prop("hidden",false);
        ansNum = ansNum.split("btn")[1];
        ansNum = parseInt(ansNum)-1;
        socket.emit('submitAns',{ans:ansNum,id:id});
    } else {
        $(".gameButtons").prop("hidden",true);
        changeWaitMessage();
        $(".waiting").prop("hidden",false);
    }
}

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

//Handle Final Scores
socket.on('finalResults',function(players){
    console.log(players);
   var me = searchBy(players,'id',id);
   console.log(me);
   var sorted = [];
   for(var i = 0; i < players.length; i++){
       sorted[i] = players[i].points;
   }
   sorted.sort(function(a,b){return b-a});
   var place = 0;
   for(var i = 0; i < sorted.length; i++){
       if(me.points==sorted[i]){
           place = (i+1);
       }
   }
   console.log(sorted);
   changeWaitMessage(findEnding(place));
   $(".subMSG").text("place");
});

//A function to find the suffix of a number IE: 1 -> 1st, 2 -> 2nd, etc.
function findEnding(number){
    switch(number%10){
        case 1:
            return number+"st";
        case 2:
            return number+"nd";
        case 3:
            return number+"rd";
        default:
            return number+"th";
    }
}