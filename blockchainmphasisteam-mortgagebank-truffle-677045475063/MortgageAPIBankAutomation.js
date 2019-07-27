
/**
 * Required libraries
 */
var fs = require("fs");
var Web3 = require('web3-quorum');
var cors = require('cors');
var fs = require('fs');
var path = require('path');

var MongoClient = require('mongodb').MongoClient;
const express = require('express');
var md5 = require('md5');
const app = express();
var bodyParser = require('body-parser');
// express file upload library
const fileUpload = require('express-fileupload');
// ipfs javascript http-client library
var ipfsAPI = require('ipfs-http-client');

var log4js = require('log4js');
var logger = log4js.getLogger('MortgageAPIBankAutomation');

/* Sanjeev Added tis */
/*
var async = require('async');
var await = require('await');
*/

//set logger level
//logger.level = 'debug';
logger.level = 'info';

logger.info("MortgageAPIBankAutomation API");
/**
 * Read application configuration
 * 
 */
let configRawData = fs.readFileSync('config.json');
let configData = JSON.parse(configRawData);
logger.debug("Read config.js  : " + JSON.stringify(configData));
logger.debug("Initializing app");

/**
 * app settings
 */


var pathval=__dirname+ "/UI/";
console.log(pathval);
app.set('views',pathval);
app.use(express.static(pathval));

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());
app.options("*", cors());

/**
 * ipfs configuration
 */

var ipfs = ipfsAPI(configData.ipfsAPI);
ipfsIpAddress=configData.ipfsIpAddress;
ipfsPort=configData.ipfsPort;

/**
 * 
 * web3 provider configuration
 */

var web3 = new Web3(new Web3.providers.HttpProvider(configData.web3Provider));

/**
 * 
 * Bank wallet address
 */
var bankAddress = configData.bankWalletAddress;
var bankWalletPassword = configData.bankWalletPassword;
var appPort = configData.appPort;
var mongodbIp = configData.mongoIp;
var mongodbPort = configData.mongoPort;

var insuranceTxnDBUrL = "mongodb://"+mongodbIp+":"+mongodbPort+"/bank_insurance_txns";
var mortgageTxnDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/bank_mortgage_txns";
var mortgageDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/bank_mortgage";
//var mortgageAutoDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/bank_mortgage_auto"; // commented on feb5 2019
var mortgageAutoDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/mortgage_auto";


//mongoDB database objects
var insuranceTxnDB;
var mortgageTxnDB;
var mortgageDB;
var mortgageAutoDB;

var portfolioDBUrl="mongodb://"+mongodbIp+":"+mongodbPort+"/bank_portfolioDB";
var portfolioDB;

MongoClient.connect(portfolioDBUrl, function(err, portfolioDBTemp) {
    portfolioDB = portfolioDBTemp;
});

var customerDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/bank_customerDB";
var customerDB;

MongoClient.connect(customerDBUrl, function(err, customerDBTemp) {
    customerDB = customerDBTemp;
});



//reading abi from file
var source = fs.readFileSync("Mortgage.json");
var contracts = JSON.parse(source)["contracts"];
var abi = JSON.parse(contracts["Mortgage.sol:Mortgage"].abi);

var insurance_source = fs.readFileSync("MortgageInsurance.json");
var insurance_contract = JSON.parse(insurance_source)["contracts"];
var insurance_abi = JSON.parse(insurance_contract["MortgageInsurance.sol:MortgageInsurance"].abi);


let rawdata = fs.readFileSync('./contractConfig.json');
let contractsData = JSON.parse(rawdata);
console.log(JSON.stringify(contractsData));

var contractAddress = contractsData.mortgageContract;
var insuranceContractAddress = contractsData.mortgageInsuranceContract;
console.log("************* read contract addresses from contractConfig.json ***************");

// get deployed contract abi from contract address;
const mortgageContract = web3.eth.contract(abi).at(String(contractAddress));
const insuranceContract = web3.eth.contract(insurance_abi).at(String(insuranceContractAddress));

var appPort = configData.appPort;

/**
 * 
 * Redirection URL
 */
var redirectionURL = configData.redirectionIP;

var globalMessagArray = {
    "loanId": "",
    "message": ""
}



var customerList = [
    "adamJones@gmail.com",
    "adamSmith@gmail.com",
    "ameliaVanderton@gmail.com",
    "bobDylan@gmail.com",
    "catherineJones@gmail.com",
    "catherineStark@gmail.com",
    "cedricWatts@gmail.com",
    "emmaJenkins@gmail.com",
    "finnLawrence@gmail.com",
    "johnClegaine@gmail.com",
    "johnConner@gmail.com",
    "jupiterJones@gmail.com",
    "lilaParrish@gmail.com",
    "louiseLane@gmail.com",
    "mariaReynolds@gmail.com",
    "mattWatson@gmail.com",
    "michaelGeorge@gmail.com",
    "michaelJohnson@gmail.com",
    "naomiKay@gmail.com",
    "ravenBedford@gmail.com",
    "samJones@gmail.com",
    "samuelJackson@gmail.com",
    "sharonSmith@gmail.com",
    "tanyamcCarthy@gmail.com"
];

/** 
************************************** Events **************************************
*/

/**
 * Registration Event.
 * @event
 */
var registrationEvent;
registrationEvent = mortgageContract.CustomerRegistration({}, { fromBlock: 'latest', toBlock: 'latest' });
//console.log(myEvent);
registrationEvent.watch(function (error, result) {
    logger.info("customerRegistrationEvent");
    /*logger.debug(result); */
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            logger.info("storing  transaction details");
            try {
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress);
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
});


/**
 * Portfolio Creation  Event.
 * @event
 */
var portfolioCreationEvent;
portfolioCreationEvent = mortgageContract.PortfolioCreation({}, { fromBlock: 'latest', toBlock: 'latest' });
portfolioCreationEvent.watch(function (error, result) {
    logger.info("Portfolio creation event");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
});


/**
 * Portfolio Update  Event.
 * @event
 */
var portfolioUpdateEvent;
portfolioUpdateEvent = mortgageContract.PortfolioUpdate({}, { fromBlock: 'latest', toBlock: 'latest' });
portfolioUpdateEvent.watch(function (error, result) {
    logger.info("Portfolio update event");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.status, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
})


/**
 * Pre-doc Upload  Event.
 * @event
 */
var preDocUploadEvent;
preDocUploadEvent = mortgageContract.PreDocUpload({}, { fromBlock: 'latest', toBlock: 'latest' });
preDocUploadEvent.watch(function (error, result) {
    logger.info("PreDocUploadEvent");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
});


/**
 * Post-doc Upload  Event.
 * @event
 */
var postDocUploadEvent;
postDocUploadEvent = mortgageContract.PostDocUpload({}, { fromBlock: 'latest', toBlock: 'latest' });
postDocUploadEvent.watch(function (error, result) {
    logger.info("PostDocUploadEvent");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });

})

/**
 * Add Shared Owner  Event.
 * @event
 */
var addSharedOwnerEvent;
addSharedOwnerEvent = mortgageContract.addOwner({}, { fromBlock: 'latest', toBlock: 'latest' });
addSharedOwnerEvent.watch(function (error, result) {
    logger.info("addSharedOwnerEvent");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
});

/**
 * Pay Premium  Event.
 * @event
 */
var payPremiumEvent;
payPremiumEvent = insuranceContract.PayPremium({}, { fromBlock: 'latest', toBlock: 'latest' });
//console.log(portfolioUpdateEvent);
payPremiumEvent.watch(function (error, result) {
    logger.info("payPremiumEvent");
    logger.debug(result);
    var args = result.args;
    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("storing  transaction details");
                storeTransaction(args.userName, result.transactionHash, args.description, args.customerAddress, args.loanId.toNumber());
                console.log("transaction sent to db");
            } catch (e) {
                logger.error("Error in storing event data to DB: " + e);
            }
        }, 5000);
    });
});


/**
 ******************************** events end here *************************************
*/




/**
 ################################################## API starts here ############################################
*/

/**
******************************************  API to create user account ****************************************
*/


/**
 * Create Account.
 * @function createAccount
 * @param {string} firstName - first name of the customer.
 * @param {string} lastName - last name of the customer.
 * @param {string} mobileNumber - mobile number of the customer.
 * @param {string} emialId - email id of the customer.
 * @param {string} password - password for the account.
 */
