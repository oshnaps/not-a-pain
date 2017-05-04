function getQuestionByLabel(Qs, label) {
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


function sendTextMessage(recipientId, text) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text
    }
  };

  return callSendAPI(messageData);
}

function sendQuickReply(recipientId, text, replies) {
    let quick_replies = replies.forEach(item => {
        quick_replies.push({
            context_type: 'text',
            title: item.value,
            payload: JSON.stringify(item.payload)
        });
    });
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text,
            quick_replies
        }
    }; 

  return callSendAPI(messageData);
}


function callSendAPI(messageData) {
  return new Promise((resolve, reject) => {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
        method: 'POST',
        json: messageData

      }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var recipientId = body.recipient_id;
          var messageId = body.message_id;
          resolve();
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

