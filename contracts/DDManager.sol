//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;



import "@openzeppelin/contracts/access/Ownable.sol";
import "./HitchensUnorderedAddressSet.sol";
import "./DirectDonation.sol";
interface IDDManager {

    function createDirectDonation() external returns(address);
    function removeDirectDonation(address key) external;
    function getDirectDonationCount() external returns(uint256);
    function getDirectDonationList() external view  returns(address[] memory);
    function getDirectDonationAtIndex(uint index) external view returns( address ) ;

    event LogCreateDirectDonation(address indexed sender, address key); 
    event LogRemoveDirectDonation(address indexed sender, address key);

}

contract DDManager is IDDManager, Ownable{
    
    using HitchensUnorderedAddressSetLib for HitchensUnorderedAddressSetLib.Set;
    HitchensUnorderedAddressSetLib.Set DonationSet;
    
    constructor(address _walletAddress) Ownable(){
        Ownable._transferOwnership(_walletAddress);
    }
    function createDirectDonation() external override onlyOwner returns(address){
        address instanceAddr = address(new DirectDonation(Ownable.owner()));
        DonationSet.insert(instanceAddr); // Note that this will fail automatically if the key already exists.
        emit LogCreateDirectDonation(msg.sender, instanceAddr);
        return instanceAddr ;
    }
    
    function removeDirectDonation(address key) external override onlyOwner {
        DonationSet.remove(key); // Note that this will fail automatically if the key doesn't exist
        emit LogRemoveDirectDonation(msg.sender, key);
    }
    
    function getDirectDonationCount() external view override onlyOwner returns(uint256) {
        return DonationSet.count();
    }
    
    function getDirectDonationList() external view override onlyOwner returns(address[] memory) {
        return DonationSet.list();
    }

    function getDirectDonationAtIndex(uint index) external view override onlyOwner returns( address ) {
        return DonationSet.keyAtIndex(index) ;
    }
}