app.post('/createAccount', function (request, response) {

    var firstName = request.query.firstName;
    var lastName = request.query.lastName;
    var mobileNumber = request.query.mobileNumber;
    var emailId = request.query.emailId;
    var password = request.query.password;

    var name = firstName + " " + lastName;
    var userName = emailId;
    logger.info("createAccount");
    logger.debug("firstName : " + firstName);
    logger.debug("lastName : " + lastName);
    logger.debug("mobileNumber : " + mobileNumber);
    logger.debug("emailId : " + emailId);
    logger.debug("printing password hash : " + md5(password));

    // creating wallet for customer
    var walletResponse = web3.personal.newAccount("");

    logger.debug("customer wallet address  : " + walletResponse);
    var walletAddress = walletResponse;
    password_hashed = md5(password);
    web3.personal.unlockAccount(walletAddress, "");

    // add some ether to the account
    web3.personal.unlockAccount(bankAddress, bankWalletPassword);
    web3.eth.sendTransaction({ from: bankAddress, to: walletAddress, value: 70000000000 });

    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {
            try {
                logger.info("creating customer account ");
                var jsonResponse = (mortgageContract['enrollCustomer'](walletAddress, name, userName, emailId, mobileNumber, password_hashed, { from: walletAddress, gas: 4000000 }));

                //push record to mongoDB
		var customerData={
			wallet:walletAddress,
			name:name,
			userName:userName,
			emailId:emailId
        }
        
        var mortgageDBData={
			accountAddress:walletAddress,
            userName:userName
        		}
		var collectionName = "wallet_"+walletAddress;
		customerDB.collection(collectionName).insertOne(customerData, function (err, res) {
                	if (err) throw err;
               	 	logger.debug("Transaction record inserted ....");
                });
         
                mortgageDB.collection(userName).insertOne(mortgageDBData, function (err, res) {
                	if (err) throw err;
               	 	logger.info("Inserting data to mortgage DB ....");
                });      
                

                
               

		logger.debug("transactionID : " + jsonResponse);
                var message = {
                    "walletAddress": walletAddress,
                    "tx_id": jsonResponse
                }

                response.setHeader('Content-Type', 'application/json');
                response.send(message);
            } catch (e) {
                logger.error("Error in creating customer account : " + e);
            }
        }, 10000);

    });
});















//*********************************************** API to get customer info *********************************************** */

/**
 * Get Customer Information.
 * @function getCustomerInfo
 * @param {string} firstName - first name of the customer.
 * @param {string} lastName - last name of the customer.
 * @param {string} mobileNumber - mobile number of the customer.
 * @param {string} emialId - email id of the customer.
 * @param {string} password - password for the account.
 */
app.get('/getCustomerInfo', function (request, response) {
    var walletAddress = request.query.walletAddress;
    logger.info("getCustomerInfo");
    logger.debug("customer walletAddress : " + walletAddress);
    try {
        var result = (mortgageContract['getCustomer'](walletAddress, { from: String(walletAddress), gas: 4000000 }));
        /*logger.debug("customer details : " + result);*/
        logger.debug("Fetched customer details : " + result[0]);

        var jsonResponse = {
            "customerAddress": result[0],
            "name": result[1],
            "userName": result[2],
            "emailId": result[3],
            "mobileNumber": result[4],
            "password_hashed": result[5]
        }

        return response.send({ message: jsonResponse });
    } catch (e) {
        logger.error("Error in getting customer info : "+e);
    }
});

//***************************************** API to authenticate user *************************************/
/**
 * Authenticate Customer.
 * @function authenticate
 * @param {string} userName - userName of the customer.
 * @param {string} walletAddress - wallet Address of the customer.
 * @param {string} password - password of the customer.
 */
app.get('/authenticate', function (request, response) {
    logger.info("authenticate");

    var userName = request.query.userName;
    //var walletAddress = request.query.walletAddress;
    var password = request.query.password;

    logger.info("userName : " + userName);
  //  logger.debug("walletAddress : " + walletAddress);
    logger.debug("password : " + password);

    mortgageDB.collection(userName).findOne({}, function(err, result) {   // added feb 5 2019
        var walletAddress=result.accountAddress; 
      
    try {
        var customerObject = (mortgageContract['getCustomer'](walletAddress));
        logger.debug("printing customer object : " + JSON.stringify(customerObject));
        var message;
        if (customerObject[5] == md5(password) && customerObject[2] == userName) {
            message = {
                "customerAddress": customerObject[0],
                "name": customerObject[1],
                "userName": customerObject[2],
                "emailId": customerObject[3],
                "mobileNumber": customerObject[4],
                "password_hashed": customerObject[5]
            }
        } else {
            message = "Invalid credentials. Please try again.";
        }

        return response.send({ message: message });
    } catch (e) {
        logger.error("Error in authenticating user : " + e);
        return response.status(500).send({ message: "Invalid Credentials"});
    }
});
});

//*************************************** API to  create customer portfolio **********************************
/**
 * Apply for loan.
 * @function createPortfolio
 * @param {string} walletAddress - wallet Address of the customer.
 * @param {string} loanType - loan type .
 * @param {string} loanPurpose - loan purpose.
 * @param {string} interestType - interest type.
 * @param {string} loanTerm - loan term.
 * @param {string} purchase price - purchase price of property.
 * @param {string} propertyType - property type.
 * @param {string} downPayment - downpayment for loan.
 */
app.post('/createPortfolio', function (request, response) {

    logger.info("createPortfolio");
    var walletAddress = request.query.walletAddress;
    var loanType = request.query.loanType;
    var loanPurpose = request.query.loanPurpose;
    var interestType = request.query.interestType;
    var loanTerm = request.query.loanTerm;
    var purchasePrice = request.query.purchasePrice;
    var propertyType = request.query.propertyType;
    var propertyAddress = request.query.propertyAddress;
    var downPayment = request.query.downPayment;

    logger.debug("walletAddress : " + walletAddress);
    logger.debug("loanType : " + loanType);
    logger.debug("loanPurpose : " + loanPurpose);
    logger.info("interestType : " + interestType);
    logger.debug("loanTerm : " + loanTerm);
    logger.debug("purchasePrice : " + purchasePrice);
    logger.debug("propertyType : " + propertyType);
    logger.info("propertyAddress : " + propertyAddress);
    logger.info("downPayment : " + downPayment);

    try {

        // get user_name by walletAddress
        var customerObject = (mortgageContract['getCustomer'](walletAddress));
        var user_name = customerObject[2];
        var unique_id = Math.floor(Math.random() * 9000000) + 10000000;
        logger.debug("customer Info : " + customerObject);
        logger.debug("Unlocking customer wallet : " + walletAddress);
        
        web3.personal.unlockAccount(walletAddress, "");
        web3.personal.unlockAccount(bankAddress, bankWalletPassword);

        var contractOutput = (mortgageContract['createPortfolioMortgage'](bankAddress, walletAddress, unique_id, loanPurpose, loanType, interestType, loanTerm, purchasePrice, downPayment, propertyType, propertyAddress, { from: String(walletAddress), gas: 4000000 }))

        logger.debug("TransactionId " + contractOutput);
        var jsonResponse = {
            "tx_id": contractOutput
        }

        /**
         * call the automation function
        */
        logger.info("Starting automation process : ");
        automateCustomerPortfolioProcess(bankAddress, unique_id, walletAddress);
        return response.send({ message: jsonResponse });
    } catch (e) {
        logger.error("Error in creating portfolio : " + e);
    }

});

/**
 * @deprecated
 */
app.post('/registerForAutomation',function(request,response){
        var password = request.query.password;
        if(password == "mortgagepoc"){
            console.log("calling registerCustomerForAutomation() function ");
            registerCustomerForAutomation();
            response.send("Automation method called");
        }else{
            console.log("invalid password");
            response.send("Error invalid password");
        }
});



/**
 *  API TO FETCH COINBASE ADDRESS
 */
app.get('/getCoinBase',function(request,response){
   // var password = request.query.password;
    //if(password == "mortgagepoc"){
      //  console.log("calling registerCustomerForAutomation() function ");

      coinBase = web3.eth.accounts[0]
    
      return response.send({"coinBase":coinBase});
 });
      




/**
 * 
 * Register customers for automation
 */
