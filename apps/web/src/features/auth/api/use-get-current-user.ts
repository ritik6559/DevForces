import axiosClient from '@/utils/axios-client'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner';

export const useGetCurrentUser = () => {
    const query = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try{
                const res = await axiosClient.get("/auth/me");
                return res.data.data;
            } catch (e) {
                console.log(e);
                toast.error("Failed to fetch user");
                return null;
            }
        },
        retry: 1
    });

    return query;
}