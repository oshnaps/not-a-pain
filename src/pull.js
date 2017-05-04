///// pull.js /////
const db = require('./dynamo');
const merge = require('deepmerge');

let questions = [
	{
		label: "0",
		q: "{{IS_NOT_FIRST_TIME}} Did you remember to take {{MEDS}}?",
		a: [
			{
				value: "Took it",
				payload: {
					value: null,
					goto: 1
				}
			}, {
				value: "Snooze",
				payload: {
					value: "Trying again...",
					goto: 0
				}
			}
		] 
	},
	{
		label: "1",
		q: "Good! do you feel pain right now?",
		a: [
			{
				value: "Yes",
				payload: {
					value: null,
					goto: 2
				}
			}, {
				value: "No",
				payload: {
					value: {
						user: {
							pain_level: 0
						}
					},
					goto: 5
				}
			}
		] 
	},
	{
		label: "2",
		q: "Still in {{MAIN_AREA}}?",
		a: [
			{
				value: "Yes",
				payload: {
					value: null,
					goto: 4
				}
			}, {
				value: "No",
				payload: {
					value: null,
					goto: 3
				}
			}
		] 
	},
	{
		label: "3",
		q: "Where, than?",
		a: [null] // body areas
	},
	{
		label: "4",
		q: "How painful is it?",
		a: [
			{
				value: "A Lot",
				payload: {
					value: {
						user: {
							pain_level: 1
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 2
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 3
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 4
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 5
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 6
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 7
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 8
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: null,
				payload: {
					value: {
						user: {
							pain_level: 9
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "Not at all",
				payload: {
					value: {
						user: {
							pain_level: 10
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}
		] 
	},
	{
		label: "5",
		q: "{{CHANGE_IN_PAIN}} How do you generally feel?",
		a: [null] // feelings 
	},
	{
		label: "6",
		q: "{{FEELING_HERE}} When did you take {{MEDS}}?",
		a: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "didn't take"] // times 
	},
	{
		label: "7",
		q: "And when did you take {{SOS_MEDS}}?",
		a: ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "didn't take"] // times 
	},
	{
		label: "8",
		q: "What were you doing in the last several hours?",
		a: [null] // activities 
	},
	{
		label: "9",
		q: "Can you please take a picture of the painful area?",
		a: [null] // activities 
	}
];

function handle(event) {
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
	return ("parseA" + data.currentQ).call(null, data);
}

function parseA0(data) {
	let entry = {
		id: 0,
		datetime: ,
		pain_level: 5,
		pain_area: null,
		log: {"a1": null},
		image_url: null,
		mood: null,
		medications: [
			name: null,
			time: null
		],
		activity: null
	}

	return Promise.resolve(data);
}

function parseA1(data) {
	let answer = data.event.postback && data.event.postback.payload;
	let entry = {};
	let patient = {};
	if (!answer) {
		console.error("Handle this situation!!!");
	}
	else {
		data.newEntry = merge.all(data.current, entry);
		data.newPatient = merge.all(data.patient, patient);
		data.nextQ = answer.goto || questions[1].goto || data.currentQ + 1;
	}
	return Promise.resolve(data);
}


module.exports = {handle: handle};