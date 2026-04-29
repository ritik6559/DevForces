/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo } from "react";
import Editor from "@monaco-editor/react";
import { File } from "@/utils/file-manager";
import { Socket } from "socket.io-client";

export const Code = ({
  selectedFile,
  socket,
}: {
  selectedFile: File | undefined;
  socket: Socket | null;
}) => {
  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-900">
        Select a file to view code
      </div>
    );
  }

  const language = useMemo(() => {
    const ext = selectedFile.name.split(".").pop();
    switch (ext) {
      case "js":
      case "jsx":
        return "javascript";
      case "ts":
      case "tsx":
        return "typescript";
      case "py":
        return "python";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      default:
        return "plaintext";
    }
  }, [selectedFile.name]);

  const debouncedUpdate = useMemo(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (value: string | undefined) => {
      if (timeout) clearTimeout(timeout);
      if (!value || !socket) return;

      timeout = setTimeout(() => {
        socket.emit("updateContent", {
          path: selectedFile.path,
          content: value,
        });
      }, 500);
    };
  }, [selectedFile.path, socket]);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%" 
        language={language}
        value={selectedFile.content || ""}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
        onChange={(value) => debouncedUpdate(value)}
      />
    </div>
  );
};