function registerCustomerForAutomation() {
    logger.info("registerCustomerForAutomation");
    var customerList = [
        "adamJones@gmail.com",
        "adamSmith@gmail.com",
        "ameliaVanderton@gmail.com",
        "bobDylan@gmail.com",
        "catherineJones@gmail.com",
        "catherineStark@gmail.com",
        "cedricWatts@gmail.com",
        "emmaJenkins@gmail.com",
        "finnLawrence@gmail.com",
        "johnClegaine@gmail.com",
        "johnConner@gmail.com",
        "jupiterJones@gmail.com",
        "lilaParrish@gmail.com",
        "louiseLane@gmail.com",
        "mariaReynolds@gmail.com",
        "mattWatson@gmail.com",
        "michaelGeorge@gmail.com",
        "michaelJohnson@gmail.com",
        "naomiKay@gmail.com",
        "ravenBedford@gmail.com",
        "samJones@gmail.com",
        "samuelJackson@gmail.com",
        "sharonSmith@gmail.com",
        "tanyamcCarthy@gmail.com"
    ];
    try {
        for (let index = 0; index < customerList.length; index++) {
            //push userName into mongodb database
            var collectionName = customerList[index];
            var myObj = { userName: customerList[index] };
            logger.debug("collectionName : " + collectionName);
            logger.debug("myObj : " + myObj);
            mortgageAutoDB.collection(collectionName).insertOne(myObj, function (err, res) {
                if (err) throw err;
                logger.debug("customer record inserted  -----> " + customerList[index]);
            });
        }
    } catch (e) {
        logger.error("Error in registerCustomerForAutomation : "+e);
    }
}

/**
 * automation function for mortgage process
 */

function automateCustomerPortfolioProcess(bankAddress, loanId, customerAddress) {

    logger.info(" Checking for automation condition ");
    var customerObject = (mortgageContract['getCustomer'](customerAddress));
    var userName = customerObject[2];
    logger.debug("customerObject : " + customerObject);
    logger.debug("userName : " + userName);
    logger.info("printing username from automate method : "+userName)
    //check from database
    mortgageAutoDB.collection(userName).find({ userName: userName }).toArray(function (err, result) {
        if (err) throw err;
        if (result.length > 0) {
            try {
                logger.debug("Starting automation");
                //update portfolio status from bank side (approve loan and request for documents)
                web3.personal.unlockAccount(bankAddress, bankWalletPassword);
                var initialApprovalTxId = (mortgageContract['updatePortfolioStatus'](bankAddress, loanId, "pre_approval_pending", "upload_id_docs", { from: String(bankAddress), gas: 4000000 }));
                logger.debug("Initial approval provided from bank with transactionId : " + JSON.stringify(initialApprovalTxId));
                logger.debug("\nCustomer uploads documents");

                /**
                 * Customer uploads documents
                 * Update portfolio status after uploading documents
                 */
                logger.info(" Uploading documents to ipfs ");
                var ownerAddress = customerAddress;

                //unlocking customer account
                web3.personal.unlockAccount(ownerAddress, "");

                //read ssn, passport, tax and salary documents from directory
                var customerName = customerObject[1].toLocaleLowerCase();
                customerName = customerName.replace(/\s/g, "");
                var ssnFileName = customerName + "_ssn.pdf";
                var passportFileName = customerName + "_passport.pdf";
                var taxFileName = "taxdocument.pdf";
                var salaryFileName = "salary.pdf";
                logger.debug("ssnFileName : " + ssnFileName);
                logger.debug("passportFileName : " + passportFileName);
                logger.debug("taxFileName : " + taxFileName);
                logger.debug("salaryFileName : " + salaryFileName);
                let ssnData = fs.readFileSync('files/' + ssnFileName);
                let passportData = fs.readFileSync('files/' + passportFileName);
                let taxData = fs.readFileSync('files/' + taxFileName);
                let salaryData = fs.readFileSync('files/' + salaryFileName);

                logger.debug("******************* File data read from document store ****************");

                var ssnHash = "";
                var passportHash = "";
                const files = [
                    {
                        path: ssnFileName,
                        content: ssnData
                    },
                    {
                        path: passportFileName,
                        content: passportData
                    },
                    {
                        path: taxFileName,
                        content: taxData
                    },
                    {
                        path: salaryFileName,
                        content: salaryData
                    }
                ]
                var fileHash = [];
                logger.info("uploading files to IPFS");
                ipfs.add(files, (err, filesAdded) => {
                    logger.debug(filesAdded);
                    logger.debug(filesAdded[0].hash);
                    logger.debug(filesAdded[1].hash);
                    logger.debug("printing loanId" + loanId);
                    logger.debug("printing owner address" + ownerAddress);
                    logger.debug("Files uploaded to IPFS, Executing smart contract");
                    setTimeout(function () {
                        var documentUploadPreTx = (mortgageContract['uploadPreDocuments'](loanId, ownerAddress, filesAdded[0].hash, filesAdded[1].hash, { from: String(ownerAddress), gas: 4000000 }));
                        var documentUploadPostTx = (mortgageContract['uploadPostDocuments'](loanId, ownerAddress, filesAdded[2].hash, filesAdded[3].hash, { from: String(ownerAddress), gas: 4000000 }));
                        logger.debug("printing transaction id for pre doc upload : " + documentUploadPreTx);
                        logger.debug("printing transaction id for post doc upload : " + documentUploadPostTx);
                    }, 500);

                    logger.debug(" documents uploaded ");
                    logger.debug(" verifying documents from bank side ");

                    setTimeout(function () {
                        var docVerificationTransactionId = (mortgageContract['updatePortfolioStatus'](bankAddress, loanId, "insurance_pending", "apply_for_insurance", { from: String(bankAddress), gas: 4000000 }));
                        logger.debug("Documents verified from bank with transactionId : " + JSON.stringify(docVerificationTransactionId));
                    }, 5000);
                });
            } catch (e) {
                logger.error("Error in automation process : " + e);
            }
        } else {
            logger.error("userName not found in autoDB exiting automation process");
        }
    });
}



/**
 * 
 * Automated code to check loanIds status and do final approval
 */
 function autoFinalApproval() {
     logger.info(" Auto final approving loans ");
     var wallets = (mortgageContract['getAllWallets']());
     logger.debug("wallets : " + wallets);
     try {
         for (var index = 0; index < wallets.length; index++) {
             var customerObject = (mortgageContract['getCustomer'](wallets[index]));
             var walletAddress = customerObject[0];
             var userName = customerObject[2];
             logger.debug("customerObject : " + customerObject);
             web3.personal.unlockAccount(walletAddress);
             logger.debug("Checking for customer with wallet address : " + walletAddress + " userName : " + userName);
             for (var index3 = 0; index3 < customerList.length; index3++) {
                 if (customerList[index3] == userName) {
                     logger.debug("*************** user " + userName + " exist in autoDBList ****************************");
                     logger.debug("*************** checking for   auto final approval *****************");
                     var customerPortfolios = (mortgageContract['getPortfolios'](walletAddress));
                     var length = customerPortfolios[1].length;
                     logger.debug("checking list of loans for userName : " + userName + " with wallet Id : " + walletAddress);
                     for (var index2 = 0; index2 < length; index2++) {
                         var loanId = customerPortfolios[1][index2];
                         var portfolio = (mortgageContract['getPortfolioStatus'](loanId));
                         var portfolioStatus = portfolio[1];
                         //If portfolio status is  "Insurnace_approved"
                         //updatePortfolioStatus
                         if (portfolioStatus == "Insurance_approved") {
                             logger.debug("unlocking bank account ");
                             web3.personal.unlockAccount(bankAddress, bankWalletPassword);
                             logger.debug("********************* initiating auto final approval *********************");
                             logger.debug("************* insurance is approved for loanId : " + loanId);
                             logger.debug("************* updating portfolio status for loanId : " + loanId);
                             var portfolioUpdateTrasnactionId = (mortgageContract['updatePortfolioStatus'](bankAddress, loanId, "Loan_Approved", "Completed", {
                                 from: String(bankAddress),
                                 gas: 4000000
                             }));
                             logger.debug("portfolio update transaction ---> " + JSON.stringify(portfolioUpdateTrasnactionId));
                             logger.debug("Final approval done for loanId : " + loanId);
                         } else {
                             logger.debug("exiting auto approval for loanId : " + loanId);
                             logger.debug("Loan Id : " + loanId + " is not Insurance_approved");
                         }
                     }
                 }
             }
         }
     } catch (e) {
         logger.error("Error in autoFinalApproval : " + e);
     }
 }

/**
 * 
 * Call autoFinalApprovalMethod
 */

setInterval(function(){
    logger.info("Starting autoFinalApproval");
    autoFinalApproval()
},7000);























// ****************************** API to get portfolio of customer by loanId and wallet address *******************

/**
 * Get Portfolio Details.
 * @function getPortfolio
 * @param {number} loanId - loan id.
 * @param {string} walletAddress - wallet Address of the customer.
 */
