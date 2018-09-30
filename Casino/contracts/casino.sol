pragma solidity ^0.4.17;

contract Casino {
    
    address public casinoOwner;
    address[] public players;

    constructor() public{
        casinoOwner = msg.sender;
    }

    function enterPlayer() public payable{
        require(msg.value > 1 ether);
        players.push(msg.sender);
    }
    
    function random() private view returns (uint) {
        return uint (keccak256(block.difficulty, now, players));
    }
    
    function pickWinner() public restricted {
        uint index = random() % players.length;
        address myAddress = this;
        players[index].transfer(myAddress.balance);
        players = new address[](0);        
    }
    
    modifier restricted(){
        require(msg.sender == casinoOwner,"Only casino manager can pick a winner.");
        _;
    }

    function getPlayers() public view returns (address[]){
        return players;
    }
}