const hre = require("hardhat");

async function main() {
    const doctorAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F";
    const userAddress = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1";

    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorAddress);

    const admin = await doctorContract.admin();
    console.log("Contract Admin:", admin);
    console.log("User Address:", userAddress);
    console.log("Is User Admin?", admin.toLowerCase() === userAddress.toLowerCase());

    const balance = await hre.ethers.provider.getBalance(userAddress);
    console.log("User Balance:", hre.ethers.formatEther(balance));

    // Check if user is registered again (sanity check)
    const doctor = await doctorContract.doctors(userAddress);
    console.log("Is Registered:", doctor.isRegistered);

    if (doctor.isRegistered) {
        console.log("User is ALREADY registered. This explains the revert.");
        return;
    }

    // Attempt simulation with exact data from log if needed, or just arguments.
    console.log("Attempting estimateGas...");
    const signer = await hre.ethers.getImpersonatedSigner(userAddress);

    // Ensure balance (Account 19 usually has 10000 ETH)
    if (balance === 0n) {
        console.log("User has 0 ETH. Funding...");
        await hre.network.provider.send("hardhat_setBalance", [userAddress, "0x10000000000000000000"]);
    }

    try {
        const gas = await doctorContract.connect(signer).registerDoctor.estimateGas("willaim", "Doctor", "9518300115");
        console.log("Gas Estimate:", gas.toString());

        console.log("Attempting execution...");
        const tx = await doctorContract.connect(signer).registerDoctor("willaim", "Doctor", "9518300115");
        await tx.wait();
        console.log("Transaction mined successfully!");
    } catch (e) {
        console.error("Execution Failed:", e.message);
        if (e.data) console.error("Revert Data:", e.data);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
