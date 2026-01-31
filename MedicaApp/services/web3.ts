import { ethers } from 'ethers';
import DoctorABI from '../constants/abis/doctorContractABI.json';
import PatientABI from '../constants/abis/patientContractABI.json';
import InsuranceABI from '../constants/abis/insuranceContractABI.json';
import ResearcherABI from '../constants/abis/researcherContractABI.json';
import AuditABI from '../constants/abis/auditContractABI.json';

// Addresses (Should match Web App/src/App.js)
// TODO: Use environment variables or a constants file
const DOCTOR_ADDRESS = "0x90E18de98C49344F944e80b292D95b63Ff1a4e52";
const PATIENT_ADDRESS = "0x00b3697BF61C1066D0Bb664F04D899B28B79B8D8";
const INSURANCE_ADDRESS = "0xdb72DCE4ad67B6f2B57560A41ABaD10a70D92F41";
const RESEARCHER_ADDRESS = "0x99cC50B32E63827F328ffAD7A8fA8D9201952a07";
const AUDIT_ADDRESS = "0x119590cd8620020FD2409862B3C80C5E12c54Ae5";

// RPC URL - for Android Emulator use 10.0.2.2 instead of localhost
export const RPC_URL = "http://10.0.2.2:8545";

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
