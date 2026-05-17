/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "@/components/Editor";
import { File, RemoteFile, Type } from "@/utils/file-manager";
import { useParams, useSearchParams } from "react-router-dom";
import { Output } from "@/components/Output";
import { TerminalComponent as Terminal } from "@/components/Terminal";
import { SocketEvents } from "common-types";
import { useCreateResources } from "@/features/challenge/api/use-create-resources";
import { toast } from "sonner";
import { useGetCurrentUser } from "@/features/auth/api/use-get-current-user";

function buildServiceName(
  contestId: string,
  challengeId: string,
  userId: string,
) {
  return `c${contestId}-ch${challengeId}-u${userId}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

function useSocket(serviceName: string, workDir: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!serviceName || !workDir) return;

    const newSocket = io(
      `ws://${serviceName}.devforces-out.ritik.fun`,
      {
        transports: ["websocket"],
        withCredentials: true,
        query: {
          workDir,
        },
      },
    );

    newSocket.on("connect", () => {
      console.log("Socket connected");
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

  const { data: user, isLoading: isUserLoading } =
    useGetCurrentUser();

  const { contestId, challengeId } = useParams<{
    contestId: string;
    challengeId: string;
  }>();

  const { mutateAsync: createResources, isPending } =
    useCreateResources();

  useEffect(() => {
    if (
      !contestId ||
      !challengeId ||
      isUserLoading ||
      !user?.userId
    ) {
      return;
    }

    const initializeResources = async () => {
      try {
        await createResources({
          contestId,
          challengeId,
          userId: user.userId,
        });

        setPodCreated(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize workspace");
      }
    };

    initializeResources();
  }, [
    contestId,
    challengeId,
    user,
    isUserLoading,
    createResources,
  ]);

  if (!podCreated || isPending) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Booting your environment...</p>
        </div>
      </div>
    );
  }

  return <CodingPagePostPodCreation />;
};

export const CodingPagePostPodCreation = () => {
  const [searchParams] = useSearchParams();

  const contestId = searchParams.get("contestId") ?? "";
  const challengeId = searchParams.get("challengeId") ?? "";

  const [loaded, setLoaded] = useState(false);

  const [fileStructure, setFileStructure] = useState<
    RemoteFile[]
  >([]);

  const [selectedFile, setSelectedFile] = useState<
    File | undefined
  >(undefined);

  const [showOutput, setShowOutput] = useState(false);

  const { data: user, isLoading: isUserLoading } =
    useGetCurrentUser() as {
      data: {
        userId: string;
        email: string;
        role: string;
      };
      isLoading: boolean;
    };

  const serviceName =
    user?.userId && contestId && challengeId
      ? buildServiceName(
          contestId,
          challengeId,
          user.userId,
        )
      : "";

  const workDir =
    user?.userId && contestId && challengeId
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
          const resolvedContent = await Promise.resolve(
            rootContent,
          );

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
        ({
          success,
          data,
        }: {
          success: boolean;
          data: RemoteFile[];
        }) => {
          if (!success) {
            toast.error("Failed to fetch directory");
            return;
          }

          setFileStructure((prev) => {
            const allFiles = [...prev, ...data];

            return allFiles.filter(
              (f, index, self) =>
                index ===
                self.findIndex(
                  (inner) => inner.path === f.path,
                ),
            );
          });
        },
      );
    } else {
      socket.emit(
        SocketEvents.FETCH_CONTENT,
        file.path,
        ({
          success,
          data,
        }: {
          success: boolean;
          data: string;
        }) => {
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

  if (!loaded || isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white font-medium">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-zinc-950 text-slate-200">
      <div className="flex justify-end p-2 border-b border-zinc-800">
        <button
          onClick={() => setShowOutput(!showOutput)}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded transition-colors"
        >
          {showOutput ? "Hide Output" : "See Output"}
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
    </div>
  );
};