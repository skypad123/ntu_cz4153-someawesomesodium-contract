import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    goerli_testnet: {
        url: `https://goerli.infura.io/v3/<your infura node endpoint>`,
        accounts: [`0x` + "<your private key>"],
        gasPrice: 1000
    },
  }
};

export default config;
