// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ResearcherManagement {
    address public admin;

    struct Researcher {
        string username;
        string role; // e.g., "researcher"
        bool isRegistered;
    }

    mapping(address => Researcher) public researchers;
    address[] private researcherAddresses;
    
    // Maps researcher -> list of patients they have access to
    mapping(address => address[]) public researcherPatients;
    mapping(address => mapping(address => bool)) public researcherPatientAccess;

    event ResearcherRegistered(address indexed researcherAddress, string username, string role);
    event PatientAccessGranted(address indexed researcherAddress, address indexed patientAddress);
    event PatientAccessRevoked(address indexed researcherAddress, address indexed patientAddress);

    constructor() {
        admin = msg.sender;
        researchers[msg.sender] = Researcher("admin", "admin", true);
        researcherAddresses.push(msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function registerResearcher(address _researcherAddress, string memory _username, string memory _role) public {
        require(!researchers[_researcherAddress].isRegistered, "Researcher already registered");
        researchers[_researcherAddress] = Researcher(_username, _role, true);
        researcherAddresses.push(_researcherAddress);
        emit ResearcherRegistered(_researcherAddress, _username, _role);
    }

    address public patientContractAddress;

    function setPatientContractAddress(address _patientContractAddress) external onlyAdmin {
        patientContractAddress = _patientContractAddress;
    }

    function addPatientAccess(address _researcherAddress, address _patientAddress) external {
        require(researchers[_researcherAddress].isRegistered, "Researcher not registered");
        require(!researcherPatientAccess[_researcherAddress][_patientAddress], "Access already granted");
        
        require(msg.sender == _patientAddress || msg.sender == patientContractAddress, "Only patient or PatientContract can grant access");
        
        researcherPatients[_researcherAddress].push(_patientAddress);
        researcherPatientAccess[_researcherAddress][_patientAddress] = true;
        
        emit PatientAccessGranted(_researcherAddress, _patientAddress);
    }

    function revokePatientAccess(address _researcherAddress, address _patientAddress) external {
        require(researchers[_researcherAddress].isRegistered, "Researcher not registered");
        require(researcherPatientAccess[_researcherAddress][_patientAddress], "Access not granted");
        
        require(msg.sender == _patientAddress || msg.sender == patientContractAddress, "Only patient or PatientContract can revoke access");
        
        researcherPatientAccess[_researcherAddress][_patientAddress] = false;
        
        address[] storage patients = researcherPatients[_researcherAddress];
        for (uint i = 0; i < patients.length; i++) {
            if (patients[i] == _patientAddress) {
                patients[i] = patients[patients.length - 1];
                patients.pop();
                break;
            }
        }
        
        emit PatientAccessRevoked(_researcherAddress, _patientAddress);
    }

    function getResearcher(address _researcherAddress) public view returns (string memory username, string memory role, string memory phoneNumber, bool isRegistered) {
        require(researchers[_researcherAddress].isRegistered, "Researcher not registered");
        Researcher memory r = researchers[_researcherAddress];
        return (r.username, r.role, "", r.isRegistered);
    }

    function getAuthorizedPatients(address _researcherAddress) public view returns (address[] memory) {
        return researcherPatients[_researcherAddress];
    }

    function isAuthorized(address _researcherAddress, address _patientAddress) public view returns (bool) {
        return researcherPatientAccess[_researcherAddress][_patientAddress];
    }

    function getAllResearchers() public view returns (address[] memory) {
        return researcherAddresses;
    }
}
