import hre from "hardhat";

async function main() {
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";
    const doctorAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    // The address that actually sent the TX
    const actualSender = "0x8dF4011360D127b3EA020cD2664C838E8c658118";

    const patientContract = await hre.ethers.getContractAt("PatientManagement", patientContractAddress);

    console.log(`Checking Access for ACTUAL Sender: ${actualSender}`);

    const timestamp = await patientContract.accessExpiry(actualSender, doctorAddr);
    console.log(`Access Expiry: ${timestamp} (Current: ${Math.floor(Date.now() / 1000)})`);

    if (timestamp > Math.floor(Date.now() / 1000)) {
        console.log("-> Access is ACTIVE for this sender.");
    } else {
        console.log("-> Access is NOT active.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
