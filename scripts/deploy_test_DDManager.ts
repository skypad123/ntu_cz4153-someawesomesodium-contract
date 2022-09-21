import { ethers } from "hardhat";

import { DDManager, TestERC20 } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"


async function main() {

  var MainDDManager: DDManager;

  var MainERC20: TestERC20;
  var SecondaryERC20: TestERC20;

  var MainOwner: SignerWithAddress;
  var OtherOwners: SignerWithAddress[];

  const accounts = await ethers.getSigners();
  MainOwner = accounts[0];
  OtherOwners = accounts.slice(1);

  //set DDManager Contract Instance
  const DDManagerContractCF = await ethers.getContractFactory("DDManager");
  const DDManagerContract = await DDManagerContractCF.connect(MainOwner).deploy(await MainOwner.getAddress());
  MainDDManager = DDManagerContract;
  console.log("DirectDonationManagerContract");
  console.log(await MainDDManager.address);
  //set MainERC20 Contract Instance
  const ERC20contractCF1 = await ethers.getContractFactory("TestERC20");
  const ERC20contract1 = await ERC20contractCF1.connect(MainOwner).deploy("Token1", "TK1", 1000000000 );
  MainERC20 = ERC20contract1;
  console.log("Erc20 main");
  console.log(await MainERC20.address);
  //set MainERC20 Contract Instance
  const ERC20contractCF2 = await ethers.getContractFactory("TestERC20");
  const ERC20contract2 = await ERC20contractCF2.connect(MainOwner).deploy("Token2", "TK2", 1000000000 );
  SecondaryERC20 = ERC20contract2;
  console.log("Erc20 secondary");
  console.log(await SecondaryERC20.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
