const UDP_PORT = 12345;
const UDP_MULTICAST = "230.185.192.108";

const TCP_PORT = 2205;

// package
var dgram = require('dgram');
var net = require('net');
var moment = require('moment')

// Choose correct instrument for sound
var instruments = new Map();
instruments.set("ti-ta-ti", "piano");
instruments.set("pouet", "trumpet");
instruments.set("trulu", "flute");
instruments.set("gzi-gzi", "violin");
instruments.set("boum-boum", "drum");

// Musician data
var musician = new Map();

function deleteOldMusician(uuid) {
    musician.delete(uuid);
}

// UDP server
var udpServer = dgram.createSocket('udp4');


udpServer.on('error', function(err) {
    console.error("Server error: " + err.stack);
    server.close();
});

udpServer.on('message', function(msg, rinfo) {
    var now = moment();

    var o = JSON.parse(msg);
    var m = musician.get(o.uuid);

    if(typeof m != "undefined") {
        clearTimeout(m.timeout);
        m.lastActive = now;
        m.timeout = setTimeout(deleteOldMusician, 5000, o.uuid);
    } else {
        musician.set(o.uuid, {
            "instrument" : instruments.get(o.sound),
            "activeSince" : now,
            "lastActive" : now,
            "timeout" : setTimeout(deleteOldMusician, 5000, o.uuid)
        });
    }
});

udpServer.on('listening', function () {
   console.log("Server now listening for musician.");
});

udpServer.bind(UDP_PORT, function () {
    udpServer.setBroadcast(true);
    udpServer.setMulticastTTL(128);
    udpServer.addMembership(UDP_MULTICAST);
});


// TCP server
var tcpServer = net.createServer(function (socket) {
    var content = [];
    musician.forEach(function (val, key, map){
       content.push({
           "uuid": key,
           "instrument": val.instrument,
           "activeSince": val.activeSince.format()
       });
    });
    socket.write(JSON.stringify(content) + "\r\n");

    socket.end();
});

tcpServer.listen(TCP_PORT);

console.log("Hello auditor!");