import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  networks: {
    // goerli_testnet: {
    //     url: process.env.INFURA_URL_PROVIDER,
    //     accounts: [`0x${process.env.GOERLI_PVT_KEY}`],
    //     gasPrice: 500000000
    // },
    local_testnet: {
        url: `http://127.0.0.1:8545/`,
        accounts: ["0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"],
        gasPrice: 900000000
    },
    local_ganache_testnet: {
      url: `http://127.0.0.1:7545/`,
      accounts: ["0x3b2f7331c84181e14ad4dca42166dbfa01949e4f44a0cd4a5d4704101b91dba1"],
      gasPrice: 900000000
  },
  }
};

export default config;
