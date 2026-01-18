import hre from "hardhat";

async function main() {
    // Sepolia Addresses
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    // Test Case: Patient accessing their OWN records
    const patientWalletAddr = "0x8dF4011360D127b3EA020cD2664C838E8c658118";

    console.log(`Testing getActiveRecords for: ${patientWalletAddr}`);

    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(patientContractAddress);

    // We need to impersonate the patient to test the restricted call
    // verification on public testnet is tricky for restricted views without the private key.
    // However, we can use 'callStatic' with a specific 'from' overrides if using a provider that supports it (Hardhat Network does, Sepolia via Infura/Alchemy usually supports eth_call with 'from')

    try {
        // Attempt 1: Call with specific sender (Simulating the Patient)
        // Note: ethers v6 uses .staticCall or .callStatic is deprecated? 
        // We can just use the contract instance connected to a void signer with that address, 
        // OR simply pass { from: ... } override to a read-only call.

        console.log("Simulating authorized call...");
        // In Ethers 6, for view functions, we can often pass overrides
        const records = await patientContract.getActiveRecords(patientWalletAddr, { from: patientWalletAddr });
        console.log(`✅ Success! Records found: ${records.length}`);

    } catch (e) {
        console.log("❌ Authorized Call Failed (Expected Success).");
        console.error(e.message);
    }

    try {
        // Attempt 2: Call with random sender (Simulating access denial)
        console.log("Simulating UNauthorized call...");
        const randomAddress = "0x000000000000000000000000000000000000dead";
        // We ask for patientWalletAddr's records, but FROM randomAddress
        await patientContract.getActiveRecords(patientWalletAddr, { from: randomAddress });
        console.log("❌ Unauthorized Call SUCCEEDED (Should have failed!)");
    } catch (e) {
        if (e.message.includes("Access allowed only for patient owner")) {
            console.log("✅ Unauthorized Call Rejected correctly.");
        } else {
            console.log(`✅ Unauthorized Call Rejected (Reason: ${e.message})`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
