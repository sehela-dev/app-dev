"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCallback, useMemo, useState } from "react";

import { Divider } from "@/components/ui/divider";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useAdminManualTransaction } from "@/context/admin/add-transaction.ctx";
import { formatCurrency } from "@/lib/helper";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import { useCreateNewManualTrx } from "@/hooks/api/mutations/admin/use-create-manual-order";
import { IPackages, IProduct, ISession } from "@/types/orders.interface";
import { useRouter } from "next/navigation";
import { useApplyDiscountVoucher } from "@/hooks/api/mutations/admin";
import { IApplyDiscountResponse, IVouchersListItem } from "@/types/discount-voucher.interface";
import { DiscountSelectComponent } from "@/components/page/orders/discount-code-select";
import { XIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BANK_LIST } from "@/constants/sample-data";
import Select from "react-select";

export const PAYMENT_METHODS = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "EDC",
    value: "edc",
  },
  {
    label: "Bank Transfer",
    value: "transfer",
  },
];
export const DetailFormAddTransaction = () => {
  const router = useRouter();

  const { cartItems, updateStepper, customerData, removeItem, updateQuantity, clearCart, addCustomer } = useAdminManualTransaction();
  const [selectedVoucher, setSelectedVoucher] = useState<IVouchersListItem | null>(null);
  const [discountData, setDiscountData] = useState<IApplyDiscountResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedPaymentMethod, setSelectPaymentMethod] = useState("cash");
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [selectedBankTo, setSelectedBankTo] = useState<string | null>(null);
  const [nameFrom, setNameFrom] = useState(customerData?.name ?? "");

  const { mutateAsync, isPending } = useCreateNewManualTrx();
  const onModifyQty = (id: number | string, type: "+" | "-") => {
    const item = cartItems?.find((item) => item.id === id);
    const currentQty = item?.quantity || 0;
    const newQty = type === "+" ? currentQty + 1 : currentQty - 1;

    if (newQty < 0) return;

    if (newQty === 0) {
      removeItem(id);
    } else if (item) {
      updateQuantity(id, newQty);
    }
  };

  const { mutateAsync: applyDiscountCode } = useApplyDiscountVoucher();
  const totalPrice = useMemo(() => {
    let tempTp = 0;
    cartItems?.map((item) => (tempTp = tempTp + item.subtotal));
    return tempTp ?? 0;
  }, [cartItems]);

  const onCancel = () => {
    setOpen(false);
    router.push("/admin/orders");
  };
  const onConfirm = async () => {
    const sessions: ISession[] = [];
    const products: IProduct[] = [];
    const packages: IPackages[] = [];

    cartItems?.forEach((item) => {
      if (item.type === "class") {
        sessions.push({
          class_session_id: item.id as string,
        });
      } else if (item.type === "buy_product" || item.type === "rent_product") {
        products.push({
          variant_id: item.id as string,
          quantity: item.quantity,
        });
      } else if (item.type === "packages") {
        packages.push({
          package_id: item.id as string,
          // share_with_user_id: item.quantity,
        });
      }
    });

    const payload = {
      customer_name: customerData?.name as string,
      customer_email: customerData?.email as string,
      customer_phone: customerData?.phone as string,
      sessions: sessions ?? [],
      products: products ?? [],
      packages: packages ?? [],
      notes: "Combined purchase",
      status: "paid",
      payment_method: selectedPaymentMethod,
      ...(selectedPaymentMethod === "bank"
        ? {
            transfer_details: {
              account_name_from: nameFrom as string,
              account_bank_from: selectedBank as string,
              account_bank_to: selectedBankTo as string,
            },
          }
        : null),
      user_id: customerData?.id as string,
      ...(discountData ? { voucher_code: selectedVoucher?.code } : null),
    };

    try {
      const res = await mutateAsync(payload);
      if (res) {
        setOpen(true);
        clearCart();
        addCustomer(undefined);
      }
    } catch (error) {
      console.log(error);
    }

    // updateStepper();
    // clearCart();
    // addCustomer(undefined);
    // setOpen(false);
  };

  const onSuccessDialog = () => {
    setOpen(false);
    clearCart();
    addCustomer(undefined);
    updateStepper();
  };

  const getCategoryFromItems = useCallback(() => {
    // Get unique types from the array
    const uniqueTypes = new Set(cartItems?.map((item) => item.type));

    // Map each unique type to its corresponding category
    const categories = Array.from(uniqueTypes)
      .map((type) => {
        switch (type) {
          case "class":
            return "booking";
          case "package":
            return "package_purchase";
          case "product":
            return "order";
          default:
            return "booking";
        }
      })
      .filter(Boolean); // Remove null/undefined values

    // Return unique categories
    return [...new Set(categories)];
  }, [cartItems]);

  const onApplyDiscount = async () => {
    try {
      const payload = {
        code: selectedVoucher?.code as string,
        transaction_type: selectedVoucher?.category as string,
        cart_total_idr: totalPrice,
        categories: getCategoryFromItems(),
        ...(customerData?.id ? { user_id: customerData.id as string } : null),
      };
      const res = await applyDiscountCode(payload);
      if (res) {
        setDiscountData(res?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="flex mt-2">
        <div className="grid grid-cols-8 gap-4">
          <div className="col-span-6 flex flex-col gap-4 w-full">
            <Card className="border-brand-100 w-full pb-0 ">
              <CardHeader>
                <h3 className=" text-brand-999 text-2xl font-semibold">Detail Order</h3>
                <p className="text-sm font-normal text-gray-500">Review class and product and choose how to pay</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col">
                  <div className="grid gap-2">
                    <hr style={{ color: "var(--color-brand-100" }} className="my-1" />
                    <div className="grid grid-cols-2">
                      <p className="text-brand-999 font-semibold text-sm">Customer Information</p>
                    </div>
                    <div className="grid grid-cols-2">
                      <p className="text-gray-500  text-sm">Customer</p>
                      <p className="text-brand-999 text-right text-sm">{customerData?.name}</p>
                    </div>
                    <div className="grid grid-cols-2">
                      <p className="text-gray-500  text-sm">Phone</p>
                      <p className="text-brand-999 text-right text-sm">{customerData?.phone}</p>
                    </div>
                    <div className="grid grid-cols-2">
                      <p className="text-gray-500  text-sm">Email</p>
                      <p className="text-brand-999 text-right text-sm">{customerData?.email}</p>
                    </div>
                    <Divider className="my-2" />
                  </div>

                  <div className="flex flex-col w-full">
                    <p className="text-brand-999 font-semibold text-sm mb-2">Ordered Items</p>
                    <div className="grid grid-cols-9">
                      <p className="text-gray-500 font-medium text-sm col-span-6">Item</p>
                      <p className="text-gray-500 font-medium text-sm col-span-1">Type</p>
                      <p className="text-gray-500 font-medium text-sm col-span-1 text-center flex justify-center items-center">Action</p>
                      <p className="text-gray-500 font-medium text-sm text-right col-span-1">Price & Qty</p>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex flex-col gap-2 itm">
                      <ScrollArea>
                        {cartItems?.map((item) => (
                          <div key={item.id}>
                            <div className="grid grid-cols-9">
                              <div className="col-span-6 items-center">
                                <p className="text-brand-999 font-medium text-sm">{item.name}</p>
                                {item?.description && <p className="text-gray-500 font-medium text-sm">{item.description}</p>}
                                {/* <p className="text-sm font-semibold text-brand-200 flex-1">
                              {item?.variant?.map((v: { name: string; value: string }) => v.value).join(", ")}
                            </p> */}
                              </div>
                              <p className="text-brand-999 font-medium text-sm col-span-1">
                                {item.badge && (
                                  <Badge className="border bg-brand-100 min-w-[18px] h-[18px] text-[10px] border-brand-400 !p-1.5 ">
                                    {item.badge}
                                  </Badge>
                                )}
                              </p>
                              <div className="text-brand-999 font-medium text-sm text-center col-span-1">
                                {" "}
                                <div className="flex flex-row gap-2 items-center justify-center">
                                  <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(item.id as number, "-")}>
                                    -
                                  </Button>
                                  <div className="w-8 h-8 flex items-center justify-center bg-brand-100 rounded-md">{item.quantity}</div>

                                  <Button variant={"outline"} className="bg-transparent w-8 h-8" onClick={() => onModifyQty(item.id as number, "+")}>
                                    +
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-brand-999">
                                  {item.price.toLocaleString("id-ID", {
                                    currency: "IDR",
                                    style: "currency",
                                    maximumFractionDigits: 0,
                                  })}
                                </p>
                                <p className="text-brand-999 font-medium text-sm text-right col-span-1">x{item.quantity}</p>
                              </div>
                            </div>
                            <Divider className="my-2" />
                          </div>
                        ))}
                      </ScrollArea>
                      <div className="grid grid-cols-9">
                        <p className="text-brand-999 font-medium text-sm col-span-8">Sub Total</p>
                        <p className="text-brand-999 font-medium text-sm text-right col-span-1">{formatCurrency(totalPrice)}</p>
                      </div>
                      <Divider className="my-2" />
                      <div className="grid grid-cols-2">
                        <p className="text-brand-999 font-semibold text-sm">Discount Code</p>
                      </div>

                      {!discountData ? (
                        <div className="flex flex-row w-full gap-2 items-center">
                          <div className="flex w-full">
                            <DiscountSelectComponent
                              selecteValue={selectedVoucher}
                              setSelectedVoucher={setSelectedVoucher}
                              status={getCategoryFromItems()}
                            />
                            {/* <Input className="w-full border-brand-100" placeholder="Input discount code here..." /> */}
                          </div>
                          <div className="col-span-2">
                            <Button className="text-brand-999" variant={"secondary"} onClick={onApplyDiscount}>
                              Apply
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-row w-full gap-2 items-center">
                          <div className="flex w-full">
                            <Badge className="border bg-brand-500  text-[10px] border-brand-400 !px-4 rounded-[999px] text-gray-50 ">
                              <p className="font-semibold text-lg">
                                {selectedVoucher?.code}{" "}
                                {selectedVoucher?.discount_type === "percentage"
                                  ? `(${selectedVoucher?.discount_value}%)`
                                  : formatCurrency(selectedVoucher?.discount_value)}
                              </p>
                            </Badge>
                          </div>
                          <div className="col-span-2">
                            <Button
                              className="text-brand-999"
                              variant={"ghost"}
                              onClick={() => {
                                setSelectedVoucher(null);
                                setDiscountData(null);
                              }}
                            >
                              <XIcon />
                            </Button>
                          </div>
                        </div>
                      )}

                      <Divider className="!my-4" />
                      <div className="grid grid-cols-9">
                        <p className="text-brand-999  text-sm col-span-8">Sub Total</p>
                        <p className="text-brand-999  text-sm text-right col-span-1">{formatCurrency(totalPrice)}</p>
                      </div>
                      <Divider />
                      <div className="grid grid-cols-9">
                        <p className="text-brand-999  text-sm col-span-8">Discount</p>
                        <p className="text-brand-999  text-sm text-right col-span-1">
                          -
                          {!discountData
                            ? formatCurrency(0)
                            : discountData?.discount_type === "percentage"
                            ? `${formatCurrency(discountData?.calculated_discount)} (${discountData?.discount_value}%)`
                            : formatCurrency(discountData?.discount_value)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-brand-25 rounded-b-xl min-h-[56px] w-full">
                <div className="flex flex-row w-full font-bold text-xl">
                  <p className="text-brand-999  text-sm w-[80%]">Total Payment</p>
                  <p className="text-brand-999  text-sm text-right w-full">
                    {!discountData ? formatCurrency(totalPrice) : formatCurrency(discountData?.final_amount)}
                  </p>
                </div>
              </CardFooter>
            </Card>
            <div className="flex w-full gap-2 pt-4">
              <div className="flex w-full">
                <Button variant={"secondary"} className="w-full" onClick={updateStepper}>
                  Add Other Items
                </Button>
              </div>
              <div className="flex w-full">
                <Button className="w-full" onClick={() => onConfirm()} disabled={!!isPending}>
                  Save
                </Button>
              </div>
            </div>
          </div>
          <Card className="flex flex-col w-full border border-brand-100  h-fit col-span-2 pt-2">
            <CardHeader className="text-center font-semibold text-lg ">
              Payment Method
              <Divider />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 w-full">
                <RadioGroup
                  className="flex flex-row items-center justify-between"
                  value={selectedPaymentMethod}
                  onValueChange={(e) => setSelectPaymentMethod(e)}
                >
                  {PAYMENT_METHODS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-sm font-medium text-brand-999 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1 mt-2">
                    <Label className="text-gray-500">Pay Amount</Label>
                    <Input
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-gray-999  placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                      value={!discountData ? formatCurrency(totalPrice) : formatCurrency(discountData?.final_amount)}
                      readOnly
                    />
                  </div>
                  {selectedPaymentMethod === "transfer" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col gap-1 mt-2">
                        <Label className="text-gray-500">Transfer To</Label>
                        <Select
                          options={BANK_LIST as never}
                          className="basic-multi-select "
                          classNames={{
                            control: () =>
                              "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                            placeholder: () => "placeholder-gray-400",
                            singleValue: () => "text-brand-999",
                            input: () => "text-brand-999 bg-none",
                          }}
                          onChange={(e) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setSelectedBankTo(e as any);
                          }}
                        />
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <Label className="text-gray-500">Account Name</Label>
                        <Input
                          className="w-full px-4 py-4 border-2 border-gray-200 rounded-lg text-brand-999 placeholder-gray-400 focus:outline-none focus:border-brand-500 transition-colors h-[42px]"
                          placeholder="Type here.."
                          value={nameFrom}
                          onChange={(e) => {
                            setNameFrom(e.target.value);
                          }}

                          // className="w-auto min-w-[388px]"
                        />
                      </div>

                      <div className="flex flex-col gap-1 mt-2">
                        <Label className="text-gray-500">Transfer From</Label>
                        <Select
                          options={BANK_LIST as never}
                          className="basic-multi-select "
                          classNames={{
                            control: () =>
                              "w-full !border-2 !border-gray-200 rounded-lg text-gray-999  focus:outline-none focus:border-brand-500 transition-colors h-[42px] !rounded-md !bg-transparent shadow-xs",
                            placeholder: () => "placeholder-gray-400",
                            singleValue: () => "text-brand-999",
                            input: () => "text-brand-999 bg-none",
                          }}
                          onChange={(e) => {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            setSelectedBank(e as any);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* {selectedPaymentMethod === "bank_transfer" &&} */}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {open && (
        <BaseDialogConfirmation
          image="success-2"
          onCancel={onCancel}
          subtitle="Manual transaction added to your records."
          title="Transaction Added Successfully"
          onConfirm={onSuccessDialog}
          open={open}
          cancelText="Order List"
          confirmText="Create More"
        />
      )}
    </>
  );
};
