import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFileToIPFS, viewFile } from '../ipfs';
import '../App.css';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, FileText, Upload, Search,
  LogOut, User, Plus, Clock, File, AlertCircle
} from 'lucide-react';

import { isAddress } from 'ethers';

export const DoctorLogin = ({ contract, account, connectWallet }) => {
  const [doctorId, setDoctorId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Optional: Auto-fill if wallet connected
  useEffect(() => {
    if (account) {
      setDoctorId(account);
    }
  }, [account]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      setError('Please enter a Wallet Address');
      return;
    }

    // Validate address format
    let validAddress = false;
    try {
      validAddress = isAddress(doctorId);
    } catch (e) { validAddress = false; }

    if (!validAddress && !doctorId.toLowerCase().match(/^0x[a-f0-9]{40}$/)) {
      setError('Invalid Wallet Address format (must be 0x...)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sanitizedId = doctorId.toLowerCase();
      const doctor = await contract.doctors(sanitizedId);

      if (doctor.isRegistered) {
        navigate(`/doctor-dashboard/${sanitizedId}`);
      } else {
        setError('Account not registered as a Doctor.');
      }
    } catch (err) {
      setError('Error verifying doctor status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-white/20"
      >
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className='text-3xl font-bold text-white tracking-tight'>Doctor Portal</h1>
          <p className="text-blue-100 mt-2">Secure Blockchain Access</p>
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
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                  placeholder="0x..."
                />
              </div>
            </div>

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
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
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

export const DoctorDashboard = ({ doctorContract, patientContract, getSignedContracts }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [doctor, setDoctor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState('1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // get doctor info 
        const sanitizedId = id.toLowerCase();
        const doctorInfo = await doctorContract.getDoctor(sanitizedId);
        const name = doctorInfo[0];
        setDoctor({ name, address: sanitizedId });

        const authorizedPatients = await doctorContract.getAuthorizedPatients(sanitizedId);

        const patientsData = await Promise.all(
          authorizedPatients.map(async (patientId) => {
            const patient = await patientContract.getPatient(patientId);
            // Use getSharedRecords to respect access control
            const patientRecords = await patientContract.getSharedRecords(patientId);
            // Show ALL shared records, not just my own
            const doctorRecords = patientRecords;

            return {
              id: patientId,
              name: patient[0],
              records: doctorRecords
            };
          })
        );

        setPatients(patientsData.filter(p => p !== null));

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorContract && patientContract && id) {
      fetchData();
    }
  }, [doctorContract, patientContract, id]);


  const addRecord = async (e) => {
    e.preventDefault();

    if (!selectedPatient) return alert("Please select a patient.");
    if (!file) return alert("Please upload a file.");
    if (!title.trim()) return alert("Please provide a title.");

    try {
      setSubmitting(true);
      const fileCID = await uploadFileToIPFS(file);
      if (!fileCID) throw new Error("Failed to upload file to IPFS.");

      const { patientContract: signedDoctorContract } = await getSignedContracts();
      const tx = await signedDoctorContract.addMedicalRecord(
        selectedPatient.id,
        fileCID,
        'Unknown',
        file.name,
        title.trim(),
        description.trim(),
        '',
        parseInt(privacyLevel)
      );

      await tx.wait();

      const patientRecords = await signedDoctorContract.getSharedRecords(selectedPatient.id);

      // Update with ALL records
      setPatients(patients.map(p =>
        p.id === selectedPatient.id ? { ...p, records: patientRecords } : p
      ));

      // Update the selected patient state as well so UI refreshes immediately
      setSelectedPatient(prev => ({
        ...prev,
        records: patientRecords
      }));

      setFile(null);
      setTitle('');
      setDescription('');
      alert('Record added successfully');
    } catch (err) {
      console.error("Error adding record:", err);
      alert('Error adding record: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{doctor?.name || "Loading..."}</h1>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded-full w-fit">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              {id?.slice(0, 6)}...{id?.slice(-4)}
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
              My Patients
            </h2>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{patients.length}</span>
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{patients.length}</span>
          </div>

          {/* Request Access Section */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Request Access
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                id="req-patient-addr"
                placeholder="Patient Address (0x...)"
                className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={async () => {
                  const addr = document.getElementById('req-patient-addr').value;
                  if (!addr) return alert("Enter address");
                  try {
                    const { patientContract: signedPatient } = await getSignedContracts();
                    const tx = await signedPatient.requestAccess(addr);
                    await tx.wait();
                    alert("Access requested! Waiting for patient approval.");
                  } catch (err) {
                    alert("Error: " + err.message);
                  }
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                Send Request
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 gap-2">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                Loading...
              </div>
            ) : patients.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <p className="font-medium text-gray-600">No patients found</p>
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
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 ${selectedPatient?.id === patient.id ? 'bg-blue-50/50 border-r-4 border-blue-600' : 'border-r-4 border-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${selectedPatient?.id === patient.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                          {patient.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`font-semibold ${selectedPatient?.id === patient.id ? 'text-blue-900' : 'text-gray-800'}`}>
                            {patient.name}
                          </h3>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{patient.id.slice(0, 6)}...{patient.id.slice(-4)}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                        {patient.records.length} Records
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Patient Details & Add Record */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {selectedPatient ? (
              <motion.div
                key={selectedPatient.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Add Record Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">New Medical Record</h3>
                      <p className="text-sm text-gray-500">Adding for <span className="font-semibold text-blue-600">{selectedPatient.name}</span></p>
                    </div>
                  </div>

                  <form onSubmit={addRecord} className="grid grid-cols-1 gap-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Record Title</label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="e.g. Lab Results - Jan 2024"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Attach File</label>
                        <div className="relative">
                          <input
                            type="file"
                            onChange={(e) => setFile(e.target.files[0])}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-200 rounded-xl cursor-pointer"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                          placeholder="Clinical notes..."
                          rows="3"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Level</label>
                        <div className="space-y-2">
                          <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="radio" name="privacy" value="2" checked={privacyLevel === '2'} onChange={(e) => setPrivacyLevel(e.target.value)} className="w-4 h-4 text-blue-600" />
                            <div className="ml-3">
                              <span className="block text-sm font-medium text-gray-900">Private (Doctor Only)</span>
                              <span className="block text-xs text-gray-500">Only authorized doctors can view</span>
                            </div>
                          </label>

                          <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="radio" name="privacy" value="1" checked={privacyLevel === '1'} onChange={(e) => setPrivacyLevel(e.target.value)} className="w-4 h-4 text-blue-600" />
                            <div className="ml-3">
                              <span className="block text-sm font-medium text-gray-900">Standard (Insurers+Doctors)</span>
                              <span className="block text-xs text-gray-500">Visible to doctors and insurers</span>
                            </div>
                          </label>

                          <label className="flex items-center p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                            <input type="radio" name="privacy" value="0" checked={privacyLevel === '0'} onChange={(e) => setPrivacyLevel(e.target.value)} className="w-4 h-4 text-blue-600" />
                            <div className="ml-3">
                              <span className="block text-sm font-medium text-gray-900">Research (Public)</span>
                              <span className="block text-xs text-gray-500">Available to verified researchers</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-medium shadow-lg shadow-gray-900/20 hover:bg-black transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add Record
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Past Records List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    Patient History
                  </h3>
                  <div className="space-y-4">
                    {selectedPatient.records.length > 0 ? (
                      selectedPatient.records.map((record, idx) => (
                        <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="mt-1 p-2 bg-blue-50 rounded-lg h-fit">
                                <File className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{record[3]}</h4>
                                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(Number(record.timestamp || record[5] || Date.now() / 1000) * 1000).toLocaleDateString()}
                                  </span>
                                  <span>•</span>
                                  <span>{record[2]}</span>
                                </div>
                                {record[4] && (
                                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">{record[4]}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => viewFile(record[0])}
                              className="px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors border border-gray-200 flex items-center gap-2"
                            >
                              <Search className="w-4 h-4" />
                              View
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-medium">No medical records found</p>
                        <p className="text-sm text-gray-400 mt-1">Uploaded records will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 min-h-[600px]">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-blue-200" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Patient</h3>
                <p className="max-w-xs mx-auto text-gray-500">Choose a patient from the sidebar list to view their medical history or upload new records.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
};