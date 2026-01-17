import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { viewFile } from '../ipfs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, FileText, Share2, Shield, Clock,
  CheckCircle, XCircle, AlertCircle, Search,
  ChevronRight, Calendar, UserCheck, Key
} from 'lucide-react';
import userLogo from '../imgs/user_logo.png';
import '../App.css';

export const PatientLogin = ({ contract }) => {
  const [patientId, setPatientId] = useState('');
  const [patientUsername, setPatientUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verifyPatient = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const patient = await contract.patients(patientId);
      if (patient.isRegistered) {
        navigate(`/patient-dashboard/${patientId}`);
      } else {
        setError('Invalid patient ID or not registered');
      }
    } catch (err) {
      console.error(err);
      setError('Error verifying patient. Please check your connection.');
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


export const PatientDashboard = ({ doctorContract, patientContract, getSignedContracts }) => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('records');

  // Data States
  const [doctors, setDoctors] = useState([]);
  const [records, setRecords] = useState([]);
  const [patient, setPatient] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get Patient Info
        const patientInfo = await patientContract.getPatient(id);
        setPatient({
          username: patientInfo[0],
          role: patientInfo[1],
          address: id
        });

        // 2. Get Doctors & Access Status
        const doctorIds = await doctorContract.getAllDoctors();
        const doctorsData = await Promise.all(
          doctorIds.map(async (doctorId) => {
            const doctor = await doctorContract.getDoctor(doctorId);
            if (doctor[1] === 'admin') return null;
            const hasAccess = await doctorContract.isAuthorized(doctorId, id);
            return { id: doctorId, name: doctor[0], hasAccess, role: doctor[1] };
          })
        );
        setDoctors(doctorsData.filter(d => d !== null));

        // 3. Get Records
        const allRecords = await patientContract.getActiveRecords(id);
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
                doctorId: record[6]
              };
            } catch (e) {
              return null;
            }
          })
        );
        setRecords(recordData.filter(r => r !== null));

        // 4. Get Access Requests
        try {
          const fetchedRequests = await patientContract.getPatientAccessRequests(id);
          setRequests([...fetchedRequests]);
        } catch (err) {
          console.warn("Could not fetch requests (might need signer):", err);
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
  }, [doctorContract, patientContract, id]);

  const handleGrantAccess = async (doctorId) => {
    try {
      const { doctorContract: signedDoc } = await getSignedContracts();
      const tx = await signedDoc.addPatientAccess(doctorId, id);
      await tx.wait();

      setDoctors(doctors.map(d =>
        d.id === doctorId ? { ...d, hasAccess: true } : d
      ));
      alert("Access granted successfully!");
    } catch (err) {
      alert('Error granting access: ' + err.message);
    }
  };

  const handleRevokeAccess = async (doctorId) => {
    try {
      const { doctorContract: signedDoc } = await getSignedContracts();
      const tx = await signedDoc.revokePatientAccess(doctorId, id);
      await tx.wait();

      setDoctors(doctors.map(d =>
        d.id === doctorId ? { ...d, hasAccess: false } : d
      ));
      alert("Access revoked successfully!");
    } catch (err) {
      alert('Error revoking access: ' + err.message);
    }
  };

  const handleApproveRequest = async (reqAddress, duration) => {
    try {
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(reqAddress, duration);
      await tx.wait();
      setRequests(requests.filter(r => r !== reqAddress));
      alert("Request approved!");
    } catch (err) {
      alert("Error approving request: " + err.message);
    }
  };

  const handleManualGrant = async (address, duration) => {
    try {
      const { patientContract: signedPatient } = await getSignedContracts();
      const tx = await signedPatient.grantAccess(address, duration);
      await tx.wait();
      alert("Access granted to " + address);
    } catch (err) {
      alert("Error granting access: " + err.message);
    }
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
          <div className="flex gap-3">
            {/* Stats or Actions could go here */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('records')}
            className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'records' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Medical Records
            </div>
            {activeTab === 'records' && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('access')}
            className={`pb-4 px-4 font-medium transition-all relative ${activeTab === 'access' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Access Control
              {requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
              )}
            </div>
            {activeTab === 'access' && (
              <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
            )}
          </button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'records' ? (
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
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
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {new Date(Number(record.datetime) * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{record.title}</h3>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{record.description}</p>

                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <UserCheck className="w-4 h-4" />
                        <span>Dr. {record.doctorName}</span>
                      </div>

                      <button
                        onClick={() => viewFile(record.recordCDI)}
                        className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <Search className="w-4 h-4" /> View Document
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="access"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Pending Requests */}
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-100">
                <h3 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" /> Pending Requests
                </h3>
                {requests.length === 0 ? (
                  <p className="text-orange-700/70">No pending access requests.</p>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">{req}</p>
                          <p className="text-xs text-gray-400 mt-1">Requesting access to your records</p>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <select id={`dur-${req}`} className="p-2 rounded-lg border border-gray-200 text-sm bg-gray-50 flex-1">
                            <option value="3600">1 Hour</option>
                            <option value="86400">1 Day</option>
                            <option value="604800">1 Week</option>
                          </select>
                          <button
                            onClick={() => {
                              const dur = document.getElementById(`dur-${req}`).value;
                              handleApproveRequest(req, dur);
                            }}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Registered Doctors List */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Registered Doctors</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {doctors.map(doctor => (
                    <div key={doctor.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                          <p className="text-xs text-gray-500 font-mono mt-1">{doctor.id}</p>
                        </div>
                      </div>

                      {doctor.hasAccess ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" /> Authorized
                          </span>
                          <button
                            onClick={() => handleRevokeAccess(doctor.id)}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                          >
                            Revoke
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleGrantAccess(doctor.id)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Grant Access
                        </button>
                      )}
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No doctors registered in the system.</div>
                  )}
                </div>
              </div>

              {/* Manual Grant Access */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-purple-600" /> Custom Access Grant
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                    <input type="text" id="custom-addr" placeholder="0x..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none" />
                  </div>
                  <div className="w-full md:w-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <div className="flex gap-2">
                      <select id="custom-dur" className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none">
                        <option value="3600">1 Hour</option>
                        <option value="86400">1 Day</option>
                        <option value="604800">1 Week</option>
                      </select>
                      <button
                        onClick={() => {
                          const addr = document.getElementById('custom-addr').value;
                          const dur = document.getElementById('custom-dur').value;
                          if (!addr) return alert("Enter address");
                          handleManualGrant(addr, dur);
                        }}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
                      >
                        Grant Access
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
