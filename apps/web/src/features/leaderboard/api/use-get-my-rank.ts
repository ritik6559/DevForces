import axiosClient from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query";

export const useGetMyRank = (contestId: string) => {
    const query = useQuery({
        queryKey: ["leaderboard", "my-rank"],

        queryFn: async () => {
            try {
                const response = await axiosClient.get(`/contests/${contestId}/leaderboard/me`);
                return response.data;
            } catch (error) {
                console.error("Error fetching my rank:", error);
                throw error;
            }
        }
    });

    return query;
}