const hre = require("hardhat");

async function main() {
    const doctorAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F";
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorAddress);

    // Get two random signers (not admin)
    const signers = await hre.ethers.getSigners();
    const user1 = signers[10]; // Account 10
    const user2 = signers[11]; // Account 11

    const phone = "9999999999";

    console.log(`User 1: ${user1.address}`);
    console.log(`User 2: ${user2.address}`);
    console.log(`Phone: ${phone}`);

    // Register User 1
    console.log("Registering User 1...");
    try {
        await doctorContract.connect(user1).registerDoctor("User One", "Doctor", phone);
        console.log("User 1 Registered Success");
    } catch (e) {
        console.log("User 1 Failed:", e.message);
    }

    // Register User 2 with SAME PHONE
    console.log("Registering User 2 with SAME PHONE...");
    try {
        await doctorContract.connect(user2).registerDoctor("User Two", "Doctor", phone);
        console.log("User 2 Registered Success (Duplicate Phone Allowed)");
    } catch (e) {
        console.log("User 2 Failed:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
