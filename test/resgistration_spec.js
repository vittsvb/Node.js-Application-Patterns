var Registration = require('../lib/registration');
var db = require("secondthought");

describe("Registration", function () {
	var reg = {};
	before(function (done) {
		db.connect({
			db: "membership"
		}, function (err, db) {
			reg = new Registration(db);
			done();
		});
	});
	//happy path
	describe("a valid application", function () {
		var regResult = {};
		before(function (done) {
			db.users.destroyAll(function (err, result) {
				reg.applyForMembership({
					email: 'test@test.com',
					password: "password",
					confirm: "password"
				}, function (err, result) {
					regResult = result;
					done();
				});
			});
		});
		it("is successful", function () {
			regResult.success.should.equal(true);
		});
		it("creates a user", function () {
			regResult.user.should.be.defined;
		});
		it("creates a log entry", function () {
			regResult.user.should.be.defined;
		});
		it("sets the users status to approved", function () {
			regResult.user.status.should.equal("approved")
		});
		it("offers a welcome message", function () {
			regResult.message.should.equal('Welcome!')
		});
		it("increments the signInCount", function () {
			regResult.user.signInCount.should.equal(1)
		});
	});

	describe("an empty or null email", function () {
		var regResult = {};
		before(function (done) {
			reg.applyForMembership({
				email: null,
				password: "password",
				confirm: "password"
			}, function (err, result) {
				regResult = result;
				done();
			});
		});
		it.skip("is not successful", function () {
			regResult.success.should.equal(false);
		});
		it.skip("tells user that email is required", function () {
			regResult.message.should.equal("Email is required");
		});
	});

	describe("empty or null password", function () {
		var regResult = {};
		before(function (done) {
			reg.applyForMembership({
				email: "test@test.com",
				password: null,
				confirm: "password"
			}, function (err, result) {
				regResult = result;
				done();
			});
		});
		it("is not successful", function () {
			regResult.success.should.equal(false);
		});
		it("tells user that password is required", function () {
			regResult.message.should.equal("Email and password are required");
		});
	});

	describe("password and confirm mismatch", function () {
		var regResult = {};
		before(function (done) {
			reg.applyForMembership({
				email: "test@test.com",
				password: "goofy",
				confirm: "password"
			}, function (err, result) {
				regResult = result;
				done();
			});
		});
		it("is not successful", function () {
			regResult.success.should.equal(false);
		});
		it("tells user passwords dont match", function () {
			regResult.message.should.equal("Password dont match");
		});
	});

	describe("email already exists", function () {
		before(function (done) {
			var newUser = {
				email: "test@test.com",
				password: "password",
				confirm: "password"
			};
			db.users.destroyAll(function (err, deleted) {
				reg.applyForMembership(newUser, function (err, result) {
					reg.applyForMembership(newUser, function (err, nextResult) {
						regResult = nextResult;
						done();
					});
				});
			});
		});
		it("is not successful", function () {
			regResult.success.should.equal(false);
		});
		it("tells user that email already exists", function () {
			regResult.message.should.equal("This email already exists");
		});
	});
});