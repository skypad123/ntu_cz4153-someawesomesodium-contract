
pragma solidity >=0.7.0 <0.9.0;
import "./DirectDonation.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract DirectDonationFactory{

    function createDirectDonationContractInstance() external returns(DirectDonation){
        DirectDonation newInstance = new DirectDonation(msg.sender);
        emit ContractInstanceCreation( address(msg.sender), address(newInstance));
        return newInstance;
    }

    event ContractInstanceCreation( address _contractOwner, address _contractAddress);
}