const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, { 
  pingInterval: 5000, 
  pingTimeout: 3000, 
  cors: { 
    origin: process.env.FRONTEND_URL || '*', 
    methods: ['GET', 'POST'] 
  } 
});

const getSubsets = (arr, maxPicks = arr.length) => {
  const subsets = [['None']];
  const max = 1 << arr.length;
  for (let i = 1; i < max; i++) {
    let combo = [];
    for (let j = 0; j < arr.length; j++) {
      if (i & (1 << j)) combo.push(arr[j]);
    }
    if (combo.length <= maxPicks) subsets.push(combo);
  }
  return subsets;
};

const getPairs = (arr) => {
  const pairs = [['None']];
  for(let i=0; i<arr.length; i++) {
    pairs.push([arr[i], arr[i]]);
    for(let j=i+1; j<arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
};

const getHalfPairs = (arr) => {
  const pairs = [['None']];
  for(let i=0; i<arr.length; i++) {
    pairs.push([arr[i]]);
    for(let j=i+1; j<arr.length; j++) {
      pairs.push([arr[i], arr[j]]);
    }
  }
  return pairs;
};

const CATEGORIES_UNIVERSE = {
  entree: [['Burrito'], ['Bowl'], ['Tacos'], ['Salad']],
  rice: getHalfPairs(['White', 'Brown']),
  beans: getHalfPairs(['Black', 'Pinto']),
  protein: getPairs(['Chicken', 'Carnitas', 'Sofritas', 'Barbacoa', 'Steak', 'Al Pastor', 'Veggie']),
  salsa: getSubsets(['Tomato', 'Green', 'Red', 'Corn Salsa']),
  toppings: getSubsets(['Cheese', 'Sour Cream', 'Lettuce', 'Fajita Veggies']),
  extras: getSubsets(['Queso', 'Cilantro Lime Sauce', 'Guacamole'])
};

// Base ingredients exposed to the UI board
const BASE_INGREDIENTS = {
  entree: ['Burrito', 'Bowl', 'Tacos', 'Salad'],
  rice: ['White', 'Brown', 'None'],
  beans: ['Black', 'Pinto', 'None'],
  protein: ['Chicken', 'Carnitas', 'Sofritas', 'Barbacoa', 'Steak', 'Al Pastor', 'Veggie', 'None'],
  salsa: ['Tomato', 'Green', 'Red', 'Corn Salsa', 'None'],
  toppings: ['Cheese', 'Sour Cream', 'Lettuce', 'Fajita Veggies', 'None'],
  extras: ['Queso', 'Cilantro Lime Sauce', 'Guacamole', 'None']
};

const calculateInitialCombos = () => {
  let total = 1;
  for (const items of Object.values(CATEGORIES_UNIVERSE)) {
    total *= items.length;
  }
  return total;
};

const TOTAL_ORIGINAL_COMBOS = calculateInitialCombos();

let vaultState = {
  categories: BASE_INGREDIENTS,
  confirmed: { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] },
  incorrect: { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] },
  partial: { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] },
  activeConnections: 0,
  remainingCombos: TOTAL_ORIGINAL_COMBOS,
  totalCombos: TOTAL_ORIGINAL_COMBOS
};

let activeAssignments = {};

let voteTracker = { entree: {}, rice: {}, beans: {}, protein: {}, salsa: {}, toppings: {}, extras: {} };

function initVoteTrackerItem(cat, item) {
  if (!voteTracker[cat][item]) {
    voteTracker[cat][item] = { Correct: new Set(), Partial: new Set(), Wrong: new Set() };
  }
}

function getSanitizedVoteState() {
  const sanitized = {};
  for (const cat of Object.keys(voteTracker)) {
    sanitized[cat] = {};
    for (const [item, votes] of Object.entries(voteTracker[cat])) {
      sanitized[cat][item] = {
        Correct: votes.Correct.size,
        Partial: votes.Partial.size,
        Wrong: votes.Wrong.size
      };
    }
  }
  return sanitized;
}

function clearVotes(cat, item) {
  if (voteTracker[cat] && voteTracker[cat][item]) {
    delete voteTracker[cat][item];
  }
}

let vaultStats = {
  itemsEntered: 0,
  peakUsers: 0,
  resets: 0
};

let stateHistory = [];
let actionLog = [];
let logIdTracker = 1;
const rateLimits = {}; // socket.id -> array of timestamps

