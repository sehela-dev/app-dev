"use client";

import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { IAdminAuditLog } from "@/types/admin-management.interface";
import { formatDateHelper } from "@/lib/helper";
import { Loader2 } from "lucide-react";

const ACTION_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  admin_create: { label: "Admin Created", variant: "default" },
  admin_update: { label: "Admin Updated", variant: "secondary" },
  admin_deactivate: { label: "Admin Deactivated", variant: "destructive" },
  product_create: { label: "Product Created", variant: "default" },
  product_update: { label: "Product Updated", variant: "secondary" },
  product_delete: { label: "Product Deleted", variant: "destructive" },
  class_create: { label: "Class Created", variant: "default" },
  class_update: { label: "Class Updated", variant: "secondary" },
  class_delete: { label: "Class Deleted", variant: "destructive" },
  session_create: { label: "Session Created", variant: "default" },
  session_update: { label: "Session Updated", variant: "secondary" },
  session_delete: { label: "Session Deleted", variant: "destructive" },
  enroll_create: { label: "Enrollment", variant: "outline" },
  enroll_cancel: { label: "Enrollment Cancelled", variant: "destructive" },
  voucher_create: { label: "Voucher Created", variant: "default" },
  voucher_update: { label: "Voucher Updated", variant: "secondary" },
  voucher_delete: { label: "Voucher Deleted", variant: "destructive" },
  inventory_update: { label: "Inventory Updated", variant: "secondary" },
  location_create: { label: "Location Created", variant: "default" },
  location_update: { label: "Location Updated", variant: "secondary" },
  location_delete: { label: "Location Deleted", variant: "destructive" },
  instructor_create: { label: "Instructor Created", variant: "default" },
  instructor_update: { label: "Instructor Updated", variant: "secondary" },
  instructor_delete: { label: "Instructor Deleted", variant: "destructive" },
};

const ACTION_FALLBACK = { label: "Action", variant: "outline" as const };

export const getActionBadge = (action: string): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } => {
  return ACTION_LABELS[action] ?? { label: prettifyAction(action), variant: "outline" as const };
};

export const AUDIT_ACTION_OPTIONS = Object.keys(ACTION_LABELS).map((key) => ({ value: key, label: ACTION_LABELS[key].label }));

const prettifyAction = (action: string): string => {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const FIELD_LABELS: Record<string, string> = {
  full_name: "Full Name",
  name: "Name",
  phone: "WhatsApp",
  email: "Email",
  role: "Role",
  is_active: "Status",
  password: "Password",
  product_id: "Product ID",
  category_id: "Category ID",
  is_rentable: "Rentable",
  class_id: "Class ID",
  class_name: "Class Name",
  allow_credit: "Allow Credit",
  session_id: "Session ID",
  session_name: "Session Name",
  booking_id: "Booking ID",
  package_name: "Package",
  customer_name: "Customer",
  payment_method: "Payment Method",
  credits_used: "Credits Used",
  notes: "Notes",
};

const formatFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Object) return JSON.stringify(value);
  return String(value);
};

const renderChanges = (before: Record<string, unknown> | null, after: Record<string, unknown> | null) => {
  const keys = Array.from(new Set([...(before ? Object.keys(before) : []), ...(after ? Object.keys(after) : [])]));
  const rows: { key: string; before: string; after: string }[] = [];
  keys.forEach((key) => {
    const beforeValue = before ? before[key] : undefined;
    const afterValue = after ? after[key] : undefined;
    if (beforeValue !== afterValue) {
      rows.push({
        key,
        before: formatFieldValue(beforeValue),
        after: formatFieldValue(afterValue),
      });
    }
  });
  return rows;
};

interface IAuditLogDetailsProps {
  isOpen: boolean;
  log: IAdminAuditLog | null;
  onClose: () => void;
}

export const AuditLogDetailsComponent = ({ isOpen, log, onClose }: IAuditLogDetailsProps) => {
  const badge = log ? getActionBadge(log.action) : ACTION_FALLBACK;

  return (
    <BaseDialogComponent title="Audit Log Details" isOpen={isOpen} onClose={onClose} btnConfirm="Close" onConfirm={onClose}>
      {!log ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-12 gap-2 text-sm">
            <div className="grid col-span-4 text-gray-500">Action</div>
            <div className="grid col-span-8">
              <Badge variant={badge.variant}>{badge.label}</Badge>
            </div>
            <div className="grid col-span-4 text-gray-500">Actor</div>
            <div className="grid col-span-8">
              <div className="flex flex-col">
                <span>{log.actor_name}</span>
                <span className="text-xs text-gray-500">{log.actor_auth_user_id}</span>
              </div>
            </div>
            <div className="grid col-span-4 text-gray-500">Target</div>
            <div className="grid col-span-8">
              {log.target_name ? (
                <div className="flex flex-col">
                  <span>{log.target_name}</span>
                  <span className="text-xs text-gray-500">{log.target_email ?? "-"}</span>
                </div>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>
            <div className="grid col-span-4 text-gray-500">Date</div>
            <div className="grid col-span-8">{formatDateHelper(log.created_at, "dd/MM/yyyy HH:mm")}</div>
            <div className="grid col-span-4 text-gray-500">Reason</div>
            <div className="grid col-span-8">{log.reason ?? "-"}</div>
          </div>
          <Divider />
          <div>
            <h4 className="text-sm font-semibold mb-2">Changes</h4>
            {renderChanges(log.before_data, log.after_data).length > 0 ? (
              <div className="overflow-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-50 text-gray-500">
                      <th className="text-left p-3 font-medium">Field</th>
                      <th className="text-left p-3 font-medium">Before</th>
                      <th className="text-left p-3 font-medium">After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderChanges(log.before_data, log.after_data).map((row) => (
                      <tr key={row.key} className="border-t border-brand-100">
                        <td className="p-3">{FIELD_LABELS[row.key] ?? row.key}</td>
                        <td className="p-3 text-gray-500">{row.before}</td>
                        <td className="p-3">{row.after}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No field changes recorded.</p>
            )}
          </div>
        </div>
      )}
    </BaseDialogComponent>
  );
};
