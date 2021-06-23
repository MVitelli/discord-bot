const User = require("./User");
const UserRepository = require("./UserRepository");

const user = new User();
const userRepository = new UserRepository(user);

module.exports = {
    User: user,
    UserRepository: userRepository
};