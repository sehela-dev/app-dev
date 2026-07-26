'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useGetVoidPreview } from '@/hooks/api/queries/admin/orders';
import { formatCurrency } from '@/lib/helper';
import { Badge } from '@/components/ui/badge';


export interface TransactionVoidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (reason: string, disposition: string) => void;
  isDisabled?: boolean;

  trxId: string
}

export const TransactionVoidDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDisabled = false,
  trxId

}: TransactionVoidDialogProps) => {
  const [step, setStep] = useState<'preview' | 'reason'>('preview');
  const [reason, setReason] = useState('');
  const [selectedDisposition, setSelectedDisposition] = useState('refunded_externally');

  const { data, isLoading, refetch } = useGetVoidPreview(trxId)


  const payment = data?.data?.payment || {};

  const handleProceedToReason = () => {
    if (data?.data?.possible && data?.data.blockers?.length === 0) {
      setStep('reason');
    }
  };

  const handleSubmitVoid = () => {
    if (reason.trim() && onConfirm) {
      onConfirm(reason, selectedDisposition);
      resetForm();
    }
  };

  const resetForm = () => {
    setStep('preview');
    setReason('');
    setSelectedDisposition('refunded_externally');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[55vw] max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-brand-500">
            {step === 'preview' ? 'Preview Transaction Void' : 'Confirm Void Reason'} {data?.data?.possible ?
              <Badge>Voidable</Badge> : <Badge variant={'destructive'}>Non Voidable</Badge>}
          </AlertDialogTitle>
        </AlertDialogHeader>
        {isLoading ? <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div> : <>


          <div className="space-y-6 py-4">
            {step === 'preview' ? (
              <PreviewStep
                data={data}
                payment={payment}
                selectedDisposition={selectedDisposition}
                onDispositionChange={setSelectedDisposition}
              />
            ) : (
              <ReasonStep
                reason={reason}
                onReasonChange={setReason}
                selectedDisposition={selectedDisposition}
                onDispositionChange={setSelectedDisposition}
                data={data}
                payment={payment}
              />
            )}
          </div>

          <AlertDialogFooter>
            <div className="flex flex-row w-full gap-2.5">
              <div className="w-full">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={step === 'preview' ? handleClose : () => setStep('preview')}
                >
                  {step === 'preview' ? 'Cancel' : 'Back'}
                </Button>
              </div>
              <div className="w-full">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={step === 'preview' ? handleProceedToReason : handleSubmitVoid}
                  disabled={
                    isDisabled ||
                    (step === 'preview'
                      ? !data?.data?.possible || (data?.data?.blockers?.length ?? 0) > 0
                      : !reason.trim())
                  }
                >
                  {step === 'preview' ? 'Proceed to Void' : 'Confirm Void'}
                </Button>
              </div>
            </div>
          </AlertDialogFooter>
        </>}

      </AlertDialogContent>
    </AlertDialog>
  );
};

interface PreviewStepProps {
  data: any;
  payment: any;
  selectedDisposition: string;
  onDispositionChange: (value: string) => void;
}

