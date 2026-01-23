# MedBlock: Decentralized Medical Record System

MedBlock is a secure, blockchain-based Electronic Health Record (EHR) system designed to give patients complete control over their medical data. Leveraging **Ethereum (Sepolia Testnet)** for access control and **IPFS** for decentralized storage, MedBlock ensures data integrity, privacy, and availability.

---

## 📖 Introduction

Traditional medical systems often suffer from centralized data silos, making it difficult for patients to share records across different providers securely. MedBlock solves this by:
*   **Decentralizing Storage**: Using IPFS to store encrypted medical records.
*   **Immutable Access Control**: Using Smart Contracts to manage who can view records and for how long.
*   **Patient Sovereignty**: Patients own their data and explicitly grant/revoke access to doctors, researchers, and insurers.
*   **Auditability**: Every access attempt is logged on the blockchain for transparency.

---

## 🛠️ Tech Stack Used

### Blockchain & Storage
*   **Solidity**: Smart Contracts for access control logic (Patient, Doctor, Researcher, Insurance, Audit).
*   **Ethereum (Sepolia Testnet)**: Deployment network.
*   **IPFS (InterPlanetary File System)**: Decentralized, content-addressed file storage.
*   **Hardhat**: Development environment for compiling, testing, and deploying contracts.
*   **Pinata**: IPFS pinning service (optional/integrated).

### Frontend Client
*   **React.js**: User Interface and state management.
*   **Ethers.js (v6)**: Blockchain interaction library.
*   **Tailwind CSS**: Modern, responsive styling.
*   **Framer Motion**: Smooth UI animations.
*   **Lucide React**: Iconography.

---

## 🏗️ System Architecture

The system follows a 3-tier decentralized architecture:

1.  **Presentation Layer**: A React-based web portal with dedicated dashboards for Patients, Doctors, Researchers, Insurers, and Admins.
2.  **Logic Layer (Blockchain)**: A suite of solidity smart contracts that act as the "Gatekeeper". No file is retrieved without a valid transaction check.
3.  **Data Layer (IPFS)**: Stores the actual heavy files (PDFs, Images). The Blockchain only stores the **Content ID (CID)** and metadata/permissions.

> For detailed diagrams and flowcharts, please refer to [SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md).

---

## 📐 Methodology & Security

MedBlock employs a strict **Role-Based Access Control (RBAC)** methodology:

### 1. Verification & Registration
All users (Doctors, Patients, Researchers, Insurers) must be registered on the blockchain by an Admin before they can interact with the system. This prevents unauthorized entities from flooding the network.

### 2. Time-Limited Access
Access is never permanent.
*   **Doctors**: Default 30-day access (Extendable).
*   **Researchers**: Default 7-day access.
*   **Insurers**: Default 24-hour access.
*   **Revocation**: Patients can instantly revoke access at any time manually.

### 3. Record Integrity
Medical records are hashed and stored on IPFS. The hash (CID) is stored on the blockchain. Any tampering with the file would change its hash, making it easy to detect corruption.

### 4. Audit Trail
A dedicated `HealthcareAudit.sol` contract logs every significant action:
*   `RECORD_ADDED`
*   `ACCESS_GRANTED`
*   `ACCESS_REVOKED`
*   `PATIENT_REGISTERED`
This creates an immutable history of who accessed what and when.

---

## 🚀 Features by Role

| Role | Capabilities |
| :--- | :--- |
| **Patient** | • View own records <br> • Grant/Revoke access to Doctors/Insurers <br> • View Audit Logs of who accessed their data |
| **Doctor** | • Upload new medical records for patients <br> • View shared records of authorized patients <br> • Request access to new patients |
| **Researcher** | • View anonymized/public-level data for research purposes (if authorized) |
| **Insurer** | • View standard-level records for claims processing (if authorized) |
| **Admin** | • Register new users onto the platform |

---

## 📦 Installation & Setup

### Prerequisites
*   **Node.js** (v16+)
*   **MetaMask Wallet** (Browser Extension)
*   **Docker** (for local IPFS node, optional if using Pinata)

### 1. Clone the Repository
```bash
git clone https://github.com/vaibhav-rm/MedBlock.git
cd MedBlock/Web\ App
```

### 2. Install Dependencies
```bash
# Install Web App dependencies
npm install

# Install Hardhat dependencies
cd hardhat-project
npm install
cd ..
```

### 3. Quick Start
Run the automated start script to launch the app and IPFS node:
```bash
./start.sh
```
*The app will open at `http://localhost:3000`*

---

## 🌐 Smart Contract Deployment

The contracts are live on **Sepolia Testnet**:

| Contract | Address |
| :--- | :--- |
| **Doctor Contract** | `0xa75d4D4F441b1CfA37B72143c2Fc4BF7BB114cea` |
| **Patient Contract** | `0xFcdbC582A859749C9F917fC159C8Cbf6913eaa42` |
| **Researcher Contract** | `0x99cC50B32E63827F328ffAD7A8fA8D9201952a07` |
| **Insurance Contract** | `0xdb72DCE4ad67B6f2B57560A41ABaD10a70D92F41` |

> **⚠️ Important:** To test the application, you **MUST** switch your MetaMask account to match the role you are logging in as. The system validates `msg.sender` for all sensitive actions.