import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface Props {
  pubForm: Record<string, string>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onPublish: () => Promise<void>;
  isPublishing: boolean;
}

export function PublicationsTab({ pubForm, onChange, onPublish, isPublishing }: Props) {
  const [pdfFile, setPdfFile]       = useState<File | null>(null);
  const [uploading, setUploading]   = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [existingIssues, setExistingIssues] = useState<any[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from('past_issues')
      .select('id, label, volume, year, issue_range')
      .order('year', { ascending: false })
      .then(({ data }) => { setExistingIssues(data || []); });
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type === 'application/pdf') setPdfFile(f);
    else toast.error('Please drop a PDF file');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setPdfFile(f);
  };

  /** Uploads the chosen PDF and returns its public URL. */
  const doUpload = async (): Promise<string> => {
    if (!pdfFile) return '';
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${pdfFile.name.replace(/\s+/g, '_')}`;
      const { error } = await supabase.storage
        .from('article-pdfs')
        .upload(fileName, pdfFile, { contentType: 'application/pdf', upsert: false });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('article-pdfs').getPublicUrl(fileName);
      setUploadedUrl(publicUrl);

      // Update the parent's form state immediately
      onChange({ target: { name: 'pdf_url', value: publicUrl } } as any);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async () => {
    try {
      await doUpload();
      toast.success('PDF uploaded and attached to publication!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    }
  };

  const handlePublishWithPdf = async () => {
    // A PDF that was chosen but never uploaded used to be silently dropped —
    // the article published with no pdf_url and the admin had no idea. Upload
    // it here first, and abort the publish if that fails.
    if (pdfFile && !uploadedUrl) {
      try {
        await doUpload();
      } catch (err: any) {
        toast.error('PDF upload failed, article not published: ' + err.message);
        return;
      }
    }
    await onPublish();
    setPdfFile(null);
    setUploadedUrl('');
  };

  const fields1 = [
    { name: 'title',       label: 'Title *',        placeholder: 'Enter publication title' },
    { name: 'author',      label: 'Author Name *',  placeholder: 'Enter author name' },
    { name: 'authorEmail', label: 'Author Email *',  placeholder: 'author@institution.edu' },
    { name: 'location',    label: 'Location',        placeholder: 'City, Country' },
    { name: 'volume',      label: 'Volume / Issue',  placeholder: 'e.g. Vol 2, Issue 4' },
  ];

  const abstractFields = [
    { name: 'background',  label: 'Background',       placeholder: 'Problem statement and context...' },
    { name: 'objectives',  label: 'Aim & Objectives', placeholder: 'What does this study aim to achieve?' },
    { name: 'methods',     label: 'Methods',           placeholder: 'Design, participants, materials...' },
    { name: 'results',     label: 'Results',           placeholder: 'Data analysis and primary findings...' },
    { name: 'conclusion',  label: 'Conclusion',        placeholder: 'Implications for practice...' },
  ];

  return (
    <motion.div key="publications" initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.3 }}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#d63384] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Publication</h2>
              <p className="text-gray-400 text-sm">Register an article and upload its PDF to the journal database</p>
            </div>
          </div>

          {/* Shown when the form was pre-filled from a submission, so the admin can
              see the link that will be recorded on the published article. */}
          {(pubForm as any).submissionId && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-pink-50 border border-pink-200 text-sm text-pink-900">
              Publishing from submission <strong>#{(pubForm as any).submissionId}</strong>
              {(pubForm as any).journal ? <> · {(pubForm as any).journal}</> : null}
              . On success the submission is marked <strong>Accepted</strong> and linked to this article.
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {fields1.map(f => (
              <div key={f.name} className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{f.label}</label>
                {f.name === 'volume' ? (
                  <input name={f.name} value={(pubForm as any)[f.name]} onChange={onChange} placeholder={f.placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
                ) : (
                  <input name={f.name} value={(pubForm as any)[f.name]} onChange={onChange} placeholder={f.placeholder}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
                )}
              </div>
            ))}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Publication Date</label>
              <input name="date" value={pubForm.date} onChange={onChange} type="date"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
          </div>

          {/* Volume / Issue numbers decide which issue the article is filed under.
              Left blank, the article inherits the issue currently on display. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Volume No.</label>
              <input name="volumeNo" type="number" value={(pubForm as any).volumeNo ?? ''} onChange={onChange} placeholder="e.g. 3"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Issue No.</label>
              <input name="issueNo" type="number" value={(pubForm as any).issueNo ?? ''} onChange={onChange} placeholder="e.g. 2"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Leave both blank to publish into the issue currently shown under Journal → Current Issue.
          </p>

          {/* Archive collection (past_issues.id) + citation metadata.
              Picking a collection files the paper under Journal → Past Issues →
              that collection. Left as "Current Issue only", the article stays
              unfiled and appears only in the current issue. */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Archive Collection</label>
              <select name="pastIssueId" value={(pubForm as any).pastIssueId ?? ''} onChange={onChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm">
                <option value="">Current Issue only (not archived)</option>
                {existingIssues.map(issue => (
                  <option key={issue.id} value={issue.id}>
                    {issue.label} — Vol {issue.volume} · {issue.year}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Pages</label>
              <input name="pages" value={(pubForm as any).pages ?? ''} onChange={onChange} placeholder="e.g. 112-119"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">DOI</label>
              <input name="doi" value={(pubForm as any).doi ?? ''} onChange={onChange} placeholder="e.g. 10.1234/jcnap.2024.3.2.5"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-8">
            Choosing a collection files this paper under Journal → Past Issues, grouped by its Issue No.
          </p>

          {/* ── PDF Upload ── */}
          <div className="mb-8 p-6 rounded-2xl border-2 border-dashed border-pink-200 bg-pink-50/40">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#d63384]" /> Upload Article PDF
            </h3>

            {!pdfFile ? (
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => fileRef.current?.click()}
                className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-pink-300 bg-white cursor-pointer hover:bg-pink-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-pink-300 mb-2" />
                <p className="text-sm text-gray-500 font-medium">Drag & drop a PDF here, or <span className="text-[#d63384] font-bold">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">PDF files only</p>
                <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-pink-100">
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
                  <>
                    <Button size="sm" onClick={handleUpload} disabled={uploading}
                      className="bg-[#d63384] hover:bg-pink-700 text-white text-xs h-8 px-4 rounded-lg">
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Upload'}
                    </Button>
                    <button onClick={() => setPdfFile(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Abstract */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
              Abstract (Structured)
              <span className="text-xs font-normal text-gray-400 uppercase tracking-widest">All sections optional</span>
            </h3>
            <div className="space-y-4">
              {abstractFields.map(f => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">{f.label}</label>
                  <textarea name={f.name} value={(pubForm as any)[f.name]} onChange={onChange} placeholder={f.placeholder} rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all resize-none text-sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Keywords & References */}
          <div className="space-y-4 mb-8">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">Keywords</label>
              <input name="keywords" value={pubForm.keywords} onChange={onChange} placeholder="Cardiology, Public Health (comma separated)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide">References</label>
              <textarea name="references" value={pubForm.references} onChange={onChange} placeholder="Standard citation format (APA/MLA)..." rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#d63384]/20 focus:border-[#d63384] outline-none transition-all resize-none text-sm" />
            </div>
          </div>

          <Button onClick={handlePublishWithPdf} disabled={isPublishing}
            className="w-full py-6 text-base font-bold rounded-2xl text-white shadow-xl hover:opacity-90 transition-all"
            style={{ background: 'linear-gradient(135deg, #d63384, #b5165a)' }}>
            {isPublishing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Publishing...</> : '📄 Publish to Journal'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
