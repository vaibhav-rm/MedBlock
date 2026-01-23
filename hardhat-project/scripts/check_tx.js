import hre from "hardhat";

async function main() {
    const txHash = "0xc89b539c0ed65d87c8aec50e5de77bec8efea376a525b9586b66bfaed56b37f3";
    console.log(`Fetching receipt for: ${txHash}`);

    try {
        const tx = await hre.ethers.provider.getTransaction(txHash);
        if (!tx) {
            console.log("Transaction NOT FOUND on this network.");
            return;
        }
        console.log(`Transaction found!`);
        console.log(`To: ${tx.to}`);
        console.log(`From: ${tx.from}`);

        const receipt = await hre.ethers.provider.getTransactionReceipt(txHash);
        console.log(`Status: ${receipt.status} (1=Success, 0=Revert)`);
        console.log(`Block Number: ${receipt.blockNumber}`);
        console.log(`Logs: ${receipt.logs.length}`);

        // Decode logs if possible
        const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";
        if (tx.to && tx.to.toLowerCase() === patientContractAddress.toLowerCase()) {
            console.log("Transaction was sent to CORRECT PatientContract.");
        } else {
            console.log(`WARNING: Transaction sent to ${tx.to}, EXPECTED ${patientContractAddress}`);
        }

    } catch (error) {
        console.error("Error fetching receipt:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
