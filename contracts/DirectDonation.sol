//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./HitchensUnorderedAddressSet.sol";
interface IDirectDonation {

     struct SimplifiedFormat {
        address walletAddress; 
        uint32 percentAllocation;
    }

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) external;
    function addAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function getAllocationValue( address _walletAddress ) external returns(uint32); 
    function getAllocationSum()external returns(uint32);
    function removeAllocation( address _walletAddress ) external;
    function getAllocationList() external returns( SimplifiedFormat[] memory ) ;

    function donate() external payable; 
    function withdrawContractBalance() external;
    function destory() external;

    event LogCreateAllocation(address indexed _walletAddress, uint32 _percentCount);
    event LogAddAllocation(address indexed  _walletAddress, uint32 _PercentCount);
    event LogSubtractAllocation(address indexed _walletAddress, uint32 _percentCount);
    event LogRemoveAllocation (address indexed _walletAddress);
    event LogDonation( uint256 sum );
    event LogWithdrawal( uint256 sum );
    event LogDestruction();
}

contract DirectDonation is IDirectDonation,Ownable {

    using HitchensUnorderedAddressSetLib for HitchensUnorderedAddressSetLib.Set;
    HitchensUnorderedAddressSetLib.Set PercentSet;

    mapping(address => uint32) PercentAllocationMap;
    uint32 PercentAllocationSum;

    constructor(address _walletOwner) Ownable(){
        Ownable._transferOwnership(_walletOwner);
        PercentAllocationSum = 0; 
    }

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) external override onlyOwner {
        require(PercentAllocationSum + _initPercentCount <= 1000000000, "total percent count cannot pass 100%.");
        PercentSet.insert(_walletAddress);
        PercentAllocationMap[_walletAddress] = _initPercentCount;
        PercentAllocationSum += _initPercentCount;
        emit LogCreateAllocation( _walletAddress, _initPercentCount);
    }
    function addAllocation( address _walletAddress, uint32 _percentCount ) external override onlyOwner {
        require(PercentSet.exists(_walletAddress),"address has not been added to allocation.");
        require(PercentAllocationSum + _percentCount <= 1000000000, "total percent count cannot pass 100%.");
        PercentAllocationMap[_walletAddress] += _percentCount;
        PercentAllocationSum += _percentCount;
        emit LogAddAllocation( _walletAddress, _percentCount);
    }
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) external override onlyOwner {
        require(PercentSet.exists(_walletAddress),"address has not been added to allocation.");
        require(_percentCount <= PercentAllocationMap[_walletAddress], "cannot subtract more than already allocated.");
        PercentAllocationMap[_walletAddress] -= _percentCount;
        PercentAllocationSum -= _percentCount;
        emit LogSubtractAllocation( _walletAddress, _percentCount);
    }
    function getAllocationValue( address _walletAddress ) external view override onlyOwner returns(uint32) {
        require(PercentSet.exists(_walletAddress),"address has not been added to allocation.");
        return PercentAllocationMap[_walletAddress];
    }

    function getAllocationSum() external view override onlyOwner returns(uint32) {
        return PercentAllocationSum;
    }

    function removeAllocation( address _walletAddress ) external override onlyOwner {
        require(PercentSet.exists(_walletAddress),"address has not been added to allocation.");
        PercentAllocationSum -= PercentAllocationMap[_walletAddress];
        PercentAllocationMap[_walletAddress] = 0;
        PercentSet.remove(_walletAddress);
        emit LogRemoveAllocation( _walletAddress);
    }

    function getAllocationList() external override view onlyOwner returns( SimplifiedFormat[] memory ) {
        SimplifiedFormat[] memory  ret; 
        address currAddr;
        for (uint32 i = 0; i< PercentSet.count(); i++){
            currAddr = PercentSet.keyAtIndex(i);
            ret[i] = SimplifiedFormat ({
                walletAddress: currAddr,
                percentAllocation: PercentAllocationMap[currAddr]
            });
        }
        return ret;
    }

    function donate() external payable override {
        // send ethers to percentage address    
        //remaining unallocated Percent will be given to Owner
        uint256 transferable = 0;
        address currAddr;
        for (uint32 i = 0; i < PercentSet.count(); i++){
            currAddr = PercentSet.keyAtIndex(i);
            transferable = (msg.value/ 1000000000)*PercentAllocationMap[currAddr] ;
            (bool sent, ) = currAddr.call{value: transferable}("");
            require(sent,"Failed to send Ether");
        }
        emit LogDonation(msg.value);
    }

    function withdrawContractBalance() external override  onlyOwner{
        uint256 contractBalance = address(this).balance; 
        (bool sent, ) = Ownable.owner().call{value: contractBalance}("");
        require(sent,"Failed to send Ether");
        emit LogWithdrawal(contractBalance);
    }

    function destory() external override onlyOwner{
        emit LogWithdrawal(address(this).balance);
        selfdestruct(payable(Ownable.owner()));
    }

}