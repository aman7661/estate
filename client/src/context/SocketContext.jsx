import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token'); // or wherever you store your JWT
    
    if (token) {
      // Create socket connection with JWT token in auth handshake
      const newSocket = io(`${import.meta.env.VITE_SOCKET_URL}`, {
        auth: {
          token: token
        }
      });

      // Handle connection events
      newSocket.on('connect', () => {
        console.log('✅ Connected to socket server');
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection failed:', error.message);
        if (error.message === 'Authentication error: Invalid token') {
          // Handle expired/invalid token
          localStorage.removeItem('token');
          // Redirect to login or refresh token
        }
      });

      setSocket(newSocket);

      // Cleanup function
      return () => {
        newSocket.close();
      };
    }
  }, [currentUser]); // Re-connect when user changes

  useEffect(() => {
    // Only emit newUser if socket is connected and authenticated
    if (currentUser && socket?.connected) {
      socket.emit("newUser", currentUser.id);
    }
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
