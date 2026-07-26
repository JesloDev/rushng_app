'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export interface VerificationDocument {
  id: string;
  type: 'nin' | 'drivers_license' | 'vehicle_reg' | 'utility_bill';
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  rejectionReason?: string;
  updatedAt?: string;
}

interface ProviderVerificationProps {
  currentLevel?: string; // 'basic' | 'verified' | 'certified'
  complianceScore?: number; // e.g., 85
  documents?: VerificationDocument[];
  onUploadDocument?: (docType: string, file: File) => Promise<void>;
}

const DEFAULT_DOCUMENTS: VerificationDocument[] = [
  {
    id: '1',
    type: 'nin',
    title: 'National Identification Number (NIN)',
    status: 'approved',
    updatedAt: '2026-05-12',
  },
  {
    id: '2',
    type: 'drivers_license',
    title: "Driver's License / Rider Permit",
    status: 'pending',
    updatedAt: '2026-07-20',
  },
  {
    id: '3',
    type: 'vehicle_reg',
    title: 'Vehicle Roadworthiness & Registration',
    status: 'not_submitted',
  },
  {
    id: '4',
    type: 'utility_bill',
    title: 'Proof of Residence (Utility Bill)',
    status: 'not_submitted',
  },
];

export function ProviderVerification({
  currentLevel = 'basic',
  complianceScore = 70,
  documents = DEFAULT_DOCUMENTS,
  onUploadDocument,
}: ProviderVerificationProps) {
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const getStatusBadge = (status: VerificationDocument['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">
            <Clock className="h-3 w-3 mr-1" /> Under Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none">
            <AlertTriangle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500 border-slate-200">
            Action Required
          </Badge>
        );
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDocId(docType);
    try {
      if (onUploadDocument) {
        await onUploadDocument(docType, file);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      toast.success('Document uploaded successfully and queued for review.');
    } catch (err) {
      toast.error('Failed to upload document. Please try again.');
    } finally {
      setUploadingDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900">Verification Status</h2>
                  <Badge className="bg-orange-600 text-white font-medium capitalize">
                    {currentLevel} Level
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete identity verification to receive high-value priority dispatches.
                </p>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Compliance Score
              </span>
              <div className="text-2xl font-black text-slate-900">{complianceScore}%</div>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Overall KYC Completion</span>
              <span>{complianceScore}%</span>
            </div>
            <Progress value={complianceScore} className="h-2 bg-slate-100" />
          </div>
        </CardContent>
      </Card>

      {/* Document Submission List */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Required Verification Documents</CardTitle>
          <CardDescription>
            Upload clear photos or PDFs of your official documents. Review usually takes 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4">
          {documents.map((doc) => {
            const isUploading = uploadingDocId === doc.type;

            return (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 shrink-0">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                      {getStatusBadge(doc.status)}
                    </div>
                    {doc.rejectionReason && (
                      <p className="text-xs text-red-600 mt-1">{doc.rejectionReason}</p>
                    )}
                    {doc.updatedAt && doc.status === 'approved' && (
                      <p className="text-xs text-slate-400 mt-0.5">Verified on {doc.updatedAt}</p>
                    )}
                  </div>
                </div>

                <div className="w-full sm:w-auto flex justify-end">
                  {doc.status !== 'approved' && (
                    <div className="relative">
                      <input
                        type="file"
                        id={`file-${doc.type}`}
                        className="hidden"
                        accept="image/*,application/pdf"
                        disabled={isUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.type, file);
                        }}
                      />
                      <label htmlFor={`file-${doc.type}`}>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isUploading}
                          className="text-xs font-medium border-slate-200 hover:bg-white cursor-pointer pointer-events-none"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <UploadCloud className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                              {doc.status === 'rejected' ? 'Re-upload' : 'Upload File'}
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}