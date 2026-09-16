// src/pages/PaperDetail.tsx
// Public, READ-ONLY reader for one published paper.
//
// Everything on this page comes from the database row identified by the :id in
// the URL — nothing is hardcoded. The page renders no edit/delete/publish
// control for anyone, administrators included; managing a paper happens only in
// the Admin Portal.
//
// Security: the query filters on published = true, and RLS
// ("articles_read_published_or_admin", migration 004) independently blocks
// drafts, unpublished rows and papers inside a hidden collection. A visitor who
// types an arbitrary id therefore gets "not available", not someone's draft.

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import type { Article, PastIssue } from '@/lib/supabase';

/** Supabase storage public URLs serve inline by default; ?download= forces a save. */
function toDownloadUrl(url: string) {
    if (!url.includes('/storage/v1/object/public/')) return url;
    return url + (url.includes('?') ? '&' : '?') + 'download=';
}

export default function PaperDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [paper, setPaper] = useState<Article | null>(null);
    const [collection, setCollection] = useState<PastIssue | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            setLoading(true);

            if (!isSupabaseReady || !id) {
                if (!cancelled) { setPaper(null); setLoading(false); }
                return;
            }

            // published = true is defence in depth on top of RLS.
            const { data } = await supabase
                .from('articles')
                .select('*')
                .eq('id', id)
                .eq('published', true)
                .maybeSingle();

            if (cancelled) return;
            setPaper((data as Article) ?? null);

            // Collection label for the breadcrumb ("2022 Collection"). RLS returns
            // nothing here for a hidden collection, so the breadcrumb just omits it.
            if (data?.past_issue_id) {
                const { data: coll } = await supabase
                    .from('past_issues')
                    .select('*')
                    .eq('id', data.past_issue_id)
                    .maybeSingle();
                if (!cancelled) setCollection((coll as PastIssue) ?? null);
            } else if (!cancelled) {
                setCollection(null);
            }

            if (!cancelled) setLoading(false);
        })();

        return () => { cancelled = true; };
    }, [id]);

    // A paper with no collection belongs to the Current Issue, so "back" has to
    // lead there rather than into the archive.
    const inArchive = !!paper?.past_issue_id;
    const backHref = inArchive
        ? `/journal?view=issues&collection=${paper!.past_issue_id}`
        : '/journal?view=current';
    const backLabel = inArchive ? 'Back to Past Issues' : 'Back to Current Issue';

    const goBack = () => navigate(backHref);

    // Structured abstract sections, shown only when the row actually has them.
    const abstractSections = paper
        ? [
            { label: 'Background', value: paper.abstract_background },
            { label: 'Objectives', value: paper.abstract_objectives },
            { label: 'Methods', value: paper.abstract_methods },
            { label: 'Results', value: paper.abstract_results },
            { label: 'Conclusion', value: paper.abstract_conclusion },
        ].filter(s => s.value)
        : [];

    // Publication facts — every entry is dropped when the column is empty.
    const facts = paper
        ? [
            { label: 'Volume', value: paper.volume != null ? String(paper.volume) : '' },
            { label: 'Issue', value: paper.issue != null ? String(paper.issue) : '' },
            { label: 'Year', value: paper.year != null ? String(paper.year) : '' },
            { label: 'Pages', value: paper.pages ?? '' },
            { label: 'Published', value: paper.publication_date ?? '' },
            { label: 'Volume / Issue', value: paper.volume_issue ?? '' },
        ].filter(f => f.value)
        : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
            {/* Header — same shell as the journal, minus the section tabs */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
                <div className="w-full px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16">
                        <button onClick={() => navigate('/')} className="flex items-center gap-2">
                            <img
                                src="/journal-logo.jpeg"
                                alt="Journal of Clinical Nursing and Allied Health Practice"
                                className="h-12 w-auto object-contain flex-shrink-0"
                            />
                        </button>
                        <Button
                            variant="ghost"
                            onClick={goBack}
                            className="flex items-center gap-1 transition-all duration-200 hover:text-[#d63384]"
                        >
                            <ArrowLeft className="w-4 h-4" /> {backLabel}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {loading ? (
                    <div className="flex items-center gap-3 text-gray-500 py-20 justify-center">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Loading paper…</span>
                    </div>
                ) : !paper ? (
                    <div className="bg-white border border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <div className="text-5xl mb-4">🔒</div>
                        <h1 className="text-xl font-bold text-gray-900 mb-2">This paper is not available</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            It may have been withdrawn, or it has not been published yet.
                        </p>
                        <Link
                            to="/journal?view=issues"
                            className="inline-block bg-[#d63384] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b5165a] transition-colors"
                        >
                            Browse Past Issues
                        </Link>
                    </div>
                ) : (
                    <article>
                        {/* Breadcrumb */}
                        <nav className="text-xs text-gray-500 mb-5 flex flex-wrap items-center gap-1">
                            {inArchive ? (
                                <Link to="/journal?view=issues" className="hover:text-[#d63384] font-medium">Past Issues</Link>
                            ) : (
                                <Link to="/journal?view=current" className="hover:text-[#d63384] font-medium">Current Issue</Link>
                            )}
                            {collection && (
                                <>
                                    <span>/</span>
                                    <Link
                                        to={`/journal?view=issues&collection=${collection.id}`}
                                        className="hover:text-[#d63384] font-medium"
                                    >
                                        {collection.label}
                                    </Link>
                                </>
                            )}
                            {paper.issue != null && (
                                <>
                                    <span>/</span>
                                    <span>Issue {paper.issue}</span>
                                </>
                            )}
                        </nav>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-9">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1120] leading-snug mb-4">
                                {paper.title}
                            </h1>

                            {/* Authors & contact */}
                            <div className="border-l-4 border-[#d63384] pl-4 mb-6 text-sm text-gray-700 leading-relaxed">
                                {paper.author_name && (
                                    <p className="m-0"><strong>Authors:</strong> {paper.author_name}</p>
                                )}
                                {paper.author_email && (
                                    <p className="m-0">
                                        <strong>Correspondence:</strong>{' '}
                                        <a href={`mailto:${paper.author_email}`} className="text-[#d63384] hover:underline">
                                            {paper.author_email}
                                        </a>
                                    </p>
                                )}
                                {paper.location && (
                                    <p className="m-0"><strong>Affiliation:</strong> {paper.location}</p>
                                )}
                            </div>

                            {/* Publication information */}
                            {(facts.length > 0 || paper.doi || collection) && (
                                <div className="mb-7 rounded-xl bg-gray-50 border border-gray-200 p-4">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                                        Publication information
                                    </h2>
                                    <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                                        {collection && (
                                            <div>
                                                <dt className="text-[11px] uppercase tracking-wide text-gray-400">Collection</dt>
                                                <dd className="m-0 text-gray-800 font-medium">{collection.label}</dd>
                                            </div>
                                        )}
                                        {facts.map(f => (
                                            <div key={f.label}>
                                                <dt className="text-[11px] uppercase tracking-wide text-gray-400">{f.label}</dt>
                                                <dd className="m-0 text-gray-800 font-medium">{f.value}</dd>
                                            </div>
                                        ))}
                                        {paper.doi && (
                                            <div className="col-span-2 sm:col-span-3">
                                                <dt className="text-[11px] uppercase tracking-wide text-gray-400">DOI</dt>
                                                <dd className="m-0">
                                                    <a
                                                        href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#d63384] font-medium hover:underline break-all"
                                                    >
                                                        {paper.doi}
                                                    </a>
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}

                            {/* PDF actions */}
                            {paper.pdf_url && (
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <a
                                        href={paper.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-[#d63384] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#b5165a] transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" /> Open PDF
                                    </a>
                                    <a
                                        href={toDownloadUrl(paper.pdf_url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white border border-pink-300 text-[#d63384] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-pink-50 transition-colors"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </a>
                                </div>
                            )}

                            {/* Abstract */}
                            {(abstractSections.length > 0 || paper.abstract) && (
                                <section className="mb-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                        Abstract
                                    </h2>
                                    {abstractSections.length > 0 ? (
                                        abstractSections.map(sec => (
                                            <div key={sec.label} className="mb-3">
                                                <strong className="text-sm text-gray-900">{sec.label}:</strong>
                                                <p className="text-sm leading-relaxed text-gray-700 mt-1 whitespace-pre-line">
                                                    {sec.value}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                            {paper.abstract}
                                        </p>
                                    )}
                                </section>
                            )}

                            {/* Keywords */}
                            {paper.keywords && (
                                <section className="mb-8">
                                    <h2 className="text-sm font-bold text-gray-900 mb-2">Keywords</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {paper.keywords.split(/[,;]/).map(k => k.trim()).filter(Boolean).map(k => (
                                            <span
                                                key={k}
                                                className="inline-block bg-pink-50 text-[#d63384] text-xs px-3 py-1 rounded-full border border-pink-200"
                                            >
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Full text / PDF reader */}
                            {paper.pdf_url && (
                                <section className="mb-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                        Full text
                                    </h2>
                                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                                        <iframe
                                            src={paper.pdf_url}
                                            title={`${paper.title} — full text PDF`}
                                            className="w-full h-[70vh] min-h-[420px]"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Trouble viewing? Use “Open PDF” above to read it in a new tab.
                                    </p>
                                </section>
                            )}

                            {/* References */}
                            {paper.references && (
                                <section>
                                    <h2 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-200 pb-2">
                                        References
                                    </h2>
                                    <p className="text-xs leading-relaxed text-gray-600 whitespace-pre-line">
                                        {paper.references}
                                    </p>
                                </section>
                            )}
                        </div>

                        <div className="mt-8">
                            <button
                                type="button"
                                onClick={goBack}
                                className="text-sm font-semibold text-[#d63384] hover:text-[#b5165a]"
                            >
                                ← {backLabel}
                            </button>
                        </div>
                    </article>
                )}
            </main>
        </div>
    );
}
