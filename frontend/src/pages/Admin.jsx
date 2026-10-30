import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trash2, UploadCloud } from 'lucide-react';
import { api } from '../api';
import { Brand, ThemeToggle } from '../components.jsx';

export default function Admin() {
  const [docs, setDocs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const d = await api('/documents');
      setDocs(d.documents);
      setCategories(d.categories);
    } catch (e) {
      setError(e.message);
    }
  };
  useEffect(() => { load(); }, []);

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return setError('Choose a PDF, DOCX, TXT or MD file first.');
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('title', title);
      form.append('category', category);
      await api('/documents', { method: 'POST', form });
      setNotice('Document added. The chatbot can use it now.');
      setTitle('');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Delete "${d.title}"? The chatbot will stop using it.`)) return;
    try {
      await api(`/documents/${d._id}`, { method: 'DELETE' });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin">
      <header className="admin-bar">
        <Brand />
        <div className="rail-actions">
          <Link className="btn ghost" to="/"><ArrowLeft size={16} /> Back to chat</Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="admin-body">
        <h1>College documents</h1>
        <p className="muted">Upload circulars, rulebooks and FAQs. Students get answers only from what is listed here.</p>

        <form className="card upload" onSubmit={upload}>
          <label>Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Exam Rules 2026-27" maxLength={140} />
          </label>
          <label>Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="drop">
            <UploadCloud size={22} />
            <span>{file ? file.name : 'Choose a PDF, DOCX, TXT or MD file (max 10 MB)'}</span>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt,.md" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="ok" role="status">{notice}</p>}
          <button className="btn primary" disabled={busy}>{busy ? 'Reading document…' : 'Upload document'}</button>
        </form>

        <h2>Uploaded ({docs.length})</h2>
        {docs.length === 0 ? (
          <p className="muted">No documents yet. Upload one above, or run <code>npm run seed</code> for sample content.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Passages</th><th>Added</th><th /></tr></thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d._id}>
                    <td>{d.title}</td>
                    <td><span className="tag">{d.category}</span></td>
                    <td>{d.chunkCount}</td>
                    <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td><button className="icon-btn" onClick={() => remove(d)} aria-label={`Delete ${d.title}`}><Trash2 size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
