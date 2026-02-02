import { Button } from "../ui/button";
import React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Divider } from "../ui/divider";

export interface IProps {
  buttonTriggerText?: string;
  title: string;
  children: React.ReactNode;
  icon?: React.ReactElement;
  btnConfirm?: string;
  onConfirm?: () => void;
  onClickTrigger?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  isDisabled?: boolean;
}

export const BaseDialogComponent = ({
  isOpen = false,
  onConfirm,
  title = "Export Data",
  children,
  btnConfirm = "Export",
  onClose,
  isDisabled,
}: IProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="min-w-[55vw]">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
        </AlertDialogHeader>
        {children}
        <Divider />
        <AlertDialogFooter>
          <div className="flex flex-row w-full gap-2.5">
            {onClose && (
              <div className="w-full">
                <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            )}

            {btnConfirm && (
              <div className="w-full">
                <Button type="button" className="w-full" variant={"default"} onClick={onConfirm} disabled={isDisabled}>
                  {btnConfirm}
                </Button>
              </div>
            )}
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    // <Dialog open={isOpen}>
    //   <DialogTrigger asChild>
    //     <Button variant={"outline"} onClick={onClickTrigger}>
    //       {icon}
    //       {buttonTriggerText}
    //     </Button>
    //   </DialogTrigger>
    //   <DialogContent className="sm:max-w-[500px] max-w-[345px]  bg-brand-50 font-serif text-brand-500">
    //   <DialogHeader>
    //       <DialogTitle className="text-left">{title}</DialogTitle>
    //     </DialogHeader>
    //     <DialogContent className="">{children}</DialogContent>
    //     <DialogFooter className="">
    // <div className="flex flex-row w-full gap-2.5">
    //   <div className="w-full">
    //     <DialogClose asChild>
    //       <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
    //         Cancel
    //       </Button>
    //     </DialogClose>
    //   </div>

    //   <div className="w-full">
    //     <DialogClose asChild>
    //       <Button type="button" className="w-full" variant={"default"} onClick={onConfirm}>
    //         {btnConfirm}
    //       </Button>
    //     </DialogClose>
    //   </div>
    // </div>
    //     </DialogFooter>
    //   </DialogContent>
    // </Dialog>
  );
};
