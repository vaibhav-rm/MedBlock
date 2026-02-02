// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract InsuranceManagement {
    address public admin;

    struct InsuranceProf {
        string username;
        string role; // e.g., "insurer"
        bool isRegistered;
    }

    mapping(address => InsuranceProf) public insurers;
    address[] private insurerAddresses;
    
    // Maps insurer -> list of patients they have access to
    mapping(address => address[]) public insurerPatients;
    mapping(address => mapping(address => bool)) public insurerPatientAccess;

    event InsurerRegistered(address indexed insurerAddress, string username, string role);
    event PatientAccessGranted(address indexed insurerAddress, address indexed patientAddress);
    event PatientAccessRevoked(address indexed insurerAddress, address indexed patientAddress);

    constructor() {
        admin = msg.sender;
        insurers[msg.sender] = InsuranceProf("admin", "admin", true);
        insurerAddresses.push(msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function registerInsurer(address _insurerAddress, string memory _username, string memory _role) public {
        require(!insurers[_insurerAddress].isRegistered, "Insurer already registered");
        insurers[_insurerAddress] = InsuranceProf(_username, _role, true);
        insurerAddresses.push(_insurerAddress);
        emit InsurerRegistered(_insurerAddress, _username, _role);
    }

    address public patientContractAddress;

    function setPatientContractAddress(address _patientContractAddress) external onlyAdmin {
        patientContractAddress = _patientContractAddress;
    }

    function addPatientAccess(address _insurerAddress, address _patientAddress) external {
        require(insurers[_insurerAddress].isRegistered, "Insurer not registered");
        require(!insurerPatientAccess[_insurerAddress][_patientAddress], "Access already granted");
        
        // Security: Only the patient OR the trusted PatientContract
        require(msg.sender == _patientAddress || msg.sender == patientContractAddress, "Only patient or PatientContract can grant access");
        
        insurerPatients[_insurerAddress].push(_patientAddress);
        insurerPatientAccess[_insurerAddress][_patientAddress] = true;
        
        emit PatientAccessGranted(_insurerAddress, _patientAddress);
    }

    function revokePatientAccess(address _insurerAddress, address _patientAddress) external {
        require(insurers[_insurerAddress].isRegistered, "Insurer not registered");
        require(insurerPatientAccess[_insurerAddress][_patientAddress], "Access not granted");
        
        require(msg.sender == _patientAddress || msg.sender == patientContractAddress, "Only patient or PatientContract can revoke access");
        
        insurerPatientAccess[_insurerAddress][_patientAddress] = false;
        
        address[] storage patients = insurerPatients[_insurerAddress];
        for (uint i = 0; i < patients.length; i++) {
            if (patients[i] == _patientAddress) {
                patients[i] = patients[patients.length - 1];
                patients.pop();
                break;
            }
        }
        
        emit PatientAccessRevoked(_insurerAddress, _patientAddress);
    }

    function getInsurer(address _insurerAddress) public view returns (string memory username, string memory role, string memory phoneNumber, bool isRegistered) {
        require(insurers[_insurerAddress].isRegistered, "Insurer not registered");
        InsuranceProf memory i = insurers[_insurerAddress];
        return (i.username, i.role, "", i.isRegistered);
    }

    function getAuthorizedPatients(address _insurerAddress) public view returns (address[] memory) {
        return insurerPatients[_insurerAddress];
    }

    function isAuthorized(address _insurerAddress, address _patientAddress) public view returns (bool) {
        return insurerPatientAccess[_insurerAddress][_patientAddress];
    }

    function getAllInsurers() public view returns (address[] memory) {
        return insurerAddresses;
    }
}
