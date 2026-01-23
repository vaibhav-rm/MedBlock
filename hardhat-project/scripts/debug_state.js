import hre from "hardhat";

async function main() {
    const doctorContractAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    // Addresses from user report
    const patientAddr = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
    const doctorAddr = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

    const doctorContract = await hre.ethers.getContractAt("DoctorManagement", doctorContractAddress);
    const patientContract = await hre.ethers.getContractAt("PatientManagement", patientContractAddress);

    console.log(`Checking State for:\nPatient: ${patientAddr}\nDoctor: ${doctorAddr}\n`);

    // 1. Check Patient Registration
    try {
        const p = await patientContract.getPatient(patientAddr);
        console.log(`[PatientContract] Patient Registered: YES (${p.username})`);
    } catch (e) {
        console.log(`[PatientContract] Patient Registered: NO (Error: ${e.message})`);
    }

    // 2. Check Doctor Registration
    try {
        const d = await doctorContract.getDoctor(doctorAddr);
        console.log(`[DoctorContract] Doctor Registered: YES (${d.username})`);
    } catch (e) {
        console.log(`[DoctorContract] Doctor Registered: NO (Error: ${e.message})`);
    }

    // 3. Check Access Expiry on Patient Contract
    const timestamp = await patientContract.accessExpiry(patientAddr, doctorAddr);
    console.log(`[PatientContract] Access Expiry: ${timestamp} (Current: ${Math.floor(Date.now() / 1000)})`);
    if (timestamp > Math.floor(Date.now() / 1000)) {
        console.log("-> Access is ACTIVE on Patient Side");
    } else {
        console.log("-> Access is EXPIRED/REVOKED on Patient Side");
    }

    // 4. Check Access Boolean on Doctor Contract
    const hasAccess = await doctorContract.isAuthorized(doctorAddr, patientAddr);
    console.log(`[DoctorContract] isAuthorized mapping: ${hasAccess}`);

    // 5. Check Doctor's Patient List
    const patients = await doctorContract.getAuthorizedPatients(doctorAddr);
    console.log(`[DoctorContract] Patients List for Doctor: [${patients.join(", ")}]`);

    const isInList = patients.map(a => a.toLowerCase()).includes(patientAddr.toLowerCase());
    console.log(`-> Is Patient in List? ${isInList ? "YES" : "NO"}`);

    if (hasAccess && !isInList) {
        console.error("CRITICAL STATE INCONSISTENCY: doctorPatientAccess is TRUE but Patient NOT in list!");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
