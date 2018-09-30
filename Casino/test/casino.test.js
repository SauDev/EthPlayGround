const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const { interface, bytecode } = require('../compile');

let casino;
let accounts;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  casino = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '1000000' });
});

describe('Casino Contract', () => {
  it('deploys a casino contract', () => {
    assert.ok(casino.options.address);
  });

  it('allows one player to enter', async () => {
    await casino.methods.enterPlayer().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const players = await casino.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(1, players.length);
  });

  it('allows multiple players to enter', async () => {
    await casino.methods.enterPlayer().send({
      from: accounts[0],
      value: web3.utils.toWei('1.2', 'ether')
    });
    await casino.methods.enterPlayer().send({
      from: accounts[1],
      value: web3.utils.toWei('1.4', 'ether')
    });
    await casino.methods.enterPlayer().send({
      from: accounts[2],
      value: web3.utils.toWei('1.5', 'ether')
    });

    const players = await casino.methods.getPlayers().call({
      from: accounts[0]
    });

    assert.equal(accounts[0], players[0]);
    assert.equal(accounts[1], players[1]);
    assert.equal(accounts[2], players[2]);
    assert.equal(3, players.length);
  });

  it('requires a minimum amount of ether to enter', async () => {
    try {
      await casino.methods.enterPlayer().send({
        from: accounts[0],
        value: 0
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('only casino owner can call pickWinner', async () => {
    try {
      await casino.methods.pickWinner().send({
        from: accounts[1]
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it('sends money to the winner and resets the players array', async () => {
    await casino.methods.enterPlayer().send({
      from: accounts[0],
      value: web3.utils.toWei('2', 'ether')
    });

    const initialBalance = await web3.eth.getBalance(accounts[0]);
    await casino.methods.pickWinner().send({ from: accounts[0] });
    const finalBalance = await web3.eth.getBalance(accounts[0]);
    const difference = finalBalance - initialBalance;

    assert(difference > web3.utils.toWei('1.8', 'ether'));
  });
  
});