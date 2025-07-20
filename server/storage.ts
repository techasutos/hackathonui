import {
  users, roles, groups, members, savingDeposits, loanApplications, loanRepayments,
  meetings, polls, sdgMappings, sdgImpacts,
  type User, type Role, type Group, type Member, type SavingDeposit,
  type LoanApplication, type LoanRepayment, type Meeting, type Poll,
  type SDGMapping, type SDGImpact,
  type InsertUser, type InsertRole, type InsertGroup, type InsertMember,
  type InsertSavingDeposit, type InsertLoanApplication, type InsertMeeting,
  type InsertPoll, type InsertSDGMapping
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Role operations
  getRoles(): Promise<Role[]>;
  getRole(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  // Group operations
  getGroups(): Promise<Group[]>;
  getGroup(id: number): Promise<Group | undefined>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group>;
  deleteGroup(id: number): Promise<void>;
  
  // Member operations
  getMembers(groupId?: number): Promise<Member[]>;
  getMember(id: number): Promise<Member | undefined>;
  getMemberByUserId(userId: number): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  updateMember(id: number, member: Partial<InsertMember>): Promise<Member>;
  deleteMember(id: number): Promise<void>;
  
  // Savings operations
  getSavingDeposits(memberId?: number, groupId?: number): Promise<SavingDeposit[]>;
  getSavingDeposit(id: number): Promise<SavingDeposit | undefined>;
  createSavingDeposit(deposit: InsertSavingDeposit): Promise<SavingDeposit>;
  
  // Loan operations
  getLoanApplications(memberId?: number, groupId?: number, status?: string): Promise<LoanApplication[]>;
  getLoanApplication(id: number): Promise<LoanApplication | undefined>;
  createLoanApplication(application: InsertLoanApplication): Promise<LoanApplication>;
  updateLoanApplication(id: number, application: Partial<LoanApplication>): Promise<LoanApplication>;
  
  // Loan repayment operations
  getLoanRepayments(loanId: number): Promise<LoanRepayment[]>;
  createLoanRepayment(repayment: Omit<LoanRepayment, 'id'>): Promise<LoanRepayment>;
  
  // Meeting operations
  getMeetings(groupId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  
  // Poll operations
  getPolls(groupId: number): Promise<Poll[]>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: number, poll: Partial<Poll>): Promise<Poll>;
  
  // SDG operations
  getSDGMappings(): Promise<SDGMapping[]>;
  createSDGMapping(mapping: InsertSDGMapping): Promise<SDGMapping>;
  getSDGImpacts(groupId: number): Promise<SDGImpact[]>;
  createSDGImpact(impact: Omit<SDGImpact, 'id'>): Promise<SDGImpact>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private roles: Map<number, Role> = new Map();
  private groups: Map<number, Group> = new Map();
  private members: Map<number, Member> = new Map();
  private savingDeposits: Map<number, SavingDeposit> = new Map();
  private loanApplications: Map<number, LoanApplication> = new Map();
  private loanRepayments: Map<number, LoanRepayment> = new Map();
  private meetings: Map<number, Meeting> = new Map();
  private polls: Map<number, Poll> = new Map();
  private sdgMappings: Map<number, SDGMapping> = new Map();
  private sdgImpacts: Map<number, SDGImpact> = new Map();
  
  private currentId = 1;

  constructor() {
    this.seedData();
  }

  private getNextId(): number {
    return this.currentId++;
  }

  private seedData() {
    // Seed roles
    const adminRole: Role = {
      id: this.getNextId(),
      name: "ADMIN",
      description: "System Administrator",
      permissions: ["all"],
      createdAt: new Date(),
    };
    
    const presidentRole: Role = {
      id: this.getNextId(),
      name: "PRESIDENT",
      description: "Group President",
      permissions: ["group_management", "meetings", "polls"],
      createdAt: new Date(),
    };
    
    const treasurerRole: Role = {
      id: this.getNextId(),
      name: "TREASURER",
      description: "Group Treasurer",
      permissions: ["loan_approval", "fund_management"],
      createdAt: new Date(),
    };
    
    const memberRole: Role = {
      id: this.getNextId(),
      name: "MEMBER",
      description: "Group Member",
      permissions: ["savings", "loans", "meetings_view"],
      createdAt: new Date(),
    };

    this.roles.set(adminRole.id, adminRole);
    this.roles.set(presidentRole.id, presidentRole);
    this.roles.set(treasurerRole.id, treasurerRole);
    this.roles.set(memberRole.id, memberRole);

    // Seed test group
    const testGroup: Group = {
      id: this.getNextId(),
      name: "Mahila Bachat Gat",
      description: "Women's savings group focused on financial empowerment",
      location: "Village Shanti Nagar, Karnataka",
      foundedDate: new Date("2022-01-15"),
      isActive: true,
      totalFund: "125000.00",
      createdAt: new Date(),
    };
    this.groups.set(testGroup.id, testGroup);

    // Seed test users and members
    const testUser: User = {
      id: this.getNextId(),
      username: "demo_admin",
      password: "password123", // In real app, this would be hashed
      email: "admin@example.com",
      createdAt: new Date(),
    };
    this.users.set(testUser.id, testUser);

    const testMember: Member = {
      id: this.getNextId(),
      userId: testUser.id,
      groupId: testGroup.id,
      roleId: adminRole.id,
      name: "Demo Admin",
      aadhaar: "1234-5678-9012",
      phone: "+91-9876543210",
      email: "admin@example.com",
      address: "123 Main Street, Demo City",
      gender: "Female",
      dateOfBirth: new Date("1985-06-15"),
      isApproved: true,
      joinedAt: new Date(),
    };
    this.members.set(testMember.id, testMember);

    // Seed SDG mappings
    const sdgMappingData = [
      { keywords: ["business", "entrepreneurship", "shop"], sdgGoal: 8, goalTitle: "Decent Work and Economic Growth" },
      { keywords: ["education", "school", "learning"], sdgGoal: 4, goalTitle: "Quality Education" },
      { keywords: ["agriculture", "farming", "crops"], sdgGoal: 2, goalTitle: "Zero Hunger" },
      { keywords: ["health", "medical", "healthcare"], sdgGoal: 3, goalTitle: "Good Health and Well-being" },
      { keywords: ["housing", "home", "shelter"], sdgGoal: 11, goalTitle: "Sustainable Cities and Communities" },
    ];

    sdgMappingData.forEach(data => {
      const mapping: SDGMapping = {
        id: this.getNextId(),
        keywords: data.keywords,
        sdgGoal: data.sdgGoal,
        goalTitle: data.goalTitle,
        createdAt: new Date(),
      };
      this.sdgMappings.set(mapping.id, mapping);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: this.getNextId(),
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  // Role operations
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: number): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    const role: Role = {
      ...insertRole,
      id: this.getNextId(),
      createdAt: new Date(),
    };
    this.roles.set(role.id, role);
    return role;
  }

  async updateRole(id: number, updateData: Partial<InsertRole>): Promise<Role> {
    const existing = this.roles.get(id);
    if (!existing) throw new Error("Role not found");
    
    const updated = { ...existing, ...updateData };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: number): Promise<void> {
    this.roles.delete(id);
  }

  // Group operations
  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async createGroup(insertGroup: InsertGroup): Promise<Group> {
    const group: Group = {
      ...insertGroup,
      id: this.getNextId(),
      isActive: true,
      totalFund: "0.00",
      createdAt: new Date(),
    };
    this.groups.set(group.id, group);
    return group;
  }

  async updateGroup(id: number, updateData: Partial<InsertGroup>): Promise<Group> {
    const existing = this.groups.get(id);
    if (!existing) throw new Error("Group not found");
    
    const updated = { ...existing, ...updateData };
    this.groups.set(id, updated);
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    this.groups.delete(id);
  }

  // Member operations
  async getMembers(groupId?: number): Promise<Member[]> {
    const members = Array.from(this.members.values());
    return groupId ? members.filter(m => m.groupId === groupId) : members;
  }

  async getMember(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }

  async getMemberByUserId(userId: number): Promise<Member | undefined> {
    return Array.from(this.members.values()).find(m => m.userId === userId);
  }

  async createMember(insertMember: InsertMember): Promise<Member> {
    const member: Member = {
      ...insertMember,
      id: this.getNextId(),
      isApproved: false,
      joinedAt: new Date(),
    };
    this.members.set(member.id, member);
    return member;
  }

  async updateMember(id: number, updateData: Partial<InsertMember>): Promise<Member> {
    const existing = this.members.get(id);
    if (!existing) throw new Error("Member not found");
    
    const updated = { ...existing, ...updateData };
    this.members.set(id, updated);
    return updated;
  }

  async deleteMember(id: number): Promise<void> {
    this.members.delete(id);
  }

  // Savings operations
  async getSavingDeposits(memberId?: number, groupId?: number): Promise<SavingDeposit[]> {
    let deposits = Array.from(this.savingDeposits.values());
    if (memberId) deposits = deposits.filter(d => d.memberId === memberId);
    if (groupId) deposits = deposits.filter(d => d.groupId === groupId);
    return deposits;
  }

  async getSavingDeposit(id: number): Promise<SavingDeposit | undefined> {
    return this.savingDeposits.get(id);
  }

  async createSavingDeposit(insertDeposit: InsertSavingDeposit): Promise<SavingDeposit> {
    const deposit: SavingDeposit = {
      ...insertDeposit,
      id: this.getNextId(),
      depositDate: new Date(),
      receiptNumber: `RCP-${Date.now()}`,
    };
    this.savingDeposits.set(deposit.id, deposit);
    return deposit;
  }

  // Loan operations
  async getLoanApplications(memberId?: number, groupId?: number, status?: string): Promise<LoanApplication[]> {
    let applications = Array.from(this.loanApplications.values());
    if (memberId) applications = applications.filter(a => a.memberId === memberId);
    if (groupId) applications = applications.filter(a => a.groupId === groupId);
    if (status) applications = applications.filter(a => a.status === status);
    return applications;
  }

  async getLoanApplication(id: number): Promise<LoanApplication | undefined> {
    return this.loanApplications.get(id);
  }

  async createLoanApplication(insertApplication: InsertLoanApplication): Promise<LoanApplication> {
    const application: LoanApplication = {
      ...insertApplication,
      id: this.getNextId(),
      status: "PENDING",
      appliedDate: new Date(),
      approvedDate: null,
      approvedBy: null,
      disbursedDate: null,
      disbursedBy: null,
    };
    this.loanApplications.set(application.id, application);
    return application;
  }

  async updateLoanApplication(id: number, updateData: Partial<LoanApplication>): Promise<LoanApplication> {
    const existing = this.loanApplications.get(id);
    if (!existing) throw new Error("Loan application not found");
    
    const updated = { ...existing, ...updateData };
    this.loanApplications.set(id, updated);
    return updated;
  }

  // Loan repayment operations
  async getLoanRepayments(loanId: number): Promise<LoanRepayment[]> {
    return Array.from(this.loanRepayments.values()).filter(r => r.loanId === loanId);
  }

  async createLoanRepayment(repayment: Omit<LoanRepayment, 'id'>): Promise<LoanRepayment> {
    const newRepayment: LoanRepayment = {
      ...repayment,
      id: this.getNextId(),
    };
    this.loanRepayments.set(newRepayment.id, newRepayment);
    return newRepayment;
  }

  // Meeting operations
  async getMeetings(groupId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(m => m.groupId === groupId);
  }

  async createMeeting(insertMeeting: InsertMeeting): Promise<Meeting> {
    const meeting: Meeting = {
      ...insertMeeting,
      id: this.getNextId(),
      attendees: [],
      createdAt: new Date(),
    };
    this.meetings.set(meeting.id, meeting);
    return meeting;
  }

  // Poll operations
  async getPolls(groupId: number): Promise<Poll[]> {
    return Array.from(this.polls.values()).filter(p => p.groupId === groupId);
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const poll: Poll = {
      ...insertPoll,
      id: this.getNextId(),
      votes: {},
      isActive: true,
      createdAt: new Date(),
      closedAt: null,
    };
    this.polls.set(poll.id, poll);
    return poll;
  }

  async updatePoll(id: number, updateData: Partial<Poll>): Promise<Poll> {
    const existing = this.polls.get(id);
    if (!existing) throw new Error("Poll not found");
    
    const updated = { ...existing, ...updateData };
    this.polls.set(id, updated);
    return updated;
  }

  // SDG operations
  async getSDGMappings(): Promise<SDGMapping[]> {
    return Array.from(this.sdgMappings.values());
  }

  async createSDGMapping(insertMapping: InsertSDGMapping): Promise<SDGMapping> {
    const mapping: SDGMapping = {
      ...insertMapping,
      id: this.getNextId(),
      createdAt: new Date(),
    };
    this.sdgMappings.set(mapping.id, mapping);
    return mapping;
  }

  async getSDGImpacts(groupId: number): Promise<SDGImpact[]> {
    return Array.from(this.sdgImpacts.values()).filter(i => i.groupId === groupId);
  }

  async createSDGImpact(impact: Omit<SDGImpact, 'id'>): Promise<SDGImpact> {
    const newImpact: SDGImpact = {
      ...impact,
      id: this.getNextId(),
    };
    this.sdgImpacts.set(newImpact.id, newImpact);
    return newImpact;
  }
}

export const storage = new MemStorage();
