require('babel-register');
require('babel-polyfill');
require('dotenv').config();
// const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    // ropsten: {
    //     provider: () => new HDWalletProvider('762e3cfd89a5b3084a7ed40af331b69859f2f4f0b20e586289a1930694d92da5',"wss://ropsten.infura.io/ws/v3/a95eb1e15fd94fec9325e85a5598ca94"),
     
    //   network_id: 3
    // }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
