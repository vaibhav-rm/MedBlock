import hre from "hardhat";

async function main() {
    // Sepolia Addresses
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    // Check for both casings to be super sure, though they should be same.
    const patientWallet = "0x8dF4011360D127b3EA020cD2664C838E8c658118"; // The expected patient

    console.log(`Checking Medical Records for: ${patientWallet}`);

    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(patientContractAddress);

    // 1. Check raw array length
    // We can't easily get length of a public mapping array via getter in ethers v6 without specific getter, 
    // but the contract might have 'getMedicalRecords' or 'patientRecords(addr, index)'

    try {
        const records = await patientContract.getMedicalRecords(patientWallet);
        console.log(`Total Records found: ${records.length}`);

        if (records.length === 0) {
            console.log("❌ No records found on chain.");
        } else {
            records.forEach((r, i) => {
                console.log(`[${i}] CID: ${r.ipfsHash}, Title: ${r.title}, Active: ${r.isActive}, Doctor: ${r.doctor}`);
            });
        }
    } catch (e) {
        console.error("Error fetching records:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
