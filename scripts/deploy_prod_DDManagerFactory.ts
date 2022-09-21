import { ethers  } from "hardhat";

import { DDManagerFactory} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"


async function main() {

  var MainDDManagerFactory: DDManagerFactory;

  const accounts = await ethers.getSigners();
  const MainOwner = accounts[0];


  //set DDManager Contract Instance
  const DDManagerFactoryContractCF = await ethers.getContractFactory("DDManagerFactory");
  const DDManagerFactoryContract = await DDManagerFactoryContractCF.connect(MainOwner).deploy();
  MainDDManagerFactory = DDManagerFactoryContract;
  console.log("DirectDonationManagerFactoryContract");
  console.log(await MainDDManagerFactory.address);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
