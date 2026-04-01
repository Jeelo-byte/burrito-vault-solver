# Burrito Vault Solver

A real-time, locally-hosted web application to collaboratively brute-force and solve combinatorial vault puzzles (specifically tailored for the *Chipotle Burrito Vault*). 

Built with a **Node.js + Express + Socket.io** backend and a **Vite + React + Tailwind CSS** frontend, the Vault Solver allows multiple users on the same Wi-Fi network to seamlessly coordinate, filter options, and dramatically reduce the solution space in real-time.

## Features

- **True Combinatorial Engine**: The backend mathematically maps all 3,801,088 exact permutations (including complex "Half/Half" meat selections and multi-select topping subsets) and distributes unique guesses so no two operatives test the same combination.
- **Immediate Live-Syncing**: Using WebSockets, the second a user marks an ingredient as 'Wrong', the server filters that ingredient out of all remaining 3.8 million permutations and immediately updates everyone's Vault Grid and Progress Bar without waiting for the user to finish their assignment.
- **Per-Ingredient Voting**: Assignments automatically unpack complex tuples (e.g., `Chicken & Steak`) into individual rows so users can evaluate and submit results for each ingredient completely independently. 
- **Locked Vault Tracker**: The UI prominently highlights confirmed ingredients at the top of the interface and formats them seamlessly.
- **Mobile-First Compact UI**: Designed to be aggressively compact and responsive using custom CSS scrollbars and tight flex wrap configurations, operating flawlessly on mobile devices.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS v3, Lucide-React
- **Backend**: Node.js, Express, Socket.io
- **Real-time Sync**: WebSockets

---

## Installation & Setup

You will need two terminal windows to run both the backend API and the frontend client simultaneously.

### 1. Start the Backend Server
The backend handles the master state and the combinatorial distribution engine.

```bash
cd backend
npm install
node server.js
```
*The server will start on `http://0.0.0.0:3001`.*

### 2. Start the Frontend Application
The frontend provides the interactive Vault Grid and Assignment Forms.

```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start on port `3000`.*

---

## How to Play / Collaborate

The solver is specifically designed to be hosted locally on one computer and accessed by multiple phones or laptops on the **same Wi-Fi network**.

1. **Host Computer**: Open `http://localhost:3000` in your web browser.
2. **Operatives (Friends/Phones)**: 
   - Find the Host computer's local IPv4 address (usually something like `192.168.1.X` or `10.0.0.X`).
   - On the mobile device, connect to the exact same Wi-Fi network.
   - Open a browser and navigate to `http://<HOST_IP_ADDRESS>:3000`.
3. **Usage**:
   - Everyone will instantly appear in the **Online Operatives** counter.
   - Click **Request Target** to get a unique combination.
   - Test it in the actual Vault game, and input the result (Wrong, Partial, Correct) for each ingredient.
   - The Central Vault Grid and the Solutions Remaining progress bar will update synchronously for everyone!
