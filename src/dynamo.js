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

function getPatientByFBId(data) {
    let params = {
        TableName: "patients",
        Key: {
            HashKey: data.FBPatientId
        }
    };
    return new Promise((resolve, reject) => {
        dynamo.get(params, (err, dat) => {
            if (err) {
                console.error("Failed getting patient with error: ", err.message);
                reject(err);
            }
            else {
                console.log("Got patient data");
                data.patient = dat.Item;
                resolve(data);
            }
        });
    });
}

function getCurrentEntry(data) {
    let params = {
        TableName: "entries",
        Key: {
            HashKey: data.patient.current_entry
        }
    };
    return new Promise((resolve, reject) => {
        dynamo.get(params, (err, dat) => {
            if (err) {
                console.error("Failed getting patient with error: ", err.message);
                reject(err);
            }
            else {
                console.log("Got patient data");
                data.current = dat.Item;
                resolve(data);
            }
        });
    }); 
}


module.exports = {
    getPatientByFBId,
    getCurrentEntry
}