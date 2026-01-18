import hre from "hardhat";

async function main() {
    const doctorContractAddress = "0xacbFe360F336A27940e5e785df74627A184bAAbb";
    const suspectAddress = "0x8dF4011360D127b3EA020cD2664C838E8c658118";

    console.log(`Checking if ${suspectAddress} is a registered Doctor...`);

    const DoctorManagement = await hre.ethers.getContractFactory("DoctorManagement");
    const doctorContract = DoctorManagement.attach(doctorContractAddress);

    try {
        const doctor = await doctorContract.getDoctor(suspectAddress);
        console.log(`Result: Name=${doctor[0]}, Role=${doctor[1]}`);

        // Check raw struct directly too
        const docStruct = await doctorContract.doctors(suspectAddress);
        console.log(`IsRegistered: ${docStruct.isRegistered}`);

        if (docStruct.isRegistered) {
            console.log("✅ YES, is a registered Doctor.");
        } else {
            console.log("❌ NO, is NOT a registered Doctor.");
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
