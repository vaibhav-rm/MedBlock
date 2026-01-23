import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAddress } from 'ethers';
import { viewFile } from '../ipfs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FileText, Share2, Shield, Clock,
  CheckCircle, AlertCircle, Search,
  UserCheck, Key, Microscope
} from 'lucide-react';
import '../App.css';

export const PatientLogin = ({ contract, account }) => {
  const [patientId, setPatientId] = useState('');
  const [patientUsername, setPatientUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill if wallet connected
  useEffect(() => {
    if (account) {
      setPatientId(account);
    }
  }, [account]);

  const verifyPatient = async (e) => {
    e.preventDefault();

    if (!patientId) {
      setError('Please enter a Wallet Address');
      return;
    }

    let validAddress = false;
    try {
      validAddress = isAddress(patientId);
    } catch (e) {
      validAddress = false;
    }

    if (!validAddress && !patientId.toLowerCase().match(/^0x[a-f0-9]{40}$/)) {
      setError('Invalid Wallet Address format (must be 0x...)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const sanitizedId = patientId.toLowerCase();
      // Use getPatient to verify. If invalid, it reverts
      const patient = await contract.getPatient(sanitizedId);

      // If no revert, we proceed (assuming contract logic is consistent)
      // Earlier we checked patient.isRegistered but getPatient returns (username, role)
      // If it returns successfully, patient is registered.
      navigate(`/patient-dashboard/${sanitizedId}`);

    } catch (err) {
      console.error(err);
      if (err.message.includes("Patient not registered")) {
        setError('Invalid patient ID or not registered');
      } else {
        setError('Error verifying patient. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-blue-600 p-8 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Patient Portal</h2>
          <p className="text-blue-100 mt-2">Access your secure medical records</p>
        </div>

        <div className="p-8">
          <form onSubmit={verifyPatient} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={patientUsername}
                  onChange={(e) => setPatientUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="0x..."
                />
              </div>
            </div>

            {account && patientId && account.toLowerCase() !== patientId.toLowerCase() && (
              <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-xl border border-yellow-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Wallet Mismatch:</span> You are connected as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{account.slice(0, 6)}...</span> but trying to login as <span className="font-mono text-xs bg-yellow-100 px-1 rounded">{patientId.slice(0, 6)}...</span>.
                  <div className="mt-1 text-xs opacity-90">Transactions will fail. Please switch accounts in MetaMask.</div>
                </div>
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};


export const PatientDashboard = ({ doctorContract, patientContract, insuranceContract, researcherContract, auditContract, getSignedContracts, account }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('records');

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [insurers, setInsurers] = useState([]);
  const [researchers, setResearchers] = useState([]);
  const [records, setRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]); // Audit State
  const [patient, setPatient] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const sanitizedId = id.toLowerCase();
        // 1. Get Patient Info
        const patientInfo = await patientContract.getPatient(sanitizedId);
        setPatient({
          username: patientInfo[0],
          role: patientInfo[1],
          address: sanitizedId
        });

        // 2. Get Doctors & Access Status
        const doctorIds = await doctorContract.getAllDoctors();
        const doctorsData = await Promise.all(
          doctorIds.map(async (doctorId) => {
            const doctor = await doctorContract.getDoctor(doctorId);
            if (doctor[1] === 'admin') return null;
            const hasAccess = await doctorContract.isAuthorized(doctorId, sanitizedId);
            return { id: doctorId, name: doctor[0], hasAccess, role: doctor[1] };
          })
        );
        setDoctors(doctorsData.filter(d => d !== null));

        // 3. Get Insurers
        if (insuranceContract) {
          try {
            const insurerIds = await insuranceContract.getAllInsurers();
            const insurersData = await Promise.all(
              insurerIds.map(async (insurerId) => {
                const insurer = await insuranceContract.getInsurer(insurerId);
                if (insurer[1] === 'admin') return null;
                const hasAccess = await insuranceContract.isAuthorized(insurerId, sanitizedId);
                return { id: insurerId, name: insurer[0], hasAccess, role: insurer[1] };
              })
            );
            setInsurers(insurersData.filter(i => i !== null));
          } catch (e) { console.warn("Insurers fetch failed", e); }
        }

        // 4. Get Researchers
        if (researcherContract) {
          try {
            const resIds = await researcherContract.getAllResearchers();
            const resData = await Promise.all(
              resIds.map(async (resId) => {
                const r = await researcherContract.getResearcher(resId);
                if (r[1] === 'admin') return null;
                const hasAccess = await researcherContract.isAuthorized(resId, sanitizedId);
                return { id: resId, name: r[0], hasAccess, role: r[1] };
              })
            );
            setResearchers(resData.filter(r => r !== null));
          } catch (e) { console.warn("Researchers fetch failed", e); }
        }

        // 5. Get Records
        try {
          const { patientContract: signedPatient } = await getSignedContracts();
          const allRecords = await signedPatient.getActiveRecords(sanitizedId);
          const recordData = await Promise.all(
            allRecords.map(async (record) => {
              try {
                const doctor = await doctorContract.getDoctor(record[6]);
                return {
                  recordCDI: record[0],
                  fileName: record[2],
                  title: record[3],
                  description: record[4],
                  datetime: record[5],
                  doctorName: doctor ? doctor[0] : 'Unknown',
                  doctorId: record[6],
                  privacyLevel: record[8]
                };
              } catch (e) {
                return {
                  recordCDI: record[0],
                  fileName: record[2],
                  title: record[3],
                  description: record[4],
                  datetime: record[5],
                  doctorName: 'Unknown/External',
                  doctorId: record[6],
                  privacyLevel: record[8]
                };
              }
            })
          );
          setRecords(recordData.filter(r => r !== null));
        } catch (recordError) {
          console.warn("Records fetch failed", recordError);
          setRecords([]);
        }

        // 6. Get Access Requests
        try {
          const { patientContract: signedPatient } = await getSignedContracts();
          const fetchedRequests = await signedPatient.getPatientAccessRequests(sanitizedId);
          setRequests([...fetchedRequests]);
        } catch (err) {
          console.warn("Requests fetch failed", err);
        }

        // 7. Get Audit Logs
        if (auditContract) {
          try {
            // We fetch logs where patient is subject
            const logs = await auditContract.getAuditTrailBySubject(sanitizedId);
            // Logs is array of structs/tuples
            const formattedLogs = logs.map(l => ({
              actor: l[0],
              actionType: l[1], // e.g. "ACCESS_GRANTED"
              subject: l[2],
              details: l[3],
              timestamp: l[4]
            }));
            // Sort by timestamp desc
            formattedLogs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
            setAuditLogs(formattedLogs);
          } catch (e) { console.warn("Audit fetch failed", e); }
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorContract && patientContract && id) {
      fetchData();
    }
  }, [doctorContract, patientContract, insuranceContract, researcherContract, auditContract, id]);

  // Access Duration Constants (Seconds)
  const DOCTOR_ACCESS_TIME = 30 * 24 * 60 * 60; // 30 Days
  const RESEARCHER_ACCESS_TIME = 7 * 24 * 60 * 60; // 7 Days
  const INSURANCE_ACCESS_TIME = 24 * 60 * 60; // 24 Hours

  const handleGrantAccess = async (doctorId) => {
    try {
      const sanitizedDoctorId = doctorId.toLowerCase();
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(sanitizedDoctorId, DOCTOR_ACCESS_TIME);
      await tx.wait();

      setDoctors(doctors.map(d =>
        d.id === doctorId ? { ...d, hasAccess: true } : d
      ));
      alert(`Access granted successfully for 30 days!`);
    } catch (err) {
      alert('Error granting access: ' + (err.reason || err.message));
    }
  };

  const handleRevokeAccess = async (doctorId) => {
    try {
      const { patientContract: signedPatient } = await getSignedContracts();
      const sanitizedDoctorId = doctorId.toLowerCase();
      const tx = await signedPatient.revokeAccess(sanitizedDoctorId);
      await tx.wait();
      setDoctors(doctors.map(d =>
        d.id === doctorId ? { ...d, hasAccess: false } : d
      ));
      alert("Access revoked successfully!");
    } catch (err) {
      alert('Error revoking access: ' + err.message);
    }
  };

  const handleGrantInsuranceAccess = async (insurerId) => {
    try {
      const sanitizedId = insurerId.toLowerCase();
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(sanitizedId, INSURANCE_ACCESS_TIME);
      await tx.wait();
      setInsurers(insurers.map(i => i.id === insurerId ? { ...i, hasAccess: true } : i));
      alert(`Access granted to Insurer for 24 hours!`);
    } catch (err) {
      alert("Error granting access: " + (err.reason || err.message));
    }
  };

  const handleRevokeInsuranceAccess = async (insurerId) => {
    try {
      const sanitizedId = insurerId.toLowerCase();
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.revokeAccess(sanitizedId);
      await tx.wait();
      setInsurers(insurers.map(i => i.id === insurerId ? { ...i, hasAccess: false } : i));
      alert("Access revoked!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleGrantResearcherAccess = async (resId) => {
    try {
      const sanitizedId = resId.toLowerCase();
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(sanitizedId, RESEARCHER_ACCESS_TIME);
      await tx.wait();
      setResearchers(researchers.map(r => r.id === resId ? { ...r, hasAccess: true } : r));
      alert(`Access granted to Researcher for 7 days!`);
    } catch (err) {
      alert("Error granting access: " + (err.reason || err.message));
    }
  };

  const handleRevokeResearcherAccess = async (resId) => {
    try {
      const sanitizedId = resId.toLowerCase();
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.revokeAccess(sanitizedId);
      await tx.wait();
      setResearchers(researchers.map(r => r.id === resId ? { ...r, hasAccess: false } : r));
      alert("Access revoked!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleApproveRequest = async (reqAddress, duration) => {
    /* (Keeping original logic but simplified for brevity in overwrite) */
    try {
      const { patientContract: signedPatient, doctorContract: signedDoc } = await getSignedContracts();
      const tx1 = await signedPatient.grantAccess(reqAddress, duration);
      await tx1.wait();

      // Try sync
      try { await signedDoc.addPatientAccess(reqAddress, id.toLowerCase()); } catch (e) { }

      setRequests(requests.filter(r => r !== reqAddress));
      alert("Request approved!");
    } catch (e) { alert("Error: " + e.message); }
  };

  const handleManualGrant = async (address, duration) => {
    try {
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(address.toLowerCase(), duration);
      await tx.wait();
      alert("Access granted to " + address);
    } catch (e) { alert("Error: " + e.message); }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {patient?.username}</h1>
            <div className="flex items-center gap-2 text-gray-500 mt-1 font-mono text-sm bg-gray-100 px-3 py-1 rounded-full w-fit">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {id}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button onClick={() => setActiveTab('records')} className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'records' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" /> Medical Records
            </div>
            {activeTab === 'records' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>

          <button onClick={() => setActiveTab('access')} className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'access' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" /> Access Control
              {requests.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>}
            </div>
            {activeTab === 'access' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>

          <button onClick={() => setActiveTab('audit')} className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'audit' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" /> Audit Trail
            </div>
            {activeTab === 'audit' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />}
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'records' ? (
            <motion.div key="records" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {records.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No medical records found.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {records.map((record, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className='flex flex-col items-end gap-1'>
                          <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {new Date(Number(record.datetime) * 1000).toLocaleDateString()}
                          </span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${record.privacyLevel == 0 ? 'bg-green-100 text-green-700' :
                            record.privacyLevel == 1 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {record.privacyLevel == 0 ? 'Research' : record.privacyLevel == 1 ? 'Standard' : 'Private'}
                          </span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{record.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{record.description}</p>
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <UserCheck className="w-4 h-4" /> <span>Dr. {record.doctorName}</span>
                      </div>
                      <button onClick={() => viewFile(record.recordCDI)} className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" /> View Document
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : activeTab === 'access' ? (
            <motion.div key="access" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">

              {/* Requests */}
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2"><Clock className="w-5 h-5" /> Pending Requests</h3>
                {requests.length === 0 ? <p className="text-orange-700/70">No pending access requests.</p> : (
                  <div className="space-y-4">
                    {requests.map((req, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div><p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">{req}</p></div>
                        <button onClick={() => handleApproveRequest(req, 604800)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">Approve</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Doctors */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900">Registered Doctors</h3></div>
                <div className="divide-y divide-gray-100">
                  {doctors.map(doctor => (
                    <div key={doctor.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><UserCheck className="w-6 h-6 text-blue-600" /></div>
                        <div><h4 className="font-semibold text-gray-900">{doctor.name}</h4><p className="text-xs text-gray-500 font-mono mt-1">{doctor.id}</p></div>
                      </div>
                      {doctor.hasAccess ?
                        <button onClick={() => handleRevokeAccess(doctor.id)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Revoke</button> :
                        <button onClick={() => handleGrantAccess(doctor.id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Grant Access</button>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Insurers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-600" /> Registered Insurers</h3></div>
                <div className="divide-y divide-gray-100">
                  {insurers.map(insurer => (
                    <div key={insurer.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center"><Shield className="w-6 h-6 text-emerald-600" /></div>
                        <div><h4 className="font-semibold text-gray-900">{insurer.name}</h4><p className="text-xs text-gray-500 font-mono mt-1">{insurer.id}</p></div>
                      </div>
                      {insurer.hasAccess ?
                        <button onClick={() => handleRevokeInsuranceAccess(insurer.id)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Revoke</button> :
                        <button onClick={() => handleGrantInsuranceAccess(insurer.id)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">Grant Access</button>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Researchers (NEW) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
                <div className="p-6 border-b border-gray-100"><h3 className="text-lg font-bold text-gray-900 flex items-center gap-2"><Microscope className="w-5 h-5 text-purple-600" /> Registered Researchers</h3></div>
                <div className="divide-y divide-gray-100">
                  {researchers.map(r => (
                    <div key={r.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center"><Microscope className="w-6 h-6 text-purple-600" /></div>
                        <div><h4 className="font-semibold text-gray-900">{r.name}</h4><p className="text-xs text-gray-500 font-mono mt-1">{r.id}</p></div>
                      </div>
                      {r.hasAccess ?
                        <button onClick={() => handleRevokeResearcherAccess(r.id)} className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors">Revoke</button> :
                        <button onClick={() => handleGrantResearcherAccess(r.id)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors">Grant Access</button>
                      }
                    </div>
                  ))}
                  {researchers.length === 0 && <div className="p-6 text-center text-gray-500">No researchers registered.</div>}
                </div>
              </div>

              {/* Manual Grant */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-60">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Manual Grant (Advanced)</h3>
                <div className="flex gap-2">
                  <input type="text" id="custom-addr" placeholder="0x..." className="p-2 border rounded text-sm w-full" />
                  <button onClick={() => handleManualGrant(document.getElementById('custom-addr').value, 604800)} className="bg-gray-200 px-3 py-1 rounded text-sm">Add</button>
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl text-gray-500">No audit logs found.</div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="p-4 font-semibold text-gray-600">Action</th>
                        <th className="p-4 font-semibold text-gray-600">Actor (Who)</th>
                        <th className="p-4 font-semibold text-gray-600">Details</th>
                        <th className="p-4 font-semibold text-gray-600">When</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {auditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-bold text-gray-800">
                            <span className={`px-2 py-1 rounded text-xs ${log.actionType === 'ACCESS_GRANTED' ? 'bg-green-100 text-green-800' :
                              log.actionType === 'ACCESS_REVOKED' ? 'bg-red-100 text-red-800' :
                                log.actionType === 'RECORD_ADDED' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                              {log.actionType.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-gray-500 text-xs">{log.actor}</td>
                          <td className="p-4 text-gray-600">{log.details}</td>
                          <td className="p-4 text-gray-500">{new Date(Number(log.timestamp) * 1000).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >
  );
};
