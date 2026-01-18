import hre from "hardhat";

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy DoctorManagement Contract
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorManagement = await DoctorManagement.deploy();
    await doctorManagement.waitForDeployment();
    const doctorAddress = await doctorManagement.getAddress();
    console.log("DoctorManagement deployed to:", doctorAddress);

    // Deploy PatientManagement Contract
    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientManagement = await PatientManagement.deploy();
    await patientManagement.waitForDeployment();
    const patientAddress = await patientManagement.getAddress();
    console.log("PatientManagement deployed to:", patientAddress);

    // Link Contracts
    console.log("Linking contracts...");
    await doctorManagement.setPatientContractAddress(patientAddress);
    await patientManagement.setDoctorContractAddress(doctorAddress);
    console.log("Contracts linked successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
