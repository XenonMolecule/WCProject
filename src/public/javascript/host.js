//CODE FOR THE HOST OF THE GAME

//all of the players in the game
var players = [];
//constructor for a new player
function player(name,serverID){
    this.name = name;
    this.serverID = serverID;
    this.points = 0;
    do{
        this.id = Math.round(Math.random()*1000);
    } while(!(checkID(this.id)));
    players.push(this);
}
//Data from the questions.json file
var questionData;

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
    var newPlayer = new player(userInfo.name, userInfo.serverID);
    socket.emit('giveID',newPlayer);
    $("#pList").append("<li id = '"+newPlayer.id+"' playerID='"+newPlayer.id+"'>"+userInfo.name+"</li>");
    initPlayerList();
    if(removePx($(".playerList").css("height")) < removePx($(".playerList ul").css("height"))){
        $(".playerList").css("height",(removePx($(".playerList ul").css("height"))+5)+"px");
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