import hre from "hardhat";

async function main() {
    // Addresses from App.js
    const doctorContractAddress = "0x3d9F331786b1AFD6adBbc7E6DA7A30901B319E61";
    const patientContractAddress = "0x7AD0D48FF40e63E7e2CDFA29822af88A1bDA3dd1";

    console.log("Checking DoctorManagement at:", doctorContractAddress);
    try {
        const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
        const doctorContract = DoctorManagement.attach(doctorContractAddress);
        const admin = await doctorContract.admin();
        console.log("Success! Doctor Admin:", admin);
    } catch (error) {
        console.error("Failed to fetch Doctor Admin:", error.message);
    }

    console.log("Checking PatientManagement at:", patientContractAddress);
    try {
        const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
        const patientContract = PatientManagement.attach(patientContractAddress);
        const admin = await patientContract.admin();
        console.log("Success! Patient Admin:", admin);
    } catch (error) {
        console.error("Failed to fetch Patient Admin:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
