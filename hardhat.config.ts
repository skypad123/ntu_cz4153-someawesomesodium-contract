import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    goerli_testnet: {
        url: process.env.INFURA_URL_PROVIDER,
        accounts: [`0x${process.env.GOERLI_PVT_KEY}`],
        gasPrice: 5000000000000000000000
    },
    local_testnet: {
      url: `http://192.168.1.98:7545`,
      accounts: [`0x` + "e07ebd366f038ec838c253ce1610af2214a037e1671f4c0ed945bf5177c46dce"],
      gasPrice: 1000
  },
  }
};

export default config;