app.get('/getPortfolio', function (request, response) {
    logger.info("getPortfolio");
    var loanId = request.query.loanId;
    var walletAddress = request.query.walletAddress;
    logger.debug("fetching portfolio from contract");
    try {
        var portfolioMortgageList = (mortgageContract['getPortfolioMortgage'](loanId, {
            from: String(walletAddress),
            gas: 4000000
        }))
        var portfolioPropertyList = (mortgageContract['getPortfolioProperty'](loanId, {
            from: String(walletAddress),
            gas: 4000000
        }))

        logger.debug("portfolioMortgageList : " + portfolioMortgageList);
        logger.debug("portfolioPropertyList : " + portfolioPropertyList);

        var portfolio = {
            "loanId": portfolioMortgageList[0],
            "loanPurpose": portfolioMortgageList[1],
            "loanType": portfolioMortgageList[2],
            "interestType": portfolioMortgageList[3],
            "loanTerm": portfolioMortgageList[4],
            "purchasePrice": portfolioMortgageList[5],
            "downPayment": portfolioMortgageList[6],
            "propertyType": portfolioPropertyList[1],
            "propertyAddress": portfolioPropertyList[2]
        }

        console.log(" printing portfolio " + JSON.stringify(portfolio));
        return response.send({
            message: portfolio
        });
    } catch (e) {
        logger.error("Error in getPortfolio : " + e);
    }
});



//************************************** API to get Portfolio Status by loanId ***************************************

/**
 * Get Portfolio Status.
 * @function getPortfolioStatus
 * @param {number} loanId - loan id.
 */

app.get('/getPortfolioStatus', function(request,response){
    logger.info("getPortfolioStatus");
    var loanId          = request.query.loanId;
    logger.debug("loanID : "+loanId);
    console.log("fetching portfolioStatus from contract");

    var status = (mortgageContract['getPortfolioStatus'](loanId));
    logger.debug("portfolio status : "+status);
    var portfolioStatus = {
       "loanId":status[0],
       "portfolioStatus":status[1],
       "message":status[2],
       "owner":status[3],
       "sharedOwners":status[4]
    }

    return response.send({message:portfolioStatus});
});

//********************************* API to  get Portfolios by customer Address ***************************

/**
 * Get All Portfolios (applied loans for a customer).
 * @function getAllPortfolios 
 * @param {string} walletAddress - wallet Address of the customer.
 */
/*
app.get('/getAllPortfolios', function(request,response){
    logger.info("getAllPortfolios");
    var walletAddress          = request.query.walletAddress;
    logger.debug("walletAddress : "+walletAddress);
    logger.debug("fetching portfolioStatus from contract");
    var customerPortfolios = (mortgageContract['getPortfolios'](walletAddress));
    logger.debug("customerPortfolios : "+customerPortfolios);
    var jsonResponse = [];
    var length = customerPortfolios[1].length;

    for(var index = 0; index < length ; index++){
        var portfolio = (mortgageContract['getPortfolioStatus'](customerPortfolios[1][index]));
        var portfolioStatus = {
            "loanId":portfolio[0],
            "portfolioStatus":portfolio[1],
            "message":portfolio[2],
            "owner":portfolio[3],
            "sharedOwners":portfolio[4]
         }
        jsonResponse.push(portfolioStatus);
    }

    logger.debug(" printing portfolio Status"+JSON.stringify(jsonResponse));
    return response.send(jsonResponse.reverse());
});
*/


/**
 * 
 * Get all portfolios
 */
/*====== Sanjeev added this ===================*/
async function insertDataToDB(portfolioList,walletId){
    var loanListLength = portfolioList[1].length;
    logger.debug("insertDataToDB for wallet : "+walletId);
    for(var i = 0; i < loanListLength; i++){
        var portfolio = (mortgageContract['getPortfolioStatus'](portfolioList[1][i]));
        var portfolioStatus = {
            "loanId":portfolio[0],
            "portfolioStatus":portfolio[1],
            "message":portfolio[2],
            "owner":portfolio[3],
            "sharedOwners":portfolio[4]
        }

            var query = {
                    loanId:portfolio[0]
            };
            //var obj = initialClaimDetails;
            await portfolioDB.collection("db_"+walletId).update(query,portfolioStatus,{upsert: true}, function(err,doc){
                    if (err) throw err;
                    console.log("Sanjeev: Single Wallet record inserted/updated ..");
            });
    }
}
/*=========================*/

app.get('/getAllPortfolios',function(request, response){
    var walletAddress = request.query.walletAddress;
    /*      Sanjeev updated this : Start     */
    /*logger.debug ("Sanjeev:Updating portfolioDB before querying..."); 
    var portfolioList =  (mortgageContract['getPortfolios'](walletAddress));
    insertDataToDB(portfolioList,walletAddress); 
    logger.debug ("Sanjeev:Updating portfolioDB done..."); */

    /*      Sanjeev updated this : End */
    logger.info("getAllPortfolios");
    portfolioDB.collection("db_"+walletAddress).find({}).toArray(function(err, result) {
        if (err) throw err;
        logger.debug(result);
        return response.send(result.reverse());
      });

});




//********************************* API to change portfolio status *************************/

// update portfolio status 
// not : only shared owner can change the portfolio status
/**
 * Update portfolio.
 * @function updatePortfolioStatus
 * @param {number} loanId - loan id.
 * @param {string} sharedOwnerAddress - wallet Address of the sharedOwner.
 * @param {string} status - status of the loan.
 * @param {string} message - message to be sent.
 */
app.post('/updatePortfolioStatus', function (request, response) {

    logger.info("updatePortfolioStatus");
    var sharedOwnerAddress = request.query.sharedOwnerAddress;
    var loanId = request.query.loanId;
    var status = request.query.status;
    var message = request.query.message;


    logger.info("sharedOwnerAddress : " + sharedOwnerAddress);
    logger.info("loanId : " + loanId);
    logger.info("status : " + status);
    logger.info("message : " + message);
    //dont know password.. 

    try {
        logger.debug("unlocking shared owner wallet");
        web3.personal.unlockAccount(sharedOwnerAddress, "");
        var transactionId = (mortgageContract['updatePortfolioStatus'](sharedOwnerAddress, loanId, status, message, {
            from: String(sharedOwnerAddress),
            gas: 4000000
        }));
        logger.debug("portfolio update transaction " + JSON.stringify(transactionId));

        return response.send({
            message: transactionId
        });
    } catch (e) {
        logger.error("Error in updatePortfolioStatus : " + e);
    }
});



// ******************************** API to add shared owner *********************************** 



/**
 * Add Shared Owner.
 * @function addSharedOwner
 * @param {number} loanId - loan id.
 * @param {string} newOwnerAddress - wallet address of the newOwner.
 * @param {string} ownerAddress - wallet address of the owner i.e customer.
 */
app.post('/addSharedOwner', function (request, response) {

    logger.info("addSharedOwner");
    logger.debug("************************ add shared owner  **************************");

    var owner = request.query.owner;
    var loanId = request.query.loanId;
    var newOwnerAddress = request.query.newOwnerAddress;
    logger.debug("owner : " + owner);
    logger.debug("loanId : " + loanId);
    logger.debug("newOwnerAddress : " + newOwnerAddress);

    try {

        var transactionId = (mortgageContract['addSharedOwner'](owner, loanId, newOwnerAddress, {
            from: String(owner),
            gas: 4000000
        }));
        logger.debug("transactionId : " + newOwnerAddress);
        console.log("printing transaction id " + transactionId);
        return response.send({
            message: transactionId
        });

    } catch (e) {
        logger.error("Error in addSharedOwner : " + e);
    }
});


// ********************************* API to upload identity documents *****************************

