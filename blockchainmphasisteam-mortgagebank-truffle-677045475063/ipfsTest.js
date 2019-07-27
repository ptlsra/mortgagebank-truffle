/**
 * Sample program to test ipfs-http-client
 */


var ipfsClient = require('ipfs-http-client');
var fs = require('fs');
 /**
  * Connect to ipfs
  */
var ipfs = ipfsClient('/ip4/127.0.0.1/tcp/5001');

var fileData = fs.readFileSync('./README.md');

ipfs.add(fileData, (err, data) => {
    console.log("files uploaded to ipfs");
    console.log(data);
});



