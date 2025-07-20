import axios from "@/hooks/axios";
import { SavingDepositRequest } from "@/types/saving";

export const fetchMyDeposits = async () => {
  const res = await axios.get("/saving-deposits/me/track");
  return res.data;
};

export const depositSaving = async (data: SavingDepositRequest) => {
  return axios.post("/saving-deposits", data);
};

export const fetchGroupDeposits = async () => {
  const res = await axios.get("/saving-deposits/group");
  return res.data;
};

export const fetchGroupSummary = async () => {
  const res = await axios.get("/saving-deposits/group/summary");
  return res.data;
};