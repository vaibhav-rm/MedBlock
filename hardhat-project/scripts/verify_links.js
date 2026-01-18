import hre from "hardhat";

async function main() {
    // Sepolia Addresses (Addresses from App.js)
    const doctorAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";
    const patientAddress = "0x5EbFfd687770D423a9ebFAb957b16eefcA6f7FE2";

    console.log("Verifying linking on Sepolia...");

    // Check DoctorManagement
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorAddress);
    const storedPatientContract = await doctorContract.patientContractAddress();
    console.log(`DoctorManagement.patientContractAddress: ${storedPatientContract}`);

    if (storedPatientContract.toLowerCase() === patientAddress.toLowerCase()) {
        console.log("✅ Doctor -> Patient Link is CORRECT");
    } else {
        console.log("❌ Doctor -> Patient Link is INCORRECT");
    }

    // Check PatientManagement
    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = PatientManagement.attach(patientAddress);
    const storedDoctorContract = await patientContract.doctorContractAddress();
    console.log(`PatientManagement.doctorContractAddress: ${storedDoctorContract}`);

    if (storedDoctorContract.toLowerCase() === doctorAddress.toLowerCase()) {
        console.log("✅ Patient -> Doctor Link is CORRECT");
    } else {
        console.log("❌ Patient -> Doctor Link is INCORRECT");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
