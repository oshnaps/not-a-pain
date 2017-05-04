const aws = require('aws-sdk');
const dynamoService = new AWS.DynamoDB(dynamoConfig = {
    httpOptions: {
        agent: new https.Agent({
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_method'
        })
    }
});
const dynamo = new AWS.DynamoDB.DocumentClient({ service: dynamoService });

function scanTable(TableName) {
    return new Promise((resolve, reject) => {
        dynamo.scan({ TableName }, (err, data) => {
            if (err) {
                console.error(`Failed scanning ${TableName} Table with error: ${err.message}`);
                reject(err);
            }
            else {
                console.log(`Scanned table ${TableName} succesfully`);
                resolve(data);
            }
        });
    });
}

function getPatientByFBId(obj) {
    let params = {
        TableName: "patients",
        Key: {
            HashKey: obj.FBPatientId
        }
    };
    return new Promise((resolve, reject) => {
        dynamo.get(params, (err, data) => {
            if (err) {
                console.error("Failed getting patient with error: ", err.message);
                reject(err);
            }
            else {
                console.log("Got patient data");
                obj.patient = data.Item;
                resolve(obj);
            }
        });
    });
}

function getCurrentEntry(obj) {
    let params = {
        TableName: "entries",
        Key: {
            HashKey: obj.patient.current_entry
        }
    };
    return new Promise((resolve, reject) => {
        dynamo.get(params, (err, data) => {
            if (err) {
                console.error("Failed getting patient with error: ", err.message);
                reject(err);
            }
            else {
                console.log("Got patient data");
                obj.current = data.Item;
                resolve(obj);
            }
        });
    }); 
}


module.exports = {
    getPatientByFBId,
    getCurrentEntry,
    Qs: scanTable('questions')
}