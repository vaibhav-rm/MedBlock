# ReactJS App

## functionalities : 

- admin : 
    - autentificatien (the owner of the contract)
    - can add doctor or patient to the blockchain using it account

- doctor : 
    - autentificatien
    - can add new medical File
    - can read the medical File

- patient :
    - autentificatien 
    - can only view his medical folder
    - can autorize the doctor 

---

## Running The React Application

### Prerequisites
- Node.js (v16 or later)
- npm or yarn

### Steps
1. Install to the Depandencis 
   ```bash
   git clone https://github.com/vaibhav-rm/MedBlock.git
   cd 'MedBlock'
   ```

2. Install the deppendencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash

   npm start
   ```
   The app will be available at `http://localhost:3000/`.

## There are some screenshoots : 



docker pull ipfs/kubo
docker run -d --name ipfs_node -v ipfs_data:/data/ipfs -p 4001:4001 -p 5001:5001 -p 8080:8080 ipfs/kubo