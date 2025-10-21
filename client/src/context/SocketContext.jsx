import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext();

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Always return null socket - no connection attempts
    setSocket(null);
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket: null }}>
      {children}
    </SocketContext.Provider>
  );
};