app.post('/uploadIdentityDocuments', function (request, response) {
    logger.info("uploadIdentityDocuments ");
    var loanId = request.body.loanId;
    var ownerAddress = request.body.ownerAddress;
    var username = request.body.username;
    var password = request.body.password;

    logger.debug("loanId : " + loanId);
    logger.debug("ownerAddress : " + ownerAddress);
    logger.debug("userName : " + userName);
    logger.debug("password : " + password);

    // upload identity documents to ipfs first
    if (!request.files) {
        return response.status(400).send('No files were uploaded.');
    }

    //unlocking account
    web3.personal.unlockAccount(ownerAddress, "");
    let ssn = request.files.ssn;
    let passport = request.files.passport;

    console.log(" uploading ssn document to ipfs " + ssn.name);
    console.log(" uploading passport document to ipfs  " + passport.name);
    var ssnHash = "";
    var passportHash = "";
    const files = [{
            path: request.files.ssn.name,
            content: request.files.ssn.data
        },
        {
            path: request.files.passport.name,
            content: request.files.passport.data
        }
    ]
    var fileHash = [];
    try {
        ipfs.add(files, (err, filesAdded) => {
            //fileHash.push(filesAdded[0].hash);
            //fileHash.push(filesAdded[1].hash);
            logger.debug("Files uploaded ");
            logger.debug(filesAdded[0].hash);
            logger.debug(filesAdded[1].hash);
            logger.debug("printing loanId" + loanId);
            logger.debug("printing owner address" + ownerAddress);

            var documentUploadTx = (mortgageContract['uploadPreDocuments'](loanId, ownerAddress, filesAdded[0].hash, filesAdded[1].hash, {
                from: String(ownerAddress),
                gas: 4000000
            }));

            logger.debug("printing transaction id " + documentUploadTx);

            return response.redirect("http://" + redirectionURL + "/Bank/UploadIdentityDocs?loanId=" + loanId + "&username=" + username + "&password=" + password);
        });
    } catch (e) {
        logger.error("Error in uploadIdentityDocuments : " + e);
    }
})

//************************************ API to upload salary and property documents ********************** */

app.post('/uploadTaxDocuments', function (request, response) {

    logger.info("uploadTaxDocuments");

    var loanId = request.body.loanId;
    var ownerAddress = request.body.ownerAddress;
    var username = request.body.username;
    var password = request.body.password;

    logger.debug("loanId : " + loanId);
    logger.debug("ownerAddress : " + ownerAddress);
    logger.debug("username : " + username);
    logger.debug("password : " + password);

    // upload identity documents to ipfs first
    if (!request.files) {
        return response.status(400).send('No files were uploaded.');
    }

    //unlocking account
    web3.personal.unlockAccount(ownerAddress, "");

    let tax = request.files.tax;
    let salary = request.files.salary;

    logger.debug(" uploading ssn document to ipfs " + tax.name);
    logger.debug(" uploading passport document to ipfs  " + salary.name);
    var ssnHash = "";
    var passportHash = "";
    const files = [{
            path: request.files.tax.name,
            content: request.files.tax.data
        },
        {
            path: request.files.salary.name,
            content: request.files.salary.data
        }
    ]
    var fileHash = [];
    try {
        ipfs.add(files, (err, filesAdded) => {
            //fileHash.push(filesAdded[0].hash);
            //fileHash.push(filesAdded[1].hash);
            logger.debug(filesAdded[0].hash);
            logger.debug(filesAdded[1].hash);
            logger.debug("printing byte array" + web3.fromUtf8("ssn"));
            logger.debug("printing byte array" + web3.fromUtf8("passport"));
            logger.debug("printing loanId" + loanId);
            logger.debug("printing owner address" + ownerAddress);

            var documentUploadTx = (mortgageContract['uploadPostDocuments'](loanId, ownerAddress, filesAdded[0].hash, filesAdded[1].hash, {
                from: String(ownerAddress),
                gas: 4000000
            }));

            logger.debug("printing transaction id " + documentUploadTx);
            return response.redirect("http://" + redirectionURL + "/Bank/UploadTaxDocs?loanId=" + loanId + "&username=" + username + "&password=" + password);
        });
    } catch (e) {
        logger.error("Error in uploadTaxDocuments : " + e);
    }
});

//********************************** API to get all dcuments by loanId ******************************

/**
 * Get Documents By Loan Id.
 * @function getDocumentHashByLoanId
 * @param {number} loanId - loan id.
 */

app.get('/getDocumentHashByLoanId', function(request,response){
    logger.info("getDocumentHashByLoanId");
    var loanId          = request.query.loanId;
    logger.debug("loanID : "+loanId);

    var customerDocList = (mortgageContract['getUploadedDocuments'](loanId));
    logger.debug("printing customer document list"+customerDocList);
    
    var jsonResponse = {
        "loanId":customerDocList[0],
        "ssnHash":customerDocList[1],
        "passportHash":customerDocList[2],
        "taxReturnsHash":customerDocList[3],
        "salaryDetailsHash":customerDocList[4]
    }

    return response.send({message:jsonResponse});
    
});

//************************************* API to get all wallets *****************************/


app.get('/getAllWallets', function(request,response){
    logger.info("getAllWallets");
    var allWallets=[];
    customerDB.listCollections().toArray(function(err, result){
        if (err) throw err;
        //logger.debug(result);

        for( var index = 0; index < result.length; index++){
            var collectionName = result[index].name;
            customerDB.collection(collectionName).findOne({}, function(err, result) {
                if (err) throw err;
                var customerObject = {
                    wallet:result.wallet,
                    name:result.name,
                    userName:result.userName
                }
                allWallets.push(customerObject);
            });
        }
	//logger.debug("allWallets : "+JSON.stringify(allWallets));
        let promiseA = new Promise((resolve, reject) => {
            let wait = setTimeout(() => {
		logger.debug("allWallets : "+JSON.stringify(allWallets));
                response.setHeader('Content-Type', 'application/json');
                response.send(allWallets);
            }, 1500)
        })
    });

});








/**
 * Get All Wallets in the chain.
 * @function getAllwallets
 */

/*
app.get('/getAllwallets',function(request,response){
    logger.info("getAllwallets");
    var wallets = (mortgageContract['getAllWallets']());
    logger.debug("list of wallets are "+wallets);
    var jsonResponse=[];
    logger.debug("Length of wallet list is :"+wallets.length);

    for(var index=0; index<wallets.length; index++){
        var customerObject = (mortgageContract['getCustomer'](wallets[index]));
            var message;
                message = {
                    "wallet":customerObject[0],
                    "name":customerObject[1],
                    "userName":customerObject[2]
                }
        jsonResponse.push(message);
    }
    return response.send(jsonResponse.reverse());
});

*/



















// -------------------------------------------- insurance company API'S -------------------------------------





// ********************************** API to get list of insurance company in the chain ************************

/**
 * Get Insurance Companies.
 * @function getInsuranceCompanies
 */
app.get('/getInsuranceCompanies',function(request, response){

logger.info("getInsuranceCompanies");

    var length = (insuranceContract['getInsuranceCompanyListLength']());
    logger.debug("length of the list is : "+length);
    // fetching all companies 
    var companyList = [];
    for(var index=0; index<length; index++){
        var company =  (insuranceContract['getInsuranceCompany'](index,{from:String(bankAddress), gas: 4000000}));
        var companyObject = {
            "accountAddress":company[0],
            "companyName":company[1]
        }

        companyList.push(companyObject);
    }
    return response.send(companyList);
})

// ***************************** API For requesting  quote ( for customer) *******************************
/**
 * Request For Quote.
 * @function requestForQuote
 * @param {number} loanId - loan id.
 * @param {string} customerAddress - wallet address of customer.
 */
app.post('/requestForQuote',function(request, response){

    logger.info("requestForQuote");
    var loanId              = request.body.loanId;


    var customerAddress     = request.body.customerAddress;
    var  insuranceList = [];
    insuranceList = request.body.insuranceAddresses;
    logger.debug("loanID : "+loanId);
    logger.debug("customerAddress : "+customerAddress);
    logger.debug("insuranceList : "+insuranceList);

    try{
    logger.debug("unlocking bank account");
    web3.personal.unlockAccount(bankAddress, bankWalletPassword);

    // get userName
    var result = (mortgageContract['getCustomer'](customerAddress));
    var userName = result[2];

    var transactionId       = (insuranceContract['requestForQuote'](loanId, insuranceList, contractAddress, userName,customerAddress,{from: String(bankAddress), gas: 4000000}));
    var transactionIdM		= (mortgageContract['requestForQuote'](loanId, insuranceList,{from: String(bankAddress), gas: 400000}));
  
    logger.debug("printing transactionId : "+transactionId);
	logger.debug("printing mortgageContract transaction : "+transactionIdM);
    response.send({"tx_id":transactionId});
    }catch(e){
        logger.error("Error in requestForQuote : "+e);
    }
});














// ********************* API for getting list of request quotes from customer ( for insurance company) *********************


/**
 * Get Quote Details of customer (Note : The quote should be first given by customer).
 * @function getCustomerQuoteRequest
 * @param {string} insuranceAddress - wallet address of insuranceCompany.
 */

