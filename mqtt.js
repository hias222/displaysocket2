var mqtt = require('mqtt');

var settings = {
  keepalive: 1000
}

var mqtt = require('mqtt');
var client = mqtt.connect(settings);

client.on('connect', function () {
  client.subscribe('presence');
  client.publish('presence', 'Hello mqtt');
});

client.on('message', function (topic, message) {
  console.log('websocket backend', topic, message.toString());
});