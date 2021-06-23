const FileRepository = require("../../interfaces/FileRepository");

class BetRepository extends FileRepository{
    constructor(model) {
        super(model)
    }
}

module.exports = BetRepository;