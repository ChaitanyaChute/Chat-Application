import React, { useEffect, useState } from "react";
import { useWS } from "../libs/WebSockets"; 

interface Props {
  room: string;
}

const Indicator: React.FC<Props> = ({ room }) => {
  const { ws } = useWS();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    if (!ws) return;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "typing" && data.room === room) {
        setTypingUsers(data.users);
      }
    };
  }, [ws, room]);

  if (!typingUsers.length) return null;

  return (
    <div className="px-4 py-2 text-sm text-gray-400">
      {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
    </div>
  );
};

export default Indicator;
