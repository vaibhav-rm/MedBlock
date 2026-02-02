const hre = require("hardhat");

async function main() {
    const doctorAddress = "0x2aA8Bd7C97dC1C5e1a0891BBDD485ef8475d2DBa"; // From App.js
    const patientAddress = "0x97f14c14c194248F834912f9368525241c9C429e"; // From App.js

    const docCode = await hre.ethers.provider.getCode(doctorAddress);
    const patCode = await hre.ethers.provider.getCode(patientAddress);

    console.log("Doctor Contract Code Length:", docCode.length);
    console.log("Patient Contract Code Length:", patCode.length);

    if (docCode === "0x") console.log("ERROR: No code at Doctor Address");
    else console.log("SUCCESS: Code found at Doctor Address");

    if (patCode === "0x") console.log("ERROR: No code at Patient Address");
    else console.log("SUCCESS: Code found at Patient Address");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
