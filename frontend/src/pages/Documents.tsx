import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DocumentItem } from '../types';
import {
  FileText,
  UploadCloud,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  Clock
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('ITR');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const res = await api.getDocuments();
      if (res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.warn('Could not load documents:', err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type.toLowerCase())) {
        setErrorMsg('Invalid file format. Please upload a PDF, JPG, or PNG document.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 5MB maximum limit.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg('Please choose a valid file to upload.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      if (notes) formData.append('notes', notes);

      const res = await api.uploadDocument(formData);
      setDocuments((prev) => [res.document, ...prev]);
      setSelectedFile(null);
      setNotes('');
      setSuccessMsg('Document successfully uploaded and cataloged in profile.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete document.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-3 mb-2">
        <div className="p-3 rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Supporting Financial Documents</h2>
          <p className="text-xs text-slate-500">
            Upload verified KYC, income tax returns, salary slips, and collateral deeds required by lenders.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Upload Supporting Document</h3>
        <p className="text-xs text-slate-500 mb-4">
          Accepted file types: <strong>PDF, JPG, PNG</strong> (Maximum 5MB per document).
        </p>

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Document Classification
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ITR">Income Tax Returns (ITR - Last 2-3 Years)</option>
                <option value="BANK_STATEMENT">Bank Statement (Last 6 Months)</option>
                <option value="SALARY_SLIP">Co-Applicant Salary Slips (Last 3 Months)</option>
                <option value="CA_NET_WORTH_CERTIFICATE">CA Certified Net Worth Certificate</option>
                <option value="PROPERTY_DOCS">Property Title Deed / 30-Year EC / Layout</option>
                <option value="PASSPORT_ID">Passport / Aadhaar / KYC Identity Proof</option>
                <option value="ADMISSION_LETTER">University Admission Letter / I-20 Form</option>
                <option value="ACADEMIC_MARKSHEET">Academic Marksheets & Standardized Test Scores</option>
                <option value="OTHER">Other Financial / Academic Evidence</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                File Attachment
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Sub-category (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assessment Year 2024-25 ITR-V for Father"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Files are securely encrypted and access-restricted to your account.
            </span>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Encrypting & Storing...' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900">Uploaded Supporting Documents ({documents.length})</h3>
          <span className="text-xs text-slate-500">Supporting Evidence for Lender Appraisal</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p>No documents uploaded yet.</p>
            <p className="text-[11px] mt-1">Upload key documents to improve your Document Readiness score.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    PDF
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{doc.originalName}</span>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium">
                        {doc.documentType.replace(/_/g, ' ')}
                      </span>
                      <span>• {formatFileSize(doc.fileSize)}</span>
                      <span>• {new Date(doc.createdAt).toLocaleDateString()}</span>
                      {doc.notes && <span>• Note: {doc.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-emerald-600" />
                    Uploaded
                  </span>

                  <a
                    href={api.getDocumentDownloadUrl(doc.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                    title="View Document"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50/70 p-3 rounded-xl">
          <strong>Notice:</strong> For this hiring assignment, uploaded documents serve as supporting preliminary evidence for profile completeness and lender matching. Automated verification is not performed; physical verification and underwriting appraisal are conducted by the respective lender.
        </div>
      </div>
    </div>
  );
};
