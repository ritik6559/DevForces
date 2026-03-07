import { useMutation } from "@tanstack/react-query"
import axiosClient from "@/utils/axios-client";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { SendOtp } from "common-types"

export const useSendOTP = () => {

    const mutation = useMutation({
        mutationFn: async (user: SendOtp) => {
            const res = await axiosClient.post("/auth/send-otp", user);
            return res.data.data;
        },
        onSuccess: () => {
            toast.success("OTP sent successfully")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error);
            const errorMessage = error?.response?.data?.message || "Failed to send OTP.";
            toast.error(errorMessage);
        },
    });

    return mutation;
}