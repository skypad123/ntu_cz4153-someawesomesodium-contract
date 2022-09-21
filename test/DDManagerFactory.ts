import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { DDManagerFactory, DDManager, DirectDonation ,TestERC20 } from "../typechain-types";
import { abi as directDonationABI } from "../artifacts/contracts/DirectDonation.sol/DirectDonation.json";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";

describe("Testing DirectDonationFactory Contract.", function () {

    var MainDDManagerFactory: DDManagerFactory;

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
      const DDManagerContractFactoryCF = await ethers.getContractFactory("DDManagerFactory");
      const DDManagerContractFactory = await DDManagerContractFactoryCF.connect(MainOwner).deploy();
      MainDDManagerFactory = DDManagerContractFactory;
      //set MainERC20 Contract Instance
      const ERC20contractCF1 = await ethers.getContractFactory("TestERC20");
      const ERC20contract1 = await ERC20contractCF1.connect(MainOwner).deploy("Token1", "TK1", 1000000000 );
      MainERC20 = ERC20contract1;
      //set MainERC20 Contract Instance
      const ERC20contractCF2 = await ethers.getContractFactory("TestERC20");
      const ERC20contract2 = await ERC20contractCF2.connect(MainOwner).deploy("Token2", "TK2", 1000000000 );
      SecondaryERC20 = ERC20contract2;
  
    })

  describe("Testing Direct Donation Manger Mapping and Creation.", () => {
    
    var DDManagerAddressList : string[] = [];

    describe("createMyDDManager()", async function () {
        it("proper creation of DirectDonation Manager Contract Instance", async function () {
            const returns  = await MainDDManagerFactory.connect(MainOwner).createMyDDManager();
            const receipt = await returns.wait();
            const contractCreationLog = receipt.events?.filter( item => { return (item.event === "LogDDManagerCreation" ? true : false ); });
            const createdInstanceAddress = contractCreationLog?.at(0)?.args?.flat()[1];
            DDManagerAddressList.push(createdInstanceAddress);
            const DirectDonation = new ethers.Contract(createdInstanceAddress,directDonationABI,MainOwner);
            expect(await MainOwner.getAddress()).to.equal(contractCreationLog?.at(0)?.args?.flat()[0])
        })
    });

    describe("myDDManagerExist()", async function () {
      it("proper boolean value of existence", async function () {
          const returns  = await MainDDManagerFactory.connect(MainOwner).myDDManagerExist();
          expect(returns).to.equal(true);
        })
    });

    describe("getMyDDManager()", async function () {
      it("proper boolean value of existence", async function () {
          const returns  = await MainDDManagerFactory.connect(MainOwner).getMyDDManager();
          expect(returns).to.equal(DDManagerAddressList.pop());
        })
    });



  });
});


// function myDDManagerExist() external view returns(bool);
// function getMyDDManager() external view returns(address);
// function createMyDDManager() external returns(address);

// event LogDDManagerCreation( address indexed _contractOwner, address _contractAddress);
