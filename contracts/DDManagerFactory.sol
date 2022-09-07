//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;
import "./DirectDonation.sol";
import "./DDManager.sol";
//import "@openzeppelin/contracts/utils/Strings.sol";

interface IDDManagerFactory {

    function myDDManagerExist() external view returns(bool);
    function getMyDDManager() external view returns(address);
    function createMyDDManager() external returns(address);

    event LogDDManagerCreation( address indexed _contractOwner, address _contractAddress);
}

contract DDManagerFactory is IDDManagerFactory{

    mapping (address => address) DDManagerMap;

    function myDDManagerExist() external view returns(bool){
        address mapResult = DDManagerMap[msg.sender];
        return mapResult == address(0)? false : true;
    }

    function getMyDDManager() external view returns(address){
        return DDManagerMap[msg.sender];
    }

    function createMyDDManager() external returns(address){
        address instanceAddr = address(new DDManager(msg.sender));
        DDManagerMap[msg.sender] = instanceAddr;
        emit LogDDManagerCreation(msg.sender, instanceAddr);
        return instanceAddr;
    }    
}