const ethers = require('ethers');
const fs = require('fs');

// ABI Imports
const PatientABI = require('./constants/abis/patientContractABI.json').abi;
const DoctorABI = require('./constants/abis/doctorContractABI.json').abi;

// Addresses (from web3.ts)
const DOCTOR_ADDRESS = "0xe93F3F464551c9204483713061ee4B0eD3B5f1F0";
const PATIENT_ADDRESS = "0x4D2124b88D952e63120F3186ABF4579C32aa12c2";
const RPC_URL = "http://127.0.0.1:8545";

async function checkState() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const patientContract = new ethers.Contract(PATIENT_ADDRESS, PatientABI, provider);
    const doctorContract = new ethers.Contract(DOCTOR_ADDRESS, DoctorABI, provider);

    console.log("Checking Linkage...");
    const linkedDoctorAddress = await patientContract.doctorContractAddress();
    console.log(`PatientContract.doctorContractAddress: ${linkedDoctorAddress}`);
    console.log(`Actual DoctorContract Address:       ${DOCTOR_ADDRESS}`);

    if (linkedDoctorAddress.toLowerCase() !== DOCTOR_ADDRESS.toLowerCase()) {
        console.error("MISMATCH! Linkage is broken.");
    } else {
        console.log("Linkage Verified.");
    }

    // Check specific doctor
    // The doctor address from the user's error message isn't fully clear (0x7ebab... mentioned in prev prompt?)
    // "even tho the doctor exists 0x7ebabf1777d6131dcce6edc849fc0832bac8f3b1"
    const doctorWallet = "0x7ebabf1777d6131dcce6edc849fc0832bac8f3b1";
    console.log(`Checking Doctor Registration for: ${doctorWallet}`);

    try {
        const docInfo = await doctorContract.getDoctor(doctorWallet);
        console.log("Doctor Info:", docInfo);
        // [username, role, phoneNumber] - docInfo[2] might be isRegistered from struct? 
        // ABI says returns (username, role, phoneNumber)
        // Wait, ABI: returns (string, string, string)

        // Let's check 'doctors' mapping or 'isRegistered' boolean logic if exposed.
        // ABI also has 'doctors(address)' returning (username, role, phoneNumber, isRegistered)
        const docStruct = await doctorContract.doctors(doctorWallet);
        console.log("Doctor Struct:", docStruct);
        console.log("isRegistered:", docStruct[3]); // 4th element is bool
    } catch (e) {
        console.error("Error fetching doctor:", e.message);
    }
}

checkState();
