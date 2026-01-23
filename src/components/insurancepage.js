import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFileToIPFS, viewFile } from '../ipfs';
import '../App.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Shield, Users, FileText, Upload, Search,
    LogOut, User, Plus, Clock, File, AlertCircle, Building, BadgeCheck
} from 'lucide-react';
import { isAddress } from 'ethers';

export const InsuranceLogin = ({ contract, account, connectWallet }) => {
    const [insurerId, setInsurerId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (account) {
            setInsurerId(account);
        }
    }, [account]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!insurerId) {
            setError('Please enter a Wallet Address');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const sanitizedId = insurerId.toLowerCase();
            // Use getInsurer to verify status and registration.
            const insurer = await contract.getInsurer(sanitizedId);

            // getInsurer returns (username, role, isRegistered)
            if (insurer[2] === true || insurer.isRegistered) {
                navigate(`/insurance-dashboard/${sanitizedId}`);
            } else {
                setError('Account not registered as an Insurer.');
            }
        } catch (err) {
            console.error(err);
            if (err.message && (err.message.includes("Insurer not registered") || err.reason === "Insurer not registered")) {
                setError('Account not registered as an Insurer.');
            } else {
                setError('Error verifying insurer status. Check connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-white/20"
            >
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className='text-3xl font-bold text-white tracking-tight'>Insurance Portal</h1>
                    <p className="text-emerald-100 mt-2">Secure Information Access</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 ml-1">Wallet Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={insurerId}
                                    onChange={(e) => setInsurerId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                    placeholder="0x..."
                                />
                            </div>
                        </div>

                        {account && insurerId && account.toLowerCase() !== insurerId.toLowerCase() && (
                            <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-xl border border-yellow-200 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Wallet Mismatch:</span> You are connected as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{account.slice(0, 6)}...</span> but trying to login as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{insurerId.slice(0, 6)}...</span>.
                                    <div className="mt-1 text-xs opacity-90">Transactions will fail. Please switch accounts in MetaMask.</div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center justify-center gap-2"
                            >
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:-translate-y-0.5
                ${account
                                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                    : 'bg-gray-800 hover:bg-gray-900'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </div>
                            ) : (account ? 'Login to Dashboard' : 'Connect Wallet')}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="w-full text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors pt-2"
                        >
                            Back to Home
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};


export const InsuranceDashboard = ({ insuranceContract, patientContract, getSignedContracts }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [insurer, setInsurer] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // get insurer info 
                const sanitizedId = id.toLowerCase();
                const insurerInfo = await insuranceContract.getInsurer(sanitizedId);
                const name = insurerInfo[0];
                setInsurer({ name, address: sanitizedId });

                const authorizedPatients = await insuranceContract.getAuthorizedPatients(sanitizedId);

                const { patientContract: signedPatientContract } = await getSignedContracts();

                const patientsData = await Promise.all(
                    authorizedPatients.map(async (patientId) => {
                        const patient = await patientContract.getPatient(patientId);
                        try {
                            // Use signed contract to ensure msg.sender is correct
                            const patientRecords = await signedPatientContract.getSharedRecords(patientId);

                            return {
                                id: patientId,
                                name: patient[0],
                                records: patientRecords
                            };
                        } catch (err) {
                            console.warn("Error fetching records for patient:", patientId, err);
                            return {
                                id: patientId,
                                name: patient[0],
                                records: []
                            };
                        }
                    })
                );

                setPatients(patientsData.filter(p => p !== null));

            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (insuranceContract && patientContract && id) {
            fetchData();
        }
    }, [insuranceContract, patientContract, id]);


    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{insurer?.name || "Loading..."}</h1>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Insurer
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </nav>

            <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Sidebar: Patients List */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <Users className="w-5 h-5 text-gray-500" />
                            Clients (Patients)
                        </h2>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{patients.length}</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                Loading...
                            </div>
                        ) : patients.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                <Shield className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="font-medium text-gray-600">No authorized clients</p>
                                <p className="text-sm mt-1">Patients must grant you access first.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-200px)]">
                                {patients.map(patient => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${selectedPatient?.id === patient.id ? 'bg-emerald-50/50 border-r-4 border-emerald-600' : 'border-r-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selectedPatient?.id === patient.id ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${selectedPatient?.id === patient.id ? 'text-emerald-900' : 'text-gray-800'}`}>
                                                        {patient.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 font-mono mt-0.5">{patient.id.slice(0, 6)}...{patient.id.slice(-4)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content: Patient Details */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedPatient ? (
                            <motion.div
                                key={selectedPatient.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                {/* Records List */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        Medical History for {selectedPatient.name}
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedPatient.records.length > 0 ? (
                                            selectedPatient.records.map((record, idx) => (
                                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="mt-1 p-2 bg-emerald-50 rounded-lg h-fit">
                                                                <File className="w-5 h-5 text-emerald-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-lg">{record.title}</h4>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                    <span>{record.fileName}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(Number(record.timestamp || Date.now() / 1000) * 1000).toLocaleDateString()}</span>
                                                                </div>
                                                                <p className="mt-2 text-sm text-gray-600 max-w-2xl">{record.resume}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => viewFile(record.ipfsHash)}
                                                            className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors border border-gray-200 flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            <Search className="w-4 h-4" />
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-gray-500">No records shared.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 min-h-[500px]">
                                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-10 h-10 text-emerald-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h3>
                                <p className="max-w-xs mx-auto text-gray-500">View insurance-relevant data for your clients.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

            </main>
        </div>
    );
};
