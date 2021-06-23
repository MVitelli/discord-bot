class BetController {
    constructor(repository) {
        this.repository = repository;
    }

    async add(bet) {
        return this.repository.add(bet);
    }

    async findById(id) {
        return this.repository.find('id', id);
    }

    async findAll() {
        return this.repository.findAll();
    }
}

module.exports = BetController;