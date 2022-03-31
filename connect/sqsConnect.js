// Load the AWS SDK for Node.jss
var AWS = require('aws-sdk');
// Set the region
// export
// AWS_ACCESS_KEY_ID
// AWS_SECRET_ACCESS_KEY

AWS.config.update({
  region: 'eu-central-1'
});

console.log(AWS.config)

var debug = process.env.MQTT_DEBUG === 'true' ? true : false;

const EventEmitter = require('events');

const SQSMessageHandler = require('./utils/sqsmessqges')

// Create an SQS service object
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
class SQSEmitter extends EventEmitter {
  constructor() {
    super();

    this.params = {}


    this.waittime = 100;

    this.SQSconnected = false;
    this.sendMessage = this.sendMessage.bind(this);
    this.getSQSMessage = this.getSQSMessage.bind(this);
    this.getSQSMessages = this.getSQSMessages.bind(this);
  }

  connect(destination, settings) {
    let _this = this;
    this.params = settings
    console.log('<sqsConnect> connect ' + settings.QueueUrl)
    setTimeout(() => {
      // wait short to get the event
      _this.emit('connect', 'start');
    }, 500);
    return this
  }

  subscribe() {
    setTimeout(() => {
      // wait short to get the event
      this.getSQSMessages()
    }, this.waittime);
    console.log('<sqsConnect> start subscribe')
  }

  connected() {
    return this.SQSconnected
  }

  sendMessage(message) {
    this.emit('message', 'SQS', JSON.stringify(message));
  }

  async getSQSMessages() {
    var running = true
    this.SQSconnected = true
    while (running) {
      await this.getSQSMessage()
        .then((data) => {
          if (debug) console.log('<sqsConnect> ' + data)
          running = true
        })
        .catch((err) => {
          console.log('<sqsConnect> ' + err)
          running = false
        });
    }
    console.log('<sqsConnect> end getSESmessages')
    this.SQSconnected = false
    this.waittime = 5000
    this.emit('error', 'SQS not connected');
  }

  async getSQSMessage() {
    // resolve('resolved');
    // await timer(1000)
    return new Promise((resolve, reject) => {
      var self = this;
      sqs.receiveMessage(this.params, function (err, data) {
        if (err) {
          self.SQSconnected = false
          reject(err);
        } else if (data.Messages) {
          self.SQSconnected = true
          var newMessage = SQSMessageHandler(data.Messages)
          self.sendMessage(newMessage)
          var deleteParams = {
            QueueUrl: self.params.QueueUrl,
            ReceiptHandle: data.Messages[0].ReceiptHandle
          };
          sqs.deleteMessage(deleteParams, function (err, data) {
            if (err) {
              console.log("Delete Error", err);
            }
          });
          resolve('new message');
        } else {
          resolve('no data');
        }
      });
    });
  }

}

const myEmitter = new SQSEmitter();

module.exports = myEmitter