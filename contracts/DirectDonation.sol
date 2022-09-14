//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "./HitchensUnorderedAddressSet.sol";
interface IDirectDonation {

     struct SimplifiedFormat {
        address walletAddress; 
        uint32 percentAllocation;
    }

    function createAllocation( address _walletAddress, uint32 _initPercentCount ) external;
    function addAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function subtractAllocation( address _walletAddress, uint32 _percentCount ) external; 
    function getAllocationValue( address _walletAddress ) external view returns(uint32); 
    function getAllocationSum()external view returns(uint32);
    function removeAllocation( address _walletAddress ) external;
    function getWalletList() external view returns( address[] memory);

 
    //set Allowed ERC20 Tokens to be donated
    function setAcceptedERC20( address _tokenAddress ) external;
    //delete Allowed ERC20 Tokens to be donated
    function deleteAcceptedERC20( address _tokenAddress ) external;
    //view List of Wallet Addresses to be donated to
    function getAcceptedERC20List() external view returns( address[] memory);
    // set if donate pays out from contract immediately or keeps in contract
    function setCustodianFeature( bool _switch) external;
    // depending CustodianFeature donate() payout the ether value to account immediately - false or accept into contract the ether value for later collection 
    function donate() external payable; 
    // depending CustodianFeature donate() payout the ether value to account immediately - false or accept into contract the ERC20 value for later collection 
    function donate(address _tokenAddress, uint256 sum) external;
   // divide and transfer current Ether Contract Balance by set Percentages
    function payoutContractBalance(uint256 _sum) external;
    // divide and transfer current stated ERC20 token by set Percentages
    function payoutContractBalance(address _tokenAddress, uint256 _sum) external; 
    // calls both version of payoutContract for Ether and Every donated ERC20 tokens 
    function payoutAllContractBalance() external;
    // withdraws all ether in contract to owner
    function withdrawContractBalance() external;
    // withdraws all curent stated ERC20 token in contract to owner
    function withdrawContractBalance(address _tokenAddress) external;
    // withdraws Ether and Every donated ERC20 tokens in contract to owne
    function withdrawAllContractBalance() external;

    function destory() external;

    event LogCreateAllocation(address indexed walletAddress, uint32 percentCount);
    event LogAddAllocation(address indexed  walletAddress, uint32 percentCount);
    event LogSubtractAllocation(address indexed walletAddress, uint32 percentCount);
    event LogRemoveAllocation (address indexed walletAddress);
    event LogEtherDonation( uint256 sum );
    event LogERC20Donation( address indexed token, uint256 sum );
    event LogEtherPayout( address indexed wallet, uint256 sum );
    event LogERC20Payout( address indexed token, address indexed wallet, uint256 sum );
    event LogEtherWithdrawal( address indexed wallet, uint256 sum );
    event LogERC20Withdrawal( address indexed token, address indexed wallet, uint256 sum );
    event LogDestruction();
}

