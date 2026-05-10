import { axiosClient } from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query"

export const useGetAllChallenges = () => {
    const query = useQuery({
        queryKey: ['challenges'],
        queryFn: async () => {
            const res = await axiosClient.get("/challenge");
            return res.data.data;
        },
        retry: 1
    });

    return query;
}