import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema, insertRoleSchema, insertGroupSchema, insertMemberSchema,
  insertSavingDepositSchema, insertLoanApplicationSchema, insertMeetingSchema,
  insertPollSchema, insertSDGMappingSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const member = await storage.getMemberByUserId(user.id);
      const role = member ? await storage.getRole(member.roleId!) : null;
      
      res.json({
        user: { id: user.id, username: user.username, email: user.email },
        member,
        role: role?.name || "MEMBER"
      });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Role routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.get("/api/roles/:id", async (req, res) => {
    try {
      const role = await storage.getRole(parseInt(req.params.id));
      if (!role) return res.status(404).json({ error: "Role not found" });
      res.json(role);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch role" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const roleData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(roleData);
      res.status(201).json(role);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid role data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create role" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const roleData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(parseInt(req.params.id), roleData);
      res.json(role);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid role data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      await storage.deleteRole(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // Group routes
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const group = await storage.getGroup(parseInt(req.params.id));
      if (!group) return res.status(404).json({ error: "Group not found" });
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(groupData);
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid group data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.put("/api/groups/:id", async (req, res) => {
    try {
      const groupData = insertGroupSchema.partial().parse(req.body);
      const group = await storage.updateGroup(parseInt(req.params.id), groupData);
      res.json(group);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid group data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update group" });
    }
  });

  app.delete("/api/groups/:id", async (req, res) => {
    try {
      await storage.deleteGroup(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete group" });
    }
  });

  // Member routes
  app.get("/api/members", async (req, res) => {
    try {
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const members = await storage.getMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch members" });
    }
  });

  app.get("/api/members/:id", async (req, res) => {
    try {
      const member = await storage.getMember(parseInt(req.params.id));
      if (!member) return res.status(404).json({ error: "Member not found" });
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch member" });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const memberData = insertMemberSchema.parse(req.body);
      const member = await storage.createMember(memberData);
      res.status(201).json(member);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create member" });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    try {
      const memberData = insertMemberSchema.partial().parse(req.body);
      const member = await storage.updateMember(parseInt(req.params.id), memberData);
      res.json(member);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid member data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      await storage.deleteMember(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete member" });
    }
  });

  // Savings routes
  app.get("/api/savings", async (req, res) => {
    try {
      const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const deposits = await storage.getSavingDeposits(memberId, groupId);
      res.json(deposits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch savings" });
    }
  });

  app.post("/api/savings", async (req, res) => {
    try {
      const depositData = insertSavingDepositSchema.parse(req.body);
      const deposit = await storage.createSavingDeposit(depositData);
      res.status(201).json(deposit);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid deposit data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create deposit" });
    }
  });

  // Loan routes
  app.get("/api/loans", async (req, res) => {
    try {
      const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const status = req.query.status as string;
      const loans = await storage.getLoanApplications(memberId, groupId, status);
      res.json(loans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loans" });
    }
  });

  app.get("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.getLoanApplication(parseInt(req.params.id));
      if (!loan) return res.status(404).json({ error: "Loan not found" });
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch loan" });
    }
  });

  app.post("/api/loans", async (req, res) => {
    try {
      const loanData = insertLoanApplicationSchema.parse(req.body);
      const loan = await storage.createLoanApplication(loanData);
      res.status(201).json(loan);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid loan data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create loan application" });
    }
  });

  app.put("/api/loans/:id", async (req, res) => {
    try {
      const loan = await storage.updateLoanApplication(parseInt(req.params.id), req.body);
      res.json(loan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update loan application" });
    }
  });

  // Meeting routes
  app.get("/api/meetings", async (req, res) => {
    try {
      const groupId = parseInt(req.query.groupId as string);
      const meetings = await storage.getMeetings(groupId);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  app.post("/api/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const meeting = await storage.createMeeting(meetingData);
      res.status(201).json(meeting);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid meeting data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create meeting" });
    }
  });

  // Poll routes
  app.get("/api/polls", async (req, res) => {
    try {
      const groupId = parseInt(req.query.groupId as string);
      const polls = await storage.getPolls(groupId);
      res.json(polls);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      const pollData = insertPollSchema.parse(req.body);
      const poll = await storage.createPoll(pollData);
      res.status(201).json(poll);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid poll data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create poll" });
    }
  });

  app.put("/api/polls/:id", async (req, res) => {
    try {
      const poll = await storage.updatePoll(parseInt(req.params.id), req.body);
      res.json(poll);
    } catch (error) {
      res.status(500).json({ error: "Failed to update poll" });
    }
  });

  // SDG routes
  app.get("/api/sdg/mappings", async (req, res) => {
    try {
      const mappings = await storage.getSDGMappings();
      res.json(mappings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SDG mappings" });
    }
  });

  app.post("/api/sdg/mappings", async (req, res) => {
    try {
      const mappingData = insertSDGMappingSchema.parse(req.body);
      const mapping = await storage.createSDGMapping(mappingData);
      res.status(201).json(mapping);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Invalid SDG mapping data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create SDG mapping" });
    }
  });

  app.get("/api/sdg/impact/:groupId", async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const impacts = await storage.getSDGImpacts(groupId);
      res.json(impacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SDG impacts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
