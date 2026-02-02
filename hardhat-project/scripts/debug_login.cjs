const hre = require("hardhat");

async function main() {
    // 1. Check Function Selectors
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const contract = DoctorManagement.attach("0xFC6BD28291d94061163F2833DAE586165E56431F");

    const getDoctorSelector = contract.interface.getFunction("getDoctor").selector;
    const doctorsSelector = contract.interface.getFunction("doctors").selector;

    console.log("getDoctor selector:", getDoctorSelector);
    console.log("doctors selector:", doctorsSelector);

    // User transaction data was: a9583c22...
    // Let's see which one matches.

    // 2. Check User Registration Status
    const userAddress = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1";
    console.log("\nChecking registration for:", userAddress);

    const doctor = await contract.doctors(userAddress);
    console.log("Doctor Struct from mapping:", doctor);
    console.log("Is Registered:", doctor.isRegistered);

    // 3. Try calling getDoctor
    try {
        console.log("Calling getDoctor(userAddress)...");
        const res = await contract.getDoctor(userAddress);
        console.log("getDoctor result:", res);
    } catch (e) {
        console.log("getDoctor reverted:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
