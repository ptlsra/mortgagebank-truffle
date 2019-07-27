var Web3 = require('web3-quorum');
var fs = require("fs");
var log4js = require('log4js');
var logger = log4js.getLogger('updateConfig.js');
var web3;
logger.level = "debug";

/**
 * printUsage
 */
function printUsage() {
    //TODO
    logger.debug("printUsage");
    logger.info("ARGS[1] - ipfsIP");
    logger.info("ARGS[2] - ipfsPort");
    logger.info("ARGS[3] - mongoIp");
    logger.info("ARGS[4] - mongoPort");
    logger.info("ARGS[5] - appPort");
    logger.info("ARGS[6] - rpcAddress");
    logger.info("ARGS[7] - rpcPort");
}
/**
 * 
 * @param {*} ipfsIp 
 * @param {*} ipfsPort 
 * @param {*} mongoIp 
 * @param {*} mongoPort 
 * @param {*} appPort 
 * @param {*} rpcAddress 
 * @param {*} rpcPort 
 */
function updateConfig(ipfsIp, ipfsPort, mongoIp, mongoPort, appPort, rpcAddress, rpcPort) {
    logger.info("updateConfig");
    logger.debug("ipfsIp : " + ipfsIp);
    logger.debug("ipfsPort : " + ipfsPort);
    logger.debug("mongoIp : " + mongoIp);
    logger.debug("mongoPort : " + mongoPort);
    logger.debug("appPort : " + appPort);
    logger.debug("rpcAddress : " + rpcAddress);
    logger.debug("rpcPort : " + rpcPort);

    /**
     * Read config.json file
     */
    let configRawData = fs.readFileSync('./config.json');
    let configData = JSON.parse(configRawData);

    logger.debug("config.json : " + JSON.stringify(configData));

    var ipfsUrl = "/ip4/" + "127.0.0.1" + "/tcp/" + ipfsPort;
    var web3Url = "http://" + rpcAddress + ":" + rpcPort;

    //app will run at 0.0.0.0
    var appIp = "0.0.0.0";

    web3 = new Web3(new Web3.providers.HttpProvider(web3Url));
    logger.info("Connected to web3");
    console.log("updating firstWalletAddress : "+web3.eth.coinbase);
    var firstWalletAddress = web3.eth.coinbase;
    var walletPassword = "";

    configData.bankWalletAddress = firstWalletAddress;
    configData.bankWalletPassword = walletPassword;
    configData.ipfsAPI = ipfsUrl;
    configData.web3Provider = web3Url;
    configData.mongoIp = mongoIp;
    configData.mongoPort = mongoPort;
    configData.appIp = appIp;
    configData.appPort = appPort;

    logger.debug("New config data : " + JSON.stringify(configData));

    //update config.json
    fs.writeFileSync("./config.json", JSON.stringify(configData));
    logger.info("config.json file updated");

}

//get command line arguments
var cmdArgs = process.argv.slice(2);
logger.debug("args : " + cmdArgs);
//check args length ( should be 9. If not print usage)
if (cmdArgs.length == 7) {
    //deployContract(cmdArgs[0], cmdArgs[1], cmdArgs[2], cmdArgs[3], cmdArgs[4], cmdArgs[5], cmdArgs[6], cmdArgs[7], cmdArgs[8]);
    updateConfig(cmdArgs[0], cmdArgs[1], cmdArgs[2], cmdArgs[3], cmdArgs[4], cmdArgs[5], cmdArgs[6]);
} else {
    printUsage();
}
