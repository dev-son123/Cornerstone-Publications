// src/components/journal/AddArticleForm.tsx
// Admin-only "Add Document" form for the journal's Current Issue.
//
// SECURITY: rendering this form is gated by useIsAdmin() in Journal.tsx, but
// that is only a convenience. The real enforcement lives in Postgres — RLS on
// public.articles and on the article-pdfs storage bucket (see
// app/migrations/002_current_issue_admin_rls.sql). A non-admin who calls
// supabase.from('articles').insert(...) or .storage.upload(...) by hand gets a
// 42501 "row-level security" error back, which is surfaced below.

import { useEffect, useRef, useState } from 'react';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Props {
    /** Leave the form without saving. */
    onCancel: () => void;
    /** A document was inserted — the caller should refresh the Current Issue. */
    onSaved: () => void;
}

const emptyForm = {
    title: '',
    author_name: '',
    author_email: '',
    publication_date: '',
    location: '',
    volume_issue: '',
    volume: '',
    issue: '',
    year: '',
    keywords: '',
    abstract: '',
    abstract_background: '',
    abstract_objectives: '',
    abstract_methods: '',
    abstract_results: '',
    abstract_conclusion: '',
    references: '',
    pdf_url: '',
};

type FormState = typeof emptyForm;

const inputCls =
    'w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#d63384] outline-none';

/** Turn a rejected Supabase write into something an admin can act on. */
function explain(err: { code?: string; message?: string } | null): string {
    const msg = err?.message ?? 'Unknown error';
    if (err?.code === '42501' || /row-level security|not authorized|permission denied/i.test(msg)) {
        return 'Permission denied by the database. Only administrators can add published papers.';
    }
    return msg;
}

