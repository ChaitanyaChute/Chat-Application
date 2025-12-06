import React, { useState } from "react";
import { useWS } from "../libs/WebSockets";

interface Props {
  room: string;
}

const MessageInput: React.FC<Props> = ({ room }) => {
  const { ws } = useWS();
  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!ws || !text.trim()) return;

    ws.send(JSON.stringify({ type: "chat", message: text, room }));
    setText("");
  };

  return (
    <div className="flex p-4 gap-2 border-t border-gray-700 bg-gray-800">
      <input
        type="text"
        className="flex-1 rounded-lg px-4 py-2 outline-none text-white bg-gray-900 border border-gray-700"
        placeholder="Type a message..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button
        onClick={sendMessage}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;
