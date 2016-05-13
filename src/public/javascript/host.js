//CODE FOR THE HOST OF THE GAME

//all of the players in the game
var players = [];
//constructor for a new player
function player(name){
    this.name = name;
    this.points = 0;
    do{
        this.id = Math.round(Math.random()*1000);
    } while(!(checkID(this.id)));
    players.push(this);
}

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
socket.on('join',function(username){
    var newPlayer = new player(username);
    socket.emit('giveID',newPlayer);
    $("#pList").append("<li playerID='"+newPlayer.id+"'>"+username+"</li>");
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