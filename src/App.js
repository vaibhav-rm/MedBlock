import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Admin, DoctorRegister, PatientRegister } from './components/adminpage';
import { DoctorLogin, DoctorDashboard } from './components/doctorpage';
import { PatientLogin, PatientDashboard } from './components/patientpage';
import { Research } from './components/Research';
import doctorContractABI from "./ABI/doctorContractABI.json";
import patientContractABI from "./ABI/patientContractABI.json";
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';

const doctorContractAddress = "0x1Db5aE0cD30C9Dc391154Cf9B16C7A1d59691816";
const patientContractAddress = "0x59743092b54db22Eaf701be48a66067D44042594";


const Home = ({ doctorContract, patientContract, account, connectWallet }) => {
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const connectAsAdmin = async () => {
		try {

			await connectWallet();
			// Re-fetch owner details after connection to be sure
			// Note: In a real app we might want to wait for state update or fetch directly
			// For now, relying on the contract instances passed in
			const doctorOwner = await doctorContract.admin();
			const patientOwner = await patientContract.admin();

			const currentAccount = account || (await (new BrowserProvider(window.ethereum)).getSigner()).address;

			if (!currentAccount
				|| doctorOwner.toLowerCase() !== currentAccount.toLowerCase()
				|| patientOwner.toLowerCase() !== currentAccount.toLowerCase()) {
				setError('Not authorized as admin');
				return;
			}
			navigate('/admin');

		} catch (err) {
			console.error(err);
			setError('Error verifying admin or connecting wallet');
		}
	};

	return (
		<>
			<LandingPage connectAsAdmin={connectAsAdmin} />
			{error && (
				<div className="fixed bottom-4 right-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 shadow-lg animate-bounce">
					{error}
				</div>
			)}
		</>
	);
};


const App = () => {
	const [doctorContract, setDoctorContract] = useState(null);
	const [patientContract, setPatientContract] = useState(null);
	const [account, setAccount] = useState('');
	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);

	const connectWallet = async () => {
		if (!window.ethereum) return;
		try {
			const accounts = await window.ethereum.request({
				method: 'eth_requestAccounts'
			});
			setAccount(accounts[0]);

			if (provider) {
				const newSigner = await provider.getSigner();
				setSigner(newSigner);
			}
		} catch (err) {
			console.error("Error connecting wallet:", err);
		}
	};

	useEffect(() => {
		const init = async () => {
			if (window.ethereum) {
				const provider = new BrowserProvider(window.ethereum);
				setProvider(provider);

				const doctorContract = new Contract(doctorContractAddress, doctorContractABI.abi, provider);
				const patientContract = new Contract(patientContractAddress, patientContractABI.abi, provider);

				setDoctorContract(doctorContract);
				setPatientContract(patientContract);

				// Check if already connected
				const accounts = await provider.listAccounts();
				if (accounts.length > 0) {
					setAccount(accounts[0].address);
					setSigner(await provider.getSigner());
				}

				window.ethereum.on('accountsChanged', async (accounts) => {
					setAccount(accounts[0] || '');
					if (accounts[0]) {
						const newSigner = await provider.getSigner();
						setSigner(newSigner);
					} else {
						setSigner(null);
					}
				});
			}
		};

		init();
	}, []);

	// Check Network
	useEffect(() => {
		const checkNetwork = async () => {
			if (window.ethereum) {
				const chainId = await window.ethereum.request({ method: 'eth_chainId' });
				// Sepolia ChainID is 11155111 (0xaa36a7)
				if (chainId !== '0xaa36a7') {
					try {
						await window.ethereum.request({
							method: 'wallet_switchEthereumChain',
							params: [{ chainId: '0xaa36a7' }],
						});
					} catch (switchError) {
						// This error code indicates that the chain has not been added to MetaMask.
						if (switchError.code === 4902) {
							console.error("Sepolia network is not added to MetaMask");
							alert("Please add Sepolia Testnet to MetaMask");
						} else {
							console.error('Failed to switch network:', switchError);
							alert('Please switch to Sepolia Testnet manually.');
						}
					}
				}
			}
		};
		checkNetwork();
	}, [account]);

	const getSignedContracts = async () => {
		if (!signer) {
			// Double check signature availability
			const newSigner = await provider.getSigner();
			setSigner(newSigner);
			return {
				doctorContract: doctorContract.connect(newSigner),
				patientContract: patientContract.connect(newSigner)
			};
		}
		return {
			doctorContract: doctorContract.connect(signer),
			patientContract: patientContract.connect(signer)
		};
	};

	if (!doctorContract || !patientContract) return <div className="min-h-screen flex items-center justify-center text-blue-600 bg-blue-50">Initializing App...</div>;

	return (
		<BrowserRouter>
			<Navbar account={account} />
			<Routes>
				<Route path="/" element={
					<Home
						doctorContract={doctorContract}
						patientContract={patientContract}
						account={account}
						connectWallet={connectWallet}
					/>
				} />

				<Route path="/admin" element={<Admin />} />

				<Route path="/register-doctor" element={
					<DoctorRegister getSignedContracts={getSignedContracts} />
				} />

				<Route path="/register-patient" element={
					<PatientRegister getSignedContracts={getSignedContracts}
					/>} />


				<Route path="/doctor-login" element={
					<DoctorLogin
						contract={doctorContract}
						account={account}
						connectWallet={connectWallet}
					/>
				} />

				<Route path="/doctor-dashboard/:id" element={
					<DoctorDashboard
						doctorContract={doctorContract}
						patientContract={patientContract}
						getSignedContracts={getSignedContracts}
					/>
				} />

				<Route path="/patient-login" element={
					<PatientLogin
						contract={patientContract}
						account={account}
						connectWallet={connectWallet}
					/>
				} />

				<Route path="/patient-dashboard/:id" element={
					<PatientDashboard
						doctorContract={doctorContract}
						patientContract={patientContract}
						getSignedContracts={getSignedContracts}
					/>
				} />

				<Route path="/research" element={<Research patientContract={patientContract} account={account} connectWallet={connectWallet} />} />

				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;  