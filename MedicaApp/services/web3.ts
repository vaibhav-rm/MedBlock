import { ethers } from 'ethers';
import DoctorABI from '../constants/abis/doctorContractABI.json';
import PatientABI from '../constants/abis/patientContractABI.json';
import InsuranceABI from '../constants/abis/insuranceContractABI.json';
import ResearcherABI from '../constants/abis/researcherContractABI.json';
import AuditABI from '../constants/abis/auditContractABI.json';

// Addresses (Should match Web App/src/App.js)
// TODO: Use environment variables or a constants file
// Addresses (Localhost)
const DOCTOR_ADDRESS = "0xc1c904b15285bA936F59ba4936F2C89e9E52ce14";
const PATIENT_ADDRESS = "0x848a9488C5C420B20B4082cCbf2598D103E5Dc94";
const INSURANCE_ADDRESS = "0x5663A9109B4a38102D92a4ee3BE1Be8347Af7173";
const RESEARCHER_ADDRESS = "0x2dB1cDB83F7798279016000a3968E889551D280A";
const AUDIT_ADDRESS = "0x51408127D0591230f1E97A0E93a08A54c96f38D4";

// RPC URL
export const RPC_URL = "https://sepolia.infura.io/v3/b5b05391f5514e1f9427f5ec93ef9173";

export const getProvider = () => {
    return new ethers.JsonRpcProvider(RPC_URL);
};

export const getContracts = async (signerOrProvider: ethers.Signer | ethers.Provider) => {
    const doctorContract = new ethers.Contract(DOCTOR_ADDRESS, DoctorABI.abi, signerOrProvider);
    const patientContract = new ethers.Contract(PATIENT_ADDRESS, PatientABI.abi, signerOrProvider);
    const insuranceContract = new ethers.Contract(INSURANCE_ADDRESS, InsuranceABI.abi, signerOrProvider);
    const researcherContract = new ethers.Contract(RESEARCHER_ADDRESS, ResearcherABI.abi, signerOrProvider);
    const auditContract = new ethers.Contract(AUDIT_ADDRESS, AuditABI.abi, signerOrProvider);

    return {
        doctorContract,
        patientContract,
        insuranceContract,
        researcherContract,
        auditContract
    };
};

export const isValidAddress = (address: string) => {
    return ethers.isAddress(address);
};
