///// setup.js /////
const db = require('./dynamo');
const utils = require('./utils');
const Hoek = require('hoek');
const deepmerge = require('deepmerge');

let Qs = undefined;

db.Qs.then(items => {
    Qs = items.filter(item => item.id === 'setup')[0];
});

function handle(data) {
    data.message = data.event.message;
    return getConversationData(data)
        .then(parseAnswer)
        .then(whichQ)
        .then(sendOutput)
        .then(cleanup);
}

function whichQ(data) {
    if (!data.FBPatientId) {
        data.next = utils.getQuestionByLabel(Qs, 'where');
    }
    data.next = getNextQuestion(data.conv.currentQ, data.message);
    data.conv.currentQ = Hoek.clone(data.next);
    return data;
}

function getNextQuestion(prevQ, answer) {

    let label = payload.goto || prevQ.goto

}

function getConversationData(data) {
    if (!global.memoryMap[data.FBPatientId]) {
        global.memoryMap[data.FBPatientId] = {};
    }
    data.conv = global.memoryMap[data.FBPatientId];
    return data;
}

function parseAnswer(data) {
    if (!data.FBPatientId) {
        return data;
    } else if (data.message) {
        try {
            data.message = JSON.parse(data.message);
        } catch (e) {}
    }
}

function send(data) {
    let answers = data.next.a;
    if (!answers) {
        // free text
    } else if (typeof answers === 'array' && answers.length > 0) {
        if (typeof answers[0] === 'object') {
            // quick replies
            utils.sendQuickReply(data.FBPatientId, data.next.q, data.next.a);
        } else {
            // regular text message
            utils.sendTextMessage(data.FBPatientId, data.next.q);
        }
    } else {
        console.error('I don\'t know what to do!!!!');
    }
}

function cleanup(data) {
    if (!data.next) {
        // this is the last question so insert the objet to the DB
        return db.putPatiant.then(() => {
            // and cleanup aferwards
            delete global.memoryMap[data.FBPatientId];
        });
    }
}

module.exports = {
    handle
};
