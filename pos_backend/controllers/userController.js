const User = require("../models/userModels");
const createHttpError = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const config = require("../config/config");

const register = async (req, res, next) => {
    try {
        const { name, phone, email, password, role } = req.body || {};

        if (!name || !phone || !email || !password || !role) {
            const error = createHttpError(400, "All fields are required!");
            return next(error);
        }

        const isUserPresent = await User.findOne({ email });
        if (isUserPresent) {
            const error = createHttpError(400, "User with this email already exists!");
            return next(error);
        }

        const user = { name, phone, email, password, role };
        
        const newUser = new User(user);
        await newUser.save();

        res.status(201).json({ success: true, message: "New user created!", data: newUser });

    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password) {
            return next(createHttpError(400, "All fields are required!"));
        }

        const userInDb = await User.findOne({ email });
        if (!userInDb) {
            return next(createHttpError(401, "Invalid Credentials"));
        }

        const isMatch = await bcrypt.compare(password, userInDb.password);
        if (!isMatch) {
            return next(createHttpError(401, "Invalid Credentials"));
        }

        const accessToken = jwt.sign({ _id: userInDb._id }, config.accessTokenSecret, {
            expiresIn: '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        res.status(200).json({
            success: true,
            message: "User login successful!",
            token: accessToken,
            data: userInDb
        });

    } catch (error) {
        next(error);
    }
}

const getUserData = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}

const logout = async (req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.status(200).json({ success: true, message: "User logout successfully!" });
    } catch (error) {
        next(error);
    }
}

const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return next(createHttpError(404, "User not found"));
        }
        
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        next(error);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const { id } = req.params;

        // Validation
        if (!role || !['admin', 'user'].includes(role)) {
             return next(createHttpError(400, "Invalid role provided"));
        }

        // Security: Prevent Admin from changing their own role to avoid locking themselves out
        if (req.user._id.toString() === id) {
             return next(createHttpError(403, "You cannot change your own role"));
        }

        const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });
        
        if (!updatedUser) {
            return next(createHttpError(404, "User not found"));
        }

        res.status(200).json({ success: true, message: "User role updated", data: updatedUser });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login, getUserData, logout, getAllUsers, deleteUser, updateUserRole };