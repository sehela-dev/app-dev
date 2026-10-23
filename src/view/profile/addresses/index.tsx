"use client";

import { getOrderApiError } from "@/api-req/customer-app";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { NavHeaderComponent } from "@/components/layout/header-checkout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAddress, useDeleteAddress, useGetAddresses, useUpdateAddress } from "@/hooks/api/queries/customer/orders";
import { IAddress, IAddressPayload } from "@/types/customer-app/order.interface";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const emptyForm: IAddressPayload = {
  label: "",
  recipient_name: "",
  phone: "",
  address: "",
  notes: "",
  is_default: false,
};

export const AddressListView = () => {
  const { data: addresses = [], isLoading } = useGetAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<IAddress | null>(null);
  const [form, setForm] = useState<IAddressPayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IAddress | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, is_default: addresses.length === 0 });
    setFormError(null);
    setOpen(true);
  };

  const openEdit = (address: IAddress) => {
    setEditing(address);
    setForm({
      label: address.label ?? "",
      recipient_name: address.recipient_name,
      phone: address.phone,
      address: address.address,
      notes: address.notes ?? "",
      is_default: address.is_default,
    });
    setFormError(null);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.recipient_name.trim() || !form.phone.trim() || !form.address.trim()) {
      setFormError("Recipient name, phone, and address are required.");
      return;
    }
    setFormError(null);
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing.id, body: form });
        toast.success("Address updated");
      } else {
        await createAddress.mutateAsync(form);
        toast.success("Address added");
      }
      setOpen(false);
    } catch (error) {
      const { code, message, details } = getOrderApiError(error);
      const fieldMessage = details ? Object.values(details)[0]?.[0] : undefined;
      setFormError(
        fieldMessage ||
        message ||
        (code === "ADDRESS_DEFAULT_CONFLICT" ? "Default address changed elsewhere. Please try again." : "Failed to save address."),
      );
    }
  };

  const handleSetDefault = async (address: IAddress) => {
    if (address.is_default) return;
    try {
      await updateAddress.mutateAsync({ id: address.id, body: { is_default: true } });
      toast.success("Default address updated");
    } catch (error) {
      const { message } = getOrderApiError(error);
      toast.error(message || "Failed to update default address.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await deleteAddress.mutateAsync(deleteTarget.id);
      toast.success(res.new_default_id ? "Address deleted. A new default was selected." : "Address deleted.");
      setDeleteTarget(null);
    } catch (error) {
      const { message } = getOrderApiError(error);
      toast.error(message || "Failed to delete address.");
    }
  };

  const isSaving = createAddress.isPending || updateAddress.isPending;

  return (
    <div className="flex flex-col w-full font-serif h-full text-brand-500">
      <NavHeaderComponent title="Address Book" />
      <div className="flex flex-col gap-3 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
              <MapPin className="text-brand-400" size={22} />
            </div>
            <p className="text-sm font-semibold">No saved address</p>
            <p className="max-w-[260px] text-xs text-brand-400">Add an address to use third-party delivery at checkout.</p>
            <Button className="mt-2" onClick={openCreate}>
              <Plus /> Add Address
            </Button>
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-brand-100 bg-brand-25 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-bold">
                    {address.label || "Address"}
                    {address.is_default && (
                      <span className="rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Default</span>
                    )}
                  </p>
                  <p className="mt-1 text-sm font-semibold">{address.recipient_name}</p>
                  <p className="text-xs text-brand-400">{address.phone}</p>
                  <p className="mt-1 whitespace-pre-line text-sm">{address.address}</p>
                  {address.notes && <p className="mt-1 text-xs text-brand-400">{address.notes}</p>}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" className="h-8 text-xs text-brand-500" onClick={() => openEdit(address)}>
                  <Pencil size={13} /> Edit
                </Button>
                {!address.is_default && (
                  <Button variant="outline" className="h-8 text-xs text-brand-500" onClick={() => handleSetDefault(address)}>
                    <Star size={13} /> Set default
                  </Button>
                )}
                <Button variant="outline" className="h-8 text-xs text-red-500" onClick={() => setDeleteTarget(address)}>
                  <Trash2 size={13} /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {addresses.length > 0 && (
        <div className="sticky bottom-4 z-40 pointer-events-none flex justify-center pb-1">
          <Button className="pointer-events-auto h-11 rounded-full px-6 shadow-lg" onClick={openCreate}>
            <Plus /> Add Address
          </Button>
        </div>
      )}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto bg-brand-25 font-serif">
          <SheetHeader>
            <SheetTitle className="text-brand-500">{editing ? "Edit Address" : "Add Address"}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            <div className="flex flex-col gap-1">
              <Label required>Recipient name</Label>
              <Input value={form.recipient_name} onChange={(e) => setForm({ ...form, recipient_name: e.target.value })} className="bg-brand-00" />
            </div>
            <div className="flex flex-col gap-1">
              <Label required>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-brand-00" inputMode="tel" />
            </div>
            <div className="flex flex-col gap-1">
              <Label required>Address</Label>
              <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-brand-00" rows={3} />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Label</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="bg-brand-00" placeholder="Rumah, Kantor…" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-brand-00" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={!!form.is_default} onCheckedChange={(checked) => setForm({ ...form, is_default: checked === true })} />
              Set as default address
            </label>

            {formError && <p className="text-xs font-medium text-red-600">{formError}</p>}

            <div className="flex gap-2 pt-2">
              <div className="flex w-full">

                <Button variant="outline" className="w-full text-brand-500" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
              <div className="flex w-full">

                <Button className="w-full" disabled={isSaving} onClick={handleSubmit}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <BaseDialogConfirmation
        open={!!deleteTarget}
        image="warning-1"
        title="Delete this address?"
        subtitle="This address will be removed from your address book."
        confirmText="Delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
