/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "@/components/Editor";
import { File, RemoteFile, Type } from "@/utils/file-manager";
import { useParams } from "react-router-dom";
import { Output } from "@/components/Output";
import { TerminalComponent as Terminal } from "@/components/Terminal";
import { SocketEvents } from "common-types";
import { useCreateResources } from "@/features/challenge/api/use-create-resources";
import { toast } from "sonner";
import { useGetCurrentUser } from "@/features/auth/api/use-get-current-user";
import { useSubmit } from "@/features/submission/api/use-submit";
import { SubmitResultPanel } from "@/components/SubmitResultPanel";
import type { SubmitResponse } from "@/features/submission/types";
import { orchestratorClient } from "@/utils/axios-client";

const HEARTBEAT_INTERVAL_MS = 60_000;

type PodStatus = "idle" | "creating" | "waiting" | "ready" | "error";

// inside CodingPage:

function short(id: string): string {
  return id.replace(/-/g, "").slice(0, 8);
}

function buildServiceName(
  contestId: string,
  challengeId: string,
  userId: string,
) {
  return `c${short(contestId)}-ch${short(challengeId)}-u${short(userId)}`;
}

async function waitForPodReady(
  serviceName: string,
  workDir: string,
  maxAttempts = 20,
  intervalMs = 3000,
): Promise<void> {
  const encoded = encodeURIComponent(workDir);
  const url = `http://${serviceName}.devforces-out.ritik.fun/socket.io/?workDir=${encoded}&EIO=4&transport=polling`;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url, { method: "GET" });
      // 200 = server up, 400 = socket.io complaining about missing sid (server still up)
      if (res.ok || res.status === 400) {
        return;
      }
    } catch {
      // network error / pod not ready yet — keep waiting
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error("Pod did not become ready in time");
}

function useSocket(serviceName: string, workDir: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!serviceName || !workDir) {
      console.log("Socket skipped — missing serviceName or workDir", {
        serviceName,
        workDir,
      });
      return;
    }

    console.log("Initializing socket", { serviceName, workDir });

    const newSocket = io(`http://${serviceName}.devforces-out.ritik.fun`, {
      query: { workDir },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error", err);
      toast.error("Failed to connect to workspace");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected", reason);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [serviceName, workDir]);

  return socket;
}

export const CodingPage = () => {
  const [podCreated, setPodCreated] = useState(false);

  const [podStatus, setPodStatus] = useState<PodStatus>("idle");

  const { data: user, isLoading: isUserLoading } = useGetCurrentUser();

  const { contestId, challengeId } = useParams<{
    contestId: string;
    challengeId: string;
  }>();

  const { mutateAsync: createResources } = useCreateResources();

  useEffect(() => {
    if (!contestId || !challengeId || isUserLoading || !user?.userId) {
      return;
    }

    const initializeResources = async () => {
      try {
        setPodStatus("creating");

        console.log("Creating resources", {
          contestId,
          challengeId,
          userId: user.userId,
        });

        await createResources({
          contestId,
          challengeId,
          userId: user.userId,
        });

        const svcName = buildServiceName(contestId, challengeId, user.userId);
        const wd = `${contestId}/${challengeId}/${user.userId}`;

        setPodStatus("waiting");

        console.log("Waiting for pod to be ready...", { svcName, wd });

        await waitForPodReady(svcName, wd);

        console.log("Pod is ready");

        setPodCreated(true);
        setPodStatus("ready");
      } catch (err) {
        console.error(err);
        setPodStatus("error");
        toast.error("Failed to initialize workspace");
      }
    };

    initializeResources();
  }, [contestId, challengeId, user, isUserLoading, createResources]);

  if (!podCreated || !user) {
    return <PodBootingScreen status={podStatus} />;
  }

  return <CodingPagePostPodCreation user={user} />;
};

function PodBootingScreen({
  status,
}: {
  status: "idle" | "creating" | "waiting" | "ready" | "error";
}) {
  const messages: Record<PodStatus, string> = {
    idle: "Preparing...",
    creating: "Provisioning your workspace...",
    waiting: "Starting your environment (this may take up to 60s)...",
    ready: "Ready!",
    error: "Something went wrong. Please refresh and try again.",
  };

  const isError = status === "error";

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white font-medium">
      <div className="flex flex-col items-center gap-4">
        {isError ? (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white text-xl font-bold">
            !
          </div>
        ) : (
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )}

        <p className={isError ? "text-red-400" : "text-white"}>
          {messages[status]}
        </p>

        {status === "waiting" && (
          <p className="text-zinc-400 text-sm">
            Pulling your saved files from S3 and booting the runner pod...
          </p>
        )}
      </div>
    </div>
  );
}

