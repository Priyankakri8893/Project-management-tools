const { UserModel } = require("../models/user.model");
const { msg } = require("../../../../config/message");
const { generateAuthToken } = require("../../../util/generate.token");
const { isValid } = require("../../../middleware/validator.middleware");
const CryptoJS = require("crypto-js");
const { ProjectController } = require("../../project/controllers/project.controller");

let validator = require("validator");

const UserController = {
    // User Registration
    signup: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !validator.isEmail(email)) {
                return res.status(400).send({ error: "Invalid email", success: false, status: 400 });
            }
            if (!isValid(password) || password.length < 6) {
                return res.status(400).send({ error: "Password must be at least 6 characters", success: false, status: 400 });
            }
            // Check password strength
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
            if (!passwordRegex.test(password)) {
                return res.status(400).send({ error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", success: false, status: 400 });
            }

            // Check if user already exists
            const user = await UserModel.findOne({ email, isDeleted: false });
            if (user) {
                return res.status(400).send({ error: "User already exists", success: false, status: 400 });
            }

            // encrypt password
            const encryptedPassword = CryptoJS.AES.encrypt(
                password,
                process.env.crypto_secret_key
            ).toString();

            // Create user
            const newUser = new UserModel({ email, password: encryptedPassword, name: email.split("@")[0] });
            await newUser.save();

            await ProjectController.dummyProject(newUser);

            return res.status(201).send({
                msg: "User registered successfully", success: true, status: 201,
                token: await generateAuthToken(newUser),
            });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // User Login
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !validator.isEmail(email)) {
                return res.status(400).send({ error: "Invalid email", success: false, status: 400 });
            }
            if (!isValid(password)) {
                return res.status(400).send({ error: "Password is required", success: false, status: 400 });
            }
            // Check if user exists
            const user = await UserModel.findOne({ email, isDeleted: false });
            if (!user) {
                return res.status(400).send({ error: "User not found", success: false, status: 404 });
            }
            // Decrypt password
            const decryptedPassword = CryptoJS.AES.decrypt(
                user.password,
                process.env.crypto_secret_key
            ).toString(CryptoJS.enc.Utf8);

            if (decryptedPassword !== password) {
                return res.status(400).send({ error: "Invalid password", success: false, status: 400 });
            }
            return res.status(200).send({
                msg: "Login successful", success: true, status: 200,
                token: await generateAuthToken(user),
            });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // Get User Profile
    profile: async (req, res) => {
        try {
            let userId = req.user._id;
            let user = await UserModel.findOne({ _id: userId, isDeleted: false }).select("name email createdAt");
            if (!user) {
                return res.status(404).send({ error: "User not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Profile fetched successfully", success: true, status: 200, data: user, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // Update User Profile
    updateProfile: async (req, res) => {
        try {
            let userId = req.user._id;
            if (isValid(req.body.email)) {
                if (!validator.isEmail(req.body.email)) {
                    return res.status(400).send({ error: "Invalid email", success: false, status: 400 });
                }
                let existingUser = await UserModel.findOne({ email: req.body.email, isDeleted: false, _id: { $ne: userId } });
                if (existingUser) {
                    return res.status(400).send({ error: "Email already in use", success: false, status: 400 });
                }
            }

            if (isValid(req.body.password)) {
                if (req.body.password.length < 6) {
                    return res.status(400).send({ error: "Password must be at least 6 characters", success: false, status: 400 });
                }
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
                if (!passwordRegex.test(req.body.password)) {
                    return res.status(400).send({ error: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character", success: false, status: 400 });
                }
                req.body.password = CryptoJS.AES.encrypt(
                    req.body.password,
                    process.env.crypto_secret_key
                ).toString();
            }

            let user = await UserModel.findByIdAndUpdate(
                { _id: userId, isDeleted: false },
                { $set: req.body },
                { new: true }
            )

            if (!user) {
                return res.status(404).send({ error: "User not found", success: false, status: 404 });
            }
            return res.status(200).send({ user, message: "Profile updated successfully", success: true, status: 200 });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // List Users
    list: async (req, res) => {
        try {
            let { page = 1, limit = 10 } = req.query;
            page = parseInt(page);
            limit = parseInt(limit);
            let filter = { isDeleted: false };
            if (isValid(req.query.key)) {
                filter.$or = [
                    { name: { $regex: req.query.key, $options: "i" } },
                    { email: { $regex: req.query.key, $options: "i" } },
                ];
            }
            let users = await UserModel.find(filter, { name: 1 }).skip((page - 1) * limit).limit(limit)
            return res.status(200).send({ msg: "Users fetched successfully", success: true, status: 200, data: users, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // Delete User
    deleteUser: async (req, res) => {
        try {
            let userId = req.user._id;
            let user = await UserModel.findByIdAndUpdate(
                { _id: userId, isDeleted: false },
                { $set: { isDeleted: true } },
                { new: true }
            );
            if (!user) {
                return res.status(404).send({ error: "User not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "User deleted successfully", success: true, status: 200 });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

}


module.exports = { UserController };
