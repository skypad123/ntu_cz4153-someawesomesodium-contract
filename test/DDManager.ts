import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DDManager, DirectDonation ,TestERC20 } from "../typechain-types";
import { abi as directDonationABI } from "../artifacts/contracts/DirectDonation.sol/DirectDonation.json";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

describe("Testing DirectDonationFactory Contract.", function () {

    var MainDDManager: DDManager;

    var MainERC20: TestERC20;
    var SecondaryERC20: TestERC20;
  
    var MainOwner: SignerWithAddress;
    var OtherOwners: SignerWithAddress[];
  
    before( async function(){
      //set Signers Accounts
      const accounts = await ethers.getSigners();
      MainOwner = accounts[0];
      OtherOwners = accounts.slice(1);
  
      //set DirectDonation Contract Instance
      const DDManagerContractCF = await ethers.getContractFactory("DDManager");
      const DDManagerContract = await DDManagerContractCF.connect(MainOwner).deploy(await MainOwner.getAddress());
      MainDDManager = DDManagerContract;
      //set MainERC20 Contract Instance
      const ERC20contractCF1 = await ethers.getContractFactory("TestERC20");
      const ERC20contract1 = await ERC20contractCF1.connect(MainOwner).deploy("Token1", "TK1", 1000000000 );
      MainERC20 = ERC20contract1;
      //set MainERC20 Contract Instance
      const ERC20contractCF2 = await ethers.getContractFactory("TestERC20");
      const ERC20contract2 = await ERC20contractCF2.connect(MainOwner).deploy("Token2", "TK2", 1000000000 );
      SecondaryERC20 = ERC20contract2;
  
    })

  describe("Testing Direct Donation Instance List.", () => {
    
    var DirectDonationAddressList : string[] = [];

    describe("createDirectDonation()", async function () {
        it("proper creation of DirectDonation Contract Instance", async function () {
            const returns  = await MainDDManager.connect(MainOwner).createDirectDonation();
            const receipt = await returns.wait();
            const contractCreationLog = receipt.events?.filter( item => { return (item.event === "LogCreateDirectDonation" ? true : false ); });
            const createdInstanceAddress = contractCreationLog?.at(0)?.args?.flat()[1];
            DirectDonationAddressList.push(createdInstanceAddress);
            const DirectDonation = new ethers.Contract(createdInstanceAddress,directDonationABI,MainOwner);
            expect(await MainOwner.getAddress()).to.equal(contractCreationLog?.at(0)?.args?.flat()[0])
        })
    });
    describe("removeDirectDonation(address key)", async function () {
        it("proper removal of DirectDonation Contract Instance", async function () {
            const mainDirectDonation = new ethers.Contract(DirectDonationAddressList[0],directDonationABI,MainOwner);
            const returns = await MainDDManager.removeDirectDonation(mainDirectDonation.address);
            const receipt = await returns.wait();
            const contractRemovalLog = receipt.events?.filter( item => { return (item.event === "LogRemoveDirectDonation" ? true : false ); });
            const removedInstanceAddress = contractRemovalLog?.at(0)?.args?.flat()[1];
            expect(DirectDonationAddressList.pop()).to.equal(removedInstanceAddress);
        })
    });

    describe("getDirectionDonationCount()", async function () {
        it("proper return of count at 0", async function () {

            expect(await MainDDManager.getDirectionDonationCount()).to.equal(0);
        
        })

        it("proper return of count at 1 after created instance", async function () {
            const returns  = await MainDDManager.connect(MainOwner).createDirectDonation();
            const receipt = await returns.wait();
            const contractCreationLog = receipt.events?.filter( item => { return (item.event === "LogCreateDirectDonation" ? true : false ); });
            const createdInstanceAddress = contractCreationLog?.at(0)?.args?.flat()[1];
            DirectDonationAddressList.push(createdInstanceAddress);
            const DirectDonation = new ethers.Contract(createdInstanceAddress,directDonationABI,MainOwner);
            expect(await MainDDManager.getDirectionDonationCount()).to.equal(1);
        })

    });

    describe("getDirectionDonationList()", async function () {
        it("proper return current list", async function () { 
            const returns  = await MainDDManager.connect(MainOwner).getDirectionDonationList();
            expect(DirectDonationAddressList[0]).to.equal(returns[0]);
        })
    })


    describe("getDirectDonationAtIndex(uint index)", async function () {
        it("proper return current index 1", async function () { 
            const returns  = await MainDDManager.connect(MainOwner).getDirectDonationAtIndex(0);
            expect(DirectDonationAddressList[0]).to.equal(returns);
        })
    })

  });
});


// function createDirectDonation() external returns(address);
// function removeDirectDonation(address key) external;
// function getDirectionDonationCount() external returns(uint256);
// function getDirectionDonationList() external view  returns(address[] memory);
// function getDirectDonationAtIndex(uint index) external view returns( address ) ;

// event LogCreateDirectDonation(address indexed sender, address key); 
// event LogRemoveDirectDonation(address indexed sender, address key);



