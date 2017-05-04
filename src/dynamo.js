const aws = require('aws-sdk');
aws.config.update({
    region: 'us-west-2'
});
const https = require('https');
const dynamoService = new aws.DynamoDB(dynamoConfig = {
    httpOptions: {
        agent: new https.Agent({
            ciphers: 'ALL',
            secureProtocol: 'TLSv1_method'
        })
    }
});
const dynamo = new aws.DynamoDB.DocumentClient({ service: dynamoService });

function scanTable(TableName) {
    return new Promise((resolve, reject) => {
        dynamo.scan({ TableName }, (err, data) => {
            if (err) {
                console.error(`Failed scanning ${TableName} Table with error: ${err.message}`);
                reject(err);
            }
            else {
                console.log(`Scanned table ${TableName} succesfully`);
                resolve(data.Items);
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

function putPatient(obj) {
    if (obj.skip.putPatient) {
        return Promise.resolve(obj);
    }
    return put("patients", obj);
}

function putEntry(obj) {
    if (obj.skip.putEntry) {
        return Promise.resolve(obj);
    }
    return put("enteries", obj);
}

function put(table, obj) {
    let params = {
        TableName: table,
        Item: obj.itemToPut
    };
    return new Promise((resolve, reject) => {
        dynamo.get(params, (err, data) => {
            if (err) {
                console.error("Failed putting to " + table + " with error: ", err.message);
                reject(err);
            }
            else {
                console.log("Successfuly put data");
                resolve(obj);
            }
        });
    });
}

module.exports = {
    getPatientByFBId,
    getCurrentEntry,
    Qs: scanTable('questions')
};
