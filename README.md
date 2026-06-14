# AuctionDanish – Dutch Auction on Ethereum

A smart contract implementing a Dutch auction on Ethereum. The price starts high and decreases every second. The first buyer who finds the price acceptable pays and takes the item – the auction closes automatically.

## How It Works

```
currentPrice = startingPrice - (discountRate * seconds_elapsed)
```

The price drops continuously until someone buys or the auction expires.

## Contracts

### AuctionDanishEngine
Main contract. Inherits `Ownable` and `Pausable` from OpenZeppelin.

- Creates and manages auctions
- Handles payments, refunds, and platform fees (10%)
- Supports pause/unpause for emergency stops
- Owner can set allowed price ranges and withdraw fees

### IAuctionDanishEngine
Interface defining the data structures, custom errors, and events.

**Auction struct:**
```solidity
struct Auction {
    address payable seller;
    uint256 startingPrice;
    uint256 finalPrice;
    uint256 startAt;
    uint256 endsAt;
    uint256 discountRate;
    string item;
    bool stopped;
}
```

**Custom errors** (gas-efficient alternative to `require` with strings):
- `IncorrectStartingPrice` – price would go negative before auction ends
- `AuctionStopped` – auction already closed
- `AuctionAlreadyEnded` – time expired
- `NotEnoughFunds` – buyer sent too little ETH
- `InvalidPriceLimits` – min > max
- `StartingPriceOutOfRange` – price outside allowed range
- `NotSeller` – only seller can cancel
- `NoFeesToWithdraw` – nothing to withdraw

### RevertingReceiver
Test helper contract whose `receive()` always reverts. Used to verify that `withdrawFees()` handles ETH-rejecting recipients correctly.

## Functions

| Function | Description |
|---|---|
| `createAuction(startingPrice, discountRate, item, duration)` | Create a new auction. If `duration == 0`, defaults to 2 days |
| `getPriceFor(index)` | View current price for an auction |
| `buy(index)` | Buy at current price. Excess ETH is refunded automatically |
| `cancelAuction(index)` | Seller cancels their auction before expiry |
| `withdrawFees()` | Owner withdraws accumulated platform fees |
| `setStartingPriceLimits(min, max)` | Owner sets allowed price range |
| `pause()` / `unpause()` | Owner pauses/resumes `createAuction` and `buy` |

## Tech Stack

- Solidity 0.8.28
- Hardhat
- OpenZeppelin (Ownable, Pausable)
- Ethers.js v6
- Chai
- dotenv

## Getting Started

### Prerequisites

- Node.js
- npm
- Hardhat

### Install

1. Clone the repository:
   ```bash
   git clone https://github.com/KonstantinVojt/AuctionDanish.git
   cd AuctionDanish
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env`:
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
   PRIVATE_KEY=your_private_key
   ETHERSCAN_API_KEY=your_etherscan_key
   ```

### Deploy

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify on Etherscan

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Testing

```bash
npx hardhat test
npx hardhat coverage
```

Test coverage includes:

- `createAuction` – valid creation, revert on price below `discountRate * duration`, revert on price out of range, default duration when `duration == 0`
- `buy` – successful purchase, revert on expired auction, revert on insufficient ETH, excess refund to buyer, correct seller payout minus fee
- `cancelAuction` – cancel by seller, revert if not seller, revert if already stopped, revert if expired
- `withdrawFees` – owner withdrawal, revert on no fees, revert if not owner, revert if recipient rejects ETH (`RevertingReceiver`)
- `setStartingPriceLimits` – revert if not owner, revert if min > max
- `pause` / `unpause` – blocks `buy` and `createAuction` when paused, unblocks after unpause, revert if not owner

## Project Structure

```
contracts/
├── AuctionDanishEngine.sol
├── IAuctionDanishEngine.sol
└── RevertingReceiver.sol

scripts/
└── deploy.js

test/
└── AuctionDanishEngine-test.js
```
