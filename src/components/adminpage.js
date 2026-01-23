import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import registerLogo from '../imgs/register_logo.png';
import { Clock, Shield, AlertCircle, FileText, UserCheck } from 'lucide-react';

export const DoctorRegister = ({ getSignedContracts }) => {
  const [doctorId, setDoctorId] = useState('');
  const [doctorUsername, setDoctorUsername] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const registerDoctor = async (e) => {
    e.preventDefault();
    try {
      const { doctorContract } = await getSignedContracts();
      const tx = await doctorContract.registerDoctor(doctorId, doctorUsername, 'Doctor');
      await tx.wait();
      setSuccess('Doctor registered successfully');
      setDoctorId('');
      setDoctorUsername('');
      setError('');
    } catch (err) {
      setError(err.message || 'Error registering doctor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md space-y-4">

        <h1 className='text-2xl'> Register Doctor </h1>

        <img src={registerLogo} alt="Login Illustration" className="w-50 h-60 mb-4 py-3" />

        <form onSubmit={registerDoctor} className="space-y-4">

          <input type="text" placeholder="Doctor Name" value={doctorUsername}
            onChange={(e) => setDoctorUsername(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <input type="password" placeholder="Doctor Address" value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
            Register Doctor
          </button>
        </form>

        <button onClick={() => navigate('/admin')} className="w-full mb-4 px-4 py-2 bg-gray-600 text-white rounded">
          Back to Admin Dashboard
        </button>

      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

    </div>
  );
};

export const PatientRegister = ({ getSignedContracts }) => {
  const [patientId, setPatientId] = useState('');
  const [patientUsername, setPatientUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const registerPatient = async (e) => {
    e.preventDefault();
    try {
      const { patientContract } = await getSignedContracts();
      const tx = await patientContract.registerPatient(patientId, patientUsername, 'Patient');
      await tx.wait();
      setSuccess('Patient registered successfully');
      setPatientId('');
      setPatientUsername('');
      setError('');
    } catch (err) {
      setError(err.message || 'Error registering patient');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md space-y-4">

        <h1 className='text-2xl'> Register Patient </h1>

        <img src={registerLogo} alt="Login Illustration" className="w-50 h-60 mb-4 py-3" />

        <form onSubmit={registerPatient} className="space-y-4">

          <input type="text" placeholder="Patient Username" value={patientUsername}
            onChange={(e) => setPatientUsername(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <input type="password" placeholder="Patient Address" value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">
            Register Patient
          </button>
        </form>

        <button onClick={() => navigate('/admin')} className="w-full mb-4 px-4 py-2 bg-gray-600 text-white rounded">
          Back to Admin Dashboard
        </button>

      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

    </div>
  );
};


export const InsuranceRegister = ({ getSignedContracts }) => {
  const [insurerId, setInsurerId] = useState('');
  const [insurerUsername, setInsurerUsername] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const registerInsurer = async (e) => {
    e.preventDefault();
    try {
      const { insuranceContract } = await getSignedContracts();
      const tx = await insuranceContract.registerInsurer(insurerId, insurerUsername, 'Insurer');
      await tx.wait();
      setSuccess('Insurer registered successfully');
      setInsurerId('');
      setInsurerUsername('');
      setError('');
    } catch (err) {
      setError(err.message || 'Error registering insurer');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md space-y-4">

        <h1 className='text-2xl'> Register Insurer </h1>

        <img src={registerLogo} alt="Login Illustration" className="w-50 h-60 mb-4 py-3" />

        <form onSubmit={registerInsurer} className="space-y-4">

          <input type="text" placeholder="Insurer Name" value={insurerUsername}
            onChange={(e) => setInsurerUsername(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <input type="password" placeholder="Insurer Address" value={insurerId}
            onChange={(e) => setInsurerId(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <button type="submit" className="w-full py-2 bg-purple-600 text-white rounded">
            Register Insurer
          </button>
        </form>

        <button onClick={() => navigate('/admin')} className="w-full mb-4 px-4 py-2 bg-gray-600 text-white rounded">
          Back to Admin Dashboard
        </button>

      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

    </div>
  );
};

export const ResearcherRegister = ({ getSignedContracts }) => {
  const [researcherId, setResearcherId] = useState('');
  const [researcherUsername, setResearcherUsername] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const registerResearcher = async (e) => {
    e.preventDefault();
    try {
      const { researcherContract } = await getSignedContracts();
      const tx = await researcherContract.registerResearcher(researcherId, researcherUsername, 'Researcher');
      await tx.wait();
      setSuccess('Researcher registered successfully');
      setResearcherId('');
      setResearcherUsername('');
      setError('');
    } catch (err) {
      setError(err.message || 'Error registering researcher');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded shadow-md space-y-4">

        <h1 className='text-2xl'> Register Researcher </h1>

        <img src={registerLogo} alt="Login Illustration" className="w-50 h-60 mb-4 py-3" />

        <form onSubmit={registerResearcher} className="space-y-4">

          <input type="text" placeholder="Researcher Name" value={researcherUsername}
            onChange={(e) => setResearcherUsername(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <input type="password" placeholder="Researcher Address" value={researcherId}
            onChange={(e) => setResearcherId(e.target.value)}
            className="w-full p-2 border rounded" required
          />

          <button type="submit" className="w-full py-2 bg-indigo-600 text-white rounded">
            Register Researcher
          </button>
        </form>

        <button onClick={() => navigate('/admin')} className="w-full mb-4 px-4 py-2 bg-gray-600 text-white rounded">
          Back to Admin Dashboard
        </button>

      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

    </div>
  );
};

export const AuditDashboard = ({ auditContract }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        if (!auditContract) return;
        const allLogs = await auditContract.getAuditTrail();
        const formattedLogs = allLogs.map(l => ({
          actor: l[0],
          actionType: l[1],
          subject: l[2],
          details: l[3],
          timestamp: l[4]
        }));
        formattedLogs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
        setLogs(formattedLogs);
      } catch (err) {
        console.error("Error fetching audits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudits();
  }, [auditContract]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-blue-600" /> System Audit Trail
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
          >
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading audit logs...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {logs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No audit logs recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-semibold text-gray-600">Action Type</th>
                      <th className="p-4 font-semibold text-gray-600">Actor (Initiator)</th>
                      <th className="p-4 font-semibold text-gray-600">Subject (Target)</th>
                      <th className="p-4 font-semibold text-gray-600">Details</th>
                      <th className="p-4 font-semibold text-gray-600">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${log.actionType.includes('GRANT') || log.actionType.includes('REGISTER') ? 'bg-green-100 text-green-700' :
                              log.actionType.includes('REVOKE') ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                            }`}>
                            {log.actionType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-xs text-gray-500">{log.actor}</td>
                        <td className="p-4 font-mono text-xs text-gray-500">{log.subject}</td>
                        <td className="p-4 text-gray-700 max-w-xs truncate" title={log.details}>{log.details}</td>
                        <td className="p-4 text-gray-500">
                          {new Date(Number(log.timestamp) * 1000).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/register-doctor')}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded"
        >
          Register Doctor
        </button>

        <button
          onClick={() => navigate('/register-patient')}
          className="w-full px-6 py-3 bg-green-600 text-white rounded"
        >
          Register Patient
        </button>

        <button
          onClick={() => navigate('/register-insurance')}
          className="w-full px-6 py-3 bg-purple-600 text-white rounded"
        >
          Register Insurer
        </button>

        <button
          onClick={() => navigate('/register-researcher')}
          className="w-full px-6 py-3 bg-indigo-600 text-white rounded"
        >
          Register Researcher
        </button>

        <button
          onClick={() => navigate('/admin/audits')}
          className="w-full px-6 py-3 bg-teal-600 text-white rounded hover:bg-teal-700 transition flex items-center justify-center gap-2"
        >
          <Clock className='w-5 h-5' /> View System Audits
        </button>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 px-6 py-3 bg-gray-600 text-white rounded"
      >
        Back to Login Page
      </button>
    </div>
  );
};