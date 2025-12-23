"use client";

import Image from "next/image";
import { AlertDialog, AlertDialogFooter, AlertDialogHeader, AlertDialogDescription, AlertDialogTitle, AlertDialogContent } from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Divider } from "../ui/divider";

interface IDialogConfimation {
  open: boolean;
  title: string;
  image: string;
  subtitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  hideCancel?: boolean;
}

export const BaseDialogConfirmation = ({
  image = "warning-1",
  onCancel,
  onConfirm,
  open,
  subtitle,
  title,
  cancelText = "Back",
  confirmText = "Exit",
  hideCancel = false,
}: IDialogConfimation) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex justify-center items-center">
              <Image src={`/assets/alert/${image}.png`} alt="warning" width={120} height={120} />
            </div>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[20px] text-center font-semibold">{title}</AlertDialogDescription>
          <AlertDialogDescription className="text-sm text-gray-500 text-center">{subtitle}</AlertDialogDescription>
        </AlertDialogHeader>
        <Divider />
        <AlertDialogFooter>
          <div className="flex w-full gap-2">
            {!hideCancel && (
              <div className="flex w-full">
                <Button variant="secondary" className="flex w-full text-brand-999" onClick={onCancel}>
                  {cancelText}
                </Button>
              </div>
            )}
            <div className="flex w-full">
              <Button className="flex w-full" onClick={onConfirm}>
                {confirmText}
              </Button>
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
