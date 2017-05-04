///// pull.js /////
const db = require('./dynamo');

let questions = [
	{
		label: "0",
		q: "{{IS_NOT_FIRST_TIME}} Did you remember to take {{MEDS}}?",
		a: [
			{
				value: "Took it",
				payload: {
					value: "",
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
					value: "",
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
					value: "",
					goto: 4
				}
			}, {
				value: "No",
				payload: {
					value: "",
					goto: 3
				}
			}
		] 
	},
	{
		label: "3",
		q: "Where, than?",
		a: [""] // body areas
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
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 2
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 3
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 4
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 5
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 6
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 7
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
				payload: {
					value: {
						user: {
							pain_level: 8
						}
					},
        			image_url: "http://petersfantastichats.com/img/red.png"
				}
			}, {
				value: "",
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
		a: [""] // feelings 
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
		a: [""] // activities 
	},
	{
		label: "9",
		q: "Can you please take a picture of the painful area?",
		a: [""] // activities 
	}
];

function handle(event) {
	data.event = event;
	data.FBPatientId = event.sender.id;
	return db.getPatientByFBId(data)
		.then(db.getCurrentEntry)
		.then(whichQ)
		.then(parseAnswer)
		.then(db.put)
		.then(sendOutput);
}

function whichQ(data) {
	let currentEntry = data.current;
}


module.exports = {handle: handle};