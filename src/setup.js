///// setup.js /////
const db = require('./dynamo');
const utils = require('./utils');
const Hoek = require('hoek');
const deepmerge = require('deepmerge');

let Qs = undefined;

db.Qs.then(items => {
    Qs = items.filter(item => {
        return item.id === 'setup';
        }
    )[0].questions;
});

function handle(data) {
    data.message = data.event.message;
    return getConversationData(data)
        .then(parseAnswer)
        .then(whichQ)
        .then(send)
        .then(cleanup);
}

function whichQ(data) {
    if (!data.conv.currentQ) {
        data.next = utils.getQuestionByLabel(Qs, 'where');
    } else {
        data.next = getNextQuestion(data.conv.currentQ, data.message);        
    }
    data.conv.currentQ = Hoek.clone(data.next);
    return Promise.resolve(data);
}

function getNextQuestion(prevQ, answer) {
    let label = (answer.payload && answer.payload.goto) || prevQ.goto;
    return utils.getQuestionByLabel(Qs, label);
}

function getConversationData(data) {
    if (!global.memoryMap[data.FBPatientId]) {
        global.memoryMap[data.FBPatientId] = {
            patient: {}
        };
    }
    data.conv = global.memoryMap[data.FBPatientId];
    return Promise.resolve(data);
}

function parseAnswer(data) {
    if (!data.conv.currentQ) {
        return Promise.resolve(data);
    } else if (data.message && data.message.payload) {
        try {
            data.message.payload = JSON.parse(data.message.payload);
            if (data.message.payload.value) {
                data.conv.patient = deepmerge(data.conv.patient, data.message.payload.value);
            }
        } catch (e) {}
        return Promise.resolve(data);
    }
}

function send(data) {
    let answers = data.next.a;
    if (!answers) {
        // free text
    } else if (Array.isArray(answers) && answers.length > 0) {
        if (typeof answers[0] === 'object') {
            // quick replies
            return utils.sendQuickReply(data);
        } else {
            // regular text message
            return utils.sendTextMessage(data);
        }
    } else {
        console.error('I don\'t know what to do!!!!');
    }
}

function cleanup(data) {
    if (!data.next) {
        // this is the last question so insert the objet to the DB
        return db.putPatient.then(() => {
            // and cleanup aferwards
            delete global.memoryMap[data.FBPatientId];
            return Promise.resolve();
        });
    } else {
        return Promise.resolve(data.messageData);
    }
}

module.exports = {
    handle
};
