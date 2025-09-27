# 🌟 Blockchain-Enabled Rare Disease Drug Crowdfunding

Welcome to a revolutionary platform that empowers communities to fund research and development for rare disease treatments! This Web3 project uses the Stacks blockchain and Clarity smart contracts to create transparent, decentralized crowdfunding campaigns. Donors contribute STX (Stacks' native token) or other supported tokens and receive NFTs that represent fractional shares in potential drug breakthroughs. If a funded project succeeds (e.g., reaches clinical trials or patents), NFT holders could benefit from revenue sharing or governance rights, fostering a collaborative ecosystem to tackle underfunded rare diseases.

This solves a real-world problem: Rare diseases affect millions worldwide but receive limited funding from traditional pharma due to small patient populations. Blockchain ensures tamper-proof tracking of funds, milestone-based releases, and incentivizes participation through tokenized ownership.

## ✨ Features

- 📈 Create and manage crowdfunding campaigns for specific rare diseases with defined goals and milestones.
- 💰 Donate securely and receive NFTs as proof of contribution, representing shares in future breakthroughs.
- 🔒 Escrow mechanism to hold funds until verified milestones are met (e.g., via oracles for real-world progress).
- 🗳️ Governance voting for NFT holders on key decisions, like fund allocation or project pivots.
- 📊 Transparent tracking of funds, donations, and project updates on the blockchain.
- 🎉 Revenue sharing: If a breakthrough leads to commercialization, distribute royalties to NFT holders.
- 🚫 Anti-fraud measures to prevent duplicate campaigns or unauthorized withdrawals.
- 🔍 Verifiable oracle integration for confirming real-world events (e.g., FDA approvals or trial results).

## 🛠 How It Works

The project is built with 8 Clarity smart contracts to handle various aspects of the ecosystem, ensuring modularity, security, and scalability. Here's a high-level overview:

### Key Smart Contracts
1. **CampaignManager.clar**: Handles creation, listing, and closure of crowdfunding campaigns. Defines goals, milestones, and disease-specific details.
2. **DonationEscrow.clar**: Acts as a secure vault to lock donated funds until milestones are verified, preventing misuse.
3. **NFTMinter.clar**: Mints unique NFTs for donors based on contribution amounts, with metadata linking to shares in breakthroughs.
4. **GovernanceToken.clar**: Issues governance tokens tied to NFTs, enabling voting on project decisions.
5. **MilestoneOracle.clar**: Integrates with external oracles to verify real-world progress (e.g., lab results or regulatory approvals) and trigger fund releases.
6. **RevenueDistributor.clar**: Manages royalty distributions from successful projects back to NFT holders proportionally.
7. **UserRegistry.clar**: Registers users, campaigns, and verifiers to maintain a trusted participant list and prevent spam.
8. **DisputeResolver.clar**: Allows community-voted resolutions for disputes, such as milestone disagreements.

**For Campaign Creators (e.g., Researchers or Non-Profits)**
- Propose a new campaign via `CampaignManager` with details like disease name, funding goal, milestones, and timeline.
- Once approved (via governance vote), the campaign goes live, and `DonationEscrow` starts accepting contributions.
- Use `MilestoneOracle` to submit proof of progress for fund releases.

**For Donors**
- Browse active campaigns and donate STX/tokens to a campaign address.
- Call the `NFTMinter` function with your donation receipt to mint an NFT representing your share (e.g., proportional to donation size).
- Hold the NFT to participate in governance votes or claim future revenues.

**For Verifiers and Community**
- Use `GovernanceToken` to vote on campaign approvals, milestone verifications, or disputes via `DisputeResolver`.
- Query `CampaignManager` or `RevenueDistributor` for transparent details on fund usage and distributions.
- If a breakthrough occurs, `MilestoneOracle` triggers `RevenueDistributor` to airdrop shares or royalties to NFT holders.

That's it! This decentralized approach ensures funds go directly to impact, with blockchain immutability providing trust and accountability. Deploy on Stacks for low-cost, Bitcoin-secured transactions.