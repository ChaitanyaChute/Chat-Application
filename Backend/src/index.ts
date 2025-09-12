import { WebSocketServer,WebSocket } from "ws";

const wss = new WebSocketServer({port:8080});

interface customWebSocket extends WebSocket{
    username?:string;
    currentRoom?:string | null ;

}


let userCount = 0 ;
let users:customWebSocket[]= [];
const rooms = new Map();




wss.on("connection",(ws)=>{

    const Customws = ws as customWebSocket;


    users.push(ws);
    userCount++;
    console.log("connection established , TotalUsers :"+userCount);

    Customws.username = "anon";
    Customws.currentRoom = null;

    Customws.on("message",(msg)=>{
        const data = JSON.parse(msg.toString())

        if(data.type == "username"){
            Customws.username = data.username || "anon";
            
            const outputData = JSON.stringify({
                "type":data.type,
                "payload":{
                    "username":data.username 
                }
            })

            Customws.send(outputData)
        }

        if(data.type == "join"){
            const room = data.room;

            if(!rooms.has(room)){
                rooms.set(room , new Set())
            }

            Customws.currentRoom = room ;

            rooms.get(room).add(ws);


            
            const outputData = JSON.stringify(
                {
                    "type": data.type,
                    "payload": {
                        "roomId":data.room,
                    }
                }
            )
            
            Customws.send(outputData);
        }

        if(data.type == "chat"){
            const message = data.message;
            
            const outputData = JSON.stringify(
                {
                    "type": data.type,
                    "payload": {
                        "message":data.message
                    }
                }
            )
            
            Customws.send(outputData);
        }

    })
    
    ws.on("close",()=>{
    userCount--;
    users = users.filter( x=> x != ws)
    console.log("connection disconnected , TotalUsers :"+userCount);
})

    
})

