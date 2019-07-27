var fs = require("fs");
var MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

let configRawData = fs.readFileSync('config.json');
let configData = JSON.parse(configRawData);
var mongodbIp = configData.mongoIp;
var mongodbPort = configData.mongoPort;

var mortgageAutoDBUrl = "mongodb://"+mongodbIp+":"+mongodbPort+"/mortgage_auto";
var mortgageAutoDB;

MongoClient.connect(mortgageAutoDBUrl, function(err, mortgageAutoDBTemp) {
    assert.equal(err, null);
    mortgageAutoDB = mortgageAutoDBTemp;
});

/**
 * Register automation customers
 */
function registerForAutomation() {
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
            var myObj = {
                userName: customerList[index]
            };

            var query = {userName: customerList[index]}
            mortgageAutoDB.collection(collectionName).update(query, myObj, {
                upsert: true
            }, function(err, doc){
                if (err) throw err;
                console.log("customer record inserted  -----> " + customerList[index]);
            });
        }

        setTimeout(function(){
            console.log("Closing mongodb connection ...");
            mortgageAutoDB.close();
        },9000);
    } catch (e) {
        console.error("Error in registerCustomerForAutomation : " + e);
    }
}

setTimeout(function(){
    registerForAutomation();
}, 2000);
