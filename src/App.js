import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Admin, DoctorRegister, PatientRegister } from './components/adminpage';
import { DoctorLogin, DoctorDashboard } from './components/doctorpage';
import { PatientLogin, PatientDashboard } from './components/patientpage';
import doctorContractABI from "./ABI/doctorContractABI.json";
import patientContractABI from "./ABI/patientContractABI.json";
import userLogo from './imgs/user_logo.png';


const doctorContractAddress = "0xa75d4D4F441b1CfA37B72143c2Fc4BF7BB114cea";
const patientContractAddress = "0xFcdbC582A859749C9F917fC159C8Cbf6913eaa42";


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
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<div className="glass-panel p-8 rounded-2xl max-w-md w-full flex flex-col items-center space-y-8">
				<div className="text-center">
					<h1 className='text-4xl font-bold text-gray-800 mb-2'>MedBlock</h1>
					<p className="text-gray-500">Secure Blockchain Medical Records</p>
				</div>

				<div className="relative w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mb-4 overflow-hidden border-4 border-white shadow-lg">
					<img src={userLogo} alt="Login Illustration" className="w-24 h-24 object-contain opacity-80" />
				</div>

				<div className="w-full space-y-4">
					<button onClick={connectAsAdmin} className="w-full px-6 py-4 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md flex items-center justify-center">
						<span>Admin Portal</span>
					</button>

					<div className="grid grid-cols-2 gap-4">
						<button onClick={() => navigate('/doctor-login')} className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md">
							Doctor
						</button>

						<button onClick={() => navigate('/patient-login')} className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md">
							Patient
						</button>
					</div>
				</div>

				{error && (
					<div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg w-full text-center border border-red-100 animate-pulse">
						{error}
					</div>
				)}

				<div className="text-xs text-center text-gray-400 mt-4">
					{account ? (
						<span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
					) : (
						<span>Wallet not connected</span>
					)}
				</div>
			</div>
		</div>
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

				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;  