# 🔐 Confidential Credit Verification (MidScore)

### A Level 3 Midnight Network dApp for Privacy-Preserving Credit Eligibility Verification

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-00C7B7?style=for-the-badge&logo=vercel&logoColor=white)](https://midscore.vercel.app)
[![Video Walkthrough](https://img.shields.io/badge/Video-YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/oHbH8y9pPAk)
[![CI/CD](https://img.shields.io/github/actions/workflow/status/ChandranshuDutta025/confidential-credit-verification/ci.yml?style=for-the-badge&label=CI%2FCD&logo=githubactions&logoColor=white)](https://github.com/ChandranshuDutta025/confidential-credit-verification/actions)
[![Network](https://img.shields.io/badge/Network-Midnight_Preview-4B7BEC?style=for-the-badge&logo=midnight&logoColor=white)](https://midnight.network)
[![Compact](https://img.shields.io/badge/Compact-0.5.1-FF6B35?style=for-the-badge&logo=bitbucket&logoColor=white)](https://docs.midnight.network)
[![Node](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 🌐 Live Deployment — Midnight Preview

| Field | Value |
|-------|-------|
| **Network** | Midnight Preview (`*.preview.midnight.network`) |
| **Contract Name** | `credit-verification` |
| **Contract Address** | `264401128219f9e476230cb17b356ebebe22a3a160ded36da07ce38d59a3aca4` |
| **Deployer Wallet** | `mn_addr_preview1m5nj8jxrhcf0ml70td0q0t25fkfkceqj8n8hu59ue6f4m3wrfl8qvh7rdv` |
| **Deployed At** | 2026-08-04 |
| **Indexer** | `https://indexer.preview.midnight.network/api/v4/graphql` |
| **Node RPC** | `https://rpc.preview.midnight.network` |
| **Proof Server** | `http://127.0.0.1:6300` (local) |

---

## 💡 Product Idea & Summary

**MidScore** is a privacy-first decentralized application (dApp) built on the Midnight Network that allows financial institutions to verify user credit eligibility without requiring users to expose sensitive financial parameters or personally identifiable information (PII). By conducting client-side zero-knowledge proof calculations in the browser, MidScore evaluates whether a user's credit score meets predefined lending thresholds. Only the deterministic SHA-256 commitment hash and the binary outcome (`eligible: 1` or `not eligible: 0`) are committed on-chain, keeping raw incomes and credit scores entirely private to the user's local device.

---

## 🚀 Live Demo, Video & Repository

| Resource | Link |
|----------|------|
| 🌐 **Live Demo** | [midscore.vercel.app](https://midscore.vercel.app) |
| 🎥 **Video Walkthrough** | [YouTube Video](https://youtu.be/oHbH8y9pPAk) |
| 💻 **Source Code** | [GitHub Repository](https://github.com/ChandranshuDutta025/confidential-credit-verification) |

---

## 📋 Challenge Requirements & Passing Checklist

| # | Requirement | Status |
|---|-------------|:------:|
| 1 | **Compact contract** with `pragma language_version >= 0.23` | ✅ |
| 2 | **Minimum 4 circuits** (`initialize`, `verifyCreditScore`, `deriveUserCommitment`, `checkVerification`) | ✅ |
| 3 | **Ledger state** using `Map<Bytes<32>, Uint<64>>` for verification results | ✅ |
| 4 | **Two witness functions** (`getCreditScore`, `getUserSecret`) returning proper witness tuples | ✅ |
| 5 | **Zero-knowledge privacy** — credit score never leaves the client device | ✅ |
| 6 | **SHA-256 commitment** derived from the user secret to link wallet and verification | ✅ |
| 7 | **CI/CD pipeline** with GitHub Actions (build + test) | ✅ |
| 8 | **7 passing tests** covering compilation, privacy guarantees, and eligibility logic | ✅ |
| 9 | **Docker DevNet** (node, indexer, proof-server) running healthy | ✅ |
| 10 | **Lace Wallet integration** via `window.midnight` DApp Connector API | ✅ |
| 11 | **Frontend** built with React + Vite + Tailwind CSS v4 | ✅ |
| 12 | **Dark/Light mode** with localStorage persistence | ✅ |

### 🚀 Deployed Contract

**Contract Address (Preview)**

```text
264401128219f9e476230cb17b356ebebe22a3a160ded36da07ce38d59a3aca4
```

**Contract Address (Preprod — legacy)**

```text
60b892512f11275c9f5260a0983197d90fb2c476d425795c0371ee9d36e9870d
```

✅ Successfully deployed and verified on Midnight Preview.


## 🛡️ Midnight Privacy Model

### What an Observer **CANNOT** Learn

| Data | Visibility | Protection Method |
|------|------------|-------------------|
| **Raw Credit Score** | 🔒 Private | Witness value — never disclosed to the network |
| **Exact Income Parameters** | 🔒 Private | Never transmitted; processed locally in-browser |
| **Personal Identifiable Information (PII)** | 🔒 Private | No PII is collected, stored, or transmitted |
| **Exact Threshold Being Evaluated** | 🔒 Private | Threshold is compared locally; only the boolean result is disclosed |

### What an Observer **CAN** Learn

| Data | Visibility | Reason |
|------|------------|--------|
| **Verification Counter** | ✅ Public | Aggregate count of total credit verifications on-chain |
| **Verified Bank/Institution ID** | ✅ Public | Wallet address linked to the cryptographic commitment |
| **Cryptographic Commitment Hash** | ✅ Public | SHA-256 hash stored on-chain (links wallet to boolean result) |
| **Eligible / Not Eligible** | ✅ Public | Binary `1` or `0` — the only data stored per verification |

> **Key Insight:** The entire credit score comparison happens client-side in the browser. Only the **boolean outcome** (`eligible: 1` or `not eligible: 0`) and a **SHA-256 commitment** derived from a random user secret are ever written to the Midnight ledger. An observer can see *that* a verification occurred and *whether* the user was eligible, but can never recover the underlying financial data.


## 📄 Contract Details

| Environment | Contract Address | Node URL | Indexer URL | Proof Server |
|-------------|-----------------|----------|-------------|--------------|
| **Preview** | `264401128219f9e476230cb17b356ebebe22a3a160ded36da07ce38d59a3aca4` | `https://rpc.preview.midnight.network` | `https://indexer.preview.midnight.network/api/v4/graphql` | `http://127.0.0.1:6300` |
| **Preprod** | `60b892512f11275c9f5260a0983197d90fb2c476d425795c0371ee9d36e9870d` | `wss://rpc.preprod.midnight.network` | `https://indexer.preprod.midnight.network/api/v4/graphql` | `https://proof-server.preprod.midnight.network` |
| **Local Devnet** | *(auto-deployed)* | `ws://127.0.0.1:9944` | `http://127.0.0.1:8088/api/v4/graphql` | `http://127.0.0.1:6300` |

### Environment Variables (Frontend)

```env
VITE_NETWORK=preview
VITE_CONTRACT_ADDRESS=264401128219f9e476230cb17b356ebebe22a3a160ded36da07ce38d59a3aca4
VITE_PROOF_SERVER_URL=http://127.0.0.1:6300
VITE_INDEXER_URL=https://indexer.preview.midnight.network/api/v4/graphql
VITE_NODE_URL=https://rpc.preview.midnight.network
```


## 🔌 Wallet Connector

### TypeScript Connection via `window.midnight.mnLace`

```typescript
// Detect and connect to Lace Wallet via the Midnight DApp Connector API
const wallets = window.midnight;

if (!wallets || !wallets.mnLace) {
  throw new Error("Lace Wallet not detected. Please install the Lace extension.");
}

const api = await wallets.mnLace.enable();

// Get wallet configuration (network, address, etc.)
const config = await api.getConfiguration();
const address = await api.getUnshieldedAddress();

console.log("Connected to Lace Wallet");
console.log("Network:", config.networkId);
console.log("Address:", address);
```

### Connection Flow

```
1. User clicks "Connect Wallet"
2. Frontend detects window.midnight.mnLace
3. Calls wallets.mnLace.enable()
4. Retrieves wallet address and network config
5. UI updates to show connected state
```


## ⚡ Quickstart

### Prerequisites


### 1. Clone the Repository

```bash
git clone https://github.com/ChandranshuDutta025/confidential-credit-verification.git
cd confidential-credit-verification
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 3. Start Docker Devnet

```bash
docker compose up -d
```

Wait until all three containers are healthy:

### 4. Compile the Contract

```bash
~/.local/bin/compact compile contracts/credit-verification.compact \
  --target-project contracts/managed/credit-verification
```

### 5. Run Tests

```bash
npx tsx src/test.ts
```

### 6. Start the Frontend

```bash
cd frontend
npx vite --host 0.0.0.0
```

Open **http://localhost:5173** in your browser.


## 🧪 Test Suite

### Expected Output

```
✓ Contract compilation: loads compiled contract artifact
✓ Contract instantiation: creates contract with valid parameters
✓ Privacy guarantee: credit score remains private witness value
✓ Eligibility logic: score >= threshold returns eligible (1)
✓ Ineligibility logic: score < threshold returns not eligible (0)
✓ SHA-256 commitment: deriveUserCommitment produces deterministic hash
✓ Verification results: Map stores per-user boolean outcomes

7 passed, 0 failed
```

### Running Tests

```bash
# From project root
npx tsx src/test.ts

# Full build verification
cd frontend && npx tsc -b && npx vite build
```


## 📸 Screenshots

### Landing Page
![Landing Page](https://github.com/ChandranshuDutta025/confidential-credit-verification/blob/a5f377d41177897272b8543f15b088b389cff91b/Screenshot%202026-07-27%20205818.png?raw=true)

> Premium fintech-inspired design with dark/light mode toggle, privacy-first messaging, and 4-step how-it-works timeline.

### ZK Proof Verification
![ZK Proof](https://github.com/ChandranshuDutta025/confidential-credit-verification/blob/a5f377d41177897272b8543f15b088b389cff91b/Screenshot%202026-07-27%20205807.png?raw=true)

> Eligibility check flow: user enters credit score → SHA-256 commitment derived → Lace Wallet authorizes → result recorded on-chain.

### Dashboard
![Dashboard](https://github.com/ChandranshuDutta025/confidential-credit-verification/blob/d2c94c29ab853896ff264fd549a052b9d8d087aa/Screenshot%202026-07-27%20213701.png?raw=true)

> Verification history dashboard with status badges, search, and contract state summary.


## 🏗️ Architecture

```
confidential-credit-verification/
├── contracts/
│   ├── credit-verification.compact     ← Compact smart contract (6 circuits)
│   └── managed/                         ← Compiled output (JS, prover/verifier keys, ZKIR)
├── src/
│   ├── deploy.ts                        ← Deployment with class wrapper witnesses
│   ├── cli.ts                           ← Interactive CLI
│   ├── test.ts                          ← 7 automated tests
│   ├── network.ts                       ← Network config (undeployed/preview/preprod)
│   ├── wallet.ts                        ← Wallet creation & persistence
│   └── setup.ts                         ← Docker + compile + deploy orchestrator
├── frontend/
│   └── src/
│       ├── App.tsx                      ← Main component (Home/Eligibility/Dashboard)
│       ├── components/
│       │   └── Navbar.tsx               ← Sticky nav with dark/light toggle
│       ├── hooks/
│       │   ├── useWalletDetection.ts    ← Lace Wallet detection & connection
│       │   └── useTheme.tsx             ← Theme context with localStorage
│       ├── api.ts                       ← API layer (commitment derivation, config)
│       ├── types.ts                     ← TypeScript types
│       └── index.css                    ← Tailwind CSS v4 tokens + dark mode
├── docker-compose.yml                   ← Local devnet (node, indexer, proof-server)
├── .github/workflows/ci.yml            ← GitHub Actions CI/CD
└── package.json
```


## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Smart Contract** | Compact 0.5.1 (`pragma >= 0.23`) |
| **Blockchain** | Midnight Network (Preview) |
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 |
| **Wallet** | Lace Wallet (DApp Connector API 4.0.1) |
| **Privacy** | SHA-256 commitments, ZK witnesses |
| **CI/CD** | GitHub Actions |
| **Dev Environment** | Docker Compose + WSL Ubuntu |


## 📜 License

MIT License — see [LICENSE](LICENSE) for details.


<p align="center">
  Built with 🔐 on <a href="https://midnight.network">Midnight Network</a>
</p>

## Midnight Preview Deployment

### Smart Contract Specifications

- Contract Address: 264401128219f9e476230cb17b356ebebe22a3a160ded36da07ce38d59a3aca4

- Target Network: Midnight Preview
