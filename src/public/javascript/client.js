//CODE FOR THE CLIENT OF THE GAME

//Initialize some variables for later use
var name,id;

//When the player clicks the submit button, send the username to the host
//But only if there is a username.  We don't want unnamed people
$("#submitName").click(function(){
    name = $(".usernameInput").val();
    if(name!=""){
        socket.emit('join',name);
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
