const hre = require("hardhat");

async function main() {
    const doctorAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F";
    const userAddress = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1"; // From user error log

    console.log("Checking contract at:", doctorAddress);
    const code = await hre.ethers.provider.getCode(doctorAddress);
    console.log("Code length:", code.length);

    if (code === "0x") {
        console.error("No code at address! Contract not deployed there.");
        return;
    }

    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorAddress);

    console.log("Checking if user is registered:", userAddress);
    const doctor = await doctorContract.doctors(userAddress);
    console.log("Doctor Struct:", doctor);
    console.log("Is Registered:", doctor.isRegistered);

    // Simulate call
    try {
        console.log("Simulating registerDoctor call...");
        // Imitate the user's call
        const signer = await hre.ethers.getImpersonatedSigner(userAddress);
        // Fund the impersonated signer
        await hre.network.provider.send("hardhat_setBalance", [
            userAddress,
            "0x10000000000000000000",
        ]);

        await doctorContract.connect(signer).registerDoctor.staticCall("willaim", "Doctor", "9518300115");
        console.log("Simulation success (would not revert).");
    } catch (e) {
        console.log("Simulation reverted:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
