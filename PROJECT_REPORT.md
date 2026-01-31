# Project Report: MedBlock - Decentralized Medical Record System

**Date:** January 24, 2026
**Project Type:** Blockchain / Healthcare

---

## 1. Executive Summary

MedBlock is a decentralized application (dApp) developed to address the critical challenges of data privacy, interoperability, and patient sovereignty in the healthcare sector. By leveraging the Ethereum blockchain for immutable access control and the InterPlanetary File System (IPFS) for decentralized storage, the system provides a secure, transparent, and user-centric platform for managing Electronic Health Records (EHR). The project successfully implements Role-Based Access Control (RBAC) ensuring that patients retain full ownership of their data while enabling authorized sharing with medical professionals and insurers.

---

## 2. Introduction

### 2.1 Problem Statement
Traditional healthcare systems rely on centralized databases that are vulnerable to single points of failure, data breaches, and ransomware attacks. Furthermore, these systems often operate in silos, making it difficult for patients to share their medical history across different providers seamlessly. Patients often lack visibility into who is accessing their data and for what purpose.

### 2.2 Proposed Solution
MedBlock proposes a hybrid architecture combining:
*   **Blockchain (Ethereum)**: To act as a secure, immutable ledger for identity management, access permissions, and audit logs.
*   **Decentralized Storage (IPFS)**: To store heavy medical files (X-rays, PDFs) in a distributed manner, ensuring high availability and tamper resistance.

This solution ensures that while the data itself is stored off-chain (for efficiency), the *control* of that data remains strictly on-chain, verifiable by smart contracts.

---

## 3. System Architecture

The project follows a modern 3-Tier Decentralized Architecture:

1.  **Presentation Layer (Frontend)**
    *   Built with **React.js** for a responsive and dynamic user interface.
    *   Integrates **Ethers.js** to communicate with the Ethereum blockchain via the user's wallet (MetaMask).
    *   Provides dedicated portals for Patients, Doctors, Researchers, and Insurers.

2.  **Logic Layer (Smart Contracts)**
    *   Written in **Solidity** and deployed on the **Sepolia Testnet**.
    *   **PatientManagement.sol**: The core contract managing the patient registry and individual medical record references (CIDs).
    *   **DoctorManagement.sol**: Manages verification and authentication of medical practitioners.
    *   **Researcher/Insurance Contracts**: specialized contracts for third-party access control.

3.  **Data Layer (Storage)**
    *   **IPFS**: Used for content-addressed storage. Files are hashed, and the hash (CID) is returned to the frontend.
    *   **Blockchain**: Stores strictly the *metadata* (CID, timestamp, owner) and *access rules*.

### 3.1 Technology Stack
*   **Blockchain**: Ethereum (Sepolia Testnet)
*   **Smart Contracts**: Solidity v0.8.0
*   **Frontend**: React, Tailwind CSS, Framer Motion
*   **Web3 Libraries**: Ethers.js v6, IPFS-HTTP-Client
*   **Development Tools**: Hardhat, Docker

---

## 4. Methodology & Security Model

The security of MedBlock relies on cryptographic proofs rather than trust in a central authority.

### 4.1 Role-Based Access Control (RBAC)
Access is enforced at the smart contract level. Every function call verifies the `msg.sender` (the caller's wallet address).
*   **Patient**: Can view their own records (Level 255 access).
*   **Doctor**: Can view records only if `allowed[patient][doctor] > block.timestamp`.
*   **Researcher**: Restricted to "Research" privacy level (Level 0) records.
*   **Insurer**: Restricted to "Standard" privacy level (Level 1) records.

### 4.2 Time-Limited Permissions
To minimize risk, access is granted temporarily:
*   Doctors obtain access for typically 30 days.
*   Insurers obtain access for 24 hours (configurable).
*   This ensures that old permissions do not remain open indefinitely.

### 4.3 Auditability
A `HealthcareAudit` smart contract logs key actions (`RECORD_ADDED`, `ACCESS_GRANTED`, `ACCESS_REVOKED`). This creates a permanent, tamper-proof trail of evidence.

---

## 5. Implementation Details

### 5.1 Smart Contract Structure
*   **Structs**: `Patient`, `Doctor`, `MedicalRecord` (contains IPFS hash, file type, privacy level).
*   **Mappings**: Efficient O(1) lookups for `patients[address]`, `doctorPatients[docAddr]`, and `accessExpiry[patient][viewer]`.
*   **Events**: Emitted for frontend real-time updates (`RecordAdded`, `AccessGranted`).

### 5.2 User Workflows
1.  **Registration**: New users interact with the Admin portal or register directly via contract calls to establish their identity.
2.  **Record Upload**: Doctors upload a file to IPFS -> Get Hash -> Call `addMedicalRecord(hash)` on-chain.
3.  **Data Retrieval**:
    *   User requests data.
    *   Frontend checks contract permissions.
    *   If valid, retrieving the IPFS Hash.
    *   file is fetched from IPFS gateway and decrypted/displayed.

---

## 6. Future Scope

*   **Zero-Knowledge Proofs (ZK-Snarks)**: To allow users to prove they have a medical condition (e.g., for insurance) without revealing the specific data.
*   **Layer 2 Scaling**: Migrating to Polygon or Arbitrum to reduce transaction gas fees.
*   **Mobile App**: Developing a React Native mobile application for easier patient access.
*   **Inter-Blockchain Communication**: connecting with other hospital networks on Hyperledger or other chains.

---

## 7. Conclusion

MedBlock effectively demonstrates how blockchain technology can revolutionize healthcare data management. By decentralizing control and enforcing secure, verifiable access rules, it empowers patients and enhances trust between medical stakeholders. The system remains performant through the hybrid on-chain/off-chain storage model and secure through Ethereum's robust consensus mechanism.
