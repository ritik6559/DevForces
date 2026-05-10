import { useMutation, useQueryClient } from "@tanstack/react-query"
import { axiosClient } from "@/utils/axios-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { CreateUserWithOtp } from "common-types"

export const useLoginUser = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (user: CreateUserWithOtp) => {
            const res = await axiosClient.post("/auth/login", user);
            return res.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            toast.success("Login successful")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error);
            const errorMessage = error?.response?.data?.message || "Failed to login user";
            toast.error(errorMessage);
        },
    });

    return mutation;
}