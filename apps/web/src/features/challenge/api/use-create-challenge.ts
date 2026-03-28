import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CreateChallenge } from "../types"
import axiosClient from "@/utils/axios-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useCreateChallenge = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (challenge: CreateChallenge) => {
            const res = await axiosClient.post("/challenge", challenge);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            toast.success("Challenge created successfully")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error);
            const errorMessage = error?.response?.data?.message || "Failed to create challenge";
            toast.error(errorMessage);
        },
    });

    return mutation;
}