import React, { useEffect, useState } from "react";
import { useWS } from "../libs/WebSockets";

interface Message {
  from: string;
  message: string;
  timestamp: string;
}

interface Props {
  room: string;
}

const MessageList: React.FC<Props> = ({ room }) => {
  const { ws } = useWS();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message" && data.room === room) {
        setMessages((prev) => [...prev, data]);
      }

      if (data.type === "history" && data.room === room) {
        setMessages(data.messages);
      }
    };
  }, [ws, room]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`p-2 rounded-lg max-w-xs ${
            msg.from === "anon" ? "bg-blue-600 text-white ml-auto" : "bg-gray-200 text-black"
          }`}
        >
          <p>{msg.message}</p>
          <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
