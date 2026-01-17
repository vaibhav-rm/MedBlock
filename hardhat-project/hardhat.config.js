import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
    solidity: "0.8.24",
    networks: {
        localhost: {
            url: "http://127.0.0.1:8545"
        },
        hardhat: {
            accounts: {
                mnemonic: process.env.SEED_PHRASE,
            },
        },
        sepolia: {
            url: process.env.SEPOLIA_RPC_URL || "",
            accounts: {
                mnemonic: process.env.SEED_PHRASE,
            },
        },
    },
};
