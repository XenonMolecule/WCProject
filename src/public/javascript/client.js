//CODE FOR THE CLIENT OF THE GAME

//Initialize some variables for later use
var name,id,serverID,questionData;

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
    $(".gameButtons").prop("hidden",true);
    changeWaitMessage();
    $(".waiting").prop("hidden",false);
    ansNum = ansNum.split("btn")[1];
    console.log(ansNum);
    ansNum = parseInt(ansNum)-1;
    console.log(ansNum);
    socket.emit('submitAns',{ans:ansNum,id:id});
}