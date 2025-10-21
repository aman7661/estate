import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Helper function to read token from cookies
    const getCookieValue = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };

    // Check if socket URL is available
    const socketUrl = import.meta.env.VITE_SOCKET_URL;
    
    if (!socketUrl) {
      console.log('🔕 Socket disabled - No VITE_SOCKET_URL configured');
      return;
    }

    // Get JWT token from cookies (NOT localStorage)
    const token = getCookieValue('token');
    
    if (!token) {
      console.log('🔕 Socket disabled - No authentication token found');
      return;
    }

    try {
      console.log('🚀 Attempting socket connection...');
      
      // Create socket connection with JWT token from cookie
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
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
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
      console.error('💥 Socket initialization error:', error);
      setSocket(null);
    }

  }, [currentUser]);

  useEffect(() => {
    // Only emit newUser if socket is connected
    if (currentUser && socket?.connected) {
      socket.emit("newUser", currentUser.id);
      console.log('👤 User registered with socket:', currentUser.id);
    }
  }, [currentUser, socket]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
