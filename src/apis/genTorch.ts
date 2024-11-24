// src/utils/API/GenTorchy.ts
import apiClient from "./apiClient";

export const result = async (req_id: string) => {
  console.log("GenTorch result", req_id);
  return await apiClient(
    `${import.meta.env.VITE_GEN_TORCHY_URL}/result/${req_id}`,
    "GET",
    ""
  );
};
