import type { SubmitResponse } from "@/features/submission/types";

/**
 * Slide-over panel that visualizes a submission result: headline score, the
 * pass/fail tally, optional run error, and a per-test breakdown with messages.
 */
export const SubmitResultPanel = ({
  result,
  onClose,
}: {
  result: SubmitResponse;
  onClose: () => void;
}) => {
  const passed = result.status === "COMPLETED" && result.tests.failed === 0 && result.tests.total > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-md flex flex-col bg-zinc-950 border-l border-zinc-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Submission Result</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Score headline */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex items-baseline justify-between">
              <span
                className={`text-sm font-medium uppercase tracking-wide ${
                  passed ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.status === "FAILED" ? "Failed to run" : passed ? "All tests passed" : "Partial"}
              </span>
              <span className="text-2xl font-bold text-white">
                {result.score.total}
                <span className="text-zinc-500 text-base"> / {result.score.max}</span>
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full ${passed ? "bg-green-500" : "bg-blue-500"}`}
                style={{ width: `${Math.min(100, result.score.percentage)}%` }}
              />
            </div>
            <div className="mt-2 flex gap-4 text-xs text-zinc-400">
              <span>{result.tests.passed} passed</span>
              <span>{result.tests.failed} failed</span>
              <span>{result.tests.total} total</span>
              {result.leaderboard.rank != null && (
                <span className="ml-auto text-zinc-300">Rank #{result.leaderboard.rank}</span>
              )}
            </div>
          </div>

          {/* Run error (jest couldn't execute, missing tests, etc.) */}
          {result.error && (
            <pre className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300 whitespace-pre-wrap overflow-x-auto">
              {result.error}
            </pre>
          )}

          {/* Per-test breakdown */}
          <div className="space-y-2">
            {result.tests.results.map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                className="rounded-md border border-zinc-800 bg-zinc-900 p-3"
              >
                <div className="flex items-start gap-2">
                  <span className={t.status === "passed" ? "text-green-400" : "text-red-400"}>
                    {t.status === "passed" ? "✓" : "✕"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-200 break-words">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.duration_ms} ms</p>
                    {t.error && (
                      <pre className="mt-2 text-xs text-red-300 whitespace-pre-wrap overflow-x-auto">
                        {t.error}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