const PreviewStep = ({
  data,
  payment,
  selectedDisposition,
  onDispositionChange,
}: PreviewStepProps) => {
  return (
    <>
      {/* Amount Summary */}
      <div className="bg-muted/50 rounded-lg p-4 border">
        <p className="text-sm text-muted-foreground">Transaction Amount</p>
        <p className="text-3xl font-bold mt-1">IDR {payment.gross_amount_idr?.toLocaleString('id-ID')}</p>
        <p className="text-xs text-muted-foreground mt-2">{payment.order_id}</p>
      </div>

      {/* Blockers */}
      {(data.blockers?.length ?? 0) > 0 && (
        <div className="border-l-4 border-red-500 bg-red-500/10 rounded p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Blockers</h4>
              <ul className="mt-2 space-y-1 text-sm text-red-800">
                {data.blockers?.map((b: string, i: number) => (
                  <li key={i}>• {b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {(data.warnings?.length ?? 0) > 0 && (
        <div className="border-l-4 border-yellow-500 bg-yellow-500/10 rounded p-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900">Warnings</h4>
              <ul className="mt-2 space-y-1 text-sm text-yellow-800">
                {data.warnings?.map((w: string, i: number) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Effects Sections */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> Effects
        </h3>

        {/* Payment Status */}
        <EffectSection title="Payment Status">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">From:</span>
              <span className="font-medium capitalize">{data?.data.effects?.payment?.from_status}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">To:</span>
              <span className="font-medium capitalize text-red-600">
                {data?.data.effects?.payment?.to_status}
              </span>
            </div>
          </div>
        </EffectSection>

        {/* Refund */}
        <EffectSection title="Refund Processing">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">
                {formatCurrency(data?.data.effects?.refund?.amount_idr)}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Type:</span>
              <span className="font-medium capitalize">{data?.data.effects?.refund?.refund_type?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium text-emerald-600 uppercase">{data?.data.effects?.refund?.status}</span>
            </div>
          </div>
        </EffectSection>

        {/* Packages */}
        {(data?.data.effects?.packages?.length ?? 0) > 0 && (
          <EffectSection title={`Package Adjustments (${data?.data.effects?.packages?.length})`}>
            {data?.data.effects?.packages?.map((pkg: any, i: number) => (
              <div key={i} className="text-sm space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium capitalize">{pkg.to_status}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Balance Change:</span>
                  <span className="font-medium">{pkg.ledger_adjustment > 0 ? '+' : ''}{pkg.ledger_adjustment}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Root Purchase:</span>
                  <span className="font-medium">{pkg.root_purchase ? 'Yes' : 'No'}</span>
                </div>
              </div>
            ))}
          </EffectSection>
        )}
      </div>

      {/* Financial Disposition */}
      {data?.data.financial_disposition?.required && (
        <div className="border rounded-lg p-4 space-y-3">
          <h4 className="font-semibold">Financial Disposition Required</h4>
          <p className="text-sm text-muted-foreground">
            How to handle  {formatCurrency(data?.data.financial_disposition?.amount_idr)}?
          </p>
          <div className="space-y-2">
            {data?.data.financial_disposition?.allowed_dispositions?.map((disp: string) => (
              <label
                key={disp}
                className="flex items-center gap-3 p-3 border rounded hover:bg-muted cursor-pointer"
              >
                <input
                  type="radio"
                  name="disposition"
                  value={disp}
                  checked={selectedDisposition === disp}
                  onChange={(e) => onDispositionChange(e.target.value)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm capitalize">{disp.replace(/_/g, ' ')}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

interface ReasonStepProps {
  reason: string;
  onReasonChange: (value: string) => void;
  selectedDisposition: string;
  onDispositionChange: (value: string) => void;
  data: any;
  payment: any;
}

const ReasonStep = ({
  reason,
  onReasonChange,
  selectedDisposition,
  onDispositionChange,
  data,
  payment,
}: ReasonStepProps) => {
  return (
    <>
      <div className="space-y-4">
        <div>
          <label htmlFor="reason" className="block text-sm font-semibold mb-2">
            Reason for Void
          </label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value.slice(0, 500))}
            placeholder="Enter the reason for voiding this transaction..."
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{reason.length}/500 characters</p>
        </div>

        {data?.data.financial_disposition?.required && (
          <div className="border rounded-lg p-4 space-y-3">
            <h4 className="font-semibold">Financial Disposition</h4>
            <div className="space-y-2">
              {data?.data.financial_disposition?.allowed_dispositions?.map((disp: string) => (
                <label
                  key={disp}
                  className="flex items-center gap-3 p-3 border rounded hover:bg-muted cursor-pointer"
                >
                  <input
                    type="radio"
                    name="disposition"
                    value={disp}
                    checked={selectedDisposition === disp}
                    onChange={(e) => onDispositionChange(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="font-medium text-sm capitalize">{disp.replace(/_/g, ' ')}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            This action will void order {payment.order_id} for IDR{' '}
            {payment.gross_amount_idr?.toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </>
  );
};

interface EffectSectionProps {
  title: string;
  children: React.ReactNode;
}

const EffectSection = ({ title, children }: EffectSectionProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-sm">{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && <div className="px-3 pb-3 border-t bg-muted/20">{children}</div>}
    </div>
  );
};
