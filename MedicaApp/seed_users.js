const ethers = require('ethers');
const fs = require('fs');

// ABI Imports
const PatientABI = require('./constants/abis/patientContractABI.json').abi;
const DoctorABI = require('./constants/abis/doctorContractABI.json').abi;

// Addresses (Localhost)
const DOCTOR_ADDRESS = "0xc21A2CCFa6dFc51a9fAd9c1447Dc168Fa2a3537D";
const PATIENT_ADDRESS = "0x1833A1F66f91700BbE2E581656e3A4c8DB06815a";
const RPC_URL = "http://127.0.0.1:8545";

const PATIENT_WALLET = "0x0893a02f11e74987f13f8f6566858b083400be2c";
const PATIENT_PHONE = "9518300115";

const DOCTOR_WALLET = "0x7ebabf1777d6131dcce6edc849fc0832bac8f3b1";

async function seed() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const signer = await provider.getSigner(); // Use Account #0 as admin/deployer

    const patientContract = new ethers.Contract(PATIENT_ADDRESS, PatientABI, signer);
    const doctorContract = new ethers.Contract(DOCTOR_ADDRESS, DoctorABI, signer);

    console.log("Seeding Patient...");
    try {
        const tx = await patientContract.registerPatient(
            PATIENT_WALLET,
            "Vaibhav Patient",
            "patient",
            PATIENT_PHONE
        );
        await tx.wait();
        console.log("Patient Registered.");
    } catch (e) {
        console.log("Patient maybe already registered:", e.shortMessage || e.message);
    }

    console.log("Seeding Doctor...");
    try {
        const tx = await doctorContract.registerDoctor(
            DOCTOR_WALLET,
            "Dr. Smith",
            "doctor",
            "9876543210"
        );
        await tx.wait();
        console.log("Doctor Registered.");
    } catch (e) {
        console.log("Doctor maybe already registered:", e.shortMessage || e.message);
    }
}

seed();
