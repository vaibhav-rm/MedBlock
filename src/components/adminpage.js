import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import registerLogo from '../imgs/register_logo.png';


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
          className="w-full px-6 py-3 bg-gray-400 text-white rounded cursor-not-allowed"
          disabled
        >
          View Audits
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