app.get('/getCustomerQuoteRequest', function (request, response) {

    console.log("************************ get customer quote request ***********************");

    var insuranceAddress = request.query.insuranceAddress;
    var loanIds = (insuranceContract['getCustomerRequest'](insuranceAddress));

    var jsonResponse = [];

    for (var index = 0; index < loanIds.length; index++) {

        //fetching insurance quote status  by insurance address

        //var quoteObject =  (mortgageContract['getQuote'](loanId,index));

        var length = (mortgageContract['getRequestCompaniesLength'](loanIds[index]));
        console.log("length of insuranceCompanies list : " + length);
        // loop and get quotes of all insurance companies
        var insuranceQuote;
        for (var i = 0; i < length; i++) {

            var jsonObject = (mortgageContract['getQuote'](loanIds[index], i));

            if (insuranceAddress == jsonObject[0]) {
                var quote_message;
                if (jsonObject[1] == "") {
                    quote_message = "pending";
                } else {
                    quote_message = jsonObject[1];
                }

                insuranceQuote = quote_message;
                break;
            }
        }

        var portfolioObject = (mortgageContract['getPortfolioProperty'](loanIds[index]));
        var customerObject = (mortgageContract['getCustomer'](portfolioObject[3]));
        var statusObject = (mortgageContract['getPortfolioStatus'](loanIds[index]));

        var jsonObject = {
            "name": customerObject[1],
            "loanId": loanIds[index],
            "customerAddress": portfolioObject[3],
            "portfolioStatus": statusObject[1],
            "quoteStatus": insuranceQuote,
            "message": statusObject[2]
        }

        jsonResponse.push(jsonObject);
    }

    // sending list of loanIds as response
    response.send({
        "message": jsonResponse.reverse()
    });
});




// ******************************* API to get portfolio information ******************************

/**
 * Get Customer Portfolio Information For Insurance.
 * @function getCustomerPortfolioInfo
 * @param {number} loanId - loan id.
 */


app.get('/getCustomerPortfolioInfo', function (request, response) {

    logger.info("getCustomerPortfolioInfo");

    var loanId = request.query.loanId;
    var walletAddress = request.query.walletAddress;
    logger.debug("loanId : " + loanId);
    logger.debug("walletAddress : " + walletAddress);

    var portfolioMortgageList = (mortgageContract['getPortfolioMortgage'](loanId, {
        from: String(walletAddress),
        gas: 4000000
    }))
    var portfolioPropertyList = (mortgageContract['getPortfolioProperty'](loanId, {
        from: String(walletAddress),
        gas: 4000000
    }))

    var customerDocList = (mortgageContract['getUploadedDocuments'](loanId));
    console.log("printing customer document list" + customerDocList);
    var jsonResponse = {

    }

    var portfolio = {
        "loanId": portfolioMortgageList[0],
        "loanPurpose": portfolioMortgageList[1],
        "loanType": portfolioMortgageList[2],
        "interestType": portfolioMortgageList[3],
        "loanTerm": portfolioMortgageList[4],
        "purchasePrice": portfolioMortgageList[5],
        "downPayment": portfolioMortgageList[6],
        "propertyType": portfolioPropertyList[1],
        "propertyAddress": portfolioPropertyList[2],
        "loanId": customerDocList[0],
        "ssnHash": customerDocList[1],
        "passportHash": customerDocList[2],
        "taxReturnsHash": customerDocList[3],
        "salaryDetailsHash": customerDocList[4]
    }

    logger.debug(" printing portfolio " + JSON.stringify(portfolio));

    return response.send({
        message: portfolio
    });
});





// ****************************** API To give quote to customer (for insurance company) *************************

app.post('/giveQuoteToCustomer', function (request, response) {

    logger.info("giveQuoteToCustomer");
    var loanId = request.query.loanId;
    var quote = request.query.quote;
    var insuranceAddress = request.query.insuranceAddress;
    var premium = request.query.premium;

    web3.personal.unlockAccount(insuranceAddress, "");

    var transactionId = insuranceContract['giveQuoteToCustomer'](loanId, quote, insuranceAddress, contractAddress, premium, {
        from: String(insuranceAddress),
        gas: 4000000
    });

    logger.debug("printing transactionId : " + transactionId);

    return response.send({
        message: transactionId
    });
});



// ************************** API to get  premium details given by insurance for a loanid ***********************

app.get('/getPremiumAmount', function (request, response) {
    logger.info("getPremiumAmount");
    var loanId = request.query.loanId;
    var insuranceAddress = request.query.insuranceAddress;

    logger.debug("loandId : " + loanId);
    logger.debug("insuranceAddress : " + insuranceAddress);

    var premiumDetails = insuranceContract['getCustomerPremium'](loanId, insuranceAddress);
    logger.debug("premium details : " + premiumDetails);
    var jsonResponse = {
        "loanId": loanId,
        "premiumAmount": premiumDetails[1]
    }

    return response.send({
        jsonResponse
    });

});


//******************************** API to get quote by loanId and insuranceAddress ****************************/
app.get('/getQuote', function (request, response) {

    logger.info("getQuote");
    var loanId = request.query.loanId;
    var insuranceAddress = request.query.insuranceAddress;
    logger.debug("loanId : "+loanId);
    logger.debug("insuranceAddress : "+insuranceAddress);
    var length = (mortgageContract['getRequestCompaniesLength'](loanId));
    logger.debug("length of insuranceCompanies list : " + length);

    // loop and get quotes of all insurance companies
    var jsonResponse = [];
    for (var index = 0; index < length; index++) {

        var jsonObject = (mortgageContract['getQuote'](loanId, index));

        var quote_message;
        if (jsonObject[1] == "") {
            quote_message = "pending";
        } else {
            quote_message = jsonObject[1];
        }
        var quote = {
            "companyAddress": jsonObject[0],
            "quote": quote_message
        }

        jsonResponse.push(quote);
    }
    logger.debug(jsonResponse);

    for (var index = 0; index < jsonResponse.length; index++) {
        var object = jsonResponse[index];

        if (insuranceAddress == object.companyAddress) {
            var quoteObject = {
                "quote": object.quote
            }
            return response.send({
                quoteObject
            });

        }
    }
});


//********************************** API to get quotes by loanId ****************************************//

app.get('/getQuotes', function (request, response) {
    logger.info("getQuotes");
    var loanId = request.query.loanId;
    var length = (mortgageContract['getRequestCompaniesLength'](loanId));
    logger.debug("length of insuranceCompanies list : " + length);
    // loop and get quotes of all insurance companies
    var jsonResponse = [];
    for (var index = 0; index < length; index++) {
        var jsonObject = (mortgageContract['getQuote'](loanId, index));

        var quote_message;
        if (jsonObject[1] == "") {
            quote_message = "pending";
        } else {
            quote_message = jsonObject[1];
        }
        var quote = {
            "companyAddress": jsonObject[0],
            "quote": quote_message
        }

        jsonResponse.push(quote);
    }
    return response.send({
        jsonResponse
    });
})


//******************************** API to pay premium by quote (for customer) **************************

app.post('/payPremium', function (request, response) {

    logger.info("payPremium");

    var loanId = request.query.loanId;
    var premiumAmount = request.query.premiumAmount;
    var insuranceAddress = request.query.insuranceAddress;
    var customerAddress = request.query.customerAddress;
    var userName = request.query.userName;

    logger.debug("loanId : " + loanId);
    logger.debug("premiumAmount : " + premiumAmount);
    logger.debug("insuranceAddress : " + insuranceAddress);
    logger.debug("customerAddress : " + customerAddress);

    logger.info("preminum amount :"+premiumAmount)

    premiumAmount = premiumAmount.replace("$", "");
    web3.personal.unlockAccount(customerAddress, "");

    try {
        //read sample policy file and upload ot to ipfs
        fs.readFile('Insurance.pdf', function (err, data) {
            if (err) throw err;
            //console.log(data);
            var policyHash = "";
            const files = [{
                path: "policyDocument",
                content: data
            }]

            var fileHash = [];
            ipfs.add(files, (err, filesAdded) => {
                console.log(filesAdded);
                var transactionId = insuranceContract['payPremium'](loanId, premiumAmount, insuranceAddress, contractAddress, userName, customerAddress, filesAdded[0].hash, {
                    from: String(customerAddress),
                    gas: 4000000
                });
                var updateRequestQuoteTx = mortgageContract['updateRequestQuote'](loanId, insuranceAddress, "approved", {
                    from: String(customerAddress),
                    gas: 4000000
                });
                var addOwnerTx = mortgageContract['addSharedOwner'](customerAddress, loanId, insuranceAddress, {
                    from: String(customerAddress),
                    gas: 4000000
                });
                var updatePortfolioTx = mortgageContract['updatePortfolioStatus'](customerAddress, loanId, "Insurance_approved", "ready_to_disburse", {
                    from: String(customerAddress),
                    gas: 4000000
                });

                console.log("paying premium");
                return response.send({
                    message: transactionId
                });
            });
        });
    } catch (e) {
        logger.error("Error in paying premium");
    }
});


