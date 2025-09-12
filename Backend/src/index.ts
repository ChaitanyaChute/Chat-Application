import { WebSocketServer,WebSocket } from "ws";

const wss = new WebSocketServer({port:8080});

interface customWebSocket extends WebSocket{
    username?:string;
}


let userCount = 0 ;
let users:customWebSocket[]= [];




wss.on("connection",(ws)=>{

    const Customws = ws as customWebSocket;


    users.push(ws);
    userCount++;
    console.log("connection established , TotalUsers :"+userCount);

    Customws.username = "anon";

    Customws.on("message",(msg)=>{
        const data = JSON.parse(msg.toString())

        if(data.type == "username"){
            Customws.username = data.username;

            Customws.send("Username set to : " + `${Customws.username}`);
        }

        if(data.type == "join"){
            

            Customws.send("Username set to : " + `${Customws.username}`);
        }

    })
    
    ws.on("close",()=>{
    userCount--;
    users = users.filter( x=> x != ws)
    console.log("connection disconnected , TotalUsers :"+userCount);
})

    
})

