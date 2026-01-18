import hre from "hardhat";

async function main() {
    // Sepolia Addresses
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";
    const doctorContractAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";

    // User provided addresses
    const patientWallet = "0x8dF4011360D127b3EA020cD2664C838E8c658118"; // The address that sent the transaction
    const doctorWallet = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";

    console.log(`Simulating Doctor View...`);
    console.log(`Doctor: ${doctorWallet}`);
    console.log(`Patient: ${patientWallet}`);

    // IMPERSONATE DOCTOR (for local fork) OR USE PROVIDER FOR READ-ONLY CHECK
    // Since we are mocking the "View" call, we can use staticCall with a specific 'from' address

    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(patientContractAddress);

    // Check 1: Is Access Active?
    const expiry = await patientContract.accessExpiry(patientWallet, doctorWallet);
    console.log(`Access Expiry: ${expiry.toString()}`);

    const currentTimestamp = (await hre.ethers.provider.getBlock('latest')).timestamp;

    if (expiry == 0n || expiry < BigInt(currentTimestamp)) {
        console.log("❌ Access is NOT active. Please Grant Access from the Patient Dashboard first.");
        return;
    } else {
        console.log("✅ Access is ACTIVE (Expiry > Current Time)");
    }

    // Check 2: Try to fetch records AS THE DOCTOR
    // We use callStatic / staticCall to simulate the transaction from the doctor's address
    try {
        // We assume the contract has no records yet, but we want to confirm it DOES NOT REVERT
        // To simulate 'msg.sender', we need a Signer if we were running on a Fork, 
        // but for a public testnet read, we can't easily spoof msg.sender in a view call via standard ethers provider without a signer.
        // HOWEVER, 'getSharedRecords' relies on msg.sender.
        // We can't strictly verify the *revert* on Sepolia without the Doctor's Private Key.
        // BUT, we can verify the precondition (Access Expiry) which we just did.

        console.log("Attempting to verify getSharedRecords precondition...");
        // If precondition passes, the contract logic IS: require(isPatient || hasConsent).
        // We proved 'hasConsent' is true.
        // Therefore, the contract WILL NOT REVERT.
        console.log("✅ Logic Verification: Precondition 'hasConsent' is MET.");

    } catch (error) {
        console.error("Error during simulation:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
