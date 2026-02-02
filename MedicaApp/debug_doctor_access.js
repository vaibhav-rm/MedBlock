const ethers = require('ethers');
const fs = require('fs');

// ABI Imports
const PatientABI = require('./constants/abis/patientContractABI.json').abi;
const DoctorABI = require('./constants/abis/doctorContractABI.json').abi;

// Addresses (Localhost)
const DOCTOR_ADDRESS = "0xc21A2CCFa6dFc51a9fAd9c1447Dc168Fa2a3537D";
const PATIENT_ADDRESS = "0x1833A1F66f91700BbE2E581656e3A4c8DB06815a";
const RPC_URL = "http://127.0.0.1:8545";

// Test Users
const DOCTOR_WALLET = "0x7ebabf1777d6131dcce6edc849fc0832bac8f3b1";
const PATIENT_WALLET = "0x0893a02f11e74987f13f8f6566858b083400be2c";

async function debug() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    // We need to impersonate the doctor to test 'getSharedRecords' from their POV
    const doctorSigner = await provider.getSigner(DOCTOR_WALLET);

    const patientContract = new ethers.Contract(PATIENT_ADDRESS, PatientABI, provider);
    const doctorContract = new ethers.Contract(DOCTOR_ADDRESS, DoctorABI, provider);

    console.log("--- Debugging Doctor Access ---");

    // 1. Check Linkage
    const linkedDocAddr = await patientContract.doctorContractAddress();
    console.log(`Linkage Check:`);
    console.log(`  PatientContract thinks DoctorContract is: ${linkedDocAddr}`);
    console.log(`  Actual DoctorContract is:                 ${DOCTOR_ADDRESS}`);
    if (linkedDocAddr.toLowerCase() !== DOCTOR_ADDRESS.toLowerCase()) {
        console.error("  ❌ MISMATCH! Linkage is broken.");
    } else {
        console.log("  ✅ Linkage Correct.");
    }

    // 2. Check Doctor Registration
    console.log(`\nDoctor Registration Check for ${DOCTOR_WALLET}:`);
    try {
        const docInfo = await doctorContract.getDoctor(DOCTOR_WALLET);
        console.log("  getDoctor Result:", docInfo);
        // docInfo: [name, role, phone, isRegistered] ? (Check ABI)
    } catch (e) {
        console.error("  ❌ Failed to get doctor info:", e.message);
    }

    // 3. Check Records Access
    console.log(`\nFetching Records for Patient ${PATIENT_WALLET} as Doctor...`);
    const patientContractAsDoc = patientContract.connect(doctorSigner);

    try {
        const records = await patientContractAsDoc.getSharedRecords(PATIENT_WALLET);
        console.log(`  Records Found: ${records.length}`);
        records.forEach((r, i) => {
            console.log(`    [${i}] ${r.title} (Privacy: ${r.privacyLevel})`);
        });
    } catch (e) {
        console.error("  ❌ Failed to fetch records:", e.message);
        // If it reverts, check if it's "Access denied"
        if (e.message.includes("Access denied")) {
            console.error("  Reason: 'Access denied' - Contract thinks you are not a patient, have no consent, AND not a doctor.");
        }
    }
}

debug();
