import React, { createContext, useContext, useEffect, useState } from "react";

interface WSContextProps {
  ws: WebSocket | null;
}

const WebSocketContext = createContext<WSContextProps>({ ws: null });

export const useWS = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket connected");
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(socket);

    return () => socket.close();
  }, []);

  return <WebSocketContext.Provider value={{ ws }}>{children}</WebSocketContext.Provider>;
};
