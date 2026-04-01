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
  cors: { origin: '*', methods: ['GET', 'POST'] } 
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
  socket.emit('state_update', vaultState);
  io.emit('connection_update', vaultState.activeConnections);

  socket.on('request_assignment', () => {
    vaultState.remainingCombos = calculateRemaining();
    if (vaultState.remainingCombos === 0) {
      socket.emit('assignment', null);
      return;
    }
    const guess = getUniqueGuess(socket.id);
    socket.emit('assignment', guess);
  });

  socket.on('submit_result', (payload) => {
    const { results, isFinal } = payload;
    for (const cat of Object.keys(BASE_INGREDIENTS)) {
      if (!results[cat]) continue;
      for (const [ingredient, status] of Object.entries(results[cat])) {
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
      }
    }
    if (isFinal) {
      delete activeAssignments[socket.id];
      socket.emit('assignment', null);
    }
    vaultState.remainingCombos = calculateRemaining();
    io.emit('state_update', vaultState);
  });

  socket.on('reset_vault', () => {
    vaultState.confirmed = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
    vaultState.incorrect = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
    vaultState.partial = { entree: [], rice: [], beans: [], protein: [], salsa: [], toppings: [], extras: [] };
    activeAssignments = {};
    vaultState.remainingCombos = TOTAL_ORIGINAL_COMBOS;
    io.emit('state_update', vaultState);
    io.emit('assignment', null);
  });

  socket.on('disconnect', () => {
    vaultState.activeConnections--;
    if(activeAssignments[socket.id]) delete activeAssignments[socket.id];
    io.emit('connection_update', vaultState.activeConnections);
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Vault Solver Backend running on http://0.0.0.0:${PORT} (Combinations: ${TOTAL_ORIGINAL_COMBOS.toLocaleString()})`);
});
