const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Force Redeploying contracts to generate NEW addresses...");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy Doctor Contract
    const DoctorFactory = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = await DoctorFactory.deploy();
    await doctorContract.waitForDeployment();
    const doctorAddress = await doctorContract.getAddress();
    console.log("NEW Doctor Contract:", doctorAddress);

    // 2. Deploy Patient Contract
    const PatientFactory = await hre.ethers.getContractFactory("PatientManagement");
    const patientContract = await PatientFactory.deploy();
    await patientContract.waitForDeployment();
    const patientAddress = await patientContract.getAddress();
    console.log("NEW Patient Contract:", patientAddress);

    // 3. Deploy Insurance Contract
    // Note: Assuming InsuranceManagement exists in artifacts, checking file system if unsure.
    // If InsuranceManagement.sol doesn't exist, we might skip or fail. 
    // In previous runs it seemed to work until Audit.
    const InsuranceFactory = await hre.ethers.getContractFactory("InsuranceManagement");
    const insuranceContract = await InsuranceFactory.deploy();
    await insuranceContract.waitForDeployment();
    const insuranceAddress = await insuranceContract.getAddress();
    console.log("NEW Insurance Contract:", insuranceAddress);

    // 4. Deploy Researcher Contract
    const ResearcherFactory = await hre.ethers.getContractFactory("ResearcherManagement");
    const researcherContract = await ResearcherFactory.deploy();
    await researcherContract.waitForDeployment();
    const researcherAddress = await researcherContract.getAddress();
    console.log("NEW Researcher Contract:", researcherAddress);

    // 5. Deploy Audit Contract (HealthcareAudit)
    const AuditFactory = await hre.ethers.getContractFactory("HealthcareAudit"); // Corrected Name
    const auditContract = await AuditFactory.deploy();
    await auditContract.waitForDeployment();
    const auditAddress = await auditContract.getAddress();
    console.log("NEW Audit Contract:", auditAddress);

    // Update App.js
    const appJsPath = path.join(__dirname, "../../src/App.js");
    let appJsContent = fs.readFileSync(appJsPath, "utf8");

    appJsContent = appJsContent.replace(/const doctorContractAddress = "0x[a-fA-F0-9]{40}";/, `const doctorContractAddress = "${doctorAddress}";`);
    appJsContent = appJsContent.replace(/const patientContractAddress = "0x[a-fA-F0-9]{40}";/, `const patientContractAddress = "${patientAddress}";`);
    appJsContent = appJsContent.replace(/const insuranceContractAddress = "0x[a-fA-F0-9]{40}";/, `const insuranceContractAddress = "${insuranceAddress}";`);
    appJsContent = appJsContent.replace(/const researcherContractAddress = "0x[a-fA-F0-9]{40}";/, `const researcherContractAddress = "${researcherAddress}";`);
    appJsContent = appJsContent.replace(/const auditContractAddress = "0x[a-fA-F0-9]{40}";/, `const auditContractAddress = "${auditAddress}";`);

    fs.writeFileSync(appJsPath, appJsContent);
    console.log("✅ App.js updated with new addresses.");

    // COPY ARTIFACTS TO SRC/ABI
    const artifactsDir = path.join(__dirname, "../artifacts/contracts");
    const abiDir = path.join(__dirname, "../../src/ABI");

    if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir);

    const copyAbi = (contractFile, contractName, abiFileName) => {
        const artifactPath = path.join(artifactsDir, contractFile, `${contractName}.json`);
        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
            fs.writeFileSync(path.join(abiDir, abiFileName), JSON.stringify(artifact, null, 2));
            console.log(`✅ Copied ${contractName} ABI to ${abiFileName}`);
        } else {
            console.warn(`⚠️ Artifact not found: ${artifactPath}`);
        }
    };

    copyAbi("doctorcontract.sol", "DoctorManagement", "doctorContractABI.json");
    copyAbi("patientcontract.sol", "PatientManagement", "patientContractABI.json");
    copyAbi("auditcontract.sol", "HealthcareAudit", "auditContractABI.json");
    // assuming filenames for insurance/researcher
    copyAbi("insurancecontract.sol", "InsuranceManagement", "insuranceContractABI.json");
    copyAbi("researchercontract.sol", "ResearcherManagement", "researcherContractABI.json");

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
