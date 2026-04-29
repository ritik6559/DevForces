import axiosClient from "@/utils/axios-client";
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner";

export const useGetAllContests = () => {
    const query = useQuery({
        queryKey: ['contests'],
        queryFn: async () => {
            try {
                const res = await axiosClient.get("/contest");
                return res.data.data;
            } catch (e) {
                console.log(e);
                toast.error("Failed to fetch contests");
                return null;
            }
        },
        retry: 1
    });

    return query;
}