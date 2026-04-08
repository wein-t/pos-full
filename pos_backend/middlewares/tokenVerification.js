const createHttpError = require("http-errors");
const config = require("../config/config");
const User = require("../models/userModels");
const jwt = require('jsonwebtoken');

const isVerifiedUser = async (req, res, next) => {
    
    console.log("\n--- Running isVerifiedUser Middleware ---");

    try {
        
        console.log("SECRET KEY USED:", config.accessTokenSecret);

        const authHeader = req.headers.authorization;
        console.log("Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("ERROR: Auth header is missing or malformed.");
            const error = createHttpError(401, "Authorization header is missing or malformed!");
            return next(error);
        }

        const accessToken = authHeader.split(' ')[1];
        console.log("Extracted Token:", accessToken);

        
        const decodeToken = jwt.verify(accessToken, config.accessTokenSecret);
        console.log("Decoded Token Payload:", decodeToken);

        const user = await User.findById(decodeToken._id);
        if (!user) {
            console.error("ERROR: User from token not found in database.");
            const error = createHttpError(401, "User does not exist!");
            return next(error);
        }

        console.log("SUCCESS: User verified successfully. User:", user.name);
        req.user = user;
        next();

    } catch (error) {
        
        console.error("!!! CATCH BLOCK ERROR IN isVerifiedUser !!!");
        console.error("Error Message:", error.message);
        console.error("Full Error Object:", error);
        
        const err = createHttpError(401, `Invalid or expired token! (${error.message})`);
        next(err);
    }
   
}

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        const error = createHttpError(403, "Forbidden. Admin access required.");
        next(error);
    }
};

module.exports = { isVerifiedUser, isAdmin };