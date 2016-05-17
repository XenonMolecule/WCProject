'use strict';

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var clientType = "";

app.use('/static', express.static(__dirname + '/public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

//CHANGE LATER, HERE FOR C9
var port = process.env.PORT;
http.listen(port,function(){
    console.log("The process is running on port:"+port);
});

//HOME ROUTE--
//      Should be the user game information like sign on and buttons to press
app.get("/",function(req,res){
    clientType = "player";
    res.locals.clientType = clientType;
    res.render("client.jade");
});

//HOST ROUTE--
//      Should be the game display and the like
app.get("/host/:password?",function(req,res){
    //Confirms the password, that is clearly here, and unhidden, 
    //so as to be accessed by the public eye (The security is really strong on this project)
    if(req.params.password === "admin54"){
        clientType = "host";
        res.locals.clientType = clientType;
        res.render("host.jade");
    } else {
        res.send("Unfortunately you need permision to view this page... Sorry");
    }
});

//SOCKET IO CONNECTION HANDLING
io.on('connection', function(socket){
  console.log(socket.id+'-- connected');
  io.emit('newConnection',socket.id);
  socket.on('join', function(name){
    io.emit('join', name);
  });
  socket.on('giveID',function(player){
    io.emit('giveID',player);
  });
  socket.on('kick',function(id){
    io.emit('kick',id);
  });
  socket.on('prepQ',function(question){
    io.emit('prepQ',question);
  });
  socket.on('quesRound',function(dummyValue){
    io.emit('quesRound',dummyValue);
  });
  socket.on('submitAns',function(info){
    io.emit('submitAns',info);
  });
  socket.on('finalResults',function(players){
    io.emit('finalResults',players);
  })
  socket.on('disconnect', function(){
    io.emit('disconnection',socket.id);
    console.log(socket.id+'-- disconnected');
  });
});