import hre from "hardhat";

async function main() {
    const doctorContractAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";
    const doctorContract = await hre.ethers.getContractAt("DoctorManagement", doctorContractAddress);

    console.log("Fetching registered doctors...");
    const doctorAddresses = await doctorContract.getAllDoctors();

    console.log(`Found ${doctorAddresses.length} registered doctors:`);
    for (const addr of doctorAddresses) {
        const doc = await doctorContract.getDoctor(addr);
        console.log(`- ${addr} (${doc.username}): isRegistered=${doc.isRegistered}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
