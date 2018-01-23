var User = require('../models/user');
var Application = require('../models/application');
var db = require("secondthought");
var assert = require("assert");

var RegResult = function () {
	var result = {
		success: false,
		message: null,
		user: null,
	};
	return result;
};

var validateInputs = function (app) {
	if (!app.email || !app.password) {
		app.setInvalid("Email and password are required");
	} else if (app.password !== app.confirm) {
		app.setInvalid("Password dont match");
	} else {
		app.validate();
	}
};

var Registration = function (db) {
	var self = this;

	var checkIfUserExists = function (app, next) {
		db.users.exists({
			email: app.email
		}, next);
	};

	self.applyForMembership = function (args, next) {
		var regResult = new RegResult();
		var app = new Application(args);

		//validate inputs
		validateInputs(app);

		//check to see if email exists
		checkIfUserExists(app, function (err, exists) {
			assert.ok(err === null, err);
			if (!exists) {
				//success
				regResult.success = true;
				regResult.message = "Welcome";

				regResult.user = new User(args);
			}
			next(null, regResult)
		});
	};
	return self;
};

module.exports = Registration;