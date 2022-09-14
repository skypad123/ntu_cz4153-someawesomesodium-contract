import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import { expect } from "chai";
import { ethers } from "hardhat";

import { abi as directDonationABI } from "../artifacts/contracts/DirectDonation.sol/DirectDonation.json";

import { DirectDonation, IERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { ERC20 } from "../typechain-types/@openzeppelin/contracts/token/ERC20/ERC20";
import { Contract } from "hardhat/internal/hardhat-network/stack-traces/model";


describe("Testing DirectDonation Contract.", function () {

  var DirectDonation: DirectDonation;
  var MainOwner: SignerWithAddress;
  var OtherOwners: SignerWithAddress[];

  before( async function(){
    const accounts = await ethers.getSigners();
    const contractCF = await ethers.getContractFactory("DirectDonation");
    const contract = await contractCF.deploy(await accounts[0].getAddress());
    await contract.deployed()
 
    DirectDonation = contract;
    MainOwner = accounts[0];
    OtherOwners = accounts.slice(1);
  })

  describe("Testing Contract Percentage List.", async function ()  {

    describe("createAllocation( address _walletAddress, uint32 _initPercentCount )", async function(){

      it("proper allocation set", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await DirectDonation.connect(MainOwner).createAllocation(mainOwnerAddress , BigInt(1000));
        const result = await DirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("1000");
      }) 

    });

    describe("addAllocation( address _walletAddress, uint32 _percentCount )", ()=>{

      it("proper allocation added", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await DirectDonation.connect(MainOwner).addAllocation( mainOwnerAddress , BigInt(100));
        const result = await DirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("1100");
      }) 
      
    });

    describe("subtractAllocation( address _walletAddress, uint32 _percentCount )", ()=>{
      
      it("proper allocation subtracted", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await DirectDonation.connect(MainOwner).subtractAllocation( mainOwnerAddress , BigInt(1100));
        const result = await DirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("0");
      }) 

    });

    describe("getAllocationValue( address _walletAddress ) returns(uint32);", ()=>{

      it("proper allocation returned", async function() {
        const otherOwnerAddress = await OtherOwners[0].getAddress();
        await DirectDonation.connect(MainOwner).createAllocation( otherOwnerAddress , BigInt(111111));
        const result = await DirectDonation.getAllocationValue(otherOwnerAddress);
        expect(result.toString()).to.equal("111111");
      }) 

      
    });

    describe("getAllocationSum() returns(uint32)", ()=>{

      it("proper allocation sum returned", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await DirectDonation.connect(MainOwner).addAllocation( mainOwnerAddress  , BigInt(110011));
        await DirectDonation.connect(MainOwner).addAllocation( secondOwnerAddress , BigInt(111111));
        await DirectDonation.connect(MainOwner).createAllocation( thirdOwnerAddress , BigInt(0));
        const result = await DirectDonation.getAllocationSum();
        expect(result.toString()).to.equal("332233");
      }) 

    });

    describe("removeAllocation( address _walletAddress )", ()=>{

      it("proper removal of allocation from AddressList", async function () {
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await DirectDonation.connect(MainOwner).removeAllocation(mainOwnerAddress);
        const result = await DirectDonation.getWalletList();
        expect(result.toString()).to.equal(`${thirdOwnerAddress},${secondOwnerAddress}`);
      })
      
    });

    describe("getWalletList() returns( address[] memory)", ()=>{

      it("proper list of wallet returned", async function(){
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await DirectDonation.connect(MainOwner).createAllocation( mainOwnerAddress, BigInt(110011));
        const result = await DirectDonation.getWalletList();
        expect(result.toString()).to.equal(`${thirdOwnerAddress},${secondOwnerAddress},${mainOwnerAddress}`);
      })
      
    });
  })

  describe("Testing Accepted ERC20 List.", function() {
    
    var mainERC20Address: string;
    var secondaryERC20Address: string;

    describe("function setAcceptedERC20( address _tokenAddress )", ()=>{

      it("proper setting of ERC20 tokens return", async function (){      
        const ERC20CF = await ethers.getContractFactory("TestERC20");
        const mainERC20 = await ERC20CF.deploy("main", "C1", BigInt(1000000000));
        mainERC20Address = await mainERC20.address;
        await DirectDonation.connect(MainOwner).setAcceptedERC20(mainERC20Address);
        const result = await DirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(mainERC20Address);
      })
      
    });

    describe("function deleteAcceptedERC20( address _tokenAddress )", ()=>{

      it("proper deletion of ERC20 tokens return", async function (){      
        const ERC20CF = await ethers.getContractFactory("TestERC20");
        const secondaryERC20 = await ERC20CF.deploy("secondary", "C2", BigInt(1000000000));
        secondaryERC20Address = await secondaryERC20.address;
        await DirectDonation.connect(MainOwner).setAcceptedERC20(secondaryERC20Address);
        await DirectDonation.connect(MainOwner).deleteAcceptedERC20(mainERC20Address);
        const result = await DirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(`${secondaryERC20Address}`);
      })  
      
    });

    describe("function getAcceptedERC20List() returns( address[] memory )", ()=>{
      
      it("proper list of Accept ERC20 token address return", async function (){
        const ERC20CF = await ethers.getContractFactory("TestERC20");
        const mainERC20 = await ERC20CF.deploy("main", "C1", BigInt(1000000000));
        mainERC20Address = await mainERC20.address;
        await DirectDonation.connect(MainOwner).setAcceptedERC20(mainERC20Address);
        const result = await DirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(`${secondaryERC20Address},${mainERC20Address}`);
      })

    });
  })

  describe("Testing Function when Custodian Feature are True", function() {
    describe("Testing Donation Mechanism.", function() {
      it("donate()", ()=>{

      });
      it("donate(address _tokenAddress, uint256 sum)", ()=>{

      });
    })
    describe("Testing Payout Mechanism.", function() {
      it("payoutContractBalance(uint256 _sum)", ()=>{

      });
      it("payoutContractBalance(address _tokenAddress, uint256 _sum)", ()=>{

      });
      it("payoutAllContractBalance()", ()=>{

      });
    })
    describe("Testing Withdraw Mechanism", function() {
      it("withdrawContractBalance()", ()=>{

      });
      it("withdrawContractBalance(address _tokenAddress)", ()=>{

      });
      it("withdrawAllContractBalance()", ()=>{

      });
    })
  })

  describe("Testing Function when Custodian Feature are False", function() {
    describe("Testing Donation Mechanism.", function() {
      it("donate()", ()=>{

      });
      it("donate(address _tokenAddress, uint256 sum)", ()=>{

      });
    })
    describe("Testing Payout Mechanism.", function() {
      it("payoutContractBalance(uint256 _sum)", ()=>{

      });
      it("payoutContractBalance(address _tokenAddress, uint256 _sum)", ()=>{

      });
      it("payoutAllContractBalance()", ()=>{

      });
    })
    describe("Testing Withdraw Mechanism.", function() {
      it("withdrawContractBalance()", ()=>{

      });
      it("withdrawContractBalance(address _tokenAddress)", ()=>{

      });
      it("withdrawAllContractBalance()", ()=>{
        
      });
    })
  })







  // describe("Deployment", () => {
  //   it("Should return address of new DirectDonation", async function () {
  //     const { directDonationFactory, owner } = await loadFixture(deploy);
  //     const returns  = await directDonationFactory.createDirectDonationContractInstance();
  //     const receipt = await returns.wait();
  //     const contractCreationLog = receipt.events?.filter( item => { return (item.event === "ContractInstanceCreation" ? true : false ); });

  //     const createdInstanceAddress = contractCreationLog?.at(0)?.args?.flat()[1];
  //     const directDonation = new ethers.Contract(createdInstanceAddress,directDonationABI,owner);
  //     const instanceOwner = await directDonation.owner();

  //     expect(instanceOwner.toString()).to.equal(owner.address);
  //   });
  // });
});





  //   it("Should receive and store the funds to lock", async function () {
  //     const { lock, lockedAmount } = await loadFixture(
  //       deployOneYearLockFixture
  //     );

  //     expect(await ethers.provider.getBalance(lock.address)).to.equal(
  //       lockedAmount
  //     );
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });

