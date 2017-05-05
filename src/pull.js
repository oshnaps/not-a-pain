///// pull.js /////
const db = require('./dynamo');
const merge = require('deepmerge');
const utils = require('./utils');

let Qs = undefined;
db.Qs.then(items => {
    Qs  = items.filter(item => item.id === 'push')[0];
});

function parseA0(data) {
	let uid = Date.now() + "";
	let entry = {
		id: uid,
		datetime: data.event.time,
		pain_level: 5,
		pain_area: null,
		log: {"a1": null},
		image_url: null,
		mood: null,
		medications: [ 
			{
				name: null,
				time: null
			}
		],
		activity: null,
		patient_id: data.FBPatientId,
		last_question_asked: 2
	}
	let patient = {current_entry: uid};
	data.nextQ = 2;
	data.itemToPut = {};
	data.itemToPut.entries = data.current ? merge.all([data.current, entry]) : entry;
	data.itemToPut.patients = merge.all([data.patient, patient]);
	return Promise.resolve(data);
}

function parseA1(data) {
	let answer = data.event.message && JSON.parse(data.event.message.payload);
	let entry = {};
	let patient = {};
	if (!answer) {
		console.error("Handle this situation!!!");
	}
	else {
		data.itemToPut = {};
		data.itemToPut.entries = merge.all([data.current, entry]);
		data.itemToPut.patients = merge.all([data.patient, patient]);
		data.nextQ = answer.goto || Qs[1].goto || data.currentQ + 1;
	}
	return Promise.resolve(data);
}

let parsers = [parseA0, parseA1];

function handle(data) {
	return db.getCurrentEntry(data)
		.then(whichQ)
		.then(parseAnswer)
		.then(db.putPatient)
		.then(db.putEntry)
		.then(sendOutput);
}

function whichQ(data) {
	// remember to clean this up in the end(?)
	let currentEntry = data.current;
	if (!currentEntry) {
		data.currentQ = -1;
	}
	else {
		data.currentQ = currentEntry.last_question_asked;
	}
	return Promise.resolve(data);
}

function parseAnswer(data) {
	let parseFunc = parsers[data.currentQ + 1];
	return parseFunc(data);
}

function sendOutput(data) {
	let question = Qs.questions[data.nextQ];
	data.next = question;
	return utils.sendQuickReply(data);
}

module.exports = {handle: handle};