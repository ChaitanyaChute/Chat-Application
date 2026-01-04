import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

interface WSContextProps {
  ws: WebSocket | null;
  isAuthed: boolean;
}

const WebSocketContext = createContext<WSContextProps>({
  ws: null,
  isAuthed: false,
});

export const useWS = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const hasSentAuth = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isReconnecting = useRef(false);

  const connectWebSocket = () => {
    if (isReconnecting.current) return;
    
    const socket = new WebSocket("ws://localhost:8080");
    let missedPongs = 0;

    socket.onopen = () => {
      console.log("WS Connected");
      hasSentAuth.current = false;
      missedPongs = 0;

      const token = localStorage.getItem("token");
      if (token && !hasSentAuth.current) {
        socket.send(JSON.stringify({ type: "auth", token }));
        hasSentAuth.current = true;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "auth") {
          if (data.success) {
            console.log("WS Auth success");
            setIsAuthed(true);
            
            
            if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
            
            pingIntervalRef.current = setInterval(() => {
              if (socket.readyState === WebSocket.OPEN) {
                missedPongs++;
                
                
                if (missedPongs >= 2) {
                  console.log("Missed pongs, reconnecting...");
                  socket.close();
                  return;
                }
                
                socket.send(JSON.stringify({ type: "ping" }));
              }
            }, 30000); 
          } else {
            console.log("WS Auth failed");
            setIsAuthed(false);
          }
        }
        
        
        if (isAuthed) {
          missedPongs = 0;
        }
      } catch (err) {
        console.error("WebSocket message error:", err);
      }
    };

    socket.onclose = () => {
      console.log("WS Disconnected");
      setIsAuthed(false);
      
      
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }

      
      const token = localStorage.getItem("token");
      if (token && !isReconnecting.current) {
        console.log("Reconnecting in 3 seconds...");
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connectWebSocket();
        }, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("WS Error:", error);
    };

    setWs(socket);
    return socket;
  };

  useEffect(() => {
    const socket = connectWebSocket();

    return () => {
      isReconnecting.current = true;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
      }
      
      socket?.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ ws, isAuthed }}>
      {children}
    </WebSocketContext.Provider>
  );
};
