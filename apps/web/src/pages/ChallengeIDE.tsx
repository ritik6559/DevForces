/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  PanelLeftClose, PanelLeftOpen, X, Lock, FileCode, FolderOpen,
  Play, Send, Sparkles, ChevronDown, ChevronRight,
  CheckCircle, XCircle, Loader2
} from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useChallenge, useSubmitCode, useUserSubmissions } from "@/hooks/useApi";
import { mockFileTree, mockTestResults } from "@/data/mockData";
import type { FileNode } from "@/data/types";
import ScoreGauge from "@/components/ScoreGauge";

const ChallengeIDE = () => {
  const { contestId, challengeId } = useParams<{ contestId: string; challengeId: string }>();
  const { data: challenge } = useChallenge(contestId!, challengeId!);
  const { data: submissions } = useUserSubmissions(challengeId!);
  const submitMutation = useSubmitCode();

  const [leftOpen, setLeftOpen] = useState(true);
  const [rightTab, setRightTab] = useState<"task" | "results" | "submissions">("task");
  const [files, setFiles] = useState<FileNode[]>(mockFileTree);
  const [activeFile, setActiveFile] = useState("src/index.ts");
  const [openTabs, setOpenTabs] = useState(["src/index.ts"]);
  const [fileContents, setFileContents] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    mockFileTree.forEach(f => { map[f.path] = f.content; });
    return map;
  });
  const [submissionState, setSubmissionState] = useState<"idle" | "pending" | "running" | "completed" | "failed">("idle");
  const [expandedTests, setExpandedTests] = useState<Record<number, boolean>>({});

  const currentFile = files.find(f => f.path === activeFile);
  const isLocked = currentFile?.locked ?? false;

  const openFile = useCallback((path: string) => {
    const f = files.find(f => f.path === path);
    if (f?.locked) return; // show lock tooltip but don't block for readOnly files
    setActiveFile(path);
    if (!openTabs.includes(path)) setOpenTabs([...openTabs, path]);
  }, [files, openTabs]);

  const closeTab = useCallback((path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = openTabs.filter(t => t !== path);
    setOpenTabs(next);
    if (activeFile === path) setActiveFile(next[next.length - 1] || "");
  }, [openTabs, activeFile]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && activeFile) {
      setFileContents(prev => ({ ...prev, [activeFile]: value }));
    }
  }, [activeFile]);

  const handleSubmit = async () => {
    setRightTab("results");
    setSubmissionState("pending");
    setTimeout(() => setSubmissionState("running"), 800);
    setTimeout(() => setSubmissionState("completed"), 3000);
  };

  const fileExt = activeFile.split(".").pop() || "ts";
  const langMap: Record<string, string> = { ts: "typescript", js: "javascript", json: "json" };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top bar */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-border bg-surface shrink-0">
        <div className="flex items-center gap-3">
          <Logo size="small" />
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs text-foreground font-medium truncate max-w-50">{challenge?.title || "Challenge"}</span>
        </div>
        <Link to={`/contests/${contestId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← Back to Contest
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANEL */}
        <AnimatePresence initial={false}>
          {leftOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-border bg-surface flex flex-col shrink-0 overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Explorer</span>
                <button onClick={() => setLeftOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-1">
                <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FolderOpen className="w-3.5 h-3.5" /> <span>solution</span>
                </div>
                {files.map(f => (
                  <button
                    key={f.path}
                    onClick={() => { setActiveFile(f.path); if (!openTabs.includes(f.path)) setOpenTabs([...openTabs, f.path]); }}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-2 text-xs transition-colors relative ${
                      activeFile === f.path ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    } ${f.locked ? "cursor-default" : ""}`}
                  >
                    {activeFile === f.path && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />}
                    <span className="pl-4 flex items-center gap-1.5">
                      {f.locked ? <Lock className="w-3 h-3 text-muted-foreground/50" /> : <FileCode className="w-3 h-3" />}
                      {f.path.split("/").pop()}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!leftOpen && (
          <button onClick={() => setLeftOpen(true)} className="border-r border-border bg-surface px-1 flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

        {/* CENTER PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tabs */}
          <div className="h-9 flex items-center bg-surface border-b border-border overflow-x-auto shrink-0">
            {openTabs.map(path => (
              <button
                key={path}
                onClick={() => setActiveFile(path)}
                className={`flex items-center gap-1.5 px-3 h-full text-xs shrink-0 border-r border-border transition-colors relative ${
                  activeFile === path ? "text-foreground bg-background" : "text-muted-foreground hover:text-foreground bg-surface"
                }`}
              >
                {activeFile === path && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                {files.find(f => f.path === path)?.locked && <Lock className="w-2.5 h-2.5 text-muted-foreground/50" />}
                {path.split("/").pop()}
                <span onClick={(e) => closeTab(path, e)} className="ml-1 hover:text-foreground">
                  <X className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            {isLocked && (
              <div className="absolute top-2 right-3 z-10 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded font-mono">
                Read Only
              </div>
            )}
            <Editor
              height="100%"
              language={langMap[fileExt] || "typescript"}
              value={fileContents[activeFile] || ""}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                readOnly: isLocked,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                padding: { top: 12 },
                renderLineHighlight: "gutter",
              }}
            />
          </div>

          {/* Status bar */}
          <div className="h-6 flex items-center justify-between px-3 bg-surface border-t border-border text-[11px] text-muted-foreground shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono">{activeFile}</span>
              <span>{langMap[fileExt] || "plaintext"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono">UTF-8</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-85 border-l border-border bg-surface flex flex-col shrink-0 overflow-hidden">
          {/* Right tabs */}
          <div className="flex border-b border-border shrink-0">
            {(["task", "results", "submissions"] as const).map(t => (
              <button
                key={t}
                onClick={() => setRightTab(t)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors border-b-2 ${
                  rightTab === t ? "text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {rightTab === "task" && challenge && (
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-bold text-foreground">{challenge.title}</h2>
                  <span className={`text-xs font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                    challenge.difficulty === "easy" ? "text-success bg-success/10" :
                    challenge.difficulty === "medium" ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10"
                  }`}>{challenge.difficulty}</span>
                </div>

                <div className="prose prose-sm prose-invert max-w-none text-sm text-muted-foreground leading-relaxed">
                  {challenge.description.split("\n").map((line, i) => {
                    if (line.startsWith("# ")) return <h3 key={i} className="text-foreground font-heading font-bold text-base mt-4 mb-2">{line.slice(2)}</h3>;
                    if (line.startsWith("## ")) return <h4 key={i} className="text-foreground font-heading font-semibold text-sm mt-3 mb-1">{line.slice(3)}</h4>;
                    if (line.startsWith("- ")) return <li key={i} className="text-muted-foreground ml-4">{line.slice(2)}</li>;
                    if (line.startsWith("```")) return <div key={i} className="my-1" />;
                    if (line.trim()) return <p key={i}>{line}</p>;
                    return <br key={i} />;
                  })}
                </div>

                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Allowed Packages</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {challenge.allowedPackages.map(pkg => (
                      <span key={pkg} className="font-mono text-xs bg-muted text-foreground px-2 py-1 rounded">{pkg}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {rightTab === "results" && (
              <div className="p-4">
                {submissionState === "idle" && (
                  <p className="text-sm text-muted-foreground text-center py-8">Submit your code to see results.</p>
                )}
                {submissionState === "pending" && (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground animate-pulse">Queued...</p>
                  </div>
                )}
                {submissionState === "running" && (
                  <div className="text-center py-8">
                    <p className="text-sm text-secondary mb-3">Running tests...</p>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mx-8">
                      <motion.div
                        className="h-full bg-secondary rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.2, ease: "linear" }}
                      />
                    </div>
                  </div>
                )}
                {submissionState === "completed" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                    <ScoreGauge score={72} max={100} />
                    <div className="flex justify-center gap-2 mb-6">
                      {[
                        { label: "Tests", value: "65/100" },
                        { label: "Quality", value: "80/100" },
                        { label: "Endpoints", value: "75/100" },
                      ].map(b => (
                        <span key={b.label} className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">
                          {b.label}: <span className="text-foreground">{b.value}</span>
                        </span>
                      ))}
                    </div>

                    <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Test Results</h4>
                    <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}>
                      {mockTestResults.map((t, i) => (
                        <motion.div
                          key={i}
                          variants={{ hidden: { opacity: 0, y: 6 }, visible: { opacity: 1, y: 0 } }}
                          className="border-b border-border last:border-0"
                        >
                          <button
                            onClick={() => t.error && setExpandedTests(p => ({ ...p, [i]: !p[i] }))}
                            className="w-full flex items-center gap-2 py-2 text-left"
                          >
                            {t.passed ? <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />}
                            <span className="text-xs text-foreground flex-1">{t.name}</span>
                            {t.error && (expandedTests[i] ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronRight className="w-3 h-3 text-muted-foreground" />)}
                          </button>
                          {t.error && expandedTests[i] && (
                            <div className="pl-6 pb-2">
                              <p className="text-xs font-mono text-destructive/80 bg-destructive/5 rounded p-2">{t.error}</p>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* AI Feedback */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="mt-6 border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-medium text-foreground">AI Mentor</span>
                      </div>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p className="bg-muted rounded p-2">✅ Great use of bcrypt for password hashing with proper salt rounds.</p>
                        <p className="bg-muted rounded p-2">⚠️ Missing input validation — add a check for missing fields before processing.</p>
                        <p className="bg-muted rounded p-2">💡 Set the Content-Type header explicitly with <code className="text-foreground">res.json()</code> instead of <code className="text-foreground">res.send()</code>.</p>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}

            {rightTab === "submissions" && (
              <div className="p-4">
                {submissions?.length ? (
                  <div className="space-y-1">
                    {submissions.map(s => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(s.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-mono text-sm text-primary">{s.score}</span>
                        <span className={`text-xs font-mono uppercase ${s.status === "completed" ? "text-success" : "text-muted-foreground"}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No submissions yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Bottom buttons */}
          {rightTab === "task" && (
            <div className="border-t border-border p-3 space-y-2 shrink-0">
              <Button variant="outline" className="w-full border-secondary/30 text-secondary hover:bg-secondary/10" disabled>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Run Tests
              </Button>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5 mr-1.5" /> Submit</>}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center">Max 1 submission per 30 seconds</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChallengeIDE;