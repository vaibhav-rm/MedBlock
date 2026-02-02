const hre = require("hardhat");

async function main() {
    // Addresses from App.js (updated in previous step)
    const addresses = {
        "Doctor": "0xFC6BD28291d94061163F2833DAE586165E56431F",
        "Patient": "0x5e09C5765F06e2600b4E1e7c8522D52622C65DB9",
        "Insurance": "0x5CcF1F3AbAa6bBe1dE2e46de696CaBcc83631217",
        "Researcher": "0x3d9F331786b1AFD6adBbc7E6DA7A30901B319E61",
        "Audit": "0x7AD0D48FF40e63E7e2CDFA29822af88A1bDA3dd1"
    };

    console.log("Verifying contract codes on Localhost...");

    for (const [name, address] of Object.entries(addresses)) {
        console.log(`Checking ${name} at ${address}...`);
        const code = await hre.ethers.provider.getCode(address);
        if (code === "0x") {
            console.error(`❌ CRITICAL: No code at ${name} Address!`);
        } else {
            console.log(`✅ Code found for ${name} (${code.length} bytes)`);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
