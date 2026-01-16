# MedBlock: Secure Medical Records with Blockchain

A decentralized application (dApp) for secure medical record management using **Ethereum (Sepolia Testnet)** and **IPFS** (InterPlanetary File System).

## 🚀 Features
- **Admin**: Manage access and register doctors/patients.
- **Doctor**: Upload and view patient medical records (stored on IPFS).
- **Patient**: View personal medical records and manage doctor access.

---

## 🛠️ Prerequisites

Before starting, ensure you have the following installed:
1.  **Node.js** (v16 or later)
2.  **Docker** (required for IPFS node)
3.  **MetaMask Extension** (configured for **Sepolia Testnet**)

---

## 📦 Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/vaibhav-rm/MedBlock.git
    cd MedBlock/Web\ App
    ```

2.  **Install Web App Dependencies**
    ```bash
    npm install
    ```

3.  **Install Hardhat Dependencies** (for Smart Contracts)
    ```bash
    cd hardhat-project
    npm install
    cd ..
    ```

4.  **Configuration**
    Create a `.env` file in the `hardhat-project/` directory with your secrets:
    ```env
    SEED_PHRASE="your twelve word seed phrase for metamask wallet"
    SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY"
    ```

---

## ▶️ Quick Start

We have provided a script to automatically set up the local IPFS node and start the React application.

**Run the start script:**
```bash
./start.sh
```

This script will:
1.  Check for the IPFS Docker container (pulls/starts it automatically).
2.  Start the React Web App on `http://localhost:3000`.

---

## 🌐 Smart Contracts

The contracts are currently deployed on the **Sepolia Testnet**.

| Contract | Address |
|----------|---------|
| **DoctorManagement** | `0xa75d4D4F441b1CfA37B72143c2Fc4BF7BB114cea` |
| **PatientManagement** | `0xFcdbC582A859749C9F917fC159C8Cbf6913eaa42` |

> **Note:** Ensure your MetaMask is connected to **Sepolia** to interact with the application. The app will prompt you to switch automatically if needed.

---

## 📝 Manual Deployment (Optional)

If you want to redeploy the contracts yourself:

1.  **Compile Contracts**
    ```bash
    cd hardhat-project
    npx hardhat compile
    ```

2.  **Deploy to Sepolia**
    ```bash
    npx hardhat run scripts/deploy.js --network sepolia
    ```

3.  **Update Frontend**
    Copy the new contract addresses from the terminal output and update the variables in `src/App.js`:
    ```javascript
    const doctorContractAddress = "YOUR_NEW_DOCTOR_ADDRESS";
    const patientContractAddress = "YOUR_NEW_PATIENT_ADDRESS";
    ```