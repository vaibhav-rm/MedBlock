const hre = require("hardhat");

const DOCTOR_ADDRESS = "0xc1c904b15285bA936F59ba4936F2C89e9E52ce14";
const PATIENT_ADDRESS = "0x848a9488C5C420B20B4082cCbf2598D103E5Dc94";
const INSURANCE_ADDRESS = "0x5663A9109B4a38102D92a4ee3BE1Be8347Af7173";
const RESEARCHER_ADDRESS = "0x2dB1cDB83F7798279016000a3968E889551D280A";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Running debug script with account:", deployer.address);

    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(DOCTOR_ADDRESS);

    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(PATIENT_ADDRESS);

    // 1. Check if Doctor Contract Address is set in Patient Contract
    const linkedDocAddress = await patientContract.doctorContractAddress();
    console.log(`PatientContract.doctorContractAddress: ${linkedDocAddress}`);
    console.log(`Expected: ${DOCTOR_ADDRESS}`);

    if (linkedDocAddress.toLowerCase() !== DOCTOR_ADDRESS.toLowerCase()) {
        console.error("MISMATCH! Doctor contract is NOT linked correctly.");
    } else {
        console.log("SUCCESS: Doctor contract is linked.");
    }

    // 2. We need a Doctor Address to test.
    // Let's print all doctors.
    const allDoctors = await doctorContract.getAllDoctors();
    console.log("Registered Doctors:", allDoctors);

    if (allDoctors.length > 0) {
        const testDoctor = allDoctors[0];
        console.log(`Testing with Doctor: ${testDoctor}`);

        const docDetails = await doctorContract.getDoctor(testDoctor);
        console.log("Doctor Details:", docDetails);

        // 3. Check if PatientContract sees this doctor as registered (via internal call check)
        // We can't call internal functions, but we can call getSharedRecords impersonating this doctor.
        // But we need a patient first.
        const allPatients = await patientContract.getAllPatients();
        console.log("Registered Patients:", allPatients);

        if (allPatients.length > 0) {
            const testPatient = allPatients[0];
            console.log(`Testing with Patient: ${testPatient}`);

            // Impersonate Doctor to call getSharedRecords
            // This requires Hardhat Network
            try {
                const impersonatedSigner = await hre.ethers.getImpersonatedSigner(testDoctor);
                const records = await patientContract.connect(impersonatedSigner).getSharedRecords(testPatient);
                console.log("getSharedRecords result:", records);
            } catch (e) {
                console.log("Impersonation failed or call reverted. If on Sepolia, this is expected.");
                console.error("Error calling getSharedRecords:", e.message);

                // Try raw call if impersonation fails (e.g. Sepolia)
                try {
                    const result = await patientContract.getSharedRecords(testPatient, { from: testDoctor });
                    console.log("getSharedRecords keys:", result);
                } catch (e2) {
                    console.error("Raw call failed too:", e2.message);
                }
            }
        } else {
            console.log("No patients registered.");
        }
    } else {
        console.log("No doctors registered.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