function checkRateLimit(socketId) {
  const now = Date.now();
  if (!rateLimits[socketId]) rateLimits[socketId] = [];
  rateLimits[socketId] = rateLimits[socketId].filter(t => now - t < 3000); // 3 second window
  if (rateLimits[socketId].length >= 10) { // max 10 requests per 3 seconds
    return false;
  }
  rateLimits[socketId].push(now);
  return true;
}

function addActionLog(msg) {
  actionLog.push({ id: logIdTracker++, timestamp: Date.now(), message: msg });
  if (actionLog.length > 50) actionLog.shift();
  io.emit('log_update', actionLog);
}

function pushStateHistory() {
  stateHistory.push({
    confirmed: JSON.parse(JSON.stringify(vaultState.confirmed)),
    incorrect: JSON.parse(JSON.stringify(vaultState.incorrect)),
    partial: JSON.parse(JSON.stringify(vaultState.partial)),
    remainingCombos: vaultState.remainingCombos
  });
  if (stateHistory.length > 50) stateHistory.shift();
}

let lastManualResetTime = 0;
const RESET_COOLDOWN_MS = 15 * 60 * 1000;

function performReset(reason = 'Vault Completely Reset') {
  pushStateHistory();
  vaultStats.resets++;

  vaultState.confirmed = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
  vaultState.incorrect = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
  vaultState.partial = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
  activeAssignments = {};
  voteTracker = { entree: {}, rice: {}, beans: {}, protein: {}, salsa: {}, toppings: {}, extras: {} };
  vaultState.remainingCombos = TOTAL_ORIGINAL_COMBOS;
  io.emit('state_update', vaultState);
  io.emit('stats_update', vaultStats);
  io.emit('vote_update', getSanitizedVoteState());
  io.emit('assignment', null);
  
  addActionLog(reason);
}

let lastAutoResetHour = -1;
setInterval(() => {
  const now = new Date();
  if (now.getMinutes() === 59 && now.getHours() !== lastAutoResetHour) {
    lastAutoResetHour = now.getHours();
    performReset('Scheduled Auto Reset (Top of Hour)');
  }
}, 10000);

function getValidPermutations(cat) {
  const reqs = vaultState.confirmed[cat];
  const bans = vaultState.incorrect[cat];
  
  return CATEGORIES_UNIVERSE[cat].filter(perm => {
    for (const req of reqs) if (!perm.includes(req)) return false;
    for (const ban of bans) if (perm.includes(ban)) return false;
    return true;
  });
}

function calculateRemaining() {
  let total = 1;
  for (const cat of Object.keys(CATEGORIES_UNIVERSE)) {
    total *= getValidPermutations(cat).length;
  }
  return total;
}

function generateGuess() {
  let guess = {};
  for (const cat of Object.keys(CATEGORIES_UNIVERSE)) {
    const valid = getValidPermutations(cat);
    guess[cat] = valid.length > 0 ? valid[Math.floor(Math.random() * valid.length)] : null;
  }
  return guess;
}

function getUniqueGuess(socketId) {
  let limit = 1000;
  while(limit > 0) {
    let guess = generateGuess();
    let guessStr = JSON.stringify(guess);
    let isAssigned = Object.values(activeAssignments).some(v => JSON.stringify(v.guess) === guessStr);
    if (!isAssigned) {
      activeAssignments[socketId] = { guess };
      return guess;
    }
    limit--;
  }
  const fallback = generateGuess();
  activeAssignments[socketId] = { guess: fallback };
  return fallback;
}

