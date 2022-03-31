function getMessageBody(message) {
    firstMessage=message[0]
    var body = firstMessage.Body
    jsonMessage = JSON.parse(body)
    return jsonMessage 
}

module.exports = getMessageBody