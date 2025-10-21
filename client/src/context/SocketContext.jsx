import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Check if socket URL is available
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    
    if (!socketUrl) {
      console.log('No socket URL configured, skipping socket connection');
      return;
    }

    // Get JWT token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        // Create socket connection with JWT token in auth handshake
        const newSocket = io(socketUrl, {
          auth: {
            token: token
          },
          transports: ['websocket', 'polling'],
          timeout: 20000,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });

        // Handle connection events
        newSocket.on('connect', () => {
          console.log('✅ Connected to socket server');
          setSocket(newSocket);
        });

        newSocket.on('connect_error', (error) => {
          console.error('❌ Socket connection failed:', error.message);
          if (error.message === 'Authentication error: Invalid token') {
            // Handle expired/invalid token
            localStorage.removeItem('token');
            // Redirect to login or refresh token
          }
          setSocket(null);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setSocket(null);
        });

        // Cleanup function
        return () => {
          if (newSocket && typeof newSocket.close === 'function') {
            newSocket.close();
          }
          setSocket(null);
        };
      } catch (error) {
        console.error('Socket initialization error:', error);
        setSocket(null);
      }
    } else {
      console.log('No token found, skipping socket connection');
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
