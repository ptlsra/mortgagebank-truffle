


//***** contract deployment code *****//


/**
 * required modules
 */

const Web3 = require('web3');
var fs = require('fs');
var mongoUrl = "mongodb://127.0.0.1:27017/";

let configRawData = fs.readFileSync('config.json');
let configData = JSON.parse(configRawData);
console.log(configData);
// connecting to web3 provider
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8102"));
//const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:22001"));
var web3 = new Web3(new Web3.providers.HttpProvider(configData.web3Provider));

//Note -> order or all threee matters so be careful while changing the order -_-

var solidityFileList        = ["Mortgage.sol","MortgageInsurance.sol"];
var solidityJsonFileList    = ["Mortgage.json","MortgageInsurance.json"];
var contractNameList        = ["Mortgage","MortgageInsurance"];
var contractAddresses=[];

/**
 * program starts here. 
 */
function deployContract(solidityFileName, solidityJsonfileName, contractName, requiredGas){
        console.log("deploying ...");
        console.log(solidityFileName);
        console.log(solidityJsonfileName);
        console.log(contractName);

        var exec = require('child_process').exec, child;
        console.log('Going to Execute solidity compile command in terminal');
        child = exec('./bin/solc --optimize --combined-json abi,bin,interface '+solidityFileName+' > '+solidityJsonfileName,
            function (error, stdout, stderr) {
                console.log('Command Executed successfully!');
                // console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);
                if (error !== null) {
                    console.log('exec error: ' + error);
                }
            });
        child;



        console.log('Smart Contract Compiled and Saved the output in JSON file!');
        //BELOW setTimeout is to wait for the compiled json file to be created. second argument "time" is in milliseconds, may need to increase this number in case of a big smart contract to compile.
        setTimeout(readF, 10000);

        function readF(){
            var fileData = fs.readFileSync(solidityJsonfileName);
            console.log("Data inside just created JSON file is: "+fileData);
            var content = JSON.parse(fileData);
            //console.log(content);
            var abi = content.contracts[solidityFileName+":"+contractName].abi;
            console.log("ABI is: "+abi);

            var binary = content.contracts[solidityFileName+":"+contractName].bin;
            //console.log("Parsed binary is: "+binary);
            var bin = '0x'+binary;
            console.log("Required BINARY is: "+bin);

            //////////////////////
            var contractDeployedAt = web3.eth.accounts[0];
            console.log("Contract is going to be deployed at: " + contractDeployedAt);
            var password1stAccount = "";
            //console.log("First account password is : " + password1stAccount);
            var accountUnlocked = web3.personal.unlockAccount(contractDeployedAt, password1stAccount);
            //console.log("Contract account unlocked: " + accountUnlocked);
            const Contract = web3.eth.contract(JSON.parse(abi));

            Contract.new({
                from: web3.eth.accounts[0],
                data:bin,
                gas: requiredGas
            },function(err, contract){
                if(err) console.log(err);    
                    if(typeof contract.address !== 'undefined'){
                        console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash)
                        //return contract.address;
                        //push contractAddress and abi into mongodb
                        var MongoClient = require('mongodb').MongoClient;
                        var url = mongoUrl+"bank_blockchaindb";
                    
                        MongoClient.connect(url, function(err, db) {
                            if (err) throw err;
                            console.log("************ connected to mongodb client at localhost *************");
                            console.log("************ storing record **********");
                            let myobj = {contractAddress:contract.address, contractName:contractName, abi:abi}; 
                            var collectionName = "contracts";
                            db.collection(collectionName).insertOne(myobj, function(err, res) {
                                if (err) throw err;
                                console.log("contract abi pushed to mongodb ....");
                                //console.log(res);
                                db.close();
                            });
                        });

                        contractAddresses.push(contract.address);
                }
            })
        }
    }

//call deployContracts method
//for(let index=0;index<solidityFileList.length;index++){

console.log("**************************** deploying Mortgage contract *********************");
    
deployContract(solidityFileList[0], solidityJsonFileList[0], contractNameList[0], "50000000");
//}


setTimeout(function(){
    console.log("**************************** deploying MortgageInsurance contract *********************");
    
    deployContract(solidityFileList[1], solidityJsonFileList[1], contractNameList[1], "50000000");
    
},30000);


//setTimeout
setTimeout(function(){
    console.log("**************************** saving cotractsConfig.json ************************");
    console.log("printing contractAddresses list : "+JSON.stringify(contractAddresses));
    let contractObject = {
        mortgageContract            : contractAddresses[0],
        mortgageInsuranceContract   : contractAddresses[1]
    }

    let data = JSON.stringify(contractObject);
    fs.writeFileSync('./contractConfig.json', data);



    let rawdata = fs.readFileSync('./contractConfig.json');  
    let contractsData = JSON.parse(rawdata);
    console.log(JSON.stringify(contractsData));
},50000);
