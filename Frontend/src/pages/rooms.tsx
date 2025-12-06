import React, { useEffect } from "react";
import MessageInput from "../components/messageInput";
import Indicator from "../components/Indicator";
import { useWS } from "../libs/WebSockets"; 
import MessageList from "../components/messageList";

interface Props {
  room: string;
}

const Room: React.FC<Props> = ({ room }) => {
  const { ws } = useWS();

  useEffect(() => {
    if (!ws) return;

    // Join room
    ws.send(JSON.stringify({ type: "join", room }));
  }, [ws, room]);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <h2 className="text-white text-lg font-bold">{room}</h2>
      </div>

      <MessageList room={room} />
      <Indicator room={room} />
      <MessageInput room={room} />
    </div>
  );
};

export default Room;
