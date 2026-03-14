import axiosClient from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetContestById = (contestId: string) => {
    const query = useQuery({
        queryKey: ['contest', contestId],
        queryFn: async () => {
            try {
                const res = await axiosClient.get(`/contest/${contestId}`);
                return res.data.data;
            } catch (e) {
                console.log(e);
                toast.error("Failed to fetch contest");
                return null;
            }
        },
        retry: 1
    });

    return query;
}