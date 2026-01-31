// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

    // Interface for DoctorManagement
    interface IDoctorManagement {
        function addPatientAccess(address _doctorAddress, address _patientAddress) external;
        function revokePatientAccess(address _doctorAddress, address _patientAddress) external;
        function getDoctor(address _doctorAddress) external view returns (string memory, string memory, bool);
    }

    // Interface for InsuranceManagement
    interface IInsuranceManagement {
        function addPatientAccess(address _insurerAddress, address _patientAddress) external;
        function revokePatientAccess(address _insurerAddress, address _patientAddress) external;
        function getInsurer(address _insurerAddress) external view returns (string memory, string memory, bool);
    }

    // Interface for ResearcherManagement
    interface IResearcherManagement {
        function addPatientAccess(address _researcherAddress, address _patientAddress) external;
        function revokePatientAccess(address _researcherAddress, address _patientAddress) external;
        function getResearcher(address _researcherAddress) external view returns (string memory, string memory, bool);
    }

    interface IHealthcareAudit {
        function addAuditLog(address _actor, string memory _actionType, address _subject, string memory _details) external;
    }

contract PatientManagement {
    address public admin;

    struct MedicalRecord {
        string ipfsHash;
        string fileType;
        string fileName;
        string title;
        string resume;
        uint256 timestamp;
        address doctor;
        bool isActive; 
        string previousVersion;
        uint8 privacyLevel; // 0=Research/Public, 1=Standard (Insurer+), 2=Private (Doctor Only)
    }

    struct Patient {
        string username;
        string role;
        bool isRegistered;
    }

    mapping(address => Patient) public patients;
    address[] public allPatients; // Track all registered patients
    mapping(address => MedicalRecord[]) public patientRecords;
    mapping(string => uint256) private recordIndexes; // Maps IPFS hash to array index
    
    // Mapping from patient address -> viewer address -> expiry timestamp
    mapping(address => mapping(address => uint256)) public accessExpiry;

    event PatientRegistered(address indexed patientAddress, string username, string role);
    event MedicalRecordAdded(address indexed patientAddress, address indexed doctorAddress, string ipfsHash, uint256 timestamp, uint8 privacyLevel);
    event MedicalRecordUpdated(address indexed patientAddress, string oldIpfsHash, string newIpfsHash, uint256 timestamp);
    
    event AccessGranted(address indexed patient, address indexed viewer, uint256 expiry);
    event AccessRevoked(address indexed patient, address indexed viewer);

    constructor() {
        admin = msg.sender;
        patients[msg.sender] = Patient("admin", "admin", true);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function registerPatient(address _patientAddress, string memory _username, string memory _role) public onlyAdmin {
        require(!patients[_patientAddress].isRegistered, "Patient already registered");
        patients[_patientAddress] = Patient(_username, _role, true);
        allPatients.push(_patientAddress);
        emit PatientRegistered(_patientAddress, _username, _role);
        
        if (auditContractAddress != address(0)) {
            try IHealthcareAudit(auditContractAddress).addAuditLog(msg.sender, "PATIENT_REGISTERED", _patientAddress, _username) {} catch {}
        }
    }

    function getAllPatients() public view returns (address[] memory) {
        return allPatients;
    }

    function getPatient(address _patientAddress) public view returns (string memory username, string memory role) {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        Patient memory patient = patients[_patientAddress];
        return (patient.username, patient.role);
    }

    function addMedicalRecord(
        address _patientAddress, 
        string memory _ipfsHash,
        string memory _fileType,
        string memory _fileName,
        string memory _title,
        string memory _resume,
        string memory _previousVersion,
        uint8 _privacyLevel
    ) external {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        require(_privacyLevel <= 2, "Invalid privacy level");
        
        // If updating an existing record
        if (bytes(_previousVersion).length > 0) {
            // Mark the old version as inactive
            uint256 oldIndex = recordIndexes[_previousVersion];
            patientRecords[_patientAddress][oldIndex].isActive = false;
            
            emit MedicalRecordUpdated(_patientAddress, _previousVersion, _ipfsHash, block.timestamp);
        }

        // Add new record
        MedicalRecord memory newRecord = MedicalRecord(
            _ipfsHash,
            _fileType,
            _fileName,
            _title,
            _resume,
            block.timestamp,
            msg.sender,
            true, 
            _previousVersion,
            _privacyLevel
        );

        patientRecords[_patientAddress].push(newRecord);
        recordIndexes[_ipfsHash] = patientRecords[_patientAddress].length - 1;
        
        emit MedicalRecordAdded(_patientAddress, msg.sender, _ipfsHash, block.timestamp, _privacyLevel);

        if (auditContractAddress != address(0)) {
            try IHealthcareAudit(auditContractAddress).addAuditLog(msg.sender, "RECORD_ADDED", _patientAddress, _ipfsHash) {} catch {}
        }
    }

    function getMedicalRecords(address _patientAddress) public view returns (MedicalRecord[] memory) {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        return patientRecords[_patientAddress];
    }

    // New function to get only active records
    function getActiveRecords(address _patientAddress) public view returns (MedicalRecord[] memory) {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        require(msg.sender == _patientAddress, "Access allowed only for patient owner");
        
        // Return all records for the owner
        uint256 activeCount = 0;
        for (uint256 i = 0; i < patientRecords[_patientAddress].length; i++) {
            if (patientRecords[_patientAddress][i].isActive) {
                activeCount++;
            }
        }
        
        MedicalRecord[] memory activeRecords = new MedicalRecord[](activeCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < patientRecords[_patientAddress].length; i++) {
            if (patientRecords[_patientAddress][i].isActive) {
                activeRecords[currentIndex] = patientRecords[_patientAddress][i];
                currentIndex++;
            }
        }
        
        return activeRecords;
    }

    address public doctorContractAddress;
    address public insuranceContractAddress;
    address public researcherContractAddress;
    address public auditContractAddress;

    function setDoctorContractAddress(address _doctorContractAddress) external onlyAdmin {
        doctorContractAddress = _doctorContractAddress;
    }

    function setInsuranceContractAddress(address _insuranceContractAddress) external onlyAdmin {
        insuranceContractAddress = _insuranceContractAddress;
    }

    function setResearcherContractAddress(address _researcherContractAddress) external onlyAdmin {
        researcherContractAddress = _researcherContractAddress;
    }

    function setAuditContractAddress(address _auditContractAddress) external onlyAdmin {
        auditContractAddress = _auditContractAddress;
    }

    function grantAccess(address _viewer, uint256 _durationSeconds) public {
        require(patients[msg.sender].isRegistered, "Sender invalid");
        require(_viewer != address(0), "Invalid viewer address");
        // Grant permission for a specific time
        accessExpiry[msg.sender][_viewer] = block.timestamp + _durationSeconds;
        emit AccessGranted(msg.sender, _viewer, block.timestamp + _durationSeconds);

        // Sync with Doctor Contract
        if (doctorContractAddress != address(0)) {
            try IDoctorManagement(doctorContractAddress).addPatientAccess(_viewer, msg.sender) {} catch {}
        }
        
        // Sync with Insurance Contract
        if (insuranceContractAddress != address(0)) {
            try IInsuranceManagement(insuranceContractAddress).addPatientAccess(_viewer, msg.sender) {} catch {}
        }

        // Sync with Researcher Contract
        if (researcherContractAddress != address(0)) {
            try IResearcherManagement(researcherContractAddress).addPatientAccess(_viewer, msg.sender) {} catch {}
        }

        // Remove from pending requests if exists
        address[] storage requests = patientAccessRequests[msg.sender];
        for (uint i = 0; i < requests.length; i++) {
            if (requests[i] == _viewer) {
                requests[i] = requests[requests.length - 1];
                requests.pop();
                break;
            }
        }

        if (auditContractAddress != address(0)) {
            try IHealthcareAudit(auditContractAddress).addAuditLog(msg.sender, "ACCESS_GRANTED", _viewer, "7 Days Access") {} catch {}
        }
    }
    
    function revokeAccess(address _viewer) public {
        require(patients[msg.sender].isRegistered, "Sender invalid");
        accessExpiry[msg.sender][_viewer] = 0;
        emit AccessRevoked(msg.sender, _viewer);

        if (doctorContractAddress != address(0)) {
             try IDoctorManagement(doctorContractAddress).revokePatientAccess(_viewer, msg.sender) {} catch {}
        }
        if (insuranceContractAddress != address(0)) {
             try IInsuranceManagement(insuranceContractAddress).revokePatientAccess(_viewer, msg.sender) {} catch {}
        }
        if (researcherContractAddress != address(0)) {
             try IResearcherManagement(researcherContractAddress).revokePatientAccess(_viewer, msg.sender) {} catch {}
        }

        if (auditContractAddress != address(0)) {
            try IHealthcareAudit(auditContractAddress).addAuditLog(msg.sender, "ACCESS_REVOKED", _viewer, "Manual Revoke") {} catch {}
        }
    }

    // Request Access Logic
    mapping(address => address[]) public patientAccessRequests;
    event AccessRequested(address indexed patient, address indexed viewer);

    function requestAccess(address _patientAddress) public {
        require(patients[_patientAddress].isRegistered, "Patient not registered");
        require(_patientAddress != msg.sender, "Cannot request access to self");
        
        if (accessExpiry[_patientAddress][msg.sender] > block.timestamp) {
            revert("Already has access");
        }

        address[] memory requests = patientAccessRequests[_patientAddress];
        for(uint i=0; i<requests.length; i++) {
            if(requests[i] == msg.sender) revert("Request already pending");
        }

        patientAccessRequests[_patientAddress].push(msg.sender);
        emit AccessRequested(_patientAddress, msg.sender);
    }

    function getPatientAccessRequests(address _patientAddress) public view returns (address[] memory) {
        require(msg.sender == _patientAddress, "Only patient can view requests");
        return patientAccessRequests[_patientAddress];
    }

    // Determine the max privacy level the caller can see
    function _getMaxAccessLevel(address _viewer) internal view returns (uint8) {
        // Patient can see everything (Level 255 effectively, but we handle that in main func)
        
        // Check Doctor (Level 2)
        if (doctorContractAddress != address(0)) {
            try IDoctorManagement(doctorContractAddress).getDoctor(_viewer) returns (string memory, string memory, bool isReg) {
                if (isReg) return 2;
            } catch {}
        }

        // Check Insurer (Level 1)
        if (insuranceContractAddress != address(0)) {
            try IInsuranceManagement(insuranceContractAddress).getInsurer(_viewer) returns (string memory, string memory, bool isReg) {
                if (isReg) return 1;
            } catch {}
        }

        // Check Researcher (Level 0)
        if (researcherContractAddress != address(0)) {
            try IResearcherManagement(researcherContractAddress).getResearcher(_viewer) returns (string memory, string memory, bool isReg) {
                if (isReg) return 0;
            } catch {}
        }

        // Default: No access to any levels if not registered (though getting here implies 'accessExpiry' passes)
        // If someone is not registered in ANY contract but somehow has 'accessExpiry', we default to level 0 (safest)
        return 0; 
    }

    function getSharedRecords(address _patientAddress) public view returns (MedicalRecord[] memory) {
        // Caller must be either:
        // 1. The patient themselves
        // 2. An authorized viewer with active consent
        
        bool isPatient = (_patientAddress == msg.sender);
        bool hasConsent = (accessExpiry[_patientAddress][msg.sender] > block.timestamp);
        
        // Check if caller is a registered doctor
        bool isDoctor = false;
        if (doctorContractAddress != address(0)) {
            try IDoctorManagement(doctorContractAddress).getDoctor(msg.sender) returns (string memory, string memory, bool isReg) {
                isDoctor = isReg;
            } catch {}
        }

        require(isPatient || hasConsent || isDoctor, "Access denied");

        uint8 maxLevel = 0;
        if (isPatient) {
            maxLevel = 255; // All levels
        } else if (isDoctor) {
             maxLevel = 2; // Doctor access level
        } else {
            maxLevel = _getMaxAccessLevel(msg.sender);
        }
        
        // Count matching records
        uint256 matchCount = 0;
        for (uint256 i = 0; i < patientRecords[_patientAddress].length; i++) {
            MedicalRecord memory r = patientRecords[_patientAddress][i];
            if (r.isActive) {
                if (isPatient || r.privacyLevel <= maxLevel) {
                    matchCount++;
                }
            }
        }
        
        MedicalRecord[] memory matches = new MedicalRecord[](matchCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 0; i < patientRecords[_patientAddress].length; i++) {
            MedicalRecord memory r = patientRecords[_patientAddress][i];
            if (r.isActive) {
                 if (isPatient || r.privacyLevel <= maxLevel) {
                    matches[currentIndex] = r;
                    currentIndex++;
                }
            }
        }
        
        return matches;
    }
}