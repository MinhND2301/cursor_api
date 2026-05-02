import { useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const MAX_CHARS = 4000;

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  async function handleRewrite() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter some text first.");
      setResult("");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setCopied(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.detail || "Rewrite failed.");
      }

      setResult(payload.linkedin_text || "");
    } catch (err) {
      setError(err?.message || "Unexpected error.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRewrite();
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const remaining = MAX_CHARS - text.length;
  const overLimit = remaining < 0;

  return (
    <main className="container">
      <div className="card">
        <header className="card-header">
          <h1>LinkedIn Style Rewriter</h1>
          <p>Turn a casual sentence into a polished LinkedIn one-liner.</p>
        </header>

        <div className="card-body">
          <div className={`textarea-wrapper ${overLimit ? "over-limit" : ""}`}>
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write casually… press Enter to rewrite, Shift+Enter for a new line."
              rows={6}
              disabled={loading}
            />
            <span className={`char-count ${remaining < 200 ? "warn" : ""} ${overLimit ? "over" : ""}`}>
              {overLimit ? `${Math.abs(remaining)} over limit` : `${remaining} remaining`}
            </span>
          </div>

          <button
            className="rewrite-btn"
            onClick={handleRewrite}
            disabled={loading || overLimit || !text.trim()}
          >
            {loading ? (
              <span className="spinner-row">
                <span className="spinner" />
                Rewriting…
              </span>
            ) : (
              "Rewrite"
            )}
          </button>

          {error && <div className="message error">{error}</div>}

          {result && (
            <div className="message result">
              <div className="result-text">{result}</div>
              <button className="copy-btn" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          )}
        </div>

        <footer className="card-footer">
          Press <kbd>Enter</kbd> to rewrite &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> for new line
        </footer>
      </div>
    </main>
  );
}
