import axiosClient from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query"

export const useGetTopPlayers = (contestId: string, count: number = 10) => {
    const query = useQuery({
        queryKey: ["leaderboard", "top-players"],

        queryFn: async () => {
            try {
                const response = await axiosClient.get(`/contests/${contestId}/leaderboard/?count=${count}`);
                return response.data;
            } catch (error) {
                console.error("Error fetching top players:", error);
                throw error;
            }
        }
    });

    return query;
}