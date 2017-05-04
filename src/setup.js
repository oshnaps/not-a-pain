///// setup.js /////
const db = require('./dynamo');
const utils = require('./utils');
let Qs = undefined;
db.Qs.then(items => {
    Qs  = items.filter(item => item.id === 'setup')[0];
});

function handle(data) {
    return getConversationData(data)
        .then(whichQ)
        .then(parseAnswer)
        .then(db.putPatiant)
        .then(sendOutput)
        .then(cleanup);
}

function whichQ(data) {
    if (!data.FBPatientId) {
        data.next = utils.getQuestionByLabel(Qs, 'where');
        data.skip.putPatiant = true;
    }
    data.next = getNextQuestion(data.convData.currentQ);
    return data;
}

function getNextQuestion(state) {

}

function getConversationData(data) {
    data.convData = global.memoryMap[data.FBPatientId];
    return data;
}

function parseAnswer(data) {
    if (!data.FBPatientId) {
        return data;
    }
}

function cleanup(data) {

}

module.exports = {

};
