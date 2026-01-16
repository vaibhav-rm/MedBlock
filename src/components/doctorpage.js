import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { uploadFileToIPFS, viewFile } from '../ipfs';
import userLogo from '../imgs/user_logo.png';
import '../App.css';
import { BrowserProvider } from 'ethers';

export const DoctorLogin = ({ contract, account, connectWallet }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      // Optional: Auto-check if user is already a doctor to streamline UX
      checkDoctorStatus(account);
    }
  }, [account]);

  const checkDoctorStatus = async (walletAddress) => {
    try {
      const doctor = await contract.doctors(walletAddress);
      if (doctor.isRegistered) {
        // We could auto-redirect here, but a button click is often better
        // navigate(`/doctor-dashboard/${walletAddress}`);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!account) {
      await connectWallet();
      return;
    }

    setLoading(true);
    try {
      const doctor = await contract.doctors(account);

      if (doctor.isRegistered) {
        navigate(`/doctor-dashboard/${account}`);
      } else {
        setError('Accound not registered as a Doctor.');
      }
    } catch (err) {
      setError('Error verifying doctor status.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-gray-100 to-gray-100">
      <div className="glass-panel p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6 transform transition-all hover:scale-[1.01]">

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
            <img src={userLogo} alt="Doctor" className="w-16 h-16 opacity-80" />
          </div>
          <h1 className='text-3xl font-bold text-gray-800 tracking-tight'>Doctor Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Secure Blockchain Access</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Wallet Address</label>
            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500 font-mono text-xs break-all flex items-center justify-center min-h-[3rem]">
              {account ? account : "No wallet connected"}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center justify-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 transform hover:-translate-y-1 
                ${account
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200'
                : 'bg-gray-800 hover:bg-gray-900'
              }`}
          >
            {loading ? 'Verifying...' : (account ? 'Login to Dashboard' : 'Connect Wallet')}
          </button>
        </form>

        <button onClick={() => navigate('/')} className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors">
          ← Back to Home
        </button>

      </div>
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // get doctor info 
        const doctorInfo = await doctorContract.getDoctor(id);
        const name = doctorInfo[0];
        setDoctor({ name, address: id });

        const authorizedPatients = await doctorContract.getAuthorizedPatients(id);

        const patientsData = await Promise.all(
          authorizedPatients.map(async (patientId) => {
            const patient = await patientContract.getPatient(patientId);
            const patientRecords = await patientContract.getActiveRecords(patientId);
            const doctorRecords = patientRecords.filter(record => record[6] === id);

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
        ''
      );

      await tx.wait();

      // Optimistically update or re-fetch
      const patientRecords = await signedDoctorContract.getActiveRecords(selectedPatient.id);
      const doctorRecords = patientRecords.filter(record => record.doctor === id);

      setPatients(patients.map(p =>
        p.id === selectedPatient.id ? { ...p, records: doctorRecords } : p
      ));

      setFile(null);
      setTitle('');
      setDescription('');
      alert('Record added successfully');
    } catch (err) {
      console.error("Error adding record:", err);
      alert('Error adding record: ' + err.message);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
            DR
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{doctor?.name || "Loading..."}</h1>
            <p className="text-xs text-gray-500 font-mono">{id?.slice(0, 6)}...{id?.slice(-4)}</p>
          </div>
        </div>
        <button onClick={() => navigate('/')} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          Sign Out
        </button>
      </nav>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Sidebar: Patients List */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <span>My Patients</span>
            <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{patients.length}</span>
          </h2>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="p-8 text-center text-gray-400">Loading patients...</div>
            ) : patients.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full mb-3"></div>
                <p>No patients detected.</p>
                <p className="text-xs mt-1">Patients must grant you access first.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {patients.map(patient => (
                  <div
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors duration-200 group ${selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                      }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`font-semibold ${selectedPatient?.id === patient.id ? 'text-blue-900' : 'text-gray-800'}`}>{patient.name}</h3>
                        <p className="text-xs text-gray-400 font-mono mt-1">{patient.id.slice(0, 8)}...</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">{patient.records.length} Records</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content: Patient Details & Add Record */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPatient ? (
            <>
              {/* Add Record Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Add Medical Record for {selectedPatient.name}</h3>
                <form onSubmit={addRecord} className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Annual Checkup Results"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Additional notes..."
                      rows="2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attach File</label>
                    <input
                      type="file"
                      onChange={(e) => setFile(e.target.files[0])}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      Upload Record
                    </button>
                  </div>
                </form>
              </div>

              {/* Past Records List */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">History</h3>
                <div className="space-y-3">
                  {selectedPatient.records.length > 0 ? (
                    selectedPatient.records.map((record, idx) => (
                      <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800 text-lg">{record[3]}</h4>
                            <div className="flex items-center space-x-2 mt-1 text-sm text-gray-500">
                              <span>{new Date(Number(record.timestamp) * 1000).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{record[2]}</span>
                            </div>
                            {record[4] && (
                              <p className="mt-3 text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">{record[4]}</p>
                            )}
                          </div>
                          <button
                            onClick={() => viewFile(record[0])}
                            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                          >
                            View Document
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <p className="text-gray-500">No records found for this patient.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center text-gray-400 min-h-[500px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-gray-800">Select a Patient</h3>
              <p>Choose a patient from the sidebar to view their records or add a new one.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};