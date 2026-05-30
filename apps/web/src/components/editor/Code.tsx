import { useEffect, useMemo, useRef } from "react";
import Editor from "@monaco-editor/react";
import { File } from "@/utils/file-manager";
import { Socket } from "socket.io-client";
import {
  SocketEvents,
  createContentPatch,
  hashContent,
  type UpdateContentAck,
} from "common-types";

// How long to wait after the last keystroke before computing a diff and
// uploading it. Adjust here to tune how "chatty" the S3 sync is.
const DEBOUNCE_DELAY_MS = 1000;

const languageFor = (name: string | undefined): string => {
  const ext = name?.split(".").pop();
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
};

export const Code = ({
  selectedFile,
  socket,
}: {
  selectedFile: File | undefined;
  socket: Socket | null;
}) => {
  // Last content we successfully synced to the server for the active file.
  // Diffs are always computed against this so we only send what changed.
  const baseContentRef = useRef<string>(selectedFile?.content ?? "");

  // Pending debounce timer for the diff upload. Held in a ref so it survives
  // re-renders and can be cleared on unmount.
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Reset the diff base whenever a different file becomes active.
  useEffect(() => {
    baseContentRef.current = selectedFile?.content ?? "";
  }, [selectedFile?.path, selectedFile?.content]);

  const language = useMemo(
    () => languageFor(selectedFile?.name),
    [selectedFile?.name],
  );

  const sendPatch = useMemo(() => {
    const emit = (path: string, from: string, to: string, attempt: number) => {
      const patch = createContentPatch(path, from, to);

      socket!.emit(
        SocketEvents.UPDATE_CONTENT,
        {
          path,
          patch,
          baseHash: hashContent(from),
          newHash: hashContent(to),
        },
        (ack: UpdateContentAck) => {
          if (ack?.success) {
            baseContentRef.current = to;
            return;
          }

          // Server copy drifted (or the patch failed). Rebase on the server's
          // current content and retry once so the edit isn't lost.
          if (ack?.resync && typeof ack.content === "string" && attempt < 1) {
            baseContentRef.current = ack.content;
            if (ack.content !== to) {
              emit(path, ack.content, to, attempt + 1);
            }
          }
        },
      );
    };

    return (value: string | undefined) => {
      // Cancel any upload still waiting from a previous keystroke.
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (value == null || !socket || !selectedFile) return;

      const path = selectedFile.path;
      debounceTimerRef.current = setTimeout(() => {
        const base = baseContentRef.current;
        if (value === base) return; // nothing changed since the last sync
        emit(path, base, value, 0);
      }, DEBOUNCE_DELAY_MS);
    };
  }, [selectedFile?.path, socket]);

  // Clear any pending debounced upload when the component unmounts so we don't
  // fire a stale diff after the editor is gone.
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  if (!selectedFile) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500 bg-zinc-900">
        Select a file to view code
      </div>
    );
  }

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
        onChange={(value) => sendPatch(value)}
      />
    </div>
  );
};