export const CodingPagePostPodCreation = ({
  user,
}: {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}) => {
  const { contestId, challengeId } = useParams<{
    contestId: string;
    challengeId: string;
  }>();

  const [loaded, setLoaded] = useState(false);
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResponse | null>(null);

  const submitMutation = useSubmit();

  const handleSubmit = async () => {
    if (!contestId || !challengeId) return;
    try {
      const result = await submitMutation.mutateAsync({ contestId, challengeId });
      setSubmitResult(result);
    } catch {
      // error toast is handled inside the hook
    }
  };

  // Keep the workspace alive while the IDE is open so the inactivity watcher
  // (orchestrator) does not reap it — even when the user is only reading.
  useEffect(() => {
    if (!contestId || !challengeId) return;

    const ping = () => {
      orchestratorClient
        .post(`/contests/${contestId}/challenges/${challengeId}/heartbeat`)
        .catch(() => { /* best-effort keep-alive */ });
    };

    ping();
    const intervalId = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [contestId, challengeId]);

  const serviceName =
    contestId && challengeId
      ? buildServiceName(contestId, challengeId, user.userId)
      : "";

  const workDir =
    contestId && challengeId
      ? `${contestId}/${challengeId}/${user.userId}`
      : "";

  const socket = useSocket(serviceName, workDir);

  useEffect(() => {
    if (!socket) return;

    socket.on(
      SocketEvents.LOADED,
      async ({
        rootContent,
      }: {
        rootContent: RemoteFile[] | Promise<RemoteFile[]>;
      }) => {
        try {
          const resolvedContent = await Promise.resolve(rootContent);

          console.log("Workspace loaded", resolvedContent);

          setFileStructure(resolvedContent);
          setLoaded(true);
        } catch (err) {
          console.error(err);
          toast.error("Failed to load workspace");
        }
      },
    );

    return () => {
      socket.off(SocketEvents.LOADED);
    };
  }, [socket]);

  const onSelect = (file: File) => {
    if (!socket) return;

    if (file.type === Type.DIRECTORY) {
      socket.emit(
        SocketEvents.FETCH_DIR,
        file.path,
        ({ success, data }: { success: boolean; data: RemoteFile[] }) => {
          if (!success) {
            toast.error("Failed to fetch directory");
            return;
          }

          setFileStructure((prev) => {
            const allFiles = [...prev, ...data];
            return allFiles.filter(
              (f, index, self) =>
                index === self.findIndex((inner) => inner.path === f.path),
            );
          });
        },
      );
    } else {
      socket.emit(
        SocketEvents.FETCH_CONTENT,
        file.path,
        ({ success, data }: { success: boolean; data: string }) => {
          if (!success) {
            toast.error("Failed to fetch file");
            return;
          }

          file.content = data;
          setSelectedFile(file);
        },
      );
    }
  };

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p>Loading workspace files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-zinc-950 text-slate-200">
      <div className="flex justify-end gap-2 p-2 border-b border-zinc-800">
        <button
          onClick={() => setShowOutput(!showOutput)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
        >
          {showOutput ? "Hide Output" : "See Output"}
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="px-4 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 w-3/5 border-r border-zinc-800 overflow-hidden">
          <Editor
            socket={socket}
            selectedFile={selectedFile}
            onSelect={onSelect}
            files={fileStructure}
          />
        </div>

        <div className="flex-1 w-2/5 flex flex-col overflow-hidden bg-black">
          {showOutput && (
            <div className="flex-1 border-b border-zinc-800 overflow-auto">
              <Output />
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <Terminal socket={socket!} />
          </div>
        </div>
      </div>

      {submitResult && (
        <SubmitResultPanel
          result={submitResult}
          onClose={() => setSubmitResult(null)}
        />
      )}
    </div>
  );
};
