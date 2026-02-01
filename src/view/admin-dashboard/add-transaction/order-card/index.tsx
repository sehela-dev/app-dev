"use client";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { formatCurrency } from "@/lib/helper";
import { IAdminCartItemData, ICustomerData } from "@/types/orders.interface";

import { ScrollArea } from "@radix-ui/react-scroll-area";

import { Fragment, useMemo, useState } from "react";

interface IOrderCartProps {
  customerData?: ICustomerData;
  cartItems?: IAdminCartItemData[];
}

export const OrdersCartComponent = ({ customerData, cartItems }: IOrderCartProps) => {
  const { updateStepper, clearCart, addCustomer } = useAdminManualTransaction();

  const [open, setOpen] = useState(false);
  const totalPrice = useMemo(() => {
    let tempTp = 0;
    cartItems?.map((item) => (tempTp = tempTp + item.subtotal));
    return tempTp ?? 0;
  }, [cartItems]);

  const onContinue = () => {
    updateStepper();
  };

  // continue edit
  const onCancel = () => {
    setOpen(false);
  };
  // confirm reset
  const onConfirm = () => {
    clearCart();
    setOpen(false);
    addCustomer(undefined);
  };

  return (
    <div className="flex w-full  h-fit">
      <Card className="border-brand-100 w-full">
        <CardHeader>
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl text-brand-999 font-medium">Orders</h3>
            <p className="text-sm text-gray-500">Order summary and total bill</p>
          </div>
          <hr style={{ color: "var(--color-brand-100" }} className="my-2" />
        </CardHeader>

        <CardContent className="">
          <div className="grid gap-2">
            <div className="grid grid-cols-2">
              <p className="text-brand-999 font-semibold text-sm">Customer Information</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Customer</p>
              <p className="text-brand-999 text-right text-sm">{customerData?.name ?? "-"}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Phone</p>
              <p className="text-brand-999 text-right text-sm">{customerData?.phone ?? "-"}</p>
            </div>
            <div className="grid grid-cols-2">
              <p className="text-gray-500  text-sm">Email</p>
              <p className="text-brand-999 text-right text-sm">{customerData?.email ?? "-"}</p>
            </div>
            <hr style={{ color: "var(--color-brand-100" }} className="my-2" />
          </div>
          {(cartItems?.length as number) > 0 && (
            <div className="p-4">
              <div className="grid grid-cols-2">
                <p className="text-gray-500 font-medium text-sm">Item</p>
                <p className="text-gray-500 font-medium text-sm text-right">Price & Qty</p>
              </div>
              <hr style={{ color: "var(--color-brand-100" }} className="my-2" />

              <ScrollArea className="max-h-[400px] space-y-4">
                {cartItems?.map((item) => (
                  <Fragment key={item.id}>
                    <div className="grid grid-cols-2 items-center">
                      <div className="flex flex-row items-center gap-2">
                        <div>
                          <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                          <p className="text-gray-500 font-medium text-sm">{item.description}</p>
                        </div>
                        {item.badge && (
                          <Badge className="border bg-brand-100 min-w-[18px] h-[18px] text-[10px] border-brand-400 !p-1.5 ">{item.badge}</Badge>
                        )}
                      </div>
                      <div className="flex flex-row gap-2 justify-end items-center">
                        <div className="flex flex-col justify-center">
                          <p className="text-brand-999 font-medium text-sm text-right">{formatCurrency(item.price)}</p>
                          <p className="text-brand-999 font-medium text-sm text-right">X{item.quantity}</p>
                        </div>
                      </div>
                    </div>
                    <hr style={{ color: "var(--color-brand-100" }} />
                  </Fragment>
                ))}
              </ScrollArea>

              <div className="grid grid-cols-2 pt-4">
                <p className="text-brand-999 font-bold text-sm">TOTAL</p>
                <p className="text-brand-999 font-bold text-sm text-right">{formatCurrency(totalPrice)}</p>
              </div>
            </div>
          )}

          {(cartItems?.length as number) ? (
            <div className="flex flex-row w-full items-center gap-2 py-4">
              <div className="flex w-full">
                <Button variant={"secondary"} className="flex w-full" onClick={() => setOpen(true)}>
                  Cancel
                </Button>
              </div>
              <div className="fle w-full">
                <Button className="flex w-full" onClick={onContinue} disabled={!customerData}>
                  Continue
                </Button>
              </div>
            </div>
          ) : (
            <></>
          )}
        </CardContent>
      </Card>
      {open && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={onCancel}
          confirmText="Discard"
          subtitle="Any unsaved changes will be lost if you exit now."
          title="Unsaved Changes"
          onConfirm={onConfirm}
          open={open}
        />
      )}
    </div>
  );
};
