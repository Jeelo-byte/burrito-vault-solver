import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Use the local device IP that served the page for the WebSocket host
const URL = `http://${window.location.hostname}:3001`;

export function useVaultState() {
  const [state, setState] = useState(null);
  const [connections, setConnections] = useState(0);
  const [assignment, setAssignment] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(URL);
    setSocket(newSocket);

    newSocket.on('state_update', (newState) => {
      setState(newState);
    });

    newSocket.on('connection_update', (count) => {
      setConnections(count);
    });

    newSocket.on('assignment', (guess) => {
      setAssignment(guess);
    });

    return () => newSocket.close();
  }, []);

  const requestAssignment = () => {
    if (socket) socket.emit('request_assignment');
  };

  const submitResult = (guess, results, isFinal = false) => {
    if (socket) {
      socket.emit('submit_result', { guess, results, isFinal });
      if (isFinal) {
        setAssignment(null);
      }
    }
  };

  const resetVault = () => {
    if (socket) socket.emit('reset_vault');
  };

  return { state, connections, assignment, requestAssignment, submitResult, resetVault };
}