export function AddArticleForm({ onCancel, onSaved }: Props) {
    const [form, setForm] = useState<FormState>(emptyForm);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [uploadedUrl, setUploadedUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    // Pre-fill volume/issue from whatever CurrentIssueSection currently treats
    // as "the current issue", so a new document lands in that issue by default.
    // The ordering below intentionally matches CurrentIssueSection's query.
    useEffect(() => {
        let cancelled = false;
        supabase
            .from('articles')
            .select('volume, issue, volume_issue, year')
            .eq('published', true)
            .order('volume', { ascending: false })
            .order('issue', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(1)
            .then(({ data }) => {
                const current = data?.[0];
                if (cancelled || !current) return;
                setForm(p => ({
                    ...p,
                    volume: current.volume != null ? String(current.volume) : '',
                    issue: current.issue != null ? String(current.issue) : '',
                    volume_issue: current.volume_issue ?? '',
                    year: current.year != null ? String(current.year) : '',
                }));
            });
        return () => { cancelled = true; };
    }, []);

    const set = (field: keyof FormState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            setForm(p => ({ ...p, [field]: e.target.value }));

    const pickFile = (f: File | undefined | null) => {
        if (!f) return;
        if (f.type !== 'application/pdf') { setError('Please choose a PDF file.'); return; }
        setError(null);
        setPdfFile(f);
        setUploadedUrl('');
    };

    const uploadPdf = async (): Promise<string | null> => {
        if (!pdfFile) return form.pdf_url.trim() || null;
        if (uploadedUrl) return uploadedUrl;

        setUploading(true);
        try {
            const path = `${Date.now()}_${pdfFile.name.replace(/\s+/g, '_')}`;
            const { error: upErr } = await supabase.storage
                .from('article-pdfs')
                .upload(path, pdfFile, { contentType: 'application/pdf', upsert: false });
            if (upErr) throw upErr;
            const { data } = supabase.storage.from('article-pdfs').getPublicUrl(path);
            setUploadedUrl(data.publicUrl);
            return data.publicUrl;
        } finally {
            setUploading(false);
        }
    };

    const submit = async () => {
        if (!form.title.trim() || !form.author_name.trim()) {
            setError('Title and Author are required.');
            return;
        }
        setError(null);
        setSaving(true);
        try {
            const pdfUrl = await uploadPdf();

            const { error: insErr } = await supabase.from('articles').insert([{
                title: form.title.trim(),
                author_name: form.author_name.trim(),
                author_email: form.author_email.trim() || null,
                publication_date: form.publication_date || null,
                location: form.location.trim() || null,
                volume_issue: form.volume_issue.trim() || null,
                volume: form.volume ? Number(form.volume) : null,
                issue: form.issue ? Number(form.issue) : null,
                year: form.year ? Number(form.year) : new Date().getFullYear(),
                keywords: form.keywords.trim() || null,
                abstract: form.abstract.trim() || null,
                abstract_background: form.abstract_background.trim() || null,
                abstract_objectives: form.abstract_objectives.trim() || null,
                abstract_methods: form.abstract_methods.trim() || null,
                abstract_results: form.abstract_results.trim() || null,
                abstract_conclusion: form.abstract_conclusion.trim() || null,
                references: form.references.trim() || null,
                pdf_url: pdfUrl,
                status: 'published',
                published: true,   // so it shows in the Current Issue immediately
            }]);
            if (insErr) throw insErr;

            setForm(emptyForm);
            setPdfFile(null);
            setUploadedUrl('');
            onSaved();
        } catch (err: any) {
            setError(explain(err));
        } finally {
            setSaving(false);
        }
    };

    const busy = saving || uploading;

    return (
        <div className="max-w-4xl mx-auto my-8 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Add Document to Current Issue</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <input placeholder="Title *" value={form.title} onChange={set('title')} className={inputCls} />
                <input placeholder="Author *" value={form.author_name} onChange={set('author_name')} className={inputCls} />
                <input placeholder="Email" value={form.author_email} onChange={set('author_email')} className={inputCls} />
                <input type="date" value={form.publication_date} onChange={set('publication_date')} className={inputCls} />
                <input placeholder="Address" value={form.location} onChange={set('location')} className={inputCls} />
                <input placeholder="Publication Scene (e.g. Vol 3, Issue 2)" value={form.volume_issue} onChange={set('volume_issue')} className={inputCls} />
            </div>

            {/* Volume / Issue / Year drive which issue this document appears in */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                <input type="number" placeholder="Volume no." value={form.volume} onChange={set('volume')} className={inputCls} />
                <input type="number" placeholder="Issue no." value={form.issue} onChange={set('issue')} className={inputCls} />
                <input type="number" placeholder="Year" value={form.year} onChange={set('year')} className={inputCls} />
            </div>
            <p className="text-xs text-gray-500 mb-8">
                Pre-filled from the issue currently on display. Keep these values to publish into the
                Current Issue, or raise them to start a new one.
            </p>

            {/* ── PDF upload → article-pdfs bucket (admin-only by storage policy) ── */}
            <div className="mb-8 w-full">
                <h3 className="text-xl font-bold mb-4 text-gray-900">Upload PDF</h3>
                {!pdfFile ? (
                    <div
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => { e.preventDefault(); pickFile(e.dataTransfer.files?.[0]); }}
                        onClick={() => fileRef.current?.click()}
                        className="flex flex-col items-center justify-center py-10 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">
                            Drag &amp; drop a PDF here, or <span className="text-[#d63384] font-bold">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF files only</p>
                        <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
                            onChange={e => pickFile(e.target.files?.[0])} />
                    </div>
                ) : (
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{pdfFile.name}</p>
                            <p className="text-xs text-gray-400">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        {uploadedUrl ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" /> Uploaded
                            </span>
                        ) : (
                            <button onClick={() => setPdfFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                    The file is uploaded when you press Submit. You can paste an existing PDF link instead:
                </p>
                <input placeholder="PDF URL (optional)" value={form.pdf_url} onChange={set('pdf_url')}
                    className={`${inputCls} mt-2`} />
            </div>

            <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Abstract</h3>
            <div className="space-y-4 mb-8">
                <textarea placeholder="Summary" value={form.abstract} onChange={set('abstract')} className={`${inputCls} h-24`} />
                <textarea placeholder="Background" value={form.abstract_background} onChange={set('abstract_background')} className={`${inputCls} h-24`} />
                <textarea placeholder="Aim" value={form.abstract_objectives} onChange={set('abstract_objectives')} className={`${inputCls} h-24`} />
                <textarea placeholder="Methods" value={form.abstract_methods} onChange={set('abstract_methods')} className={`${inputCls} h-24`} />
                <textarea placeholder="Results" value={form.abstract_results} onChange={set('abstract_results')} className={`${inputCls} h-24`} />
                <textarea placeholder="Conclusion" value={form.abstract_conclusion} onChange={set('abstract_conclusion')} className={`${inputCls} h-24`} />
            </div>

            <h3 className="text-2xl font-bold mb-4 text-gray-900 border-b pb-2">Extra</h3>
            <div className="space-y-4 mb-8">
                <textarea placeholder="References" value={form.references} onChange={set('references')} className={`${inputCls} h-24`} />
            </div>

            <input placeholder="Tags / Keywords" value={form.keywords} onChange={set('keywords')} className={`${inputCls} mb-8`} />

            {error && (
                <p className="mb-4 px-4 py-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{error}</p>
            )}

            <div className="flex gap-3">
                <Button size="lg" onClick={submit} disabled={busy}
                    className="flex-1 bg-[#d63384] hover:bg-pink-700 text-white border-none cursor-pointer px-5 py-3">
                    {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {uploading ? 'Uploading PDF…' : saving ? 'Publishing…' : 'Submit'}
                </Button>
                <Button size="lg" variant="outline" onClick={onCancel} disabled={busy} className="px-6">
                    Cancel
                </Button>
            </div>
        </div>
    );
}
