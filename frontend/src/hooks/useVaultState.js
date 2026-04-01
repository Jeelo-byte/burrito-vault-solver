import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Use the local device IP that served the page for the WebSocket host
const URL = `http://${window.location.hostname}:3001`;

export function useVaultState() {
  const [state, setState] = useState(null);
  const [connections, setConnections] = useState(0);
  const [assignment, setAssignment] = useState(null);
  const [stats, setStats] = useState({ itemsEntered: 0, peakUsers: 0, resets: 0 });
  const [actionLog, setActionLog] = useState([]);
  const [lastSubmission, setLastSubmission] = useState(null);
  const [socket, setSocket] = useState(null);
  const [voteState, setVoteState] = useState(null);

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

    newSocket.on('stats_update', (newStats) => {
      setStats(newStats);
    });

    newSocket.on('log_update', (log) => {
      setActionLog(log);
    });

    newSocket.on('toast_msg', (msg) => {
      window.alert(msg);
    });

    newSocket.on('vote_update', (newVoteState) => {
      setVoteState(newVoteState);
    });

    return () => newSocket.close();
  }, []);

  const requestAssignment = () => {
    if (socket) socket.emit('request_assignment');
  };

  const submitResult = (guess, results, isFinal = false) => {
    if (socket) {
      setLastSubmission(results);
      socket.emit('submit_result', { guess, results, isFinal });
      if (isFinal) {
        setAssignment(null);
      }
    }
  };

  const resetVault = () => {
    if (socket) socket.emit('reset_vault');
  };

  const undoLastSubmission = () => {
    if (socket && lastSubmission) {
      const inverseResults = {};
      for (const cat of Object.keys(lastSubmission)) {
        inverseResults[cat] = {};
        for (const ingredient of Object.keys(lastSubmission[cat])) {
          inverseResults[cat][ingredient] = 'Pending';
        }
      }
      socket.emit('submit_result', { guess: null, results: inverseResults, isFinal: false });
      setLastSubmission(null);
    } else {
      window.alert("No local submission history to undo.");
    }
  };

  return { state, voteState, connections, assignment, stats, actionLog, requestAssignment, submitResult, resetVault, undoLastSubmission };
}
