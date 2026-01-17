import React, { useState } from 'react';
import { viewFile } from '../ipfs';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, Lock, AlertCircle, Database } from 'lucide-react';

export const Research = ({ patientContract, account, connectWallet }) => {
    const [patientAddress, setPatientAddress] = useState('');
    const [records, setRecords] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const requestAccess = async () => {
        if (!patientAddress) return;
        try {
            if (!account) await connectWallet();

            console.log("Requesting access for:", patientAddress);
            const provider = patientContract.runner.provider;
            const signer = await provider.getSigner();
            const signedContract = patientContract.connect(signer);

            const tx = await signedContract.requestAccess(patientAddress);
            await tx.wait();
            alert("Access requested! The patient has been notified.");
        } catch (err) {
            console.error(err);
            alert("Error requesting access: " + (err.reason || err.message));
        }
    };

    const fetchRecords = async (e) => {
        e.preventDefault();
        setError('');
        setRecords([]);
        setLoading(true);

        if (!patientAddress) {
            setError("Please enter a patient address");
            setLoading(false);
            return;
        }

        try {
            if (!account) {
                await connectWallet();
            }

            console.log("Fetching records for:", patientAddress);
            const sharedRecords = await patientContract.getSharedRecords(patientAddress);

            const formattedRecords = await Promise.all(sharedRecords.map(async (record) => {
                return {
                    recordCDI: record.ipfsHash,
                    fileName: record.fileName,
                    title: record.title,
                    description: record.resume,
                    datetime: record.timestamp,
                    doctorObj: record.doctor,
                    fileType: record.fileType
                };
            }));

            setRecords(formattedRecords);

        } catch (err) {
            console.error(err);
            if (err.reason) {
                setError(err.reason);
            } else if (err.message && err.message.includes("Access denied")) {
                setError("ACCESS_DENIED");
            } else {
                setError("Error fetching records. Ensure you have permission.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto space-y-8">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <Database className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Research & Data Access</h1>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        Securely access anonymized or permissioned patient data for research purposes.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
                >
                    <form onSubmit={fetchRecords} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Enter Patient Wallet Address (0x...)"
                                value={patientAddress}
                                onChange={(e) => setPatientAddress(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Searching...
                                </div>
                            ) : 'View Records'}
                        </button>
                    </form>

                    <AnimatePresence>
                        {error === "ACCESS_DENIED" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3 text-yellow-800">
                                    <Lock className="w-5 h-5" />
                                    <p className="font-medium">Access Denied</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-sm text-yellow-700 hidden sm:block">You need permission to view these records.</p>
                                    <button
                                        onClick={requestAccess}
                                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
                                    >
                                        Request Access
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {error && error !== "ACCESS_DENIED" && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-3"
                            >
                                <AlertCircle className="w-5 h-5" />
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {records.map((record, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{record.title}</h3>
                                            <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                                                <span>{record.fileName}</span>
                                                <span>•</span>
                                                <span>{new Date(Number(record.datetime || Date.now() / 1000) * 1000).toLocaleString()}</span>
                                                {record.fileType && (
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase">{record.fileType}</span>
                                                )}
                                            </div>
                                            {record.description && (
                                                <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-2xl">{record.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => viewFile(record.recordCDI)}
                                        className="w-full sm:w-auto px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
                                    >
                                        View Document
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {records.length === 0 && !loading && !error && (
                        <div className="text-center py-12">
                            <div className="inline-block p-4 bg-gray-50 rounded-full mb-4">
                                <Search className="w-6 h-6 text-gray-400" />
                            </div>
                            <p className="text-gray-500">Enter a patient wallet address to view shared records.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
