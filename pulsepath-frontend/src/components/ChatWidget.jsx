import { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";

const PULSE_PATH = "M0,12 L14,12 L18,4 L24,20 L28,12 L34,12 L38,6 L42,18 L46,12 L64,12";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const token = localStorage.getItem("access");

    try {
      const res = await fetch("http://localhost:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (res.status === 401) {
        setMessages([...newMessages, { role: "assistant", content: "Please log in to use the assistant." }]);
        return;
      }

      const data = await res.json();
      const reply = data.data?.reply || data.reply || "No response.";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages([...newMessages, { role: "assistant", content: "Something went wrong. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button className="pp-fab" onClick={() => setOpen(true)} aria-label="Open assistant">
        <svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg">
          <path d={PULSE_PATH} fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="pp-panel">
      <div className="pp-header">
        <div className="pp-header-top">
          <div>
            <div className="pp-header-title">PulsePath Assistant</div>
            <div className="pp-header-sub">Here to help you navigate</div>
          </div>
          <button className="pp-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
        </div>
        <div className="pp-pulse-line">
          <svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d={PULSE_PATH} />
          </svg>
        </div>
      </div>

      <div className="pp-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="pp-empty">Ask about scheduling, records, or how to use PulsePath.</div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`pp-msg ${m.role}`}>{m.content}</div>
        ))}
        {loading && (
          <div className="pp-thinking">
            <svg viewBox="0 0 64 24" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
              <path d={PULSE_PATH} />
            </svg>
          </div>
        )}
      </div>

      <div className="pp-input-row">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
        />
        <button className="pp-send" onClick={sendMessage} disabled={loading}>Send</button>
      </div>
    </div>
  );
}