import { useEffect, useMemo } from "react";
import Sidebar from "@/components/editor/SideBar";
import { Code } from "@/components/editor/Code";
import {
  File,
  buildFileTree,
  RemoteFile,
} from "@/utils/file-manager";
import { FileTree } from "@/components/editor/FileTree";
import { Socket } from "socket.io-client";

export const Editor = ({
  files,
  onSelect,
  selectedFile,
  socket,
}: {
  files: RemoteFile[];
  onSelect: (file: File) => void;
  selectedFile: File | undefined;
  socket: Socket | null;
}) => {
  const rootDir = useMemo(() => {
    return buildFileTree(files);
  }, [files]);

  useEffect(() => {
    if (!selectedFile && rootDir.files.length > 0) {
      onSelect(rootDir.files[0]);
    }
  }, [onSelect, rootDir.files, selectedFile]);

  return (
    <div className="h-full w-full overflow-hidden">
      <main className="flex h-full">
        <Sidebar>
          <FileTree
            rootDir={rootDir}
            selectedFile={selectedFile}
            onSelect={onSelect}
          />
        </Sidebar>

        <div className="flex-1 min-w-0 bg-zinc-900">
          {socket ? (
            <Code socket={socket} selectedFile={selectedFile} />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500">
              Connecting to editor...
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
