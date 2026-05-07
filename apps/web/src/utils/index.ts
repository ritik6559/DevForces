import React from 'react'
import { buildFileTree, Directory } from "./file-manager";

export const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}


export const useFilesFromSandbox = (id: string, callback: (dir: Directory) => void) => {
    React.useEffect(() => {
        fetch('https://codesandbox.io/api/v1/sandboxes/' + id)
            .then(response => response.json())
            .then(({ data }) => {
                const rootDir = buildFileTree(data);
                callback(rootDir)
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

export const colors = {
    EASY: "text-success bg-success/10",
    MEDIUM: "text-warning bg-warning/10",
    HARD: "text-destructive bg-destructive/10",
};

export const podiumStyles = [
    {
        height: "h-28",
        label: "🥇",
        color: "border-primary",
    },
    {
        height: "h-20",
        label: "🥈",
        color: "border-muted-foreground/40",
    },
    {
        height: "h-16",
        label: "🥉",
        color: "border-warning/60",
    },
];