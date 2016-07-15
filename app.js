/*jshint node:true*/

// app.js
// This file contains the server side JavaScript code for your application.
// This sample application uses express as web application framework (http://expressjs.com/),
// and jade as template engine (http://jade-lang.com/).

var express = require('express');
var mysql      = require('mysql');
// setup middleware

var app=express();
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('view engine', 'jade');
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views
app.use(express.bodyParser());
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root123',
  database : 'ticketingdata'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }  console.log('connected as id ' + connection.threadId);
});

//hello
// render index page
app.get('/api/getAllTickets', function(req, resp){
	connection.query('SELECT * from TicketingData', function(err, rows, fields) {
  		if (err) throw err;
  		var json = JSON.stringify(rows);
  		resp.send(json);
	});
});
app.post('/api/addTicket', function(req, resp){
	var data = "";
	req.on('data', function(datachunc){
		data += datachunc;
	});
	var jsp = "";
	req.on('end', function(){
		try{
			jsp = JSON.parse(data);
			 var Ticket = { Customer_EailId:jsp.Customer_EailId,OrderId:jsp.OrderId ,Tag:jsp.Tag,Description:jsp.Description,status:jsp.status,customer_MobileNumber:jsp.customer_MobileNumber,Employee_username:jsp.Employee_username };
			 connection.query('INSERT INTO TicketingData SET ?', Ticket, function(err,ticket){
  			if(err) throw err;
  			console.log('Last insert ID:', ticket.insertId);
  			 var comment = {Employee_username:jsp.Employee_username,Ticket_id:ticket.insertId,Comment:jsp.Description};
  			 console.log(comment);
			 connection.query('INSERT INTO Comments SET ?', comment, function(err,res){
  			if(err) throw err;
  			resp.send({"Ticket":ticket.insertId});
  			});
  			});
		}
		catch(e){
			resp.end("invalidJson");
			return;
		}

	});
});
app.post('/api/addComment', function(req, resp){
	var data = "";
	req.on('data', function(datachunc){
		data += datachunc;
	});
	var jsp = "";
	req.on('end', function(){
		try{
			jsp = JSON.parse(data);
			 var comment = {Employee_username:jsp.Employee_username,Ticket_id:jsp.Ticket_id,Comment:jsp.Comment};
			 connection.query('INSERT INTO Comments SET ?', comment, function(err,res){
  			if(err) throw err;
  			console.log('Last insert ID:', res.insertId);
  			resp.send({"CommentId":res.insertId});
  			});
		}
		catch(e){
			resp.end("invalidJson");
			return;
		}

	});
});
app.get('/api/getCommentsForKey/:id', function(req, resp){
	connection.query('SELECT * from Comments where Ticket_id = ?',req.params.id, function(err, rows, fields) {
  		if (err) throw err;
  		var json = JSON.stringify(rows);
  		resp.send(json);
	});
});
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
var host = 'localhost';
var port = 3000;
// Start server

var http = require('http').Server(app);
http.listen(port, function(){
	console.log('App started on port ' + port);
});


