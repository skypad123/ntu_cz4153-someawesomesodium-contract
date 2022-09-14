
pragma solidity >=0.7.0 <0.9.0;

import "./_PercentRecord.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
interface IDirectDonation {

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) external;
    function addAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function getAllocationValue( address _walletAddress ) external returns(uint32); 
    function removeAllocation( address _walletAddress ) external;

    function donate() external payable; 
    function withdrawContractBalance() external;
}

contract DirectDonation is PercentRecord, Ownable, IDirectDonation {

    constructor(address  origin) Ownable(){
        Ownable._transferOwnership(origin);
    }

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) public override(IDirectDonation, PercentRecord) onlyOwner {
        PercentRecord.createAllocation( _walletAddress, _initPercentCount);
    }
    function addAllocation( address _walletAddress, uint32 _percentCount ) public override(IDirectDonation, PercentRecord) onlyOwner{
        PercentRecord.addAllocation( _walletAddress, _percentCount);
    }
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) public override(IDirectDonation, PercentRecord) onlyOwner{
        PercentRecord.subtractAllocation( _walletAddress, _percentCount);
    }
    function getAllocationValue( address _walletAddress ) public view override(IDirectDonation, PercentRecord) returns(uint32) {
        return PercentRecord.getAllocationValue( _walletAddress);
    }
    function removeAllocation( address _walletAddress ) public override(IDirectDonation, PercentRecord) onlyOwner {
        PercentRecord.removeAllocation( _walletAddress);
    }

    function donate() external payable {
        // send ethers to percentage address    
        //remaining unallocated Percent will be given to Owner
        uint32 iter = 0;
        uint256 transferable = 0;
        Allocation memory iterAllocation = Allocation(address(0),0);
        while (iter < PercentRecord.count){
            iterAllocation = PercentRecord.allocationMap[iter];
            if (iterAllocation.objAddress != address(0)){
                transferable = (msg.value*iterAllocation.percentCount) / 1000000000; 
                (bool sent, ) = iterAllocation.objAddress.call{value: transferable}("");
                require(sent,"Failed to send Ether");
            }
            iter += 1; 
        }
    }

    function withdrawContractBalance() external onlyOwner{
        uint256 contractBalance = address(this).balance; 
        (bool sent, ) = Ownable.owner().call{value: contractBalance}("");
        require(sent,"Failed to send Ether");
    }

    function destory() internal onlyOwner{
        selfdestruct(payable(tx.origin));
    }

}