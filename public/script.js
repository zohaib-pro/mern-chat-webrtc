const socket = io('/')

const peer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
myVideo.muted = true

const peers = {}


navigator.mediaDevices.getUserMedia({video: true, audio: true})
.then(stream =>{
    addVideoStream(myVideo, stream)

    peer.on('call', call=>{
        console.log('received a call')
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream =>{
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId =>{
        console.log("user conntected2: "+userId)
        setTimeout(connectToNewUser,1000,userId,stream)
        //connectToNewUser(userId, stream)
    })

    socket.on('user-disconnected', userId =>{
        console.log("user disconnected")
        if (peers[userId]){
            peers[userId].close();
        }
    })
    
})

// socket.on('user-connected', userId =>{
//     console.log("user conncted: "+userId);
// })

peer.on('open', id=>{
    socket.emit('join-room', ROOM_ID, id)
})

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', ()=>{
        video.play()
    })

    videoGrid.append(video)
}

function connectToNewUser(userId, stream){
    console.log('connecting to: '+userId)
    const call = peer.call(userId, stream)
    console.log('called: '+call)
    const video = document.createElement('video')
    call.on('stream', userVideoStream=>{
        console.log("started receiving the stream")
        addVideoStream(video, userVideoStream)
    })

    call.on('close', ()=>{
        video.remove()
    })


    peers[userId] = call;
}