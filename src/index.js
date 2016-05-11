'use strict';

var express = require('express');
var questions =require('./mock/questions.json');

var app = express();

//CHANGE LATER, HERE FOR C9
var port = process.env.PORT;
app.listen(port,function(){
    console.log("The process is running on port:"+port);
});

//HOME ROUTE--
//      Should be the user game information like sign on and buttons to press
app.get("/",function(req,res){
   res.send("Howdy World");
});

//HOST ROUTE--
//      Should be the game display and the like
app.get("/host/:password?",function(req,res){
    //Confirms the password, that is clearly here, and unhidden, 
    //so as to be accessed by the public eye (The security is really strong on this project)
    if(req.params.password === "admin54"){
        res.send("Welcome Admin");
    } else {
        res.send("Unfortunately you need permision to view this page... Sorry");
    }
})