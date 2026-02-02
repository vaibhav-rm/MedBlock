const hre = require("hardhat");

async function main() {
    const address = "0xFC6BD28291d94061163F2833DAE586165E56431F";
    const code = await hre.ethers.provider.getCode(address);
    console.log(`Code at ${address}:`, code.slice(0, 50) + "...");

    if (code === "0x") {
        console.error("CRITICAL: No code at address! Frontend is pointing to an empty address.");
    } else {
        console.log("Contract exists.");
    }

    // Check user again
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const contract = DoctorManagement.attach(address);
    const user = "0x7eBabf1777d6131Dcce6Edc849Fc0832BAc8F3B1";

    console.log("Checking user:", user);
    try {
        const doc = await contract.doctors(user);
        console.log("Doctor:", doc);
    } catch (e) {
        console.error("Mapping access failed:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
