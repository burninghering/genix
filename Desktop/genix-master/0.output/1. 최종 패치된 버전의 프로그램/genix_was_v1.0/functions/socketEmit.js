const BroadcastMSG = (io, topic, msg) => {
    io.emit(topic, msg);
}

const SendClientMSG = (socket,topic,msg)=>{
    //console.log(topic,' msg : ' , msg);
    socket.emit(topic,msg);
}
module.exports={BroadcastMSG,SendClientMSG};