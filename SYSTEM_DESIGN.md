# Medical Block System Design

This document outlines the architecture, user flows, and data interaction models for the MedBloc.

## 1. System Architecture & Tech Stack

The application follows a Decentralized Application (dApp) architecture, leveraging Ethereum for access control and IPFS for secure, distributed storage of medical records.

### Technology Stack
*   **Smart Contracts**: Solidity (v0.8+)
*   **Blockchain Network**: Ethereum Sepolia Testnet
*   **Storage**: IPFS (InterPlanetary File System)
*   **Frontend**: React.js, Ethers.js v6, Tailwind CSS
*   **Development**: Hardhat, Docker

```mermaid
graph TD
    User["User (Patient/Doctor)"] -->|Interacts via Browser| FE["Frontend application (React + ethers.js)"]
    
    subgraph "Blockchain Layer (Ethereum/Sepolia)"
        FE -->|Read/Write State| PC[Patient Contract]
        FE -->|Read/Write State| DC[Doctor Contract]
        PC <-->|Verify Registration| DC
    end
    
    subgraph "Storage Layer"
        FE -->|Upload Files| IPFS[IPFS Node]
        FE -->|Retrieve Files| IPFS
        IPFS -->|Return CID| FE
    end
    
    subgraph "Authentication"
        MetaMask[MetaMask Wallet] -->|Sign Transactions| FE
    end
```

### Key Components
*   **Frontend (React)**: Handles user interface, wallet connection, and logic.
*   **Smart Contracts (Solidity)**:
    *   `PatientContract`: Manages patient registry, medical records (CIDs), and access control rules.
    *   `DoctorContract`: Manages doctor registry and authorized patient lists.
*   **IPFS (InterPlanetary File System)**: Stores the actual medical record files (PDFs, Images) ensuring decentralization.
*   **MetaMask**: Provides identity management and transaction signing.

---

## 2. User Flowcharts

### 2.1 Registration & Authentication
Users must register for a specific role (Patient or Doctor) before accessing features.

```mermaid
flowchart TD
    Start([User Visits Landing Page]) --> Choice{Select Role}
    
    Choice -->|Patient| P_Login[Patient Login Page]
    Choice -->|Doctor| D_Login[Doctor Login Page]
    
    P_Login --> CheckP{Wallet Connected?}
    D_Login --> CheckD{Wallet Connected?}
    
    CheckP -- No --> ConnectP[Connect MetaMask] --> CheckP
    CheckD -- No --> ConnectD[Connect MetaMask] --> CheckD
    
    CheckP -- Yes --> IsRegP{Is Registered?}
    CheckD -- Yes --> IsRegD{Is Registered?}
    
    IsRegP -- No --> RegP[Register Patient Form] -->|Submit Tx| PendingP[Wait for Admin/Contract] --> DashboardP
    IsRegD -- No --> RegD[Register Doctor Form] -->|Submit Tx| PendingD[Wait for Admin/Contract] --> DashboardD
    
    IsRegP -- Yes --> DashboardP[Patient Dashboard]
    IsRegD -- Yes --> DashboardD[Doctor Dashboard]
```

### 2.2 Medical Record Upload (Doctor)
Doctors upload records for authorized patients.

```mermaid
sequenceDiagram
    participant Doc as Doctor (Frontend)
    participant IPFS
    participant BC as Blockchain (Smart Contract)
    
    Doc->>Doc: Select Patient
    Doc->>Doc: Fill Record Form (File, Title)
    Doc->>IPFS: Upload File
    IPFS-->>Doc: Return CID (Content Hash)
    Doc->>BC: addMedicalRecord(patientAddr, CID, metaData)
    BC-->>Doc: Emit Event (RecordAdded)
    Doc->>Doc: Update UI with New Record
```

### 2.3 Access Control Flow
Patients control who can view their records via a time-limited grant system.

```mermaid
stateDiagram-v2
    [*] --> NoAccess
    
    NoAccess --> RequestPending : Doctor Requests Access
    RequestPending --> AccessGranted : Patient Approves
    RequestPending --> NoAccess : Patient Rejects
    
    NoAccess --> AccessGranted : Patient Manually Grants
    
    state AccessGranted {
        [*] --> TimerRunning
        TimerRunning --> Expired : Time Elapsed
        TimerRunning --> Revoked : Patient Revokes
    }
    
    Expired --> NoAccess
    Revoked --> NoAccess
```

---

## 3. Methodology & Security Model

The system enforces strict security through cryptographic verification and decentralized consensus.

### 3.1 Role-Based Access Control (RBAC) Methodology
The system strictly separates concerns into variable contracts:
1.  **PatientManagement**: The "Core" that holds data ownership.
2.  **DoctorManagement**: Verified Doctor Registry.
3.  **ResearcherManagement / InsuranceManagement**: Specialized stakeholders.
4.  **HealthcareAudit**: Immutable logging.

**Rule:** `msg.sender` must always match the authorized entity. There are no "admin backdoors" to view private data.

### 3.2 Data Privacy Flow
*   **Public Data**: Wallet addresses, Registration status.
*   **Protected Data**: IPFS CIDs (Links to files).
*   **Access Logic**:
    1.  User requests a file.
    2.  Smart Contract checks: `if (msg.sender == patient || allowed[patient][msg.sender] > now)`
    3.  If strict check passes, Frontend receives the IPFS CID.
    4.  Frontend fetches file from IPFS using CID.

```mermaid
graph LR
    subgraph "Secure Data Retrieval"
        Req(Request Record) --> Contract{Check Permission}
        Contract -- Allowed --> GetCID[Get IPFS CID]
        Contract -- Denied --> Error[Access Denied Error]
        GetCID --> Fetch[Fetch from IPFS]
        Fetch --> View[Display to User]
    end
```

### 3.3 Audit Methodology
Every critical state change emits an event and calls the `HealthcareAudit` contract.
*   **Transparency**: Patients can see exactly when a Doctor or Insurer accessed their files.
*   **Non-Repudiation**: Blockchain transactions cannot be deleted or altered.

---

## 4. Component Interaction Map

Map of React components to their primary responsibilities.

| Component | Responsibility |
| :--- | :--- |
| `App.js` | Routing, Wallet Connection, Contract Instantiation |
| `Navbar.js` | Global Navigation, Dynamic Login State |
| `LandingPage.js` | Role Selection, Product Features |
| `patientpage.js` | **Patient Dashboard**: View Records, Manage Access Requests |
| `doctorpage.js` | **Doctor Dashboard**: View Patients, Upload Records |
| `researcherpage.js` | **Researcher Portal**: View specific patient records (Read-Only) |
| `insurancepage.js` | **Insurance Portal**: View claims-related records (Read-Only) |
| `adminpage.js` | **Admin Only**: Register new Patients/Doctors |
