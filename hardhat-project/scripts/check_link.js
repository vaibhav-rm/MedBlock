import hre from "hardhat";

async function main() {
    // Hardcoded addresses from App.js
    const doctorContractAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";
    const patientContractAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    const patientContract = await hre.ethers.getContractAt("PatientManagement", patientContractAddress);
    const doctorContract = await hre.ethers.getContractAt("DoctorManagement", doctorContractAddress);

    console.log("Checking Linkage...");

    // Check doctorContractAddress on PatientContract
    const linkedDoc = await patientContract.doctorContractAddress();
    console.log(`PatientContract thinks DoctorContract is at: ${linkedDoc}`);

    // Check patientContractAddress on DoctorContract
    const linkedPatient = await doctorContract.patientContractAddress();
    console.log(`DoctorContract thinks PatientContract is at: ${linkedPatient}`);

    if (linkedDoc.toLowerCase() === doctorContractAddress.toLowerCase()) {
        console.log("SUCCESS: Patient -> Doctor link is CORRECT.");
    } else {
        console.error("FAILURE: Patient -> Doctor link is INCORRECT.");
    }

    if (linkedPatient.toLowerCase() === patientContractAddress.toLowerCase()) {
        console.log("SUCCESS: Doctor -> Patient link is CORRECT.");
    } else {
        console.error("FAILURE: Doctor -> Patient link is INCORRECT.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
