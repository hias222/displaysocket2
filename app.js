const express = require("express");
var cors = require('cors');
const http = require("http");
const socketIo = require("socket.io");

require('dotenv').config();

const mqttConfig = require("./connect/mqttSettings");
const connectFactory = require("./connect/connectFactory");

const port = process.env.PORT || 4002;
const host = process.env.HOST || 'localhost';
const frontendurl = process.env.FRONTENDURL || 'http://localhost:3000';
const index = require("./routes/index");
const topic_name = process.env.CHANNEL_DATA || "mainchannel"
const today = new Date();

const dstMqttMode = process.env.SRC_MQTT_MODE || "MQTT"
const debug = process.env.MQTT_DEBUG === 'true' ? true : false;

const staticbasemessage = today.getDate() + "." + today.getMonth() + "." + today.getFullYear() + " \\n \
                          Live Timing\\n \
                          \\n \
                          "
var lanemessages = []

var headermessage = {
  type: 'header',
  competition: 'not defined',
  distance: '50',
  swimstyle: 'FREE',
  event: '0',
  heat: '0'
};

var start = { type: 'start' };
var laststart = Date.now();
var timestart = Date.now();
var running = false;

var client = connectFactory.createConnect(dstMqttMode, mqttConfig.mqttDestination, mqttConfig.mqttSettings);

const app = express();

app.use(index);
app.use(cors());
app.options('*', cors()); //preflight

const server = http.createServer(app);
const io = socketIo(server, { 
  path: '/ws/socket.io',
  cors: {
    origin: frontendurl,
    methods: ["GET", "POST"]
  }
}); // < Interesting!

// I dont know it !!!
//io.origins('*:*') // for latest version

if (debug) console.log('<app> Source MQQT Topic:                    ' + topic_name)
if (debug) console.log('<app> Websockets on /ws/socket.io on port:  ' + port)
if (debug) console.log('<app> check io.origins on connection issues ')

io.on("connection", socket => {
  sendBaseData(socket)
  socket.on("disconnect", () => console.log("websocket backend Client disconnected"));
  socket.on("error", (error) => {
    console.log(error)
  })
  socket.on("connect_error", (error) => {
    console.log(error)
  })
});

server.listen(port,host, () => console.log(`<app> websocket backend Listening on port ${port}`));

client.on('connect', function () {
  console.log("<app> websocket backend connected");
  client.subscribe(topic_name);
});

client.on('error', function () {
  console.log("<app> websocket backend error");
  client.subscribe(topic_name);
});

function checkMQTT() {
  if (!client.connected) {
    console.log("<app> failure MQTT")
  }
}

setInterval(checkMQTT, 1000);

//client.disconnected

client.on('message', function (topic, message) {
  //console.log('websocket backend', topic, message.toString());
  storeBaseData(message)
  try {
    io.sockets.emit("FromAPI", message.toString());
    // console.log("websocket backend send " + message.toString())
    // console.log("send heat ")
  } catch (error) {
    console.error(`<app> websocket backend Error emit : ${error.code}`);
    console.error(error);
  }
});

function storeBaseData(message) {
  try {
    var jsonmessage = JSON.parse(message)
    console.log('Store Type: ' + jsonmessage.type)
    if (jsonmessage.type == "header") {
      headermessage = jsonmessage
      if (start.type === 'clock' || start.type === 'message') {
        console.log("<app> --> reset " + start.type)
        var recallmessage = "{\"type\":\"race\"}"
        start = JSON.parse(recallmessage)
      }
    }

    if (jsonmessage.type == "race") {
      start = jsonmessage
    }

    if (jsonmessage.type == "startlist") {
      start = jsonmessage
    }

    if (jsonmessage.type == "start") {
      laststart = Date.now()
      start = jsonmessage
    }

    if (jsonmessage.type == "stop") {
      // we send it to datahub
      running = false
      start = jsonmessage
    }

    if (jsonmessage.type == "clock") {
      timestart = Date.now()
      start = jsonmessage
    }

    if (jsonmessage.type == "message") {
      timestart = Date.now()
      start = jsonmessage
    }

    if (jsonmessage.type == "clear") {
      console.log("clear lanes")
      lanemessages = []
    }

    if (jsonmessage.type == "result") {
      start = jsonmessage
    }

    if (jsonmessage.type == "lane") {
      running = true
      var lanenumber = (jsonmessage.lane - 1)
      var number_of_elements_to_remove = 1
      lanemessages.splice(lanenumber, number_of_elements_to_remove, jsonmessage);
    }
  } catch (err) {
    console.log("<app.js> error")
    console.log(err)
  }
}

async function sendBaseData(socket) {
  // we need io.sockets.socket();
  try {

    if (headermessage.event === "0") {
      var basemessage = {
        type: 'message',
        value: staticbasemessage,
      }
      var timediff = Date.now() - timestart;
      var newtime = Math.floor((timestart + timediff) / 1000);
      var jsondiff = "{\"time\":\"" + newtime + "\" }"

      var newmessage = { ...basemessage, ...JSON.parse(jsondiff) }
      socket.emit("FromAPI", JSON.stringify(newmessage));
      return;
    } else {

      socket.emit("FromAPI", JSON.stringify(headermessage));

      if (start.type === "message" || start.type === "clock") {
        var timediff = Date.now() - timestart;
        var newtime = Math.floor((timestart + timediff) / 1000);
        var jsondiff = "{\"time\":\"" + newtime + "\" }"
        var newmessage = { ...start, ...JSON.parse(jsondiff) }
        socket.emit("FromAPI", JSON.stringify(newmessage));
      } else {
        var timediff = Date.now() - laststart;
        var jsondiff = "{\"diff\":\"" + timediff + "\" }"
        var newmessage = { ...start, ...JSON.parse(jsondiff) }
        socket.emit("FromAPI", JSON.stringify(newmessage))
        if (running) {
          var racemessage = "{\"type\":\"race\"}"
          var sendracemessage = JSON.parse(racemessage)
          socket.emit("FromAPI", JSON.stringify(sendracemessage))
          console.log("send race maybe " + timediff)
        }
      }

      for (let lane of lanemessages) {
        socket.emit("FromAPI", JSON.stringify(lane));
      }

    }
    //console.log("FromAPI " + JSON.stringify(newmessage))
  } catch (error) {
    console.error(`websocket backend Error emit : ${error.code}`);
    console.error(error);
  }

}