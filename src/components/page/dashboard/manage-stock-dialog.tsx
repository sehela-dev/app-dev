"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Divider } from "@/components/ui/divider";
import { BaseDialogComponent } from "@/components/general/base-dialog-component";
import { Warehouse, CheckCircle2 } from "lucide-react";
import { IStockableVariant } from "@/types/product.interface";
import { formatCurrency } from "@/lib/helper";
import { useAdjustProductVariantInventory } from "@/hooks/api/mutations/admin/use-adjust-inventory-stock";

interface StockChange {
  [key: string]: {
    locationId: string;
    locationName: string;
    currentStock: number;
    newStock: string | number;
    difference: number;
  };
}

interface ManageStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVariant: IStockableVariant | null;
  onSuccess?: () => void;
}

export const ManageStockDialog = ({
  isOpen,
  onClose,
  selectedVariant,
  onSuccess,
}: ManageStockDialogProps) => {
  const [stockChanges, setStockChanges] = useState<StockChange>({});
  const [reviewMode, setReviewMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState("");

  const { mutateAsync } = useAdjustProductVariantInventory()

  // Initialize stock changes when variant changes or dialog opens
  useEffect(() => {
    if (isOpen && selectedVariant?.inventory) {
      const initial: StockChange = {};
      selectedVariant.inventory.forEach((inv) => {
        initial[inv.id] = {
          locationId: inv.location_id,
          locationName: inv.location?.name || "Unknown",
          currentStock: inv.stock_total,
          newStock: inv.stock_total,
          difference: 0,
        };
      });
      setStockChanges(initial);
      setReason("");
    }
  }, [isOpen, selectedVariant]);

  const handleStockChange = (inventoryId: string, newValue: string) => {
    const numValue = newValue === "" ? 0 : parseInt(newValue) || 0;
    const current = stockChanges[inventoryId]?.currentStock || 0;

    setStockChanges((prev) => ({
      ...prev,
      [inventoryId]: {
        ...prev[inventoryId],
        newStock: newValue,
        difference: numValue - current,
      },
    }));
  };

  const getTotalDifference = () => {
    return Object.values(stockChanges).reduce((sum, change) => sum + change.difference, 0);
  };

  const getTotalNewStock = () => {
    return Object.values(stockChanges).reduce((sum, change) => sum + (parseInt(String(change.newStock)) || 0), 0);
  };

  const hasChanges = Object.values(stockChanges).some((change) => change.difference !== 0);

  const hasInvalidStock = Object.values(stockChanges).some((change) => Number(change.newStock) < 0);

  const hasNegativeStock = (change?: StockChange[string]) => Number(change?.newStock) < 0;

  const handleSubmit = async () => {
    if (!hasChanges) {
      onClose();
      return;
    }

    if (hasInvalidStock) {
      return;
    }

    if (!reason.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const variantId = selectedVariant?.id as string;
      const changedLocations = Object.values(stockChanges).filter((change) => change.difference !== 0);

      for (const change of changedLocations) {
        await mutateAsync({
          variantId,
          payload: {
            location_id: change.locationId,
            quantity_delta: change.difference,
            reason: reason.trim(),
          },
          idempotencyKey: crypto.randomUUID(),
        });
      }

      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Error updating stock:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStockChanges({});
    setReviewMode(false);
    setReason("");
    onClose();
  };

  return (
    <BaseDialogComponent
      isOpen={isOpen}
      title="Manage Stock"
      onClose={handleClose}
      onCloseText="Cancel"
      btnConfirm={reviewMode ? "Confirm Update" : hasChanges ? "Review Changes" : "Done"}
      isDisabled={hasInvalidStock || (hasChanges && !reason.trim()) || isSubmitting}
      onConfirm={reviewMode ? handleSubmit : hasChanges ? () => setReviewMode(true) : handleClose}

    >
      {!selectedVariant ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Variant Info */}
          <div className="bg-accent/5 p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold ">{selectedVariant.variant_name}</h4>
                <p className="text-sm text-muted-foreground">SKU: {selectedVariant.sku}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-400">{formatCurrency(selectedVariant.price_idr)}</p>
              </div>
            </div>
          </div>

          {/* Input Mode */}
          {!reviewMode ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold  flex items-center gap-2">
                <Warehouse size={16} />
                Update Stock by Location
              </h4>

              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12">
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Reason <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. restock, damaged, correction"
                    className="h-[38px]"
                  />
                  {hasChanges && !reason.trim() && (
                    <p className="text-xs text-destructive mt-1">Reason is required to adjust stock</p>
                  )}
                </div>
              </div>

              {selectedVariant.inventory?.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No inventory locations assigned to this variant
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedVariant.inventory?.map((inv) => {
                    const change = stockChanges[inv.id] || {
                      currentStock: inv.stock_total,
                      newStock: inv.stock_total,
                      difference: 0,
                    };
                    const isDifferent = change.difference !== 0;

                    return (
                      <Card key={inv.id} className={isDifferent ? "border-blue-500/50 bg-blue-500/5" : ""}>
                        <CardContent className="pt-4">
                          <div className="grid grid-cols-12 gap-3 items-end">
                            {/* Location Info */}
                            <div className="col-span-4">
                              <p className="text-sm font-medium ">{inv.location?.name}</p>
                              <p className="text-xs text-muted-foreground mt-1">Current: {inv.stock_total} units</p>
                            </div>

                            {/* Stock Input */}
                            <div className="col-span-4">
                              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                                New Stock
                              </label>
                              <Input
                                type="number"
                                min="0"
                                value={change.newStock}
                                onChange={(e) => handleStockChange(inv.id, e.target.value)}
                                placeholder="0"
                                className={`h-[38px] ${hasNegativeStock(change) ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}`}
                              />
                              {hasNegativeStock(change) && (
                                <p className="text-xs text-destructive mt-1">Stock cannot be negative</p>
                              )}
                            </div>

                            {/* Difference Display */}
                            <div className="col-span-4">
                              <div className={`p-2.5 rounded-lg text-sm font-medium text-center ${change.difference > 0
                                ? "bg-emerald-500/10 text-emerald-600"
                                : change.difference < 0
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-gray-100 text-gray-600"
                                }`}>
                                {change.difference > 0 ? "+" : ""}{change.difference}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {Object.keys(stockChanges).length > 0 && (
                <Card className="border-blue-500/50 bg-blue-500/5">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total Current Stock</p>
                        <p className="text-lg font-semibold ">
                          {Object.values(stockChanges).reduce((sum, change) => sum + (change?.currentStock || 0), 0) || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Total New Stock</p>
                        <p className="text-lg font-semibold text-blue-600">{getTotalNewStock() || 0}</p>
                      </div>
                      {hasChanges && (
                        <div className="col-span-2">
                          <div className={`p-2.5 rounded-lg text-center font-medium ${getTotalDifference() > 0
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-red-500/10 text-red-600"
                            }`}>
                            Net Change: {getTotalDifference() > 0 ? "+" : ""}{getTotalDifference()} units
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            /* Review Mode */
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <CheckCircle2 size={18} className="text-blue-600" />
                <p className="text-sm text-blue-700 font-medium">Review your changes before confirming</p>
              </div>

              <div className="space-y-3">
                {selectedVariant.inventory?.map((inv) => {
                  const change = stockChanges[inv.id];
                  if (!change || change.difference === 0) return null;

                  return (
                    <Card key={inv.id} className="border-blue-500/50 bg-blue-500/5">
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-medium ">{inv.location?.name}</p>
                            <Badge variant={change.difference > 0 ? "default" : "destructive"}>
                              {change.difference > 0 ? "Increase" : "Decrease"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">Current</p>
                              <p className="font-semibold ">{change.currentStock}</p>
                            </div>
                            <div className="flex items-end justify-center">
                              <p className="font-bold text-muted-foreground">{change.difference > 0 ? "+" : ""}{change.difference}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs mb-1">New</p>
                              <p className="font-semibold text-blue-600">{change.newStock}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Review Summary */}
              <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
                <CardHeader>
                  <h4 className="font-semibold ">Update Summary</h4>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Current Stock:</span>
                      <span className="font-semibold">
                        {Object.values(stockChanges).reduce((sum, change) => sum + change.currentStock, 0)}
                      </span>
                    </div>
                    <Divider className="my-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total New Stock:</span>
                      <span className="font-semibold text-blue-600">{getTotalNewStock()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Net Change:</span>
                      <span className={`font-semibold ${getTotalDifference() > 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {getTotalDifference() > 0 ? "+" : ""}{getTotalDifference()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Edit Button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setReviewMode(false)}
              >
                ← Back to Edit
              </Button>
            </div>
          )}
        </div>
      )}
    </BaseDialogComponent>
  );
};
