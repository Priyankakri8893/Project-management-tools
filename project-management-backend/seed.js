const CryptoJS = require('crypto-js');
require('dotenv').config();
const { env } = require("./src/environment/environment");
const mongoose = require("./src/app/db/mongoose");

const { UserModel } = require("./src/app/modules/user/models/user.model");
const { ProjectController } = require("./src/app/modules/project/controllers/project.controller");

const dummyUser = async () => {
    try {
        let password = "Test@123";
        // encrypt password
        const encryptedPassword = CryptoJS.AES.encrypt(
            password,
            process.env.crypto_secret_key
        ).toString();

        const user = await UserModel.findOneAndUpdate(
            { email: "test@example.com", isDeleted: false },
            {
                $set: { name: "Test User", password: encryptedPassword }
            },
            { upsert: true, new: true }
        )

        await ProjectController.dummyProject(user);

        console.log("User created successfully");
        return "User created successfully";
    } catch (error) {
        console.log(error);
        return error.msg;
    }
};

dummyUser();
