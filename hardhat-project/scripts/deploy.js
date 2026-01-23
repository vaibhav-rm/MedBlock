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

    // Deploy InsuranceManagement Contract
    const InsuranceManagement = await hre.ethers.getContractFactory("InsuranceManagement");
    const insuranceManagement = await InsuranceManagement.deploy();
    await insuranceManagement.waitForDeployment();
    const insuranceAddress = await insuranceManagement.getAddress();
    console.log("InsuranceManagement deployed to:", insuranceAddress);

    // Deploy ResearcherManagement Contract
    const ResearcherManagement = await hre.ethers.getContractFactory("ResearcherManagement");
    const researcherManagement = await ResearcherManagement.deploy();
    await researcherManagement.waitForDeployment();
    const researcherAddress = await researcherManagement.getAddress();
    console.log("ResearcherManagement deployed to:", researcherAddress);

    // Deploy PatientManagement Contract
    const PatientManagement = await hre.ethers.getContractFactory("PatientManagement");
    const patientManagement = await PatientManagement.deploy();
    await patientManagement.waitForDeployment();
    const patientAddress = await patientManagement.getAddress();
    console.log("PatientManagement deployed to:", patientAddress);

    // Link Contracts
    console.log("Linking contracts...");
    await doctorManagement.setPatientContractAddress(patientAddress);
    await insuranceManagement.setPatientContractAddress(patientAddress);
    await researcherManagement.setPatientContractAddress(patientAddress);

    await patientManagement.setDoctorContractAddress(doctorAddress);
    await patientManagement.setInsuranceContractAddress(insuranceAddress);
    await patientManagement.setResearcherContractAddress(researcherAddress);
    console.log("Contracts linked successfully.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
