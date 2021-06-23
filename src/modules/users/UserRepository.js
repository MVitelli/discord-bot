const FileRepository = require("../../interfaces/FileRepository");

class UserRepository extends FileRepository{
    constructor(model) {
        super(model)
    }
}

module.exports = UserRepository;