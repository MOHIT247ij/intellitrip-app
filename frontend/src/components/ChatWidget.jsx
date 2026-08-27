/**
 * ChatWidget.jsx — a small floating AI chat assistant available on every
 * page (even to visitors who aren't logged in). Talks to POST /api/ai/chat,
 * which is backed by Gemini with a friendly canned fallback when no
 * GEMINI_API_KEY is configured — so this never shows a broken error.
 * Conversation lives only in this component's state (not persisted to the
 * backend), matching the app's lightweight, no-extra-schema approach.
 */
import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { aiService } from '../services/aiService';

const GREETING = "Hi! I'm the IntelliTrip Assistant. Ask me anything about Indian destinations, itineraries, budgets, or travel tips.";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: GREETING }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const history = messages.slice(-6);
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const { reply } = await aiService.chat(text, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the server just now — please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[28rem] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl2 bg-white shadow-cardHover ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-white">
            <span className="flex items-center gap-2 text-sm font-semibold"><Sparkles size={16} /> IntelliTrip Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 transition hover:bg-white/20">
              <X size={16} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-sand-50 p-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-xl2 px-3 py-2 text-sm shadow-soft ${
                    m.role === 'user' ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-900/5'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1.5 rounded-xl2 bg-white px-3 py-2 text-xs text-slate-400 shadow-soft ring-1 ring-slate-900/5">
                  <Loader2 size={12} className="animate-spin" /> Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-100 bg-white p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about destinations, budgets..."
              className="input-field !py-2 !text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="btn-primary !rounded-full !p-2.5 shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI chat assistant"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-accent-500 text-white shadow-cardHover transition-transform duration-300 hover:-translate-y-1 active:scale-90"
      >
        {open ? <X size={22} /> : <Sparkles size={22} />}
      </button>
    </>
  );
}
