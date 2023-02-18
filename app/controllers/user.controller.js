const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const bcrypt = require('bcrypt');

// Create and save new user
exports.create = async (req, res, next) => {
    if (!req.body.name) {
        return next(new ApiError(400, "Name cannot be empty"));
    }
    else if (!req.body.email) {
        return next(new ApiError(400, "Email cannot be empty"));
    }
    else if (!req.body.password) {
        return next(new ApiError(400, "Password cannot be empty"));
    }

    // hash password
    const saltRounds = 10;
    const myPlaintextPassword = req.body.password;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(myPlaintextPassword, salt, async function (err, hash) {
            req.body.password = hash;
            // create user
            try {
                const userService = new UserService(MongoDB.client);
                const document = await userService.create(req.body);
                return res.send(document);
            } catch (error) {
                return next(
                    new ApiError(500, "An error occurred while creating the user")
                );
            }
        });
    });

};

// Retrieve all user of a user from the database
exports.findAll = async (req, res, next) => {
    let documents = [];

    try {
        const userService = new UserService(MongoDB.client);
        const { name } = req.query;
        if (name) {
            documents = await userService.findByName(name);
        } else {
            documents = await userService.find({});
        }
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while retrieving the users")
        );
    }

    return res.send(documents);
};

// find a single user with id
exports.findOne = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.findById(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send(document);
    } catch (error) {
        return next(
            new ApiError(500, `Error retrieving user with id=${req.param.id}`)
        );
    }
};

// update a user by the id in the user
exports.update = async (req, res, next) => {
    if (Object.keys(req.body).length === 0) {
        return next(new ApiError(400, "Data to update cannot be update"))
    }
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.update(req.params.id, req.body);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send({ message: "User was updated successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Error update user with id=${req.params.id}`)
        );
    }
};

// delete a user with the specified id in the request
exports.delete = async (req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const document = await userService.delete(req.params.id);
        if (!document) {
            return next(new ApiError(404, "User not found"));
        }
        return res.send({ message: "User was deleted successfully" });
    } catch (error) {
        return next(
            new ApiError(500, `Could not delete user with id=${req.params.id}`)
        );
    }
};

// Delete all users of a user from the database
exports.deleteAll = async (_req, res, next) => {
    try {
        const userService = new UserService(MongoDB.client);
        const deleteCount = await userService.deleteAll();
        return res.send({
            message: `${deleteCount} users were deleted successfully`,
        });
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while removing all users")
        );
    }
};

// Check users from the database
exports.authUser = async (req, res, next) => {
    let documents = [];
    let user = {};

    try {
        const userService = new UserService(MongoDB.client);
        const name = req.params.name;
        const email = req.params.email;
        const password = req.params.password;
        documents = await userService.find({});

        check = false;
        isMatch = false;
        documents.forEach( element => {
            isMatch = bcrypt.compareSync(password, element.password);
            if (element.name.includes(name) && element.email.includes(email) && isMatch) {
                user = element;
                check = true;
                return false;
            }
            return true;
        });
        return res.send(
            {
                user,
                check
            },
        );
    } catch (error) {
        return next(
            new ApiError(500, "An error occurred while authorize the users")
        );
    }
};

