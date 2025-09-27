import { describe, it, expect, beforeEach } from "vitest";
import { stringAsciiCV, uintCV, listCV, tupleCV, boolCV, principalCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_DISEASE_NAME = 101;
const ERR_INVALID_FUNDING_GOAL = 102;
const ERR_INVALID_MILESTONES = 103;
const ERR_INVALID_DESCRIPTION = 104;
const ERR_INVALID_START_TIME = 105;
const ERR_INVALID_END_TIME = 106;
const ERR_CAMPAIGN_ALREADY_EXISTS = 107;
const ERR_CAMPAIGN_NOT_FOUND = 108;
const ERR_INVALID_STATUS = 109;
const ERR_INVALID_MIN_DONATION = 110;
const ERR_INVALID_MAX_DONORS = 111;
const ERR_MAX_CAMPAIGNS_EXCEEDED = 114;
const ERR_INVALID_UPDATE_PARAM = 113;
const ERR_AUTHORITY_NOT_VERIFIED = 120;
const ERR_INVALID_CATEGORY = 115;
const ERR_INVALID_TARGET_AUDIENCE = 116;
const ERR_INVALID_LOCATION = 117;
const ERR_INVALID_CURRENCY = 118;
const ERR_INVALID_ORACLE = 119;
const ERR_INVALID_REWARD_TIER = 121;
const ERR_INVALID_PROPOSAL_ID = 122;
const ERR_INVALID_VOTING_PERIOD = 123;
const ERR_INVALID_QUORUM = 124;
const ERR_INVALID_PROGRESS = 125;

interface Milestone {
  description: string;
  amount: number;
  achieved: boolean;
}

interface RewardTier {
  minAmount: number;
  nftType: string;
}

interface Campaign {
  creator: string;
  diseaseName: string;
  fundingGoal: number;
  fundsRaised: number;
  milestones: Milestone[];
  description: string;
  startTime: number;
  endTime: number;
  status: string;
  minDonation: number;
  maxDonors: number;
  category: string;
  targetAudience: string;
  location: string;
  currency: string;
  oracle: string;
  rewardTiers: RewardTier[];
  proposalId: number;
  votingPeriod: number;
  quorum: number;
  progress: number;
}

interface CampaignUpdate {
  updateDiseaseName: string;
  updateFundingGoal: number;
  updateDescription: string;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class CampaignManagerMock {
  state: {
    nextCampaignId: number;
    maxCampaigns: number;
    creationFee: number;
    authorityContract: string | null;
    campaigns: Map<number, Campaign>;
    campaignUpdates: Map<number, CampaignUpdate>;
    campaignsByName: Map<string, number>;
  } = {
    nextCampaignId: 0,
    maxCampaigns: 10000,
    creationFee: 500,
    authorityContract: null,
    campaigns: new Map(),
    campaignUpdates: new Map(),
    campaignsByName: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  stxTransfers: Array<{ amount: number; from: string; to: string | null }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextCampaignId: 0,
      maxCampaigns: 10000,
      creationFee: 500,
      authorityContract: null,
      campaigns: new Map(),
      campaignUpdates: new Map(),
      campaignsByName: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.stxTransfers = [];
  }

  setAuthorityContract(contractPrincipal: string): Result<boolean> {
    if (contractPrincipal === "SP000000000000000000002Q6VF78") {
      return { ok: false, value: ERR_NOT_AUTHORIZED };
    }
    if (this.state.authorityContract !== null) {
      return { ok: false, value: ERR_AUTHORITY_NOT_VERIFIED };
    }
    this.state.authorityContract = contractPrincipal;
    return { ok: true, value: true };
  }

  setCreationFee(newFee: number): Result<boolean> {
    if (this.state.authorityContract === null) return { ok: false, value: ERR_AUTHORITY_NOT_VERIFIED };
    this.state.creationFee = newFee;
    return { ok: true, value: true };
  }

  createCampaign(
    diseaseName: string,
    fundingGoal: number,
    milestones: Milestone[],
    description: string,
    startTime: number,
    endTime: number,
    minDonation: number,
    maxDonors: number,
    category: string,
    targetAudience: string,
    location: string,
    currency: string,
    oracle: string,
    rewardTiers: RewardTier[],
    proposalId: number,
    votingPeriod: number,
    quorum: number
  ): Result<number> {
    if (this.state.nextCampaignId >= this.state.maxCampaigns) return { ok: false, value: ERR_MAX_CAMPAIGNS_EXCEEDED };
    if (!diseaseName || diseaseName.length > 100) return { ok: false, value: ERR_INVALID_DISEASE_NAME };
    if (fundingGoal <= 0) return { ok: false, value: ERR_INVALID_FUNDING_GOAL };
    if (milestones.length <= 0 || milestones.length > 20) return { ok: false, value: ERR_INVALID_MILESTONES };
    if (description.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (startTime < this.blockHeight) return { ok: false, value: ERR_INVALID_START_TIME };
    if (endTime <= startTime) return { ok: false, value: ERR_INVALID_END_TIME };
    if (minDonation <= 0) return { ok: false, value: ERR_INVALID_MIN_DONATION };
    if (maxDonors <= 0) return { ok: false, value: ERR_INVALID_MAX_DONORS };
    if (!category || category.length > 50) return { ok: false, value: ERR_INVALID_CATEGORY };
    if (targetAudience.length > 100) return { ok: false, value: ERR_INVALID_TARGET_AUDIENCE };
    if (location.length > 100) return { ok: false, value: ERR_INVALID_LOCATION };
    if (!["STX", "BTC", "USD"].includes(currency)) return { ok: false, value: ERR_INVALID_CURRENCY };
    if (oracle === this.caller) return { ok: false, value: ERR_INVALID_ORACLE };
    if (rewardTiers.length > 10) return { ok: false, value: ERR_INVALID_REWARD_TIER };
    if (proposalId <= 0) return { ok: false, value: ERR_INVALID_PROPOSAL_ID };
    if (votingPeriod <= 0) return { ok: false, value: ERR_INVALID_VOTING_PERIOD };
    if (quorum <= 0 || quorum > 100) return { ok: false, value: ERR_INVALID_QUORUM };
    if (this.state.campaignsByName.has(diseaseName)) return { ok: false, value: ERR_CAMPAIGN_ALREADY_EXISTS };
    if (this.state.authorityContract === null) return { ok: false, value: ERR_AUTHORITY_NOT_VERIFIED };
    this.stxTransfers.push({ amount: this.state.creationFee, from: this.caller, to: this.state.authorityContract });
    const id = this.state.nextCampaignId;
    const campaign: Campaign = {
      creator: this.caller,
      diseaseName,
      fundingGoal,
      fundsRaised: 0,
      milestones,
      description,
      startTime,
      endTime,
      status: "active",
      minDonation,
      maxDonors,
      category,
      targetAudience,
      location,
      currency,
      oracle,
      rewardTiers,
      proposalId,
      votingPeriod,
      quorum,
      progress: 0
    };
    this.state.campaigns.set(id, campaign);
    this.state.campaignsByName.set(diseaseName, id);
    this.state.nextCampaignId++;
    return { ok: true, value: id };
  }

  getCampaign(id: number): Campaign | undefined {
    return this.state.campaigns.get(id);
  }

  updateCampaign(id: number, updateDiseaseName: string, updateFundingGoal: number, updateDescription: string): Result<boolean> {
    const campaign = this.state.campaigns.get(id);
    if (!campaign) return { ok: false, value: ERR_CAMPAIGN_NOT_FOUND };
    if (campaign.creator !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!updateDiseaseName || updateDiseaseName.length > 100) return { ok: false, value: ERR_INVALID_DISEASE_NAME };
    if (updateFundingGoal <= 0) return { ok: false, value: ERR_INVALID_FUNDING_GOAL };
    if (updateDescription.length > 500) return { ok: false, value: ERR_INVALID_DESCRIPTION };
    if (this.state.campaignsByName.has(updateDiseaseName) && this.state.campaignsByName.get(updateDiseaseName) !== id) {
      return { ok: false, value: ERR_CAMPAIGN_ALREADY_EXISTS };
    }
    const updated: Campaign = {
      ...campaign,
      diseaseName: updateDiseaseName,
      fundingGoal: updateFundingGoal,
      description: updateDescription
    };
    this.state.campaigns.set(id, updated);
    this.state.campaignsByName.delete(campaign.diseaseName);
    this.state.campaignsByName.set(updateDiseaseName, id);
    this.state.campaignUpdates.set(id, {
      updateDiseaseName,
      updateFundingGoal,
      updateDescription,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  updateCampaignStatus(id: number, newStatus: string): Result<boolean> {
    const campaign = this.state.campaigns.get(id);
    if (!campaign) return { ok: false, value: ERR_CAMPAIGN_NOT_FOUND };
    if (campaign.creator !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!["active", "completed", "failed"].includes(newStatus)) return { ok: false, value: ERR_INVALID_STATUS };
    const updated: Campaign = { ...campaign, status: newStatus };
    this.state.campaigns.set(id, updated);
    return { ok: true, value: true };
  }

  updateCampaignProgress(id: number, newProgress: number): Result<boolean> {
    const campaign = this.state.campaigns.get(id);
    if (!campaign) return { ok: false, value: ERR_CAMPAIGN_NOT_FOUND };
    if (campaign.oracle !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (newProgress > 100) return { ok: false, value: ERR_INVALID_PROGRESS };
    const updated: Campaign = { ...campaign, progress: newProgress };
    this.state.campaigns.set(id, updated);
    return { ok: true, value: true };
  }

  addFundsRaised(id: number, amount: number): Result<number> {
    const campaign = this.state.campaigns.get(id);
    if (!campaign) return { ok: false, value: ERR_CAMPAIGN_NOT_FOUND };
    if (campaign.status !== "active") return { ok: false, value: ERR_INVALID_STATUS };
    const newRaised = campaign.fundsRaised + amount;
    const updated: Campaign = { ...campaign, fundsRaised: newRaised };
    if (newRaised >= campaign.fundingGoal) {
      updated.status = "completed";
    }
    this.state.campaigns.set(id, updated);
    return { ok: true, value: newRaised };
  }

  markMilestoneAchieved(id: number, milestoneIndex: number): Result<boolean> {
    const campaign = this.state.campaigns.get(id);
    if (!campaign) return { ok: false, value: ERR_CAMPAIGN_NOT_FOUND };
    if (campaign.oracle !== this.caller) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (milestoneIndex >= campaign.milestones.length) return { ok: false, value: ERR_INVALID_MILESTONES };
    if (campaign.milestones[milestoneIndex].achieved) return { ok: false, value: ERR_INVALID_STATUS };
    const updatedMilestones = [...campaign.milestones];
    updatedMilestones[milestoneIndex] = { ...updatedMilestones[milestoneIndex], achieved: true };
    const updated: Campaign = { ...campaign, milestones: updatedMilestones };
    this.state.campaigns.set(id, updated);
    return { ok: true, value: true };
  }

  getCampaignCount(): Result<number> {
    return { ok: true, value: this.state.nextCampaignId };
  }

  checkCampaignExistence(name: string): Result<boolean> {
    return { ok: true, value: this.state.campaignsByName.has(name) };
  }
}

describe("CampaignManager", () => {
  let contract: CampaignManagerMock;
  beforeEach(() => {
    contract = new CampaignManagerMock();
    contract.reset();
  });
  it("creates a campaign successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    const result = contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);
    const campaign = contract.getCampaign(0);
    expect(campaign?.diseaseName).toBe("RareDisease1");
    expect(campaign?.fundingGoal).toBe(1000);
    expect(contract.stxTransfers).toEqual([{ amount: 500, from: "ST1TEST", to: "ST2TEST" }]);
  });
  it("rejects duplicate campaign names", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.createCampaign(
      "RareDisease1",
      2000,
      milestones,
      "New desc",
      15,
      25,
      20,
      200,
      "medical",
      "donors",
      "local",
      "BTC",
      "ST4ORACLE",
      rewardTiers,
      2,
      14,
      60
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_CAMPAIGN_ALREADY_EXISTS);
  });
  it("rejects campaign creation without authority contract", () => {
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    const result = contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_AUTHORITY_NOT_VERIFIED);
  });
  it("rejects invalid funding goal", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    const result = contract.createCampaign(
      "RareDisease1",
      0,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_FUNDING_GOAL);
  });
  it("updates a campaign successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "OldDisease",
      1000,
      milestones,
      "Old desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.updateCampaign(0, "NewDisease", 2000, "New desc");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const campaign = contract.getCampaign(0);
    expect(campaign?.diseaseName).toBe("NewDisease");
    expect(campaign?.fundingGoal).toBe(2000);
    expect(campaign?.description).toBe("New desc");
  });
  it("rejects update for non-existent campaign", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.updateCampaign(99, "NewDisease", 2000, "New desc");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_CAMPAIGN_NOT_FOUND);
  });
  it("rejects update by non-creator", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.caller = "ST3FAKE";
    const result = contract.updateCampaign(0, "NewDisease", 2000, "New desc");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });
  it("sets creation fee successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.setCreationFee(1000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.creationFee).toBe(1000);
  });
  it("rejects creation fee change without authority", () => {
    const result = contract.setCreationFee(1000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_AUTHORITY_NOT_VERIFIED);
  });
  it("returns correct campaign count", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.createCampaign(
      "RareDisease2",
      2000,
      milestones,
      "Another desc",
      15,
      25,
      20,
      200,
      "medical",
      "donors",
      "local",
      "BTC",
      "ST4ORACLE",
      rewardTiers,
      2,
      14,
      60
    );
    const result = contract.getCampaignCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });
  it("checks campaign existence correctly", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.checkCampaignExistence("RareDisease1");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const result2 = contract.checkCampaignExistence("NonExistent");
    expect(result2.ok).toBe(true);
    expect(result2.value).toBe(false);
  });
  it("parses campaign parameters with Clarity types", () => {
    const name = stringAsciiCV("RareDisease1");
    const goal = uintCV(1000);
    expect(name.value).toBe("RareDisease1");
    expect(goal.value).toEqual(BigInt(1000));
  });
  it("rejects campaign creation with empty name", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    const result = contract.createCampaign(
      "",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_DISEASE_NAME);
  });
  it("rejects campaign creation with max campaigns exceeded", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.state.maxCampaigns = 1;
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.createCampaign(
      "RareDisease2",
      2000,
      milestones,
      "Another desc",
      15,
      25,
      20,
      200,
      "medical",
      "donors",
      "local",
      "BTC",
      "ST4ORACLE",
      rewardTiers,
      2,
      14,
      60
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_CAMPAIGNS_EXCEEDED);
  });
  it("sets authority contract successfully", () => {
    const result = contract.setAuthorityContract("ST2TEST");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.authorityContract).toBe("ST2TEST");
  });
  it("rejects invalid authority contract", () => {
    const result = contract.setAuthorityContract("SP000000000000000000002Q6VF78");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });
  it("updates campaign status successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.updateCampaignStatus(0, "completed");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const campaign = contract.getCampaign(0);
    expect(campaign?.status).toBe("completed");
  });
  it("rejects invalid status update", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.updateCampaignStatus(0, "invalid");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_STATUS);
  });
  it("updates campaign progress successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.caller = "ST3ORACLE";
    const result = contract.updateCampaignProgress(0, 50);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const campaign = contract.getCampaign(0);
    expect(campaign?.progress).toBe(50);
  });
  it("rejects progress update over 100", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.caller = "ST3ORACLE";
    const result = contract.updateCampaignProgress(0, 101);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_PROGRESS);
  });
  it("adds funds raised successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    const result = contract.addFundsRaised(0, 500);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(500);
    const campaign = contract.getCampaign(0);
    expect(campaign?.fundsRaised).toBe(500);
  });
  it("completes campaign when goal reached", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.addFundsRaised(0, 1000);
    const campaign = contract.getCampaign(0);
    expect(campaign?.status).toBe("completed");
  });
  it("marks milestone achieved successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.caller = "ST3ORACLE";
    const result = contract.markMilestoneAchieved(0, 0);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const campaign = contract.getCampaign(0);
    expect(campaign?.milestones[0].achieved).toBe(true);
  });
  it("rejects marking already achieved milestone", () => {
    contract.setAuthorityContract("ST2TEST");
    const milestones: Milestone[] = [{ description: "Phase 1", amount: 100, achieved: false }];
    const rewardTiers: RewardTier[] = [{ minAmount: 50, nftType: "basic" }];
    contract.createCampaign(
      "RareDisease1",
      1000,
      milestones,
      "Test desc",
      10,
      20,
      10,
      100,
      "health",
      "patients",
      "global",
      "STX",
      "ST3ORACLE",
      rewardTiers,
      1,
      7,
      50
    );
    contract.caller = "ST3ORACLE";
    contract.markMilestoneAchieved(0, 0);
    const result = contract.markMilestoneAchieved(0, 0);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_STATUS);
  });
});