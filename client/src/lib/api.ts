import { apiRequest } from "./queryClient";
import type {
  User, Role, Group, Member, SavingDeposit, LoanApplication, Meeting, Poll, SDGMapping, SDGImpact,
  InsertUser, InsertRole, InsertGroup, InsertMember, InsertSavingDeposit, InsertLoanApplication,
  InsertMeeting, InsertPoll, InsertSDGMapping
} from "@shared/schema";

export class APIService {
  // Authentication
  static async login(username: string, password: string) {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    return response.json();
  }

  // Users
  static async getUser(id: number): Promise<User> {
    const response = await apiRequest("GET", `/api/users/${id}`);
    return response.json();
  }

  static async createUser(userData: InsertUser): Promise<User> {
    const response = await apiRequest("POST", "/api/users", userData);
    return response.json();
  }

  // Roles
  static async getRoles(): Promise<Role[]> {
    const response = await apiRequest("GET", "/api/roles");
    return response.json();
  }

  static async getRole(id: number): Promise<Role> {
    const response = await apiRequest("GET", `/api/roles/${id}`);
    return response.json();
  }

  static async createRole(roleData: InsertRole): Promise<Role> {
    const response = await apiRequest("POST", "/api/roles", roleData);
    return response.json();
  }

  static async updateRole(id: number, roleData: Partial<InsertRole>): Promise<Role> {
    const response = await apiRequest("PUT", `/api/roles/${id}`, roleData);
    return response.json();
  }

  static async deleteRole(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/roles/${id}`);
  }

  // Groups
  static async getGroups(): Promise<Group[]> {
    const response = await apiRequest("GET", "/api/groups");
    return response.json();
  }

  static async getGroup(id: number): Promise<Group> {
    const response = await apiRequest("GET", `/api/groups/${id}`);
    return response.json();
  }

  static async createGroup(groupData: InsertGroup): Promise<Group> {
    const response = await apiRequest("POST", "/api/groups", groupData);
    return response.json();
  }

  static async updateGroup(id: number, groupData: Partial<InsertGroup>): Promise<Group> {
    const response = await apiRequest("PUT", `/api/groups/${id}`, groupData);
    return response.json();
  }

  static async deleteGroup(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/groups/${id}`);
  }

  // Members
  static async getMembers(groupId?: number): Promise<Member[]> {
    const url = groupId ? `/api/members?groupId=${groupId}` : "/api/members";
    const response = await apiRequest("GET", url);
    return response.json();
  }

  static async getMember(id: number): Promise<Member> {
    const response = await apiRequest("GET", `/api/members/${id}`);
    return response.json();
  }

  static async createMember(memberData: InsertMember): Promise<Member> {
    const response = await apiRequest("POST", "/api/members", memberData);
    return response.json();
  }

  static async updateMember(id: number, memberData: Partial<InsertMember>): Promise<Member> {
    const response = await apiRequest("PUT", `/api/members/${id}`, memberData);
    return response.json();
  }

  static async deleteMember(id: number): Promise<void> {
    await apiRequest("DELETE", `/api/members/${id}`);
  }

  // Savings
  static async getSavingDeposits(memberId?: number, groupId?: number): Promise<SavingDeposit[]> {
    const params = new URLSearchParams();
    if (memberId) params.append("memberId", memberId.toString());
    if (groupId) params.append("groupId", groupId.toString());
    
    const url = `/api/savings${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  }

  static async createSavingDeposit(depositData: InsertSavingDeposit): Promise<SavingDeposit> {
    const response = await apiRequest("POST", "/api/savings", depositData);
    return response.json();
  }

  // Loans
  static async getLoanApplications(memberId?: number, groupId?: number, status?: string): Promise<LoanApplication[]> {
    const params = new URLSearchParams();
    if (memberId) params.append("memberId", memberId.toString());
    if (groupId) params.append("groupId", groupId.toString());
    if (status) params.append("status", status);
    
    const url = `/api/loans${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  }

  static async getLoanApplication(id: number): Promise<LoanApplication> {
    const response = await apiRequest("GET", `/api/loans/${id}`);
    return response.json();
  }

  static async createLoanApplication(loanData: InsertLoanApplication): Promise<LoanApplication> {
    const response = await apiRequest("POST", "/api/loans", loanData);
    return response.json();
  }

  static async updateLoanApplication(id: number, loanData: Partial<LoanApplication>): Promise<LoanApplication> {
    const response = await apiRequest("PUT", `/api/loans/${id}`, loanData);
    return response.json();
  }

  // Meetings
  static async getMeetings(groupId: number): Promise<Meeting[]> {
    const response = await apiRequest("GET", `/api/meetings?groupId=${groupId}`);
    return response.json();
  }

  static async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const response = await apiRequest("POST", "/api/meetings", meetingData);
    return response.json();
  }

  // Polls
  static async getPolls(groupId: number): Promise<Poll[]> {
    const response = await apiRequest("GET", `/api/polls?groupId=${groupId}`);
    return response.json();
  }

  static async createPoll(pollData: InsertPoll): Promise<Poll> {
    const response = await apiRequest("POST", "/api/polls", pollData);
    return response.json();
  }

  static async updatePoll(id: number, pollData: Partial<Poll>): Promise<Poll> {
    const response = await apiRequest("PUT", `/api/polls/${id}`, pollData);
    return response.json();
  }

  // SDG
  static async getSDGMappings(): Promise<SDGMapping[]> {
    const response = await apiRequest("GET", "/api/sdg/mappings");
    return response.json();
  }

  static async createSDGMapping(mappingData: InsertSDGMapping): Promise<SDGMapping> {
    const response = await apiRequest("POST", "/api/sdg/mappings", mappingData);
    return response.json();
  }

  static async getSDGImpacts(groupId: number): Promise<SDGImpact[]> {
    const response = await apiRequest("GET", `/api/sdg/impact/${groupId}`);
    return response.json();
  }
}
export { APIService as apiService };
