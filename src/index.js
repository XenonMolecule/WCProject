'use strict';

var express = require('express');
var questions =require('./mock/questions.json');
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
    console.log(res.locals)
});

//HOST ROUTE--
//      Should be the game display and the like
app.get("/host/:password?",function(req,res){
    //Confirms the password, that is clearly here, and unhidden, 
    //so as to be accessed by the public eye (The security is really strong on this project)
    if(req.params.password === "admin54"){
        clientType = "host";
        res.locals.clientType = clientType;
        res.send("Welcome Admin");
    } else {
        res.send("Unfortunately you need permision to view this page... Sorry");
    }
});

//SOCKET IO CONNECTION HANDLING
io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});