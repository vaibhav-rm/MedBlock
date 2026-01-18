import hre from "hardhat";

async function main() {
    // Sepolia Addresses
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    // REPLACE THESE WITH YOUR ACTUAL ADDRESSES FROM THE UI
    const doctorAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    const patientAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

    if (doctorAddress === "YOUR_DOCTOR_ADDRESS_HERE") {
        console.error("Please update the script with actual addresses before running.");
        return;
    }

    console.log(`Checking access for Patient: ${patientAddress} -> Doctor: ${doctorAddress}`);

    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(patientContractAddress);

    // Check Access Expiry
    const expiry = await patientContract.accessExpiry(patientAddress, doctorAddress);
    console.log("Access Expiry Timestamp:", expiry.toString());

    const currentBlock = await hre.ethers.provider.getBlock("latest");
    console.log("Current Block Timestamp:", currentBlock.timestamp);

    if (expiry > BigInt(currentBlock.timestamp)) {
        console.log("✅ Access is ACTIVE");
    } else {
        console.log("❌ Access is EXPIRED or NEVER GRANTED");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
