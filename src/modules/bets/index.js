const Bet = require("./Bet");
const BetController = require("./BetController");
const BetRepository = require("./BetRepository");

const bet = new Bet();
const betRepository = new BetRepository(bet);
const betController = new BetController(betRepository);

module.exports = {
    Bet: bet,
    BetRepository: betRepository,
    BetController: betController,
};