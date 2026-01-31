import PatientABI from './patientContractABI.json';
import DoctorABI from './doctorContractABI.json';
import ResearcherABI from './researcherContractABI.json';
import InsuranceABI from './insuranceContractABI.json';
import AuditABI from './auditContractABI.json';

export const ABIs = {
    Patient: PatientABI.abi,
    Doctor: DoctorABI.abi,
    Researcher: ResearcherABI.abi,
    Insurance: InsuranceABI.abi,
    Audit: AuditABI.abi,
};

// You might also want to export addresses if they are static, 
// or fetch them from a config file.
// For now, we assume we'll get them from environment or config.
