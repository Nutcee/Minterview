var User = require('../models/user');
var Story = require('../models/story');
var config = require('../../config');
var secretKey = config.secretKey;
var jsonWebToken = require('jsonwebtoken');

function createToken(user){

	var token = jsonWebToken.sign({
		_id: user._id,
		emailid: user.emailid,
		name: user.firstname,

	}, secretKey, {
		expiresInMinute: 30
	});

	return token;


}

module.exports = function (app, express, io){
	
	var api = express.Router();

	api.get('/all_stories', function(req, res){
		Story.find({}, function(err, stories){

			if(err){
				res.send(err);
				return;
			}
			res.json(stories);
		});
	});


	api.post('/signup', function(req, res){
		var user = new User({
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			emailid: req.body.emailid,
			phone: req.body.phone,
			password: req.body.password
		
		});
		var token = createToken(user);
		user.save(function(err){
			if(err){
				res.send(err);
				return;
			}
			
			res.json({
				success: true,
				message: 'User has been created',
				token: token
			});
		});
	});

	api.get('/users', function(req,res){

		User.find({}, function(err, users){
			if(err){
				res.send(err);
				return;
			}
			res.json(users);
		});

	});

	api.post('/login', function(req,res){

		User.findOne({
			emailid: req.body.emailid
		}).select('firstname  lastname emailid password').exec(function(err, user){
			if(err) throw err;

			if(!user) {
				res.send({message : "Not a registered email id"});
				console.log("User does not exist!!");
			} else if(user){
				var validPassword = user.comparePassword(req.body.password);

				if(!validPassword){
					res.send({message : "Password is incorrect"});
					console.log("Incorrect Password");
				} else{
					///token
					var token = createToken(user);

					res.json({
						success: true,
						message: "Logged in successfully!",
						token: token
					});
					console.log("Logged in successfully");

				}
			}

		});

	});

	api.use(function(req, res, next){

		console.log("Somebody just came to our app!!");

		var token = req.body.token || req.param('token') || req.headers ['x-access-token'];

		if(token) {
			jsonWebToken.verify(token, secretKey, function(err, decoded){

				if(err){
					res.status(403).send({success: false, message: "Failed to authenticate user!"});
					console.log("Failed to authenticate user!");
				}else {

					req.decoded = decoded;

					next();
				}
			});
		} else {

			res.status(403).send({success: false, message: "Failed to get token!"})
			console.log("Failed to get user token!");
		}

	});

	api.route('/')
			.post(function(req,res){
				var story = new Story({
					creator : req.decoded._id,
					content: req.body.content,
				});

				story.save(function(err, newStory){
					if(err){
						res.send(err);
						return;
					}
					io.emit('story', newStory);

					res.json({message: "New Story created"})

				});

			})
			.get(function(req, res){
				Story.find({creator: req.decoded._id}, function(err, stories){
					if(err){
						res.send(err);
						return;
					}
					res.json(stories);

				});


			});

	api.get('/me', function(req, res){
		res.json(req.decoded);
	});

	return api;
}

