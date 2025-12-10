import React, { useState, useEffect, useRef } from "react";
import { useWS } from "../libs/WebSockets";
interface MessageInputProps {
  room: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ room }) => {
  const { ws } = useWS();
  const [text, setText] = useState("");
  const typingTimeout = useRef<number | null>(null);

  const sendMessage = () => {
    if (!ws || !text.trim()) return;

    ws.send(
      JSON.stringify({
        type: "chat",
        message: text,
      })
    );
    setText("");

    ws.send(
      JSON.stringify({
        type: "typing",
        room,
        status: false,
      })
    );
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (!ws) return;

    ws.send(JSON.stringify({ type: "typing", room, status: true }));

    if (typingTimeout.current) {
      window.clearTimeout(typingTimeout.current);
    }
    typingTimeout.current = window.setTimeout(() => {
      ws?.send(JSON.stringify({ type: "typing", room, status: false }));
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (typingTimeout.current) {
        window.clearTimeout(typingTimeout.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A1C] border-t border-[#2a2a2b]">
      <input
        type="text"
        className="flex-1 bg-[#0F0F10] text-white text-sm px-4 py-2 rounded-full border border-[#2a2a2b] outline-none"
        placeholder="Type your message..."
        value={text}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="px-4 py-2 rounded-full bg-[#EF3A55] hover:bg-[#d72d48] text-white text-sm font-semibold"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
