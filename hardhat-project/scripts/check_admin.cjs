const hre = require("hardhat");

async function main() {
    const doctorContractAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F"; // From previous deployment
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorContractAddress);

    const admin = await doctorContract.admin();
    console.log("Contract Admin:", admin);

    const accounts = await hre.ethers.getSigners();
    console.log("Hardhat Account #0 (Deployer):", accounts[0].address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
