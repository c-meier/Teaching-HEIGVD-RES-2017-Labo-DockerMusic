if(process.argv.length <= 2) {
    //console.error("You should specify the instrument that will be used !!!");
    //process.exit(-1);
    process.argv[2] = "flute";
}

const PORT = 12345;
const HOST = "230.185.192.108";
const uuidv1 = require('uuid/v1');
var dgram = require('dgram');

// Choose correct sound for instrument
var instrument = process.argv[2];
var sound;

var instruments = new Map();
instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");

sound = instruments.get(instrument);
if(typeof sound == "undefined") {
    console.error("The specified instrument (" + instrument + ") is not supported");
    process.exit(-2);
}


// UUID creation
console.log("UUID: " + uuidv1());

// UDP client

var messageObj = {"uuid":uuidv1(), "sound":sound};
var message = new Buffer(JSON.stringify(messageObj));

var client = dgram.createSocket('udp4', function () {
    client.setBroadcast(true);
    client.setMulticastTTL(128);
    client.addMembership(HOST);
});

setInterval(function () {
    client.send(message, 0, message.length, PORT, HOST);

    console.log(messageObj);
}, 1000);