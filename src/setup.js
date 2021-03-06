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
    data.postback = data.event.postback;
    return getConversationData(data)
        .then(parseAnswer)
        .then(whichQ)
        .then(send)
        .then(cleanup)
        .catch(e => {
            console.error('don\'t know what happened but I\'m cleaning up');
            console.error(e);
            delete global.memoryMap[data.FBPatientId];
        });
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
    let postback = Hoek.reach(data, 'postback.payload');
    let textPayload = Hoek.reach(data, 'message.quick_reply.payload');
    let attachments = Hoek.reach(data, 'message.attachments');
    if (!Hoek.reach(data, 'conv.currentQ')) {
        return Promise.resolve(data);
    } else if (textPayload) {
        try {
            data.message.payload = JSON.parse(textPayload);
            if (data.message.payload.value) {
                data.conv.patient = deepmerge(data.conv.patient, data.message.payload.value);
            }
        } catch (e) {}
        return Promise.resolve(data);
    } else if (attachments && attachments.length > 0 && attachments[0].type === 'image') {
        // get image info
        data.conv.patient = deepmerge(data.conv.patient, {
            painAreaImage: {
                url: attachments[0].payload.url,
                date: data.event.time
              }
        });
        return Promise.resolve(data);
    } else if (postback) {
        try {
            data.message.payload = JSON.parse(postback);
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
        return utils.sendTextMessage(data);
    } else if (Array.isArray(answers) && answers.length > 0) {
        if (typeof answers[0] === 'object' && answers[0]!== null) {
            // quick replies
            return utils.sendButtonsMessage(data);
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