contract DirectDonation is IDirectDonation,Ownable {

    using HitchensUnorderedAddressSetLib for HitchensUnorderedAddressSetLib.Set;
    HitchensUnorderedAddressSetLib.Set PercentSet;
    HitchensUnorderedAddressSetLib.Set AcceptedTokensSet;
    using SafeERC20 for IERC20;

    mapping(address => uint32) PercentAllocationMap;
    uint32 PercentAllocationSum;
    bool CustodianFeature;

    constructor(address _walletOwner) Ownable(){
        Ownable._transferOwnership(_walletOwner);
        PercentAllocationSum = 0; 
        CustodianFeature = false;
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

    function getWalletList() external override view onlyOwner returns( address[] memory ) {
        return PercentSet.list();
    }

    //set Allowed ERC20 Tokens to be donated
    function setAcceptedERC20( address _tokenAddress ) external override onlyOwner{
        //need to add ERC165 checker require statement
        AcceptedTokensSet.insert(_tokenAddress);
    }    
    //delete Allowed ERC20 Tokens to be donated
    function deleteAcceptedERC20( address _tokenAddress ) external override onlyOwner{
        AcceptedTokensSet.remove(_tokenAddress);
    }
    //view List of Wallet Addresses to be donated to
    function getAcceptedERC20List() external view returns( address[] memory){
        return AcceptedTokensSet.list();
    }

    // set if donate pays out from contract immediately or keeps in contract
    function setCustodianFeature(bool _switch) external override{
        CustodianFeature = _switch;
    }

    // depending CustodianFeature donate() payout the ether value to account immediately - false or accept into contract the ether value for later collection 
    function donate() external payable override {
        emit LogEtherDonation(msg.value); 
        if (CustodianFeature == false){
            payoutContractBalance(msg.value);
        }
    }

    // depending CustodianFeature donate() payout the ether value to account immediately - false or accept into contract the ERC20 value for later collection 
    function donate(address _tokenAddress, uint256 _sum) external override{
        require(AcceptedTokensSet.exists(_tokenAddress), "Token not accepted by owner.");
        IERC20 tokenInstance = IERC20(_tokenAddress);
        tokenInstance.safeIncreaseAllowance(address(this),_sum); 
        tokenInstance.safeTransferFrom(msg.sender,address(this), _sum);
        emit LogERC20Donation(_tokenAddress,_sum);
        if (CustodianFeature == false){
            payoutContractBalance(_tokenAddress,_sum);
        }
    }
    // divide and transfer current Ether Contract Balance by set Percentages
    function payoutContractBalance(uint256 _sum) public override onlyOwner{
        // send ethers to percentage address    
        //remaining unallocated Percent will be given to Owner
        uint256 transferable = 0;
        address currAddr;
        for (uint32 i = 0; i < PercentSet.count(); i++){
            currAddr = PercentSet.keyAtIndex(i);
            transferable = (_sum/ 1000000000)* PercentAllocationMap[currAddr] ;

            (bool sent, ) = currAddr.call{value: transferable}("");
            require(sent,"Failed to send Ether");
            emit LogEtherPayout(currAddr,transferable);
        }
    }

    // divide and transfer current stated ERC20 token by set Percentages
    function payoutContractBalance(address _tokenAddress, uint256 _sum) public override onlyOwner{
        require(AcceptedTokensSet.exists(_tokenAddress), "Token not accepted by owner.");
        uint256 transferable = 0;
        IERC20 tokenInstance;
        address currAddr;
        for (uint32 i = 0; i < PercentSet.count(); i++){
            tokenInstance = IERC20(_tokenAddress);
            currAddr = PercentSet.keyAtIndex(i);
            transferable = (_sum/ 1000000000) * PercentAllocationMap[currAddr] ;

            tokenInstance.safeTransfer(currAddr,transferable);
            //require(transferApproval,"Failed to send token.");
            emit LogERC20Payout(_tokenAddress,currAddr, transferable);
        }
    }

    // calls both version of payoutContract for Ether and Every donated ERC20 tokens 
    function payoutAllContractBalance() external override onlyOwner {
        payoutContractBalance(address(this).balance);
        address currAddr;
        IERC20 tokenInstance;
        for (uint32 i = 0; i < AcceptedTokensSet.count(); i++){
            currAddr = AcceptedTokensSet.keyAtIndex(i); 
            tokenInstance = IERC20(currAddr);
            payoutContractBalance(currAddr,tokenInstance.balanceOf(address(this)));
        }
    }

    // withdraws all ether in contract to owner
    function withdrawContractBalance() public override onlyOwner{
        uint256 contractBalance = address(this).balance; 
        (bool sent, ) = Ownable.owner().call{value: contractBalance}("");
        require(sent,"Failed to send Ether.");
        emit LogEtherWithdrawal(Ownable.owner(), contractBalance);
    }

    // withdraws all curent stated ERC20 token in contract to owner
    function withdrawContractBalance(address _tokenAddress) public override onlyOwner{
        require(AcceptedTokensSet.exists(_tokenAddress), "Token not accepted by owner.");
        IERC20 tokenInstance = IERC20(_tokenAddress);
        uint256 contractBalance = tokenInstance.balanceOf(address(this)); 
        tokenInstance.safeTransfer(Ownable.owner(), contractBalance);
        //require(transferApproval,"Failed to send token.");
        emit LogERC20Withdrawal(_tokenAddress,Ownable.owner() ,contractBalance);
    }

    // withdraws Ether and Every donated ERC20 tokens in contract to owne
    function withdrawAllContractBalance() public override onlyOwner{
        withdrawContractBalance();
        address currAddr;
        IERC20 tokenInstance;
        for (uint32 i = 0; i < AcceptedTokensSet.count(); i++){
            currAddr = AcceptedTokensSet.keyAtIndex(i); 
            tokenInstance = IERC20(currAddr);
            payoutContractBalance(currAddr,tokenInstance.balanceOf(address(this)));
        }
    }

    function destory() external override onlyOwner{
        withdrawAllContractBalance();
        emit LogDestruction();
        selfdestruct(payable(Ownable.owner()));
    }

}