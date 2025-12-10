import React, { useEffect, useState } from "react";
import { useWS } from "../libs/WebSockets";

interface WSMessage {
  type: string;
  from: string;
  message: string;
  room: string;
  timestamp: string;
}

interface MessageListProps {
  room: string;
}

const MessageList: React.FC<MessageListProps> = ({ room }) => {
  const { ws } = useWS();
  const [messages, setMessages] = useState<WSMessage[]>([]);

  useEffect(() => {
    if (!ws) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      if (data.type === "history" && data.room === room) {
        setMessages(data.messages || []);
      }

      if (data.type === "message" && data.room === room) {
        setMessages((prev) => [...prev, data]);
      }
    };

    ws.addEventListener("message", handleMessage);
    return () => {
      ws.removeEventListener("message", handleMessage);
    };
  }, [ws, room]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-[#121214]">
      {messages.map((msg, idx) => {
        const isMe = msg.from === localStorage.getItem("username");
        return (
          <div
            key={idx}
            className={`max-w-[70%] rounded-lg px-3 py-2 text-sm shadow 
              ${isMe ? "ml-auto bg-[#EF3A55] text-white" : "mr-auto bg-[#1F1F22] text-gray-100"}`}
          >
            <p className="font-semibold text-xs text-gray-300 mb-1">
              {msg.from}
            </p>
            <p>{msg.message}</p>
            <p className="text-[10px] text-gray-400 mt-1 text-right">
              {msg.timestamp
                ? new Date(msg.timestamp).toLocaleTimeString()
                : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
