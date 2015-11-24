var express = require('express');
var bodyParser = require('body-parser');
var morgan = require ('morgan');
var config = require ('./config');
var mongoose = require ('mongoose');
var app = express();
var multer = require('multer');

var http = require('http').Server(app);

var io = require('socket.io')(http);

mongoose.connect(config.database, function(err){
	if(err){
		console.error(err);
	}else{
		console.log('Database connected!!');
	}
});

function getExtension(fn) {
	return fn.split('.').pop();
}

function fnAppend(fn, insert) {
	var arr = fn.split('.');
	var ext = arr.pop();
	insert = (insert !== undefined) ? insert : new Date().getTime();
	return arr + '.' + insert + '.' + ext;
}


app.use(multer({
		dest: './static/uploads/',
		rename: function (fieldname, filename) {
			return filename.replace(/\W+/g, '-').toLowerCase();
		}
	}).single('resumefile'));
app.use(express.static(__dirname + '/static'));


app.post('/api/upload', function (req, res, $location) {
		console.log('Uploading file!!!!' + req.files.userFile.name);
		res.send({file: req.files.userFile.originalname, savedAs: req.files.userFile.name});

});


app.use(bodyParser.urlencoded ({ extended : true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname + '/public'));

var api = require('./app/routes/api')(app, express, io);

app.use('/api', api);

app.get('*', function(req,res){
	res.sendFile(__dirname + '/public/app/views/index.html');
	
});

http.listen(config.port, function(err){

	if(err){
		console.error(err);
	} else {
		console.log("Listening on port 3000!!");
	}
});