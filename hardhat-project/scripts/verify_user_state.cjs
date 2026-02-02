const hre = require("hardhat");

async function main() {
    const userAddress = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1"; // From user logs
    const doctorContractAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F"; // From App.js

    console.log(`Checking status for User: ${userAddress}`);
    console.log(`On Doctor Contract: ${doctorContractAddress}`);

    const doctorContract = await hre.ethers.getContractAt("DoctorManagement", doctorContractAddress);

    // 1. Check code exists
    const code = await hre.ethers.provider.getCode(doctorContractAddress);
    if (code === "0x") {
        console.error("❌ CRITICAL: No code at Doctor Contract address! The node might have restarted without redeploy.");
        return;
    }
    console.log("✅ Contract code exists.");

    // 2. Check registration mapping
    // Mapping is address => Doctor which is a struct.
    // doctors(address) returns (username, role, phone, isRegistered)
    try {
        const doctor = await doctorContract.doctors(userAddress);
        console.log("Raw Doctor Struct:", doctor);
        console.log("isRegistered:", doctor.isRegistered); // Accessing by name might fail if array, safer to check output
        // Ethers v6 returns a Result object which works like an array/object hybrids
        console.log("isRegistered (index 3):", doctor[3]);

        if (doctor[3] === true) {
            console.log("✅ User IS registered. Login should work.");
        } else {
            console.log("❌ User is NOT registered. Registration should work.");
        }
    } catch (e) {
        console.error("Error reading doctors mapping:", e);
    }

    // 3. Simulate getDoctor call
    try {
        console.log("Simulating getDoctor()...");
        const result = await doctorContract.getDoctor.staticCall(userAddress);
        console.log("✅ getDoctor success:", result);
    } catch (e) {
        console.error("❌ getDoctor REVERTED:", e.message);
        if (e.data) {
            // Try to decode error if possible
            console.error("Revert Data:", e.data);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
