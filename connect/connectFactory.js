const MQTT = require('mqtt');
const AWS = require('aws-iot-device-sdk/device')
const SQS = require('./sqsConnect')

var debug = process.env.MQTT_DEBUG === 'true' ? true : false;

/*
node node_modules/aws-iot-device-sdk/examples/device-example.js 
--host-name=a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com 
--private-key=colorado.private.key 
--client-certificate=colorado.cert.pem 
--ca-certificate=root-CA.crt 
--client-id=sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21
*/

const connect = { MQTT, AWS, SQS };

module.exports = {
    createConnect(type, mqttdestination, settings) {
        const ConnectType = connect[type];
        //Mqtt.connect(attributes)
        if (debug) console.log('<receiver> connectFactory')
        if (debug) console.log(mqttdestination)
        if (debug) console.log(settings)
        if (type === 'AWS') {
            const AWSDevice = ConnectType({
                host: 'a101aihtfyydn6-ats.iot.eu-central-1.amazonaws.com',
                keyPath: 'aws/colorado.private.key',
                certPath: 'aws/colorado.cert.pem',
                caPath: 'aws/root-CA.crt',
                clientId: 'sdk-nodejs-d9122ba1-c0df-4470-a82f-6cd8b7c04e21'
                /*
                keyPath: args.privateKey,
                certPath: args.clientCert,
                caPath: args.caCert,
                clientId: args.clientId,
                region: args.region,
                baseReconnectTimeMs: args.baseReconnectTimeMs,
                keepalive: args.keepAlive,
                protocol: args.Protocol,
                port: args.Port,
                host: args.Host,
                debug: args.Debug
                */
            });
            return AWSDevice
        } else {
            return ConnectType.connect(mqttdestination, settings)
        }

    }
};