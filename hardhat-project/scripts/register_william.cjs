const hre = require("hardhat");

async function main() {
    const doctorContractAddress = "0x2aA8Bd7C97dC1C5e1a0891BBDD485ef8475d2DBa"; // Latest deployment address
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorContractAddress);

    const [deployer, account1] = await hre.ethers.getSigners();

    // The user specified address: 0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1
    // In Hardhat node, this usually corresponds to Account #1
    const doctorAddress = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1";
    const doctorName = "William";
    const doctorRole = "Doctor";
    const phoneNumber = "9518300115";

    console.log(`Registering Doctor: ${doctorName} (${doctorAddress})`);

    // Registering using the deployer account (any account can register now)
    const tx = await doctorContract.connect(deployer).registerDoctor(
        doctorAddress,
        doctorName,
        doctorRole,
        phoneNumber
    );

    await tx.wait();
    console.log("Doctor registered successfully!");

    const doc = await doctorContract.getDoctor(doctorAddress);
    console.log("Verified Doctor Details:", doc);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
