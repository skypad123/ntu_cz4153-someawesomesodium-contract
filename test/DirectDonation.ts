import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

import { expect } from "chai";
import { ethers } from "hardhat";

import { abi as directDonationABI } from "../artifacts/contracts/DirectDonation.sol/DirectDonation.json";

import { DirectDonation, TestERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { DirectDonation__factory } from "../typechain-types/factories/contracts/unimplemented_contracts/_DirectDonation.sol";
import { BigNumber } from "ethers";


describe("Testing DirectDonation Contract.", function () {

  var MainDirectDonation: DirectDonation;

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
    const DDcontractCF = await ethers.getContractFactory("DirectDonation");
    const DDcontract = await DDcontractCF.connect(MainOwner).deploy(await MainOwner.getAddress());
    MainDirectDonation = DDcontract;
    //set MainERC20 Contract Instance
    const ERC20contractCF1 = await ethers.getContractFactory("TestERC20");
    const ERC20contract1 = await ERC20contractCF1.connect(MainOwner).deploy("Token1", "TK1", 1000000000 );
    MainERC20 = ERC20contract1;
    //set MainERC20 Contract Instance
    const ERC20contractCF2 = await ethers.getContractFactory("TestERC20");
    const ERC20contract2 = await ERC20contractCF2.connect(MainOwner).deploy("Token2", "TK2", 1000000000 );
    SecondaryERC20 = ERC20contract2;

  })

  describe("Testing Contract Percentage List.", async function ()  {

    describe("createAllocation( address _walletAddress, uint32 _initPercentCount )", async function(){

      it("proper allocation set", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await MainDirectDonation.connect(MainOwner).createAllocation(mainOwnerAddress , BigInt(1000));
        const result = await MainDirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("1000");
      }) 

    });

    describe("addAllocation( address _walletAddress, uint32 _percentCount )", ()=>{

      it("proper allocation added", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await MainDirectDonation.connect(MainOwner).addAllocation( mainOwnerAddress , BigInt(100));
        const result = await MainDirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("1100");
      }) 
      
    });

    describe("subtractAllocation( address _walletAddress, uint32 _percentCount )", ()=>{
      
      it("proper allocation subtracted", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        await MainDirectDonation.connect(MainOwner).subtractAllocation( mainOwnerAddress , BigInt(1100));
        const result = await MainDirectDonation.getAllocationValue(mainOwnerAddress);
        expect(result.toString()).to.equal("0");
      }) 

    });

    describe("getAllocationValue( address _walletAddress ) returns(uint32)", ()=>{

      it("proper allocation returned", async function() {
        const otherOwnerAddress = await OtherOwners[0].getAddress();
        await MainDirectDonation.connect(MainOwner).createAllocation( otherOwnerAddress , BigInt(111111));
        const result = await MainDirectDonation.getAllocationValue(otherOwnerAddress);
        expect(result.toString()).to.equal("111111");
      }) 

      
    });

    describe("getAllocationSum() returns(uint32)", ()=>{

      it("proper allocation sum returned", async function() {
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await MainDirectDonation.connect(MainOwner).addAllocation( mainOwnerAddress  , BigInt(110011));
        await MainDirectDonation.connect(MainOwner).addAllocation( secondOwnerAddress , BigInt(111111));
        await MainDirectDonation.connect(MainOwner).createAllocation( thirdOwnerAddress , BigInt(0));
        const result = await MainDirectDonation.getAllocationSum();
        expect(result.toString()).to.equal("332233");
      }) 

    });

    describe("removeAllocation( address _walletAddress )", ()=>{

      it("proper removal of allocation from AddressList", async function () {
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await MainDirectDonation.connect(MainOwner).removeAllocation(mainOwnerAddress);
        const result = await MainDirectDonation.getWalletList();
        expect(result.toString()).to.equal(`${thirdOwnerAddress},${secondOwnerAddress}`);
      })
      
    });

    describe("getWalletList() returns( address[] memory)", ()=>{

      it("proper list of wallet returned", async function(){
        const mainOwnerAddress = await MainOwner.getAddress();
        const secondOwnerAddress = await OtherOwners[0].getAddress();
        const thirdOwnerAddress = await OtherOwners[1].getAddress();
        await MainDirectDonation.connect(MainOwner).createAllocation( mainOwnerAddress, BigInt(110011));
        const result = await MainDirectDonation.getWalletList();
        expect(result.toString()).to.equal(`${thirdOwnerAddress},${secondOwnerAddress},${mainOwnerAddress}`);
      })
      
    });
  });

  describe("Testing Accepted ERC20 List.", function() {
    

    describe("function setAcceptedERC20( address _tokenAddress )", ()=>{

      it("proper setting of ERC20 tokens", async function (){      
        const mainERC20Address = await MainERC20.address;
        await MainDirectDonation.connect(MainOwner).setAcceptedERC20(mainERC20Address);
        const result = await MainDirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(mainERC20Address);
      })
      
    });

    describe("function deleteAcceptedERC20( address _tokenAddress )", ()=>{

      it("proper deletion of ERC20 tokens", async function (){  
        const mainERC20Address = await MainERC20.address;
        const secondaryERC20Address = await SecondaryERC20.address;
        await MainDirectDonation.connect(MainOwner).setAcceptedERC20(secondaryERC20Address);
        await MainDirectDonation.connect(MainOwner).deleteAcceptedERC20(mainERC20Address);
        const result = await MainDirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(`${secondaryERC20Address}`);
      })
      
    });

    describe("function getAcceptedERC20List() returns( address[] memory )", ()=>{
      
      it("proper list of Accept ERC20 token address return", async function (){
        const mainERC20Address = await MainERC20.address;
        const secondaryERC20Address = await SecondaryERC20.address;
        await MainDirectDonation.connect(MainOwner).setAcceptedERC20(mainERC20Address);
        const result = await MainDirectDonation.getAcceptedERC20List();
        expect(result.toString()).to.equal(`${secondaryERC20Address},${mainERC20Address}`);
      })

    });
  });

  describe("Testing Function when Custodian Feature are True", function() {
    describe("Testing Donation Mechanism.", function() {

      beforeEach(async function(){
        await MainDirectDonation.connect(MainOwner).setCustodianFeature(true);

      })

      describe("donate()", ()=>{
        it("proper storage of ethers in contract", async function() {
          // const mainOwnerAddress = await MainOwner.getAddress();
          const mainDirectDonationAddress = await MainDirectDonation.address;
          // const perviousOwnerBalance = await ethers.provider.getBalance(mainOwnerAddress);
          const previousContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress);

          const options = {value: ethers.utils.parseEther("1.0")}
          await MainDirectDonation.connect(MainOwner)["donate()"](options);

          // const newOwnerBalance = await ethers.provider.getBalance(mainOwnerAddress);
          const newContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          // const sentAmountOwnerSide = newOwnerBalance.sub(perviousOwnerBalance);
          const sentAmountContractSide = newContractBalance.sub(previousContractBalance);
          expect(ethers.utils.parseEther("1.0")).to.equal(sentAmountContractSide.toString());
        });
        

      });
      describe("donate(address _tokenAddress, uint256 sum)", ()=>{

        it("proper storage of token in contract", async function() {
          const mainOwnerAddress = await MainOwner.getAddress();
          const mainERC20Address= await MainERC20.address;
          const mainDirectDonationAddress = await MainDirectDonation.address;
          
          const previousContractBalance= await MainERC20.balanceOf(mainDirectDonationAddress);
          await MainERC20.connect(MainOwner).increaseAllowance(mainDirectDonationAddress,1000000000);
          await MainDirectDonation.connect(MainOwner)["donate(address,uint256)"](mainERC20Address,1000000000);
          const newContractBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          const sentAmountContractSide = newContractBalance.sub(previousContractBalance);
          expect("1000000000").to.equal(sentAmountContractSide.toString());

        })
      });
    })
    describe("Testing Payout Mechanism.", function() {
      describe("payoutContractBalance(uint256 _sum)", ()=>{
        it("proper payout of ethers from contract", async function() {
          const mainOwnerAddress = await MainOwner.getAddress();
          const secondOwnerAddress = await OtherOwners[0].getAddress();
          const thirdOwnerAddress = await OtherOwners[1].getAddress();

          await MainDirectDonation.removeAllocation(mainOwnerAddress);
          await MainDirectDonation.removeAllocation(secondOwnerAddress);
          await MainDirectDonation.removeAllocation(thirdOwnerAddress);
          // 100% is 100 000 0000
          await MainDirectDonation.createAllocation(mainOwnerAddress, 500000000 );
          await MainDirectDonation.createAllocation(secondOwnerAddress, 250000000 );
          await MainDirectDonation.createAllocation(thirdOwnerAddress, 100000000 );

          const mainDirectDonationAddress = await MainDirectDonation.address;
          const previousContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          const previousSecondOwnerBalance = await ethers.provider.getBalance(secondOwnerAddress);
          const previousThirdOwnerBalance = await ethers.provider.getBalance(thirdOwnerAddress);

          await MainDirectDonation.connect(MainOwner)["payoutContractBalance(uint256)"](previousContractBalance);

          const newContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress); 
          const newSecondOwnerBalance = await ethers.provider.getBalance(secondOwnerAddress);
          const newThirdOwnerBalance = await ethers.provider.getBalance(thirdOwnerAddress);

          const expectedAmountContractSide = previousContractBalance.sub(previousContractBalance.mul(850000000).div(1000000000));
          const expectedAmountSecondaryOwnerSide = previousSecondOwnerBalance.add(previousContractBalance.mul(250000000).div(1000000000));
          const expectedAmountThirdOwnerSide = previousThirdOwnerBalance.add(previousContractBalance.mul(100000000).div(1000000000));

          expect(newSecondOwnerBalance).to.equal(expectedAmountSecondaryOwnerSide);
          expect(newThirdOwnerBalance).to.equal(expectedAmountThirdOwnerSide);
          expect(newContractBalance).to.equal(expectedAmountContractSide);
        })

      });
      describe("payoutContractBalance(address _tokenAddress, uint256 _sum)", ()=>{
        it("proper payout of token from contract", async function() {
          const mainOwnerAddress = await MainOwner.getAddress();
          const secondOwnerAddress = await OtherOwners[0].getAddress();
          const thirdOwnerAddress = await OtherOwners[1].getAddress();

          await MainDirectDonation.removeAllocation(mainOwnerAddress);
          await MainDirectDonation.removeAllocation(secondOwnerAddress);
          await MainDirectDonation.removeAllocation(thirdOwnerAddress);
          // 100% is 100 000 0000
          await MainDirectDonation.createAllocation(mainOwnerAddress, 500000000);
          await MainDirectDonation.createAllocation(secondOwnerAddress, 250000000);
          await MainDirectDonation.createAllocation(thirdOwnerAddress, 100000000);

          const mainERC20Address = await MainERC20.address;
          const mainDirectDonationAddress = await MainDirectDonation.address;
          const previousContractBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          const previousSecondOwnerBalance = await MainERC20.balanceOf(secondOwnerAddress);
          const previousThirdOwnerBalance = await MainERC20.balanceOf(thirdOwnerAddress);

          await MainDirectDonation.connect(MainOwner)["payoutContractBalance(address,uint256)"](mainERC20Address,previousContractBalance);

          const newContractBalance = await MainERC20.balanceOf(mainDirectDonationAddress); 
          const newSecondOwnerBalance = await MainERC20.balanceOf(secondOwnerAddress);
          const newThirdOwnerBalance = await MainERC20.balanceOf(thirdOwnerAddress);

          const expectedAmountContractSide = previousContractBalance.sub(previousContractBalance.mul(850000000).div(1000000000));
          const expectedAmountSecondaryOwnerSide = previousSecondOwnerBalance.add(previousContractBalance.mul(250000000).div(1000000000));
          const expectedAmountThirdOwnerSide = previousThirdOwnerBalance.add(previousContractBalance.mul(100000000).div(1000000000));

          expect(newContractBalance).to.equal(expectedAmountContractSide);
          expect(newSecondOwnerBalance).to.equal(expectedAmountSecondaryOwnerSide);
          expect(newThirdOwnerBalance).to.equal(expectedAmountThirdOwnerSide);
        })

      });
      describe("payoutAllContractBalance()", ()=>{
        it( "proper payout of both ethers and tokens", async function() {
          const mainOwnerAddress = await MainOwner.getAddress();
          const secondOwnerAddress = await OtherOwners[0].getAddress();
          const thirdOwnerAddress = await OtherOwners[1].getAddress();
  
          await MainDirectDonation.removeAllocation(mainOwnerAddress);
          await MainDirectDonation.removeAllocation(secondOwnerAddress);
          await MainDirectDonation.removeAllocation(thirdOwnerAddress);
          // 100% is 100 000 0000
          await MainDirectDonation.createAllocation(mainOwnerAddress, 500000000);
          await MainDirectDonation.createAllocation(secondOwnerAddress, 250000000);
          await MainDirectDonation.createAllocation(thirdOwnerAddress, 100000000);

          const mainERC20Address = await MainERC20.address;
          const mainDirectDonationAddress = await MainDirectDonation.address;
          const previousContractEthBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          const previousContractTokenBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          const previousSecondOwnerEthBalance = await ethers.provider.getBalance(secondOwnerAddress);
          const previousThirdOwnerTokenBalance = await MainERC20.balanceOf(thirdOwnerAddress);

          await MainDirectDonation.connect(MainOwner).payoutAllContractBalance();
          
          const newContractEthBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          const newContractTokenBalance = await MainERC20.balanceOf(mainDirectDonationAddress);  
          const newSecondOwnerEthBalance = await ethers.provider.getBalance(secondOwnerAddress);
          const newThirdOwnerTokenBalance = await MainERC20.balanceOf(thirdOwnerAddress);

          const expectedEthAmountContractSide = previousContractEthBalance.sub(previousContractEthBalance.mul(850000000).div(1000000000));
          const expectedTokenAmountContractSide = previousContractTokenBalance.sub(previousContractTokenBalance.mul(850000000).div(1000000000));
          const expectedEthAmountSecondaryOwnerSide = previousSecondOwnerEthBalance.add(previousContractEthBalance.mul(250000000).div(1000000000));
          const expectedTokenAmountThirdOwnerSide = previousThirdOwnerTokenBalance.add(previousContractTokenBalance.mul(100000000).div(1000000000));

          expect(newContractEthBalance).to.equal(expectedEthAmountContractSide);
          expect(newContractTokenBalance).to.equal(expectedTokenAmountContractSide);
          expect(newSecondOwnerEthBalance).to.equal(expectedEthAmountSecondaryOwnerSide);
          expect(newThirdOwnerTokenBalance).to.equal(expectedTokenAmountThirdOwnerSide);

        })
      });
    })
    describe("Testing Withdraw Mechanism", function() {
      describe("withdrawContractBalance()", ()=>{
        it("proper withdrawal of all ethers to owner", async function () {
            const mainDirectDonationAddress = await MainDirectDonation.address;
            await MainDirectDonation.connect(MainOwner)["withdrawContractBalance()"]();
            const newContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
            expect(newContractBalance).to.equal(0);

        })

      });
      describe("withdrawContractBalance(address _tokenAddress)", ()=>{
        it("proper withdrawal of all token to owner", async function(){
          const mainERC20Address = await MainERC20.address;
          const mainDirectDonationAddress = await MainDirectDonation.address;
          await MainDirectDonation.connect(MainOwner)["withdrawContractBalance(address)"](mainERC20Address);
          const newContractBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          expect(newContractBalance).to.equal(0);
        })
      });
      describe("withdrawAllContractBalance()", ()=>{
        it("proper withdrawal of all ether and tokens to Owner", async function(){

          const mainOwnerAddress = await MainOwner.getAddress();
          const mainERC20Address = await MainERC20.address;
          const secondaryERC20Address = await SecondaryERC20.address;
          const mainDirectDonationAddress = await MainDirectDonation.address;
        
          const options = {value: ethers.utils.parseEther("1.0")};
          await MainDirectDonation.connect(MainOwner)["donate()"](options);

          await MainERC20.connect(MainOwner).increaseAllowance(mainDirectDonationAddress,1000000);
          await MainDirectDonation["donate(address,uint256)"](mainERC20Address,1000000);
          
          await SecondaryERC20.connect(MainOwner).increaseAllowance(mainDirectDonationAddress,100000);
          await MainDirectDonation["donate(address,uint256)"](secondaryERC20Address,100000);


          const previousMainContractEthBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          //console.log(previousMainContractEthBalance);
          const previousMainContractMainTokenBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          //console.log(previousMainContractMainTokenBalance);
          const previousMainContractSecondaryTokenBalance = await SecondaryERC20.balanceOf(mainDirectDonationAddress);
          //console.log(previousMainContractSecondaryTokenBalance);
        
          // expect(previousMainContractEthBalance).to.not.equal(0);
          // expect(previousMainContractMainTokenBalance).to.not.equal(0);
          // expect(previousMainContractSecondaryTokenBalance).to.not.equal(0);

          await MainDirectDonation.connect(MainOwner).withdrawAllContractBalance();
          
          const newEthContractBalance = await ethers.provider.getBalance(mainDirectDonationAddress);
          expect(newEthContractBalance).to.equal(0);

          const newMainTokenContractBalance = await MainERC20.balanceOf(mainDirectDonationAddress);
          expect(newEthContractBalance).to.equal(0);

          const newSecondaryContractBalance = await SecondaryERC20.balanceOf(mainDirectDonationAddress);
          expect(newSecondaryContractBalance).to.equal(0);

        })

      });
    })
  });

  describe("Testing Function when Custodian Feature are False", function() {
    describe("Testing Donation Mechanism.", function() {
      it("donate()", ()=>{


      });
      it("donate(address _tokenAddress, uint256 sum)", ()=>{

      });
    
    })
  })



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