// ********************* API to get customer policyDetails ****************************

app.get('/getCustomerPolicy', function (request, response) {

    logger.info("getCustomerPolicy");
    var loanId = request.query.loanId;
    logger.debug("loanId : " + loanId);
    var policyDetails = insuranceContract['getCustomerInsurance'](loanId);
    var jsonResponse = {
        "policyId": policyDetails[0],
        "premiumPaid": policyDetails[1],
        "premiumStatus": policyDetails[2],
        "policyDocument": policyDetails[3]
    }
    return response.send(jsonResponse);
});


//API for getting quote status of a customer loan
app.get('/getQuoteStatus', function (request, response) {

    logger.info("getQuoteStatus");
    var loanId = request.query.loanId;
    var quoteStatus = mortgageContract['getRequestQuote'](loanId);
    var jsonResponse = {
        "loanId": quoteStatus[0],
        "status": quoteStatus[1],
        "approvedBy": quoteStatus[2],
        "appliedInsurance": quoteStatus[3]
    }
    return response.send(jsonResponse);
});







































// ********************************* MongoDB API for storing and retrieving transactions **************************************

function storeTransactionForInsurance(collectionName, tx_id, insuranceAddress, description, loanId) {
    logger.info("storeTransactionForInsurance");
    var date_time;

    // get blocktimestamp by fetching blockdata
    logger.debug("printing tx_id" + tx_id);
    logger.debug("fetching transaction data  ");
    logger.debug("printing loanId " + loanId);
    var transactionData = web3.eth.getTransaction(tx_id);

    logger.debug(transactionData);

    logger.debug("fetching block data  ");
    var blockNumber = transactionData.blockNumber;

    var blockData = web3.eth.getBlock(blockNumber);
    logger.debug("fetching block timestamp  ");
    date_time = blockData.timestamp;

    logger.debug("printing block timestamp   " + date_time);

    var portfolioStatus = (mortgageContract['getPortfolioStatus'](loanId));
    var accountAddress = portfolioStatus[3];

    // get name of the customer
    var customerName;

    logger.debug("printing account address : " + accountAddress);

    var result = (mortgageContract['getCustomer'](accountAddress, {
        from: String(accountAddress),
        gas: 4000000
    }));
    logger.debug("printing customer details : " + result);
    customerName = result[1];

    logger.debug("printing customerName : " + customerName);

    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {

            logger.debug("************ connected to mongodb client at localhost *************");
            logger.debug("********** storing record **********");
            var myobj = {
                transactionId: tx_id,
                dateTime: date_time,
                description: description,
                customerName: customerName,
                loanId: loanId
            };
            //var collectionName = user_name+"txns";
            insuranceTxnDB.collection(collectionName).insertOne(myobj, function (err, res) {
                if (err) throw err;
                logger.debug("Transaction record inserted ....");
            });
        }, 3000)
    });

}


app.get('/getTransactionsForInsurance', function (request, response) {
    logger.info("getTransactionsForInsurance");
    var collectionName = request.query.insuranceAddress;

    if (err) throw err;
    insuranceTxnDB.collection(collectionName).find({}).toArray(function (err, result) {
        if (err) throw err;
        logger.debug(result);
        return response.send(result.reverse());
    });
});


function storeTransaction(user_name, tx_id, description, accountAddress, loanId) {
    // storing transaction record for a customer into mongodb 
    // collection is by user_name i.e it can be any emailId( but it is unique)
    logger.info("storeTransaction");
    var date_time;

    // get blocktimestamp by fetching blockdata
    logger.debug("printing tx_id" + tx_id);
    logger.debug("fetching transaction data  ");
    var transactionData = web3.eth.getTransaction(tx_id);

    logger.debug(transactionData);

    logger.debug("fetching block data  ");
    var blockNumber = transactionData.blockNumber;

    var blockData = web3.eth.getBlock(blockNumber);
    logger.debug("fetching block timestamp  ");
    date_time = blockData.timestamp;

    logger.debug("printing block timestamp   " + date_time);

    // get name of the customer
    var customerName;

    logger.debug("printing account address : " + accountAddress);

    var result = (mortgageContract['getCustomer'](accountAddress, {
        from: String(accountAddress),
        gas: 4000000
    }));
    logger.debug("printing customer details : " + result);
    customerName = result[1];

    logger.debug("printing customerName : " + customerName);

    let promiseA = new Promise((resolve, reject) => {
        let wait = setTimeout(() => {

            logger.debug("************ connected to mongodb client at localhost *************");
            logger.debug("********** storing record **********");
            var myobj = {
                transactionId: tx_id,
                dateTime: date_time,
                description: description,
                customerName: customerName,
                loanId: loanId
            };

            var collectionName = user_name + "txns";
            mortgageTxnDB.collection(collectionName).insertOne(myobj, function (err, res) {
                if (err) throw err;
                logger.debug("Transaction record inserted ....");
            });
            /* --Sanjeev - updating portfolioDB for data retrieval in the GUI */
	    /* 1. Retrieve portfolio status from the contract using  loanID  */
	    /* 2. owner => walletid 				*/
            /* Update portfolioDB.db_walletID collection */
      	    var portfolio = (mortgageContract['getPortfolioStatus'](parseInt(loanId)));
	    var portfolioStatus = {
        	"loanId":parseInt(portfolio[0]),
		"portfolioStatus":portfolio[1],
		"message":portfolio[2],
		"owner":portfolio[3],
		"sharedOwners":portfolio[4]
	     }
	     var query = {
                    loanId:parseInt(portfolio[0])
             };
             //var obj = initialClaimDetails;
             portfolioDB.collection("db_"+portfolio[3]).update(query,portfolioStatus,{upsert: true}, function(err,doc){
                    if (err) throw err;
                     console.log("~Sanjeev: Record inserted/updated in portFolioDB -> db_"+portfolio[3]+" loanId[Status] ="+loanId+"[ "+portfolio[1]+" ]" );
             });


	   /* - Snjeev update End */
        }, 3500)
    });
}

// **************************** API for reading transactions from mongoDB ***************************//

app.get('/getAllTransactions', function (request, response) {
    logger.info("getAllTransactions");
    var jsonResponse = [];
    mortgageTxnDB.listCollections().toArray(function (err, result) {
        if (err) throw err;
        logger.debug(result);
        //db.close();
        for (var index = 0; index < result.length; index++) {

            var collectionsName = result[index].name;
            mortgageTxnDB.collection(collectionsName).find({}).toArray(function (err, record) {
                if (err) throw err;
                jsonResponse.push(record.reverse());
            });
        }

        let promiseA = new Promise((resolve, reject) => {
            let wait = setTimeout(() => {

                response.setHeader('Content-Type', 'application/json');
                response.send(jsonResponse);
            }, 2000)
        })
    });
});



//get all customer loans
app.get('/getAllCustomerLoans', function (request, response) {

    logger.info("getAllCustomerLoans");
    var jsonResponse = [];

    mortgageDB.listCollections().toArray(function (err, result) {
        if (err) throw err;
        console.log(result);
        //db.close();
        for (var index = 0; index < result.length; index++) {

            var collectionsName = result[index].name;
            //console.log("printing collections name"+collectionsName);
            mortgageDB.collection(collectionsName).find({}).toArray(function (err, record) {
                if (err) throw err;
                logger.debug("printing record" + JSON.stringify(record));
                var walletAddress = record[0].accountAddress;

                logger.debug("printing wallet address : " + walletAddress);


                var customerPortfolios = (mortgageContract['getPortfolios'](walletAddress));
                var length = customerPortfolios[1].length;
                var customerObject = (mortgageContract['getCustomer'](walletAddress, {
                    from: String(walletAddress),
                    gas: 4000000
                }));

                var ownerName = customerObject[1];
		var userName = customerObject[2];
                for (var index = 0; index < length; index++) {
                    var portfolio = (mortgageContract['getPortfolioStatus'](customerPortfolios[1][index]));

                    var portfolioStatus = {
                        "loanId": portfolio[0],
                        "portfolioStatus": portfolio[1],
                        "message": portfolio[2],
                        "owner": portfolio[3],
                        "ownerName": ownerName,
                        "sharedOwners": portfolio[4],
			"userName": userName
                    }
                    jsonResponse.push(portfolioStatus);
                }
            });
        }

        let promiseA = new Promise((resolve, reject) => {
            let wait = setTimeout(() => {

                response.setHeader('Content-Type', 'application/json');
                response.send(jsonResponse.reverse());
            }, 3000)
        })
    });
});








