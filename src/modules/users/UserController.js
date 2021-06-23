class UserController {

    constructor(repository) {
        this.repository = repository;
    }

    findById(req, res) {
        this.repository.find('id', req.params.id)
            .then(users => res.json(users))
            .catch(error => res.status(500).json({ message: 'Could not find users', error }));
    }

    findAll(req, res) {
        this.repository.findAll()
            .then(users => res.json(users))
            .catch(error => res.status(500).json({ message: 'Could not find users', error }));
    }
}

module.exports = UserController;
