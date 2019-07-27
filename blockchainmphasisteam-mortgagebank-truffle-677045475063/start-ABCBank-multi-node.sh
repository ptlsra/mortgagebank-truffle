#!/bin/bash

# takes main node ip as input
mainNodeIp=$1
mongoIp="localhost"
rpcIp="localhost"

node updateConfig.js $mainNodeIp 5001 $mongoIp 27017 5000 $rpcIp 22002 |& tee -a ./api-logs/abc-bank-api.log

echo "config.json updated"

if [ -f "contractConfig.json" ]
then
    echo "contractConfig.json found."

    echo "Starting API"
    node MortgageAPIBankAutomation.js |& tee -a ./api-logs/abc-bank-api.log

else

    echo "contractConfig.json not found."

    echo "Dropping all old databases"
    node deleteDatabase.js

    node deployContracts.js |& tee -a ./api-logs/abc-bank-api.log
    echo "contracts deployed"

    echo "Registering customers for automation"
    node registerForAutomation.js |& tee -a ./api-logs/abc-bank-api.log

    echo "Starting api"
    node MortgageAPIBankAutomation.js |& tee -a ./api-logs/abc-bank-api.log
fi