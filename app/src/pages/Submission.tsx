import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { AdvancedNav } from '../components/ui/advanced-nav';
import { Footer } from '../components/Footer';

const JOURNALS = [
  'Journal of Clinical Nursing and Allied Health Practice',
  'Journal of Biomedical Research',
  'International Journal of Medical Sciences',
  'Journal of Health Sciences',
  'Clinical Medicine & Research',
];

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  country: string;
  code: string;
  affiliation: string;
  message: string;
  journal: string;
  username: string;
  password: string;
}

export default function Submission() {
  const navigate = useNavigate();
  const manuscriptRef = useRef<HTMLInputElement>(null);
  const supplementaryRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    firstName: '', middleName: '', lastName: '',
    email: '', country: '', code: '',
    affiliation: '', message: '', journal: '',
    username: '', password: '',
  });

  const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
  const [supplementaryFile, setSupplementaryFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleReset = () => {
    setForm({ firstName: '', middleName: '', lastName: '', email: '', country: '', code: '', affiliation: '', message: '', journal: '', username: '', password: '' });
    setManuscriptFile(null);
    setSupplementaryFile(null);
    if (manuscriptRef.current) manuscriptRef.current.value = '';
    if (supplementaryRef.current) supplementaryRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.firstName || !form.lastName || !form.email || !form.country || !form.journal) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!manuscriptFile) {
      toast.error('Please attach your manuscript file.');
      return;
    }

    setIsSubmitting(true);
    try {
      let manuscriptUrl = '';
      let supplementaryUrl = '';

      // Upload manuscript file
      const ext = manuscriptFile.name.split('.').pop();
      const filePath = `manuscripts/${Date.now()}_${form.lastName}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('manuscript_files')
        .upload(filePath, manuscriptFile);

      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('manuscript_files').getPublicUrl(filePath);
      manuscriptUrl = urlData?.publicUrl ?? '';

      // Upload supplementary file if provided
      if (supplementaryFile) {
        const ext2 = supplementaryFile.name.split('.').pop();
        const filePath2 = `supplementary/${Date.now()}_${form.lastName}.${ext2}`;
        await supabase.storage.from('manuscript_files').upload(filePath2, supplementaryFile);
        const { data: urlData2 } = supabase.storage.from('manuscript_files').getPublicUrl(filePath2);
        supplementaryUrl = urlData2?.publicUrl ?? '';
      }

      // Insert record into Supabase
      const { error: dbError } = await supabase.from('submissions').insert([{
        author_name: `${form.firstName} ${form.middleName} ${form.lastName}`.trim(),
        author_email: form.email,
        country: form.country,
        affiliation_code: form.code,
        affiliation: form.affiliation,
        message: form.message,
        journal: form.journal,
        manuscript_url: manuscriptUrl,
        supplementary_url: supplementaryUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      }]);

      if (dbError) throw dbError;

      // Send invisible email notification using FormSubmit
      fetch("https://formsubmit.co/ajax/info.cornerstoneresearch@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          _subject: `New Manuscript Submission: ${form.journal}`,
          Name: `${form.firstName} ${form.middleName} ${form.lastName}`.trim(),
          Email: form.email,
          Journal: form.journal,
          Country: form.country,
          Affiliation: form.affiliation,
          Message: form.message || "No additional message",
          Manuscript_URL: manuscriptUrl,
          Supplementary_URL: supplementaryUrl || "None provided",
          _template: "table"
        })
      }).catch(console.error);

      toast.success('Manuscript submitted successfully! We will contact you shortly.');
      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      toast.error('Submission failed. Please try again or contact us by email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white rounded-[2rem] shadow-2xl shadow-pink-100 p-12 max-w-lg w-full text-center border border-pink-50 translate-y-[-20%]">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Submission Received!</h2>
          <p className="text-gray-600 mb-10 leading-relaxed text-lg italic underline decoration-pink-200 underline-offset-4 decoration-2">
            Thank you, <strong>{form.firstName}</strong>! 
            <br/><br/>
            Your manuscript has been submitted successfully. Our editorial team will review it and contact you at <strong>{form.email}</strong>.
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/journal')} 
              className="w-full py-5 bg-gradient-to-r from-[#d63384] to-[#b5165a] text-white rounded-2xl font-bold shadow-xl shadow-pink-100/50 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Journal
            </button>
            <button 
              onClick={() => { setSubmitted(false); handleReset(); }} 
              className="w-full py-4 text-gray-500 font-semibold hover:text-gray-700 transition-colors"
            >
              Submit Another Manuscript
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AdvancedNav />

      <div className="flex-1 max-w-4xl mx-auto px-4 pt-32 pb-20">
        <form onSubmit={handleSubmit} onReset={handleReset}>
          {/* Form Title */}
          <h1 className="text-2xl font-bold text-[#d63384] mb-8 tracking-wide uppercase">
            Manuscript Submission Form
          </h1>

          {/* Main form card */}
          <div className="bg-white border border-gray-300 rounded shadow-sm">
            {/* Name Row */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right">Your Name:</label>
                <div className="flex flex-1 gap-3 w-full">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">First Name <span className="text-red-500">*</span></p>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Middle Name</p>
                    <input
                      name="middleName"
                      value={form.middleName}
                      onChange={handleChange}
                      placeholder="Middle Name"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Last Name <span className="text-red-500">*</span></p>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right">Your Email:</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                  />
                  <span className="text-red-500 text-sm">*</span>
                </div>
              </div>
            </div>

            {/* Country */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right">Country:</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    required
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                  />
                  <span className="text-red-500 text-sm">*</span>
                </div>
              </div>
            </div>

            {/* Code */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right">Code:</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                  />
                  <span className="text-red-500 text-sm">*</span>
                </div>
              </div>
            </div>

            {/* Affiliation */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right pt-2">Affiliation:</label>
                <div className="flex-1 flex items-start gap-2">
                  <textarea
                    name="affiliation"
                    value={form.affiliation}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Department Name of Organization, Name of Organization, City, Province, Country"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384] resize-y"
                  />
                  <span className="text-red-500 text-sm mt-2">*</span>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right pt-2">Your Message:</label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384] resize-y"
                />
              </div>
            </div>

            {/* Select Journal */}
            <div className="p-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <label className="text-sm text-gray-600 w-24 flex-shrink-0 text-right">Select Journals:</label>
                <div className="flex-1 flex items-center gap-2">
                  <select
                    name="journal"
                    value={form.journal}
                    onChange={handleChange}
                    required
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384]"
                  >
                    <option value="">---Please select---</option>
                    {JOURNALS.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                  <span className="text-red-500 text-sm">*</span>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="p-5 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Types of document files suggested: <span className="font-normal text-gray-600">(doc/docx)</span>
              </p>

              {/* Manuscript */}
              <div className="flex items-center gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => manuscriptRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#d63384] text-white text-sm font-semibold rounded hover:bg-[#b5165a] transition-colors"
                >
                  <Upload className="w-4 h-4" /> + Add MainFiles
                </button>
                <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white min-h-[38px] flex items-center gap-2">
                  {manuscriptFile ? (
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-[#d63384]" />
                      {manuscriptFile.name}
                      <button type="button" onClick={() => { setManuscriptFile(null); if (manuscriptRef.current) manuscriptRef.current.value = ''; }}>
                        <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold text-sm">No file selected</span>
                  )}
                </div>
                <input ref={manuscriptRef} type="file" accept=".doc,.docx,.pdf" className="hidden" onChange={e => setManuscriptFile(e.target.files?.[0] ?? null)} />
              </div>

              {/* Supplementary */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => supplementaryRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#d63384] text-white text-sm font-semibold rounded hover:bg-[#b5165a] transition-colors"
                >
                  <Upload className="w-4 h-4" /> + Add Files
                </button>
                <div className="flex-1 border border-gray-300 rounded px-3 py-2 bg-white min-h-[38px] flex items-center gap-2">
                  {supplementaryFile ? (
                    <span className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="w-4 h-4 text-[#d63384]" />
                      {supplementaryFile.name}
                      <button type="button" onClick={() => { setSupplementaryFile(null); if (supplementaryRef.current) supplementaryRef.current.value = ''; }}>
                        <X className="w-4 h-4 text-red-500 hover:text-red-700" />
                      </button>
                    </span>
                  ) : (
                    <span className="text-[#d63384] font-semibold text-sm">Supplementary Materials</span>
                  )}
                </div>
                <input ref={supplementaryRef} type="file" accept=".doc,.docx,.pdf,.zip" className="hidden" onChange={e => setSupplementaryFile(e.target.files?.[0] ?? null)} />
              </div>
            </div>

            {/* Username + Password */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-b">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">User Name:</label>
                  <input
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="User Name"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384] w-48"
                  />
                  <span className="text-red-500 text-sm">*</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-gray-700">Password:</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#d63384] focus:ring-1 focus:ring-[#d63384] w-48"
                  />
                  <span className="text-red-500 text-sm">*</span>
                </div>
              </div>
            </div>
          </div>

          {/* Submit + Reset Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3 bg-[#8b1a2e] text-white font-bold text-base rounded hover:bg-[#6d1424] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
              ) : 'Submit'}
            </button>
            <button
              type="reset"
              className="px-10 py-3 bg-gray-500 text-white font-bold text-base rounded hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}
