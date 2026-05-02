import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");

  async function handleRewrite(event) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Please enter text first.");
      setResult("");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

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

  return (
    <main className="container">
      <section className="card">
        <h1>LinkedIn Style Rewriter</h1>
        <p>Rewrite a casual sentence into a polished LinkedIn one-liner.</p>

        <form onSubmit={handleRewrite}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Example: finished a cool automation project and learned a lot"
            rows={7}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Rewriting..." : "Rewrite"}
          </button>
        </form>

        {error ? <div className="error">{error}</div> : null}
        {result ? <div className="result">{result}</div> : null}
      </section>
    </main>
  );
}
