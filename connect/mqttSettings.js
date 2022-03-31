require('dotenv').config()

//var mqttpath = '/wsmqtt'

var mqtthost = typeof process.env.MQTT_URL !== "undefined" ? process.env.MQTT_URL : 'mqtt://localhost';
var mqtt_username_local = typeof process.env.MQTT_USERNAME_LOCAL !== "undefined" ? process.env.MQTT_USERNAME_LOCAL : 'mqtt';
var mqtt_password_local = typeof process.env.MQTT_PASSWORD_LOCAL !== "undefined" ? process.env.MQTT_PASSWORD_LOCAL : 'mqtt';
var debug = process.env.MQTT_DEBUG === 'true' ? true : false; 
var dstMqttMode = process.env.SRC_MQTT_MODE || "MQTT"
var srcMqttTopic = process.env.CHANNEL_DATA || "mainchannel"
var queueURL = process.env.QUEUE_URL + '/' + srcMqttTopic  || "https://sqs.eu-central-1.amazonaws.com/654384432543" + '/' + srcMqttTopic;

var settings = {
    keepalive: 2000,
    username: mqtt_username_local,
    password: mqtt_password_local,
    clientId: 'display_' + Math.random().toString(16).substr(2, 8)
}

mqttDestination = mqtthost
mqttSettings = settings

if (dstMqttMode === 'SQS'){
    mqttDestination = 'AWS'
    var AWSsettings = {
        AttributeNames: [
          "SentTimestamp"
        ],
        MaxNumberOfMessages: 1,
        MessageAttributeNames: [
          "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 20
      };

    mqttSettings = AWSsettings
}

console.log('<mqttSettings>  Destination ' + mqttDestination);
if (debug) console.log(mqttSettings)

module.exports = {
    mqttSettings,
    mqttDestination
}
