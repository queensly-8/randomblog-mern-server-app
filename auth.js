const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {})
}

module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	// "req.headers.authorization" contains sensitive data and especially our token
	let token = req.headers.authorization;

	if(typeof token === "undefined"){
		return res.status(401).send({auth: "Failed. No Token"});
	}else{
		console.log("TOKEN BEFORE SLICING !!!! :",token);
		token = token.slice(7, token.length)
		console.log("TOKEN SLICED:",token);

		// [Section] Token decryption
        jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){

        	if(err){
				console.error("Token verification error", err);
        		return res.status(401).send({
        			auth: "Failed",
        			message: err.message
        		});
        	}else{
        		console.log("result from verify method:")
        		console.log("Decoded token:",decodedToken);
        		req.user = decodedToken;
        		next();
        	}
        })
	}
}

module.exports.verifyAdmin = (req, res, next) => {
	console.log("result from verifyAdmin method");
	console.log(req.user);

	if(req.user.isAdmin){
		next();
	}else{
		return res.status(403).send({
			auth: "failed",
			message: "action forbidden"
		})
	}
}

module.exports.errorHandler = (err, req, res, next) =>{
	console.error(err);
    const statusCode = err.status || 500;
	const errorMessage = err.message || 'Internal Server Error';

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	})
}