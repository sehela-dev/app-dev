"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEHELA_BANKS } from "@/constants/sample-data";
import { useSettleBalance } from "@/hooks/api/mutations/admin/use-settle-balance";
import { formatCurrency } from "@/lib/helper";

const METHODS = [
  { value: "cash", label: "Cash" },
  { value: "edc", label: "EDC" },
  { value: "transfer", label: "Bank Transfer" },
] as const;

type SettleMethod = (typeof METHODS)[number]["value"];

interface SettleBalanceDialogProps {
  paymentId: string;
  balanceDueIdr: number;
  balanceDueDate?: string | null;
  onClose: () => void;
  onSettled: () => void;
}

export const SettleBalanceDialog = ({ paymentId, balanceDueIdr, balanceDueDate, onClose, onSettled }: SettleBalanceDialogProps) => {
  const [method, setMethod] = useState<SettleMethod>("cash");
  const [amount, setAmount] = useState(String(balanceDueIdr));
  const [senderName, setSenderName] = useState("");
  const [bankTo, setBankTo] = useState(SEHELA_BANKS[0].label);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useSettleBalance(paymentId);

  const handleSubmit = async () => {
    const value = Number(amount);
    if (!Number.isInteger(value) || value <= 0) {
      setError("Amount must be a positive whole number.");
      return;
    }
    if (value > balanceDueIdr) {
      setError(`Amount cannot exceed ${formatCurrency(balanceDueIdr)}.`);
      return;
    }
    setError(null);
    try {
      await mutateAsync({
        payment_method: method,
        amount_idr: value,
        ...(method === "transfer"
          ? { transfer_details: { account_name_from: senderName.trim() || null, account_bank_to: bankTo } }
          : null),
      });
      onSettled();
      onClose();
    } catch {
      // The mutation hook shows the server error.
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Balance</DialogTitle>
          <DialogDescription>
            Record money received for this paylater/DP transaction. Remaining balance:{" "}
            <span className="font-semibold text-brand-999">{formatCurrency(balanceDueIdr)}</span>
            {balanceDueDate ? ` (due ${balanceDueDate})` : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <Label className="text-gray-500">Amount Received</Label>
            <Input
              type="number"
              min={1}
              max={balanceDueIdr}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-[42px] border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
            />
            {Number(amount) < balanceDueIdr && Number(amount) > 0 && (
              <p className="text-xs text-gray-500">
                Remaining after this payment: {formatCurrency(balanceDueIdr - Number(amount))}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-gray-500">Payment Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as SettleMethod)}>
              <SelectTrigger className="w-full h-[42px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {method === "transfer" && (
            <>
              <div className="flex flex-col gap-1">
                <Label className="text-gray-500">Transfer From (Name)</Label>
                <Input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Input sender name..."
                  className="h-[42px] border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-gray-500">Transfer To</Label>
                <Select value={bankTo} onValueChange={setBankTo}>
                  <SelectTrigger className="w-full h-[42px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEHELA_BANKS.map((b) => (
                      <SelectItem key={b.value} value={b.label}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? "Saving..." : "Settle Balance"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
