import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Admin, DoctorRegister, PatientRegister, InsuranceRegister, ResearcherRegister } from './components/adminpage';
import { DoctorLogin, DoctorDashboard } from './components/doctorpage';
import { PatientLogin, PatientDashboard } from './components/patientpage';
import { InsuranceLogin, InsuranceDashboard } from './components/insurancepage';
import { ResearcherLogin, ResearcherDashboard } from './components/researcherpage';
import { Research } from './components/Research';
import doctorContractABI from "./ABI/doctorContractABI.json";
import patientContractABI from "./ABI/patientContractABI.json";
import insuranceContractABI from "./ABI/insuranceContractABI.json";
import researcherContractABI from "./ABI/researcherContractABI.json";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';

// UPDATED ADDRESSES
const doctorContractAddress = "0x8fF3602a77A03eC9Cfb746B30A1342BFD5B623C0";
const insuranceContractAddress = "0xa110A226F160B1C153F972ba1c0949D74a7899F7";
const researcherContractAddress = "0x8f8D6f88E57edD7E9eF6aA6014d0330491670c0D";
const patientContractAddress = "0x0b439F373A5DA216DA73982ab8E537bB5c564496";

function App() {
	const [doctorContract, setDoctorContract] = useState(null);
	const [patientContract, setPatientContract] = useState(null);
	const [insuranceContract, setInsuranceContract] = useState(null);
	const [researcherContract, setResearcherContract] = useState(null);
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

		const signedDoctorContract = new Contract(doctorContractAddress, doctorContractABI, signer);
		const signedPatientContract = new Contract(patientContractAddress, patientContractABI, signer);
		const signedInsuranceContract = new Contract(insuranceContractAddress, insuranceContractABI, signer);
		const signedResearcherContract = new Contract(researcherContractAddress, researcherContractABI, signer);

		return {
			doctorContract: signedDoctorContract,
			patientContract: signedPatientContract,
			insuranceContract: signedInsuranceContract,
			researcherContract: signedResearcherContract
		};
	};

	useEffect(() => {
		const loadContracts = async () => {
			try {
				const provider = new BrowserProvider(window.ethereum);

				const docContract = new Contract(doctorContractAddress, doctorContractABI, provider);
				const patContract = new Contract(patientContractAddress, patientContractABI, provider);
				const insContract = new Contract(insuranceContractAddress, insuranceContractABI, provider);
				const resContract = new Contract(researcherContractAddress, researcherContractABI, provider);

				setDoctorContract(docContract);
				setPatientContract(patContract);
				setInsuranceContract(insContract);
				setResearcherContract(resContract);

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
				<Route path="/patient-login" element={<PatientLogin contract={patientContract} />} />
				<Route path="/patient-dashboard/:id" element={
					<PatientDashboard
						doctorContract={doctorContract}
						patientContract={patientContract}
						insuranceContract={insuranceContract}
						researcherContract={researcherContract}
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