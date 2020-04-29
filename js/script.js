var config = {
    apiKey: "AIzaSyAi2YNagT8DE8BusrJg4vDj91tyAlz4TrI",
    authDomain: "seminar-8448e.firebaseapp.com",
    databaseURL: "https://seminar-8448e.firebaseio.com",
    projectId: "seminar-8448e",
    storageBucket: "",
    messagingSenderId: "915525042957"
};
firebase.initializeApp(config);

var database = firebase.database().ref();
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");
var yourId = Math.floor(Math.random() * 1000000000);
var servers = {
    'iceServers': [
    // {
    //     'urls': 'stun:stun.services.mozilla.com'
    // }, {
    //     'urls': 'stun:stun.l.google.com:19302'
    // }, 
    {
        'urls': 'turn:115.79.141.160:3478',
        'credentials': '123',
        'credential': '123',
        'username': 'hung'
    }]
};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate ? sendMessage(yourId, JSON.stringify({
    'ice': event.candidate
})) : console.log("Sent All Ice"));
pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
  var msg = database.push({
    sender: senderId,
    message: data
  });
  msg.remove();
}

function readMessage(data) {
  var msg = JSON.parse(data.val().message);
  var sender = data.val().sender;
  if (sender === yourId) {
    return;
  }
  if (msg.ice != undefined) {
      pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      return;
  }
  if (msg.sdp.type == "offer") {
    var r = confirm("Answer call?");
    if (r !== true) {
      alert("Rejected the call");
    }
    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
      .then(() => pc.createAnswer())
      .then(answer => pc.setLocalDescription(answer))
      .then(() => sendMessage(yourId, JSON.stringify({
          'sdp': pc.localDescription
      })));
    return;
  }
  if (msg.sdp.type == "answer") {
    pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
  }
};

database.on('child_added', readMessage);

function showMyFace() {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
  .then(stream => yourVideo.srcObject = stream)
  .then(stream => pc.addStream(stream));
}

function showFriendsFace() {
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer))
    .then(() => sendMessage(yourId, JSON.stringify({
        'sdp': pc.localDescription
    })));
}