const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer()
const myVideo = document.createElement('video')
myVideo.muted = true
var myStream;
const peers = {}
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream)
  myStream = stream
  myPeer.on('call', function(call) {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  socket.on('new-user-joined', function(userId) {
    connectToNewUser(userId, stream)
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

myPeer.on('open', function(id) {
  socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
    video.remove()
  })

  peers[userId] = call
}

function addVideoStream(video, stream) {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  videoGrid.append(video)
}


let text = $("input");
// when press enter send message
$('html').keydown(function(e) {
  if (e.which == 13 && text.val().length !== 0) {
    socket.emit('message', text.val());
    text.val('')
  }
});
socket.on("createMsg", message => {
  $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`)
  $('.div_chat_window').scrollTop($('.div_chat_window').prop("scrollHeight"))
  console.log("from server", message);
})

function playStop() {
  const playing = myStream.getVideoTracks()[0].enabled
  if (!playing) {
    myStream.getVideoTracks()[0].enabled = true
    const html = `<i class="fas fa-video"></i><span>Stop Video</span>`
    document.querySelector('.video_button').innerHTML = html;
  } else {
    const html = `<i class="stopVideo fas fa-video-slash"></i><span>Play Video</span>`
    document.querySelector('.video_button').innerHTML = html;
    myStream.getVideoTracks()[0].enabled = false
  }
}

function unmuteMute() {
  const unmute = myStream.getAudioTracks()[0].enabled
  if (!unmute) {
    myStream.getAudioTracks()[0].enabled = true
    const html = `<i class="fas fa-microphone-alt"></i><span>Mute</span>`
    document.querySelector('.mute_button').innerHTML = html;
  } else {
    const html = `<i class="unmute fas fa-microphone-alt-slash"></i><span>Unmute</span>`
    document.querySelector('.mute_button').innerHTML = html;
    myStream.getAudioTracks()[0].enabled = false
  }
}
