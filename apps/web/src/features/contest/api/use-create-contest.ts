import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { CreateContest } from "../types"
import axiosClient from "@/utils/axios-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useCreateContest = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (contest: CreateContest) => {
            const res = await axiosClient.post("/contest", contest);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contests'] });
            toast.success("Contest created successfully")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error);
            const errorMessage = error?.response?.data?.message || "Failed to create contest";
            toast.error(errorMessage);
        },
    });

    return mutation;
}