io.on('connection', (socket) => {
  vaultState.activeConnections++;
  vaultStats.peakUsers = Math.max(vaultStats.peakUsers, vaultState.activeConnections);

  socket.emit('state_update', vaultState);
  socket.emit('stats_update', vaultStats);
  socket.emit('vote_update', getSanitizedVoteState());
  socket.emit('log_update', actionLog);
  io.emit('connection_update', vaultState.activeConnections);
  io.emit('stats_update', vaultStats);

  socket.on('request_assignment', () => {
    if (!checkRateLimit(socket.id)) {
       socket.emit('toast_msg', 'Rate limit exceeded. Please slow down.');
       return;
    }
    vaultState.remainingCombos = calculateRemaining();
    if (vaultState.remainingCombos === 0) {
      socket.emit('assignment', null);
      return;
    }
    const guess = getUniqueGuess(socket.id);
    socket.emit('assignment', guess);
  });

  socket.on('submit_result', (payload) => {
    if (!checkRateLimit(socket.id)) {
       socket.emit('toast_msg', 'Rate limit exceeded. Please slow down.');
       return;
    }
    if (!payload || typeof payload !== 'object') return;
    
    const { results, isFinal } = payload;
    if (!results || typeof results !== 'object') return;

    let hasRealUpdates = false;
    let submittedItemsDesc = [];

    pushStateHistory();

    for (const cat of Object.keys(results)) {
      if (!BASE_INGREDIENTS[cat]) continue;
      if (typeof results[cat] !== 'object') continue;

      for (const [ingredient, status] of Object.entries(results[cat])) {
        // Strict Validation
        if (!BASE_INGREDIENTS[cat].includes(ingredient)) continue;
        if (!['Correct', 'Partial', 'Wrong', 'Pending'].includes(status)) continue;
        
        if (status === 'Pending') {
           if (voteTracker[cat][ingredient]) {
               voteTracker[cat][ingredient].Correct.delete(socket.id);
               voteTracker[cat][ingredient].Partial.delete(socket.id);
               voteTracker[cat][ingredient].Wrong.delete(socket.id);
           }
           const wasStatus = 'Cleared';
           // If they manually clear something already globally locked, that's complex since it requires a rollback.
           // Generally pending just means 'I am removing my vote'
           continue;
        }

        initVoteTrackerItem(cat, ingredient);
        voteTracker[cat][ingredient].Correct.delete(socket.id);
        voteTracker[cat][ingredient].Partial.delete(socket.id);
        voteTracker[cat][ingredient].Wrong.delete(socket.id);

        voteTracker[cat][ingredient][status].add(socket.id);

        let totalVotesForThisItem = 
          voteTracker[cat][ingredient].Correct.size + 
          voteTracker[cat][ingredient].Partial.size + 
          voteTracker[cat][ingredient].Wrong.size;

        let locked = false;

        let activeCount = vaultState.activeConnections;
        if (activeCount <= 10) {
            locked = true;
        } else {
            let minVotesRequired = Math.ceil(activeCount * 0.3); // 30% must vote
            if (totalVotesForThisItem >= minVotesRequired) {
                // Scale from 90% at 10 down to 60% at 100
                let reqPct = 0.90 - ((activeCount - 10) * 0.00333);
                reqPct = Math.max(0.60, Math.min(0.90, reqPct));
                
                let votesForCurrentStatus = voteTracker[cat][ingredient][status].size;
                if ((votesForCurrentStatus / totalVotesForThisItem) >= reqPct) {
                    locked = true;
                }
            }
        }

        if (locked) {
            hasRealUpdates = true;
            vaultStats.itemsEntered++;
            submittedItemsDesc.push(`${ingredient} (${cat}): ${status}`);

            vaultState.confirmed[cat] = vaultState.confirmed[cat].filter(i => i !== ingredient);
            vaultState.incorrect[cat] = vaultState.incorrect[cat].filter(i => i !== ingredient);
            vaultState.partial[cat]   = vaultState.partial[cat].filter(i => i !== ingredient);
            
            if (status === 'Correct') {
              vaultState.confirmed[cat].push(ingredient);
            } else if (status === 'Wrong') {
              vaultState.incorrect[cat].push(ingredient);
            } else if (status === 'Partial') {
              vaultState.partial[cat].push(ingredient);
            }

            clearVotes(cat, ingredient);
        }
      }
    }

    if (hasRealUpdates) {
      const isManual = payload.guess === null || !isFinal;
      addActionLog(`${isManual ? 'Manual Override' : 'Assignment Result'}: ${submittedItemsDesc.join(', ')}`);
    }

    if (isFinal) {
      delete activeAssignments[socket.id];
      socket.emit('assignment', null);
    }
    vaultState.remainingCombos = calculateRemaining();
    io.emit('state_update', vaultState);
    io.emit('vote_update', getSanitizedVoteState());
    io.emit('stats_update', vaultStats);
  });

  socket.on('reset_vault', () => {
    const now = Date.now();
    const timeSince = now - lastManualResetTime;
    if (timeSince < RESET_COOLDOWN_MS) {
      const waitMins = Math.ceil((RESET_COOLDOWN_MS - timeSince) / 60000);
      socket.emit('toast_msg', `Global reset is on cooldown. Try again in ${waitMins} min.`);
      return;
    }
    lastManualResetTime = now;
    performReset('User Triggered Manual Reset');
  });

  socket.on('disconnect', () => {
    vaultState.activeConnections--;
    if(activeAssignments[socket.id]) delete activeAssignments[socket.id];
    delete rateLimits[socket.id];
    io.emit('connection_update', vaultState.activeConnections);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Vault Solver Backend running on http://0.0.0.0:${PORT} (Combinations: ${TOTAL_ORIGINAL_COMBOS.toLocaleString()})`);
});
