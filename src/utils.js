const request = require('request');

function getQuestionByLabel({ Qs, label}) {
    let arr = Qs.filter(q => q.label === label);
    if (arr.length > 1) {
        console.error('found more than one matching question');
        return null;
    } else if (arr.length < 1) {
        console.error('no matching question found');
        return null;
    } else {
        return arr[0];
    }
}

function sendTextMessage(data) {
    let { patientId, next, localhost } = data;
    data.messageData = {
        recipient: {
            id: patientId
        },
        message: {
            text: next.q
        }
    };

    return localhost ? data : callSendAPI(data);
}

function sendQuickReply(data) {
    let { patientId, next, localhost } = data;
    let quick_replies = [];
    next.a.forEach(item => {
        quick_replies.push({
            context_type: 'text',
            title: item.value,
            payload: JSON.stringify(item.payload)
        });
    });
    data.messageData = {
        recipient: {
            id: patientId
        },
        message: {
            text: next.q,
            quick_replies
        }
    }; 

  return localhost ? data : callSendAPI(data);
}


function callSendAPI(data) {
  return new Promise((resolve, reject) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: data.messageData

      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;
          resolve(data);
          console.log("Successfully sent generic message with id %s to recipient %s", 
            messageId, recipientId);
        } else {
          console.error("Unable to send message.");
          console.error(response);
          console.error(error);
          reject();
        }
      });
    });
}

module.exports = {
    getQuestionByLabel,
    sendTextMessage,
    sendQuickReply
}

