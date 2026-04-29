/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { Editor } from "@/components/Editor";
import { File, RemoteFile, Type } from "@/utils/file-manager";
import { useSearchParams } from "react-router-dom";
import { Output } from "@/components/Output";
import { TerminalComponent as Terminal } from "@/components/Terminal";
import { SocketEvents } from "common-types";
import { useCreateResources } from "@/features/challenge/api/use-create-resources";
import { toast } from "sonner";

function useSocket(replId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io(`ws://${replId}.devforces-code.com`);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [replId]);

  return socket;
}

export const CodingPage = () => {
  const [podCreated, setPodCreated] = useState(false);
  const [searchParams] = useSearchParams();

  const contestId = searchParams.get("contestId") ?? "";
  const challengeId = searchParams.get("challengeId") ?? "";

  const { mutateAsync: createResources, isPending } = useCreateResources();

  useEffect(() => {
    const initializeResources = async () => {
      if (!contestId || !challengeId) {
        toast.error("Challenge ID or Contest Id not provided");
        return;
      }

      try {
        await createResources({ contestId, challengeId });
        setPodCreated(true);
      } catch (err) {
        console.error(err);
        toast.error("Failed to initialize workspace");
      }
    };

    initializeResources();
  }, [contestId, challengeId, createResources]);

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
  const [fileStructure, setFileStructure] = useState<RemoteFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  const socket = useSocket(contestId + challengeId);

  useEffect(() => {
    if (socket) {
      socket.on(
        SocketEvents.LOADED,
        ({ rootContent }: { rootContent: RemoteFile[] }) => {
          setLoaded(true);
          setFileStructure(rootContent);
        },
      );
    }
  }, [socket]);

  const onSelect = (file: File) => {
    if (file.type === Type.DIRECTORY) {
      socket?.emit(SocketEvents.FETCH_DIR, file.path, (data: RemoteFile[]) => {
        setFileStructure((prev) => {
          const allFiles = [...prev, ...data];
          // De-duplicate files by path
          return allFiles.filter(
            (f, index, self) =>
              index === self.findIndex((inner) => inner.path === f.path),
          );
        });
      });
    } else {
      socket?.emit(
        SocketEvents.FETCH_CONTENT,
        { path: file.path },
        (data: string) => {
          file.content = data;
          setSelectedFile(file);
        },
      );
    }
  };

  if (!loaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-900 text-white font-medium">
        Loading Workspace...
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
