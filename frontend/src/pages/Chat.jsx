import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUp, FileText, LogOut, Menu, MessageSquarePlus, ShieldCheck, Trash2, X } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { Brand, ThemeToggle } from '../components.jsx';

const SUGGESTIONS = [
  'What is the minimum attendance required to sit in exams?',
  'How do I get a bonafide certificate?',
  'What happens if I miss an internal exam?',
  'How can I apply for the merit scholarship?',
  'How do I request re-evaluation of my paper?',
  'I lost my ID card. What should I do?',
  'How do I apply for hostel accommodation?',
  'How can I get an NOC for an internship?',
];

export default function Chat() {
  const { user, logout } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [railOpen, setRailOpen] = useState(false);
  const endRef = useRef(null);

  const loadList = useCallback(async () => {
    try {
      setConversations((await api('/chat/conversations')).conversations);
    } catch {
      /* the list is optional; chat still works */
    }
  }, []);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, sending]);

  const open = async (id) => {
    setError('');
    setRailOpen(false);
    try {
      const { conversation } = await api(`/chat/conversations/${id}`);
      setActiveId(id);
      setMessages(conversation.messages);
    } catch (e) {
      setError(e.message);
    }
  };

  const newChat = () => {
    setActiveId(null);
    setMessages([]);
    setError('');
    setRailOpen(false);
  };

  const remove = async (id) => {
    await api(`/chat/conversations/${id}`, { method: 'DELETE' });
    if (id === activeId) newChat();
    loadList();
  };

  const send = async (text) => {
    const message = text.trim();
    if (!message || sending) return;
    setError('');
    setInput('');
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setSending(true);
    try {
      const d = await api('/chat', { method: 'POST', body: { message, conversationId: activeId || undefined } });
      setActiveId(d.conversationId);
      setMessages((m) => [...m, { role: 'assistant', content: d.answer, sources: d.sources }]);
      loadList();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant');
  const sources = lastAnswer?.sources || [];

  return (
    <div className="shell">
      <aside className={`rail ${railOpen ? 'open' : ''}`}>
        <div className="rail-head">
          <Brand />
          <button className="icon-btn rail-close" onClick={() => setRailOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <button className="btn primary wide" onClick={newChat}><MessageSquarePlus size={16} /> New chat</button>

        <nav className="history" aria-label="Previous chats">
          {conversations.length === 0 && <p className="muted small">Your chats will show up here.</p>}
          {conversations.map((c) => (
            <div key={c._id} className={`history-item ${c._id === activeId ? 'active' : ''}`}>
              <button onClick={() => open(c._id)} title={c.title}>{c.title}</button>
              <button className="icon-btn tiny" onClick={() => remove(c._id)} aria-label={`Delete chat: ${c.title}`}><Trash2 size={14} /></button>
            </div>
          ))}
        </nav>

        <div className="rail-foot">
          <div className="who">
            <strong>{user.name}</strong>
            <span className="muted small">{user.role === 'admin' ? 'Admin' : 'Student'}</span>
          </div>
          <div className="rail-actions">
            {user.role === 'admin' && <Link className="icon-btn" to="/admin" aria-label="Manage documents"><ShieldCheck size={18} /></Link>}
            <ThemeToggle />
            <button className="icon-btn" onClick={logout} aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>

      <main className="stage">
        <header className="stage-bar">
          <button className="icon-btn menu-btn" onClick={() => setRailOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <span className="muted small">Answers come from official college documents.</span>
        </header>

        <div className="thread" aria-live="polite">
          {messages.length === 0 ? (
            <div className="welcome">
              <h1>What do you need help with, {user.name.split(' ')[0]}?</h1>
              <p className="muted">Ask in your own words. Try one of these:</p>
              <div className="chips">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="bubble">{m.content}</div>
              </div>
            ))
          )}
          {sending && (
            <div className="msg assistant"><div className="bubble typing" aria-label="Assistant is typing"><i /><i /><i /></div></div>
          )}
          <div ref={endRef} />
        </div>

        {error && <p className="error banner" role="alert">{error}</p>}
        <div className="composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask about attendance, fees, exams, hostel…"
            rows={1}
            maxLength={1000}
            aria-label="Your question"
          />
          <button className="send" onClick={() => send(input)} disabled={sending || !input.trim()} aria-label="Send question">
            <ArrowUp size={18} />
          </button>
        </div>
      </main>

      <aside className="board" aria-label="Sources">
        <h3>Pinned from college documents</h3>
        {sources.length === 0 ? (
          <p className="muted small">When you ask a question, the documents behind the answer are pinned here so you can verify them.</p>
        ) : (
          sources.map((s) => (
            <article key={s.documentId} className="notice">
              <span className="pin" />
              <header><FileText size={14} /> <strong>{s.title}</strong></header>
              <span className="tag">{s.category}</span>
              <p>{s.snippet}</p>
            </article>
          ))
        )}
      </aside>

      {railOpen && <div className="scrim" onClick={() => setRailOpen(false)} />}
    </div>
  );
}