// ************** API to get All customer transactions by loanId  ********************
app.get('/getCustomerTransactionsByLoanId',function(request,response){
        console.log("******************** get transactions for customer ****************");
        var userName = request.query.userName;
        var loanId   = parseInt(request.query.loanId);
        console.log("userName is "+userName);
        console.log("loan id is "+loanId);

        var collectionsName = userName+"txns"
        console.log("printing collections name "+collectionsName);
          //if (err) throw err;
          var query = {loanId:loanId};
          mortgageTxnDB.collection(collectionsName).find({loanId:loanId}).toArray(function(err, result) {
            if (err) throw err;
            //console.log(result);
            return response.send(result.reverse());
          });
    });







// ************************* API to get all customer transactions **************************

app.get('/getCustomerTransactions',function(request,response){

    console.log("******************** get transactions for customer ****************");

    var userName = request.query.userName;

    var collectionsName = userName+"txns"

      mortgageTxnDB.collection(collectionsName).find({}).toArray(function(err, result) {
        if (err) throw err;
        //console.log(result);
        return response.send(result.reverse());
      });
});


app.post('/setMessage',function(request,response){
    var loanId = request.query.loanId;
    var message = request.query.message;

    console.log("*********************** set message ************************");

    if(loanId == "initial"){
        globalMessagArray.loanId = "";
        globalMessagArray.message = message;

        console.log(" loan id is initial");
    }else{
        console.log("*************** hitting setMessage **************");
        globalMessagArray.loanId = loanId;
        globalMessagArray.message = message;
        console.log("loan id is not initital");
    }
    return response.send({globalMessagArray});
});



app.get('/getMessage',function(request,response){
    logger.info("getMessage");
    logger.debug(globalMessagArray);
    return response.send({globalMessagArray});
});



// ************************ API to upload document to ipfs and quorum chain *************************
app.post('/docUpload',function(request, response){

    logger.info("docUpload");

    var loanId = request.body.loanId;
    var ownerAddress = request.body.ownerAddress;
    var username = request.body.username;
    var password = request.body.password;

    logger.debug("loanId : "+loanId);
    logger.debug("ownerAddress : "+ownerAddress);
    logger.debug("username : "+username);
    logger.debug("password : "+password);

    // upload identity documents to ipfs first
    if (!request.files){
        return response.status(400).send('No files were uploaded.');
    }

    //unlocking account
    web3.personal.unlockAccount(ownerAddress,"");

    let ssn      = request.files.ssn;
    let passport = request.files.passport;
    let tax      = request.files.tax;
    let salary   = request.files.salary;

    logger.debug(" uploading ssn document to ipfs "+ssn.name);
    logger.debug(" uploading passport document to ipfs  "+passport.name);
    logger.debug(" uploading tax  document to ipfs  "+tax.name);
    logger.debug(" uploading salary document to ipfs  "+salary.name);
   logger.info(" uploading ssn document to ipfs "+ssn.name);
    logger.info(" uploading passport document to ipfs  "+passport.name);
    logger.info(" uploading tax  document to ipfs  "+tax.name);
    logger.info(" uploading salary document to ipfs  "+salary.name);


    var ssnHash="";
    var passportHash="";
        const files=[
        {
            path: request.files.ssn.name,
            content: request.files.ssn.data
          },
          {
            path: request.files.passport.name,
            content: request.files.passport.data
          },
          {
            path: request.files.tax.name,
            content: request.files.tax.data
          },
          {
            path: request.files.salary.name,
            content: request.files.salary.data
          }
        ]
        var fileHash=[];
        try{
            ipfs.add(files, (err, filesAdded) => {
	    logger.info ("fileshash "+filesAdded[0].hash)
            logger.debug(filesAdded[0].hash);
            logger.debug(filesAdded[1].hash);
            logger.debug("printing byte array"+web3.fromUtf8("ssn"));
            logger.debug("printing byte array"+web3.fromUtf8("passport"));
            logger.debug("printing loanId"+loanId);
            logger.debug("printing owner address"+ownerAddress);

            var documentUploadPreTx    =   (mortgageContract['uploadPreDocuments'](loanId, ownerAddress, filesAdded[0].hash,filesAdded[1].hash,{from: String(ownerAddress), gas: 4000000}));
            var documentUploadPostTx   =  (mortgageContract['uploadPostDocuments'](loanId, ownerAddress, filesAdded[2].hash,filesAdded[3].hash,{from: String(ownerAddress), gas: 4000000}));
            
            logger.debug("printing transaction id "+documentUploadPreTx);
            logger.debug("printing transaction id "+documentUploadPostTx);
            response.send({
                "tx_id": documentUploadPostTx
            })
            
            //return response.redirect("http://"+redirectionURL+"/Bank/UploadIdentityDocs?loanId="+loanId+"&username="+username+"&password="+password);
        });
    }catch(e){
        logger.error("Error in docUpload : "+e);
    }
});



//********************* quorum transactions api  *******************************************/


app.get('/getTransactionDetails',function(request, repsonse){
    var tx_id = request.query.tx_id;
    var jsonResponse = web3.eth.getTransaction(tx_id);
    return response.send(jsonResponse);
});


app.get('/getContractConfig', function (request, response) {

    try {
        logger.info("getContractConfig");
        /*
        let configRawData = fs.readFileSync('./config.json');  
        let configData = JSON.parse(configRawData);
        */
        let contractConfigRawData = fs.readFileSync('./contractConfig.json');
        let contractConfigData = JSON.parse(contractConfigRawData);

        response.send({
            contractConfigData
        });
    } catch (e) {
        console.error(e);
    }

});


app.get('/getAppConfig', function(request, response){
    logger.info("getAppConfig");
    try {
        var configDataRaw = fs.readFileSync("config.json");
        let configData = JSON.parse(configDataRaw);
        response.send(configData);
    } catch (e) {
        console.error("Error : " + e);
    }
});



app.get('/getBankWalletAddress', function(request, response){
    logger.info("getBankWalletAddress");

    try {
        let configDataBankRaw = fs.readFileSync("./config.json");
        let configDataBank = JSON.parse(configDataBankRaw);
        logger.debug("bankWalletAddress : " + JSON.stringify(configDataBank.bankWalletAddress));

        response.send({
            bankWalletAddress: configDataBank.bankWalletAddress
        });
    } catch (e) {
        console.error("Error : " + e);
    }
});


app.get('getTransactionReceipt', function(request, response){
    var tx_id  = request.query.tx_id;
    var jsonResponse = web3.eth.getTransactionReceipt(tx_id);
    return response.send(jsonResponse);
});

/**
 * Health check API
 */
app.get('/checkHealthStatus', function(req, res){
    logger.info("checkHealthStatus");

    res.send({
        message:"Health check"
    });
});



//assuming app is express Object.
app.get('/index',function(req,res){
	res.sendFile(path.join(__dirname+'/UI/Landing.html'));
	//res.sendFile('/AirportDashboard/index.html');

});


// added on feb 5 2019
app.get('/ipfs', function (req, res) {
    logger.info("ipfs");
    var fileHash = req.query.fileHash;

    try {
        //create and ipfs url and return
        logger.debug("fileHash : " + fileHash);

        /*
        ipfs.files.cat(fileHash, function (err, file) {
            if (err) throw err;
            res.send(file);
        });
        */
        res.send({
            ipfsUrl: "http://" + ipfsIpAddress + ":"+ipfsPort+"/ipfs/" + fileHash
        });
    } catch (e) {
        logger.error("ERROR : " + e);
    }
});
// *******************  server configurations **********************************

app.use('/', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.send("{message: API service for mortgage app on ethereum");
})


MongoClient.connect(insuranceTxnDBUrL, function(err, insuranceTxnDBTemp) {
    insuranceTxnDB = insuranceTxnDBTemp;
    MongoClient.connect(mortgageTxnDBUrl, function(err, mortgageTxnDBTemp) {
        mortgageTxnDB = mortgageTxnDBTemp;
        MongoClient.connect(mortgageDBUrl, function(err, mortgageDBTemp) {
            mortgageDB = mortgageDBTemp;
            MongoClient.connect(mortgageAutoDBUrl, function(err, mortgageAutoDBTemp) {
                mortgageAutoDB = mortgageAutoDBTemp;
                // ************** app runs at 0.0.0.0 at port 5000 *****************************
                //all ok start the app
                app.listen(appPort, '0.0.0.0',function () {
                    logger.info("Application  listening on port "+appPort+". ");
                })
            });
        });
    });
});
