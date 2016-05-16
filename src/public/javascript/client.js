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
function changeWaitMessage(){
    $(".waitMSG").text(questionData.waitingMessages[Math.floor(Math.random()*questionData.waitingMessages.length)])
}