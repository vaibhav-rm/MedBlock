import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Admin, DoctorRegister, PatientRegister, InsuranceRegister, ResearcherRegister, AuditDashboard } from './components/adminpage';
import { DoctorLogin, DoctorDashboard } from './components/doctorpage';
import { PatientLogin, PatientDashboard } from './components/patientpage';
import { InsuranceLogin, InsuranceDashboard } from './components/insurancepage';
import { ResearcherLogin, ResearcherDashboard } from './components/researcherpage';
import { Research } from './components/Research';
import doctorContractABI from "./ABI/doctorContractABI.json";
import patientContractABI from "./ABI/patientContractABI.json";
import insuranceContractABI from "./ABI/insuranceContractABI.json";
import researcherContractABI from "./ABI/researcherContractABI.json";
import auditContractABI from "./ABI/auditContractABI.json";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';

// UPDATED ADDRESSES (SEPOLIA)
const doctorContractAddress = "0xc1c904b15285bA936F59ba4936F2C89e9E52ce14";
const insuranceContractAddress = "0x5663A9109B4a38102D92a4ee3BE1Be8347Af7173";
const researcherContractAddress = "0x2dB1cDB83F7798279016000a3968E889551D280A";
const patientContractAddress = "0x848a9488C5C420B20B4082cCbf2598D103E5Dc94";
const auditContractAddress = "0x51408127D0591230f1E97A0E93a08A54c96f38D4";

function App() {
	const [doctorContract, setDoctorContract] = useState(null);
	const [patientContract, setPatientContract] = useState(null);
	const [insuranceContract, setInsuranceContract] = useState(null);
	const [researcherContract, setResearcherContract] = useState(null);
	const [auditContract, setAuditContract] = useState(null);
	const [account, setAccount] = useState(null);

	const connectWallet = async () => {
		if (window.ethereum) {
			try {
				const provider = new BrowserProvider(window.ethereum);
				const signer = await provider.getSigner();
				setAccount(await signer.getAddress());
			} catch (error) {
				console.error("Error connecting wallet:", error);
			}
		} else {
			alert("Please install Metamask!");
		}
	};

	const getSignedContracts = async () => {
		if (!window.ethereum) throw new Error("No crypto wallet found");
		const provider = new BrowserProvider(window.ethereum);
		const signer = await provider.getSigner();

		const signedDoctorContract = new Contract(doctorContractAddress, doctorContractABI.abi, signer);
		const signedPatientContract = new Contract(patientContractAddress, patientContractABI.abi, signer);
		const signedInsuranceContract = new Contract(insuranceContractAddress, insuranceContractABI.abi, signer);
		const signedResearcherContract = new Contract(researcherContractAddress, researcherContractABI.abi, signer);
		const signedAuditContract = new Contract(auditContractAddress, auditContractABI.abi, signer);

		return {
			doctorContract: signedDoctorContract,
			patientContract: signedPatientContract,
			insuranceContract: signedInsuranceContract,
			researcherContract: signedResearcherContract,
			auditContract: signedAuditContract
		};
	};

	useEffect(() => {
		const loadContracts = async () => {
			try {
				const provider = new BrowserProvider(window.ethereum);

				const docContract = new Contract(doctorContractAddress, doctorContractABI.abi, provider);
				const patContract = new Contract(patientContractAddress, patientContractABI.abi, provider);
				const insContract = new Contract(insuranceContractAddress, insuranceContractABI.abi, provider);
				const resContract = new Contract(researcherContractAddress, researcherContractABI.abi, provider);
				const audContract = new Contract(auditContractAddress, auditContractABI.abi, provider);

				setDoctorContract(docContract);
				setPatientContract(patContract);
				setInsuranceContract(insContract);
				setResearcherContract(resContract);
				setAuditContract(audContract);

				// Check if wallet is already connected
				const accounts = await window.ethereum.request({ method: 'eth_accounts' });
				if (accounts.length > 0) {
					setAccount(accounts[0]);
				}

				// Listen for account changes
				window.ethereum.on('accountsChanged', (accounts) => {
					setAccount(accounts[0] || null);
				});

			} catch (error) {
				console.error("Error loading contracts:", error);
			}
		};

		if (window.ethereum) {
			loadContracts();
		}
	}, []);

	return (
		<BrowserRouter>
			<Navbar account={account} connectWallet={connectWallet} />
			<Routes>
				<Route path="/" element={<LandingPage />} />

				{/* Admin Routes */}
				<Route path="/admin" element={<Admin />} />
				<Route path="/register-doctor" element={<DoctorRegister getSignedContracts={getSignedContracts} />} />
				<Route path="/register-patient" element={<PatientRegister getSignedContracts={getSignedContracts} />} />
				<Route path="/register-insurance" element={<InsuranceRegister getSignedContracts={getSignedContracts} />} />
				<Route path="/register-researcher" element={<ResearcherRegister getSignedContracts={getSignedContracts} />} />
				<Route path="/admin/audits" element={<AuditDashboard auditContract={auditContract} />} />

				{/* Doctor Routes */}
				<Route path="/doctor-login" element={<DoctorLogin contract={doctorContract} account={account} connectWallet={connectWallet} />} />
				<Route path="/doctor-dashboard/:id" element={
					<DoctorDashboard
						doctorContract={doctorContract}
						patientContract={patientContract}
						getSignedContracts={getSignedContracts}
					/>
				} />

				{/* Patient Routes */}
				<Route path="/patient-login" element={<PatientLogin contract={patientContract} account={account} />} />
				<Route path="/patient-dashboard/:id" element={
					<PatientDashboard
						doctorContract={doctorContract}
						patientContract={patientContract}
						insuranceContract={insuranceContract}
						researcherContract={researcherContract}
						auditContract={auditContract}
						getSignedContracts={getSignedContracts}
						account={account}
					/>
				} />

				{/* Insurance Routes */}
				<Route path="/insurance-login" element={<InsuranceLogin contract={insuranceContract} account={account} connectWallet={connectWallet} />} />
				<Route path="/insurance-dashboard/:id" element={
					<InsuranceDashboard
						insuranceContract={insuranceContract}
						patientContract={patientContract}
						requestContract={null} // Audit not used/removed
						getSignedContracts={getSignedContracts}
					/>
				} />

				{/* Researcher Routes */}
				<Route path="/researcher-login" element={<ResearcherLogin contract={researcherContract} account={account} connectWallet={connectWallet} />} />
				<Route path="/researcher-dashboard/:id" element={
					<ResearcherDashboard
						researcherContract={researcherContract}
						patientContract={patientContract}
						getSignedContracts={getSignedContracts}
					/>
				} />

				{/* Legacy Research Route (Optional or remove) */}
				{/* <Route path="/research" element={<Research />} /> */}

			</Routes>
		</BrowserRouter>
	);
}

export default App;