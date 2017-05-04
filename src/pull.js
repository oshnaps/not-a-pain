///// pull.js /////
const db = require('./dynamo');
const merge = require('deepmerge');
const utils = require('./utils');

let Qs = undefined;
db.Qs.then(items => {
    Qs  = items.filter(item => item.id === 'push')[0];
});

function parseA0(data) {
	let entry = {
		id: 0,
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
		activity: null
	}
	data.nextQ = 2;
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
		data.newEntry = merge.all(data.current, entry);
		data.newPatient = merge.all(data.patient, patient);
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
		data.currentQ = 2;
	}
	else {
		data.currentQ = currentEntry.last_question_asked;
	}
	return Promise.resolve(data);
}

function parseAnswer(data) {
	let parseFunc = parsers[data.currentQ];
	return parseFunc(data);
}


function sendOutput(data) {
	let question = Qs[data.nextQ];
	data.next = question;
	return utils.sendQuickReply(data);
}

module.exports = {handle: handle};