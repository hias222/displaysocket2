# displaysocket

creats websocket connections for frontend

## install

* npm install
* start mqtt sserver

## Start

### MQTT Version 2 out of docker

```bash
docker pull eclipse-mosquitto:2 

# use hostname -> put in hostname in mosquitto.conf
# USer homes for volumes on MAc not working

docker run -d -p 1883:1883 -p 9001:9001 --name mqtt --hostname mqtt --rm -v /tmp/mosquitto:/mosquitto/config eclipse-mosquitto:2

docker run -p 1883:1883 -p 9001:9001 --name mqtt --hostname mqtt --rm -v /tmp/mosquitto:/mosquitto/config eclipse-mosquitto:2
docker run -p 1883:1883 -p 9001:9001 -v $(pwd)/mosquitto.conf:/mosqtto/config/mosquitto.conf eclipse-mosquitto:2

/usr/local/opt/mosquitto/sbin/mosquitto -c /Users/MFU/tmp/mosquitto.conf

# -v mosquitto.conf:/mosquitto/config/mosquitto.conf

```

### Security 

#### Create a new user named user_name, enter password interactively

docker exec -it mosquitto mosquitto_passwd /mosquitto/config/passwd user_name

### App

```bash
npm i
node app.js
```

## Docker

```bash
# start local docker

# docker build -t <your username>/node-web-app . 
docker build -t displaysocket .

docker network create mqttnet

docker run --name=mqtt --rm --network=mqttnet eclipse-mosquitto
docker run -d --name=mqtt --rm --network=mqttnet eclipse-mosquitto

DEST_MQTT_HOST
docker run --name=socket -p 4001:4001 --network=mqttnet --rm -e MQTT_URL=mqtt://mqtt displaysocket
docker run -d --name=socket -p 4001:4001 --network=mqttnet --rm -e MQTT_URL=mqtt://mqtt displaysocket

docker run -p 1883:1883 -p 9001:9001 --name mqtt --network=mqttnet --rm -v mosquitto:/mosquitto/config eclipse-mosquitto:2

docker images
```

### AWS

```bash
#AWS_ACCESS_KEY_ID
# AWS_SECRET_ACCESS_KEY
docker run --name=socket -p 4001:4001 --rm -e SRC_MQTT_MODE=SQS -e AWS_ACCESS_KEY_ID=123 -e AWS_SECRET_ACCESS_KEY=123 displaysocket
```

## Docker hub

```bash

docker build -t displaysocket .

docker login

docker tag displaysocket hias222/displaysocket:0.1.0
docker push hias222/displaysocket:0.1.0

```
