//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;



import "@openzeppelin/contracts/access/Ownable.sol";
import "./HitchensUnorderedAddressSet.sol";
import "./DirectDonation.sol";
interface IDDManager {

    function createDirectDonation(address key) external;
    function removeDirectDonation(address key) external;
    function getDirectionDonationCount() external returns(uint256);
    function getDirectionDonationList() external view  returns(address[] memory);
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
    function createDirectDonation(address key) external onlyOwner{
        DirectDonation instance = new DirectDonation(address(this));
        DonationSet.insert(address(instance)); // Note that this will fail automatically if the key already exists.
        emit LogCreateDirectDonation(msg.sender, key);
    }
    
    function removeDirectDonation(address key) external onlyOwner {
        DonationSet.remove(key); // Note that this will fail automatically if the key doesn't exist
        emit LogRemoveDirectDonation(msg.sender, key);
    }
    
    function getDirectionDonationCount() external view onlyOwner returns(uint256) {
        return DonationSet.count();
    }
    
    function getDirectionDonationList() external view onlyOwner returns(address[] memory) {
        return DonationSet.list();
    }

    function getDirectDonationAtIndex(uint index) external view onlyOwner returns( address ) {
        return DonationSet.keyAtIndex(index) ;
    }
}