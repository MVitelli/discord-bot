const Repository = require('./Repository');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const access = util.promisify(fs.access);
const { v4: uuid } = require('uuid');

class FileRepository extends Repository {
    constructor(model) {
        super(model);
        this.path = 'data/' + this.model.plural() + '.json';
        this.init();
    }

    async init() {
        return access(this.path, fs.constants.F_OK)
            .catch(() => {
                return writeFile(this.path, JSON.stringify({ [this.model.plural()]: [] }, null, 4));
            })
    }

    async data() {
        return readFile(this.path, 'utf8').then(data => {
            return JSON.parse(data)[this.model.plural()];
        });
    }

    async find(key, value) {
        return this.data().then(data => {
            let item = data.filter(element => element[key] == value);
            return item?.[0]
        });
    }

    async findAll() {
        return this.data();
    }

    async count() {
        return this.data().then(data => data.length);
    }

    async add(element) {
        return this.data().then(data => {
            data.push({ id: uuid(), ...element });
            return writeFile(this.path, JSON.stringify({ [this.model.plural()]: data }, null, 2))
                .then(() => element.id)
        });
    }

    async update(element) {
        return this.data().then(data => {
            let { id } = element
            let index = data.findIndex(entry => entry.id === id)
            data[index] = element;
            return writeFile(this.path, JSON.stringify({ [this.model.plural()]: data }, null, 2))
                .then(() => element.id)
        });
    }

    async remove(element) {
        return this.data().then(data => {
            data = data.filter(entry => entry.id !== element.id)
            return writeFile(this.path, JSON.stringify({ [this.model.plural()]: data }, null, 2))
                .then(() => element.id)
        });
    }
}

module.exports = FileRepository;