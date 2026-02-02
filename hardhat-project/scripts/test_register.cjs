const hre = require("hardhat");

async function main() {
    const doctorContractAddress = "0xFC6BD28291d94061163F2833DAE586165E56431F";
    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorContractAddress);

    const accounts = await hre.ethers.getSigners();
    const admin = accounts[0];
    const newDoctor = accounts[1]; // Using Account #1 as the new doctor

    console.log("Registering doctor via Admin:", admin.address);
    console.log("New Doctor Address:", newDoctor.address);

    try {
        const tx = await doctorContract.connect(admin).registerDoctor(
            newDoctor.address,
            "Dr. Test",
            "Doctor",
            "555-0199"
        );
        await tx.wait();
        console.log("Doctor registered successfully!");

        const doc = await doctorContract.getDoctor(newDoctor.address);
        console.log("Fetched Doctor:", doc);
    } catch (error) {
        console.error("Registration failed:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
