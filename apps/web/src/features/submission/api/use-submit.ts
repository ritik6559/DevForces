import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { axiosClient } from "@/utils/axios-client";
import type { SubmitResponse } from "../types";

/**
 * Submits the current workspace for judging.
 *
 * The backend returns the SubmitResponse body directly (HTTP 200) — including
 * the case where judging itself failed (`status: "FAILED"`). Guard outcomes
 * (contest not active, no workspace, already submitting) come back as 4xx with
 * `{ error, message }`, surfaced here as a toast.
 */
export const useSubmit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contestId,
      challengeId,
    }: {
      contestId: string;
      challengeId: string;
    }): Promise<SubmitResponse> => {
      const res = await axiosClient.post("/submit", { contestId, challengeId });
      return res.data as SubmitResponse;
    },
    onSuccess: () => {
      // Score may have changed — refresh leaderboard views.
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (error: AxiosError<{ error?: string; message?: string }>) => {
      const message = error?.response?.data?.message || "Submission failed. Please try again.";
      toast.error(message);
    },
  });
};
