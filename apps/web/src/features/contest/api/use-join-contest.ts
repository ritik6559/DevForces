import { axiosClient } from "@/utils/axios-client";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useJoinContest = (contestId: string) => {

    const mutation = useMutation({
        mutationKey: ["contest", "join", contestId],

        mutationFn: async () => {
            try {
                const response = await axiosClient.post(`/contest/${contestId}/join`);
                return response.data;
            } catch (error) {
                console.error("Error joining contest:", error);
                throw error;
            }
        },
        onSuccess: () => {
            toast.success("Contest joined successfully")
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error);
            const errorMessage = error?.response?.data?.message || "Failed to join contest";
            toast.error(errorMessage);
        },
    });

    return mutation;
}