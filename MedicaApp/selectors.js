const ethers = require('ethers');
const fs = require('fs');

const abiPath = './constants/abis/patientContractABI.json';
const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
const iface = new ethers.Interface(abi);

abi.forEach(fragment => {
    if (fragment.type === 'function') {
        const sig = fragment.name + '(' + fragment.inputs.map(i => i.type).join(',') + ')';
        const selector = ethers.id(sig).slice(0, 10);
        console.log(`${selector} : ${sig}`);
    }
});
