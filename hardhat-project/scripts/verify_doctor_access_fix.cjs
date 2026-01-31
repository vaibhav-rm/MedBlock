const hre = require("hardhat");

async function main() {
    const [admin, doctor, patient, other] = await hre.ethers.getSigners();

    console.log("Deploying contracts...");

    // Deploy Doctor Contract
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = await DoctorManagement.deploy();
    await doctorContract.waitForDeployment();
    const doctorAddress = await doctorContract.getAddress();
    console.log("DoctorManagement deployed to:", doctorAddress);

    // Deploy Patient Contract
    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = await PatientManagement.deploy();
    await patientContract.waitForDeployment();
    const patientContractAddr = await patientContract.getAddress();
    console.log("PatientManagement deployed to:", patientContractAddr);

    // Link Contracts
    await doctorContract.setPatientContractAddress(patientContractAddr);
    await patientContract.setDoctorContractAddress(doctorAddress);

    console.log("Contracts linked.");

    // 1. Register Doctor
    console.log("\n--- Registering Doctor ---");
    await doctorContract.connect(admin).registerDoctor(doctor.address, "Dr. Smith", "Cardiologist");
    console.log("Doctor registered:", doctor.address);

    // 2. Register Patient
    console.log("\n--- Registering Patient ---");
    await patientContract.connect(admin).registerPatient(patient.address, "John Doe", "Patient");
    console.log("Patient registered:", patient.address);

    // 3. Verify Initial State (No Access)
    console.log("\n--- Verifying Initial Access ---");
    let authorizedPatients = await doctorContract.getAuthorizedPatients(doctor.address);
    console.log("Authorized Patients (Expect Empty):", authorizedPatients);
    if (authorizedPatients.length !== 0) throw new Error("Should expect 0 patients initially");

    // 4. Grant Access
    console.log("\n--- Granting Access ---");
    // Patient grants access (auto-synced to DoctorContract via grantAccess -> addPatientAccess)
    await patientContract.connect(patient).grantAccess(doctor.address, 3600);
    console.log("Access granted by patient.");

    // 5. Verify Access
    console.log("\n--- Verifying Access Granted ---");
    authorizedPatients = await doctorContract.getAuthorizedPatients(doctor.address);
    console.log("Authorized Patients:", authorizedPatients);

    if (authorizedPatients.length === 1 && authorizedPatients[0] === patient.address) {
        console.log("SUCCESS: Patient found in authorized list.");
    } else {
        throw new Error("FAILED: Patient NOT found in authorized list.");
    }

    // 6. Revoke Access
    console.log("\n--- Revoking Access ---");
    await patientContract.connect(patient).revokeAccess(doctor.address);
    console.log("Access revoked by patient.");

    // 7. Verify Revocation
    console.log("\n--- Verifying Access Revoked ---");
    authorizedPatients = await doctorContract.getAuthorizedPatients(doctor.address);
    console.log("Authorized Patients:", authorizedPatients);

    if (authorizedPatients.length === 0) {
        console.log("SUCCESS: Patient removed from authorized list.");
    } else {
        throw new Error("FAILED: Patient still in authorized list.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
