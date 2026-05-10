import { orchestratorClient } from "@/utils/axios-client";
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useCreateResources = () => {

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async ({ contestId, challengeId, userId }: { contestId: string, challengeId: string, userId: string }) => {
            const response = await orchestratorClient.post("/k8s/start", { contestId, challengeId, userId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['challenges'] });
            toast.success("Workspace initiated successfully");
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.log(error.message);
            const errorMessage = error?.response?.data?.message || "Failed to initiate workspace";
            toast.error(errorMessage);
        },
    });

    return mutation;

}