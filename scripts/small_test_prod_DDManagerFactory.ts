import { ethers  } from "hardhat";
import { abi as DDManagerFactoryABI } from "../artifacts/contracts/DDManagerFactory.sol/DDManagerFactory.json";
import { DDManagerFactory} from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"


async function main() {

  const accounts = await ethers.getSigners();
  const MainOwner = accounts[0];

  //goerli testnet
  // const DDManagerFactory = new ethers.Contract("0x5c71955c7788eC0d90C7De6207BcA2747A30E91b",DDManagerFactoryABI);
  //local testnet
  const DDManagerFactory = new ethers.Contract("0x4F754F19524852cE06bCD31B7B9e3F0Dd81677b4",DDManagerFactoryABI);
  //set DDManager Contract Instance
  const returns = await DDManagerFactory.connect(MainOwner).createMyDDManager();
  const receipt = await returns.wait();
  console.log(receipt); 

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
