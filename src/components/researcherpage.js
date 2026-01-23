import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFileToIPFS, viewFile } from '../ipfs';
import '../App.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Database, Users, FileText, Search,
    LogOut, User, AlertCircle, Microscope, UserCheck
} from 'lucide-react';

export const ResearcherLogin = ({ contract, account, connectWallet }) => {
    const [researcherId, setResearcherId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (account) {
            setResearcherId(account);
        }
    }, [account]);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!researcherId) {
            setError('Please enter a Wallet Address');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const sanitizedId = researcherId.toLowerCase();
            // Use getResearcher to verify status. If not registered, this will revert/throw.
            const researcher = await contract.getResearcher(sanitizedId);

            // If call succeeds, check the boolean just in case
            if (researcher[2] === true || researcher.isRegistered) {
                navigate(`/researcher-dashboard/${sanitizedId}`);
            } else {
                setError('Account not registered as a Researcher.');
            }
        } catch (err) {
            console.error(err);
            // If contract reverts, it usually means "Researcher not registered"
            if (err.message.includes("Researcher not registered") || err.reason === "Researcher not registered") {
                setError('Account not registered as a Researcher.');
            } else {
                setError('Error verifying status. Please check your wallet connection.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-white/20"
            >
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
                        <Microscope className="w-10 h-10 text-white" />
                    </div>
                    <h1 className='text-3xl font-bold text-white tracking-tight'>Research Portal</h1>
                    <p className="text-purple-100 mt-2">Access Medical Data for Science</p>
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
                                    value={researcherId}
                                    onChange={(e) => setResearcherId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                    placeholder="0x..."
                                />
                            </div>
                        </div>

                        {account && researcherId && account.toLowerCase() !== researcherId.toLowerCase() && (
                            <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-xl border border-yellow-200 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Wallet Mismatch:</span> You are connected as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{account.slice(0, 6)}...</span> but trying to login as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{researcherId.slice(0, 6)}...</span>.
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
                                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
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
            </motion.div >
        </div >
    );
};


export const ResearcherDashboard = ({ researcherContract, patientContract, getSignedContracts }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [researcher, setResearcher] = useState(null);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const sanitizedId = id.toLowerCase();

                // 1. Get Researcher Info
                const rInfo = await researcherContract.getResearcher(sanitizedId);
                setResearcher({ name: rInfo[0], address: sanitizedId });

                // 2. Get Authorized Patients
                const authorizedPatients = await researcherContract.getAuthorizedPatients(sanitizedId);

                // 3. Get Records for each patient
                // Note: The smart contract automatically filters records based on privacy level (0)
                // because msg.sender (via getSignedContracts / provider) will be the researcher.
                // Wait, for reading we use patientContract.getSharedRecords(patientId).
                // BUT we need to make sure we call it *from the researcher's address*.
                // If we use the default provider (read-only), msg.sender is 0x0.
                // So we MUST use the signer (authenticated call).

                // However, 'patientContract' passed here might be read-only if signer not set?
                // Let's assume the user is connected. If not, results will be empty.

                const { patientContract: signedPatient } = await getSignedContracts();

                const patientsData = await Promise.all(
                    authorizedPatients.map(async (patientId) => {
                        const patient = await patientContract.getPatient(patientId);
                        try {
                            // This call relies on msg.sender being the researcher
                            // Must use signed contract to verify identity
                            const patientRecords = await signedPatient.getSharedRecords(patientId);
                            return {
                                id: patientId,
                                name: patient[0],
                                records: patientRecords
                            };
                        } catch (e) {
                            console.warn(`Could not fetch records for ${patientId}`, e);
                            return {
                                id: patientId,
                                name: patient[0],
                                records: [],
                                error: "Access denied or fetch error"
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

        if (researcherContract && patientContract && id) {
            fetchData();
        }
    }, [researcherContract, patientContract, id]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-600/20">
                        <Microscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">{researcher?.name || "Loading..."}</h1>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Researcher
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
                            Subjects (Patients)
                        </h2>
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{patients.length}</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px] flex flex-col">
                        {loading ? (
                            <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                                Loading...
                            </div>
                        ) : patients.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                                <Microscope className="w-12 h-12 text-gray-300 mb-4" />
                                <p className="font-medium text-gray-600">No authorized subjects</p>
                                <p className="text-sm mt-1">Patients must grant 'Research' access.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-200px)]">
                                {patients.map(patient => (
                                    <motion.div
                                        key={patient.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        onClick={() => setSelectedPatient(patient)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${selectedPatient?.id === patient.id ? 'bg-purple-50/50 border-r-4 border-purple-600' : 'border-r-4 border-transparent'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selectedPatient?.id === patient.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {patient.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h3 className={`font-semibold ${selectedPatient?.id === patient.id ? 'text-purple-900' : 'text-gray-800'}`}>
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

                {/* Right Content: Records */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="wait">
                        {selectedPatient ? (
                            <motion.div
                                key={selectedPatient.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        Research Data for {selectedPatient.name}
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedPatient.records.length > 0 ? (
                                            selectedPatient.records.map((record, idx) => (
                                                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 hover:shadow-md transition-all">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex gap-4">
                                                            <div className="mt-1 p-2 bg-purple-50 rounded-lg h-fit">
                                                                <FileText className="w-5 h-5 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900 text-lg">{record.title}</h4>
                                                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                                                    <span>{record.fileType}</span>
                                                                    <span>•</span>
                                                                    <span>{new Date(Number(record.timestamp || Date.now() / 1000) * 1000).toLocaleDateString()}</span>
                                                                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs">Public/Research</span>
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
                                                <p className="text-gray-500">No available records for this privacy level.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 min-h-[500px]">
                                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                                    <Database className="w-10 h-10 text-purple-200" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Subject</h3>
                                <p className="max-w-xs mx-auto text-gray-500">View research-cleared data for your subjects.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
