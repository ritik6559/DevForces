import axiosClient from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query";

export const useGetChallengesByContest = (contestId: string) => {
    const query = useQuery({
        queryKey: ['contest-challenges', contestId],
        queryFn: async () => {
            const res = await axiosClient.get(`/challenge/contest/${contestId}`);
            return res.data.data;
        },
        enabled: !!contestId,
    });

    return query;
}