"use client";

import { BackButtonComponent } from "@/components/general/back-button";
import { BaseDialogConfirmation } from "@/components/general/dialog-confirnation";
import {
  buildSessionPayload,
  createSessionDefaultValues,
  OveridePaymentModelForm,
  SessionBasicInfoFormComponent,
  SessionDateTimeFormComponent,
  SessionLocationFormComponent,
  SessionPricingFormComponent,
} from "@/components/page/session/form";
import { Button } from "@/components/ui/button";
import { useCreateNewSession } from "@/hooks/api/mutations/admin";
import { ICreateSessionPaylaod } from "@/types/class-sessions.interface";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FormProvider, useForm } from "react-hook-form";

export const CreateSessionPageView = () => {
  const router = useRouter();
  const methods = useForm({ defaultValues: createSessionDefaultValues });
  const { watch } = methods;
  const isOveride = watch("type");
  const { handleSubmit } = methods;
  const { mutateAsync } = useCreateNewSession();

  const [open, setOpen] = useState({
    ONCANCEL: false,
    ONSUCCESS: false,
  });

  // useEffect(() => {
  //   const handler = (e: BeforeUnloadEvent) => {
  //     e.preventDefault();
  //     e.returnValue = "";
  //     // handleOpenModal("ONCANCEL");
  //   };

  //   window.addEventListener("beforeunload", handler);
  //   return () => window.removeEventListener("beforeunload", handler);
  // }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const submitData = buildSessionPayload(data);
      const res = await mutateAsync(submitData as ICreateSessionPaylaod);
      if (res) {
        handleOpenModal("ONSUCCESS");
      }
    } catch (error) {
      console.log(error);
    }
  });

  const handleOpenModal = (type: "ONCANCEL" | "ONSUCCESS") => {
    setOpen((prev) => ({
      ...prev,
      [type]: !open[type],
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <BackButtonComponent page="/admin/session">
        <div className="flex flex-col gap-2">
          <h3 className="text-3xl font-semibold">Create Session</h3>
          <p className="text-gray-500">Fill in the details to create a new session</p>
        </div>
      </BackButtonComponent>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-4">
            <SessionBasicInfoFormComponent />
            {isOveride !== "regular" && <OveridePaymentModelForm prefix={"payment"} />}

            <div className="grid grid-cols-2 gap-2">
              <SessionDateTimeFormComponent />
              <SessionLocationFormComponent />
            </div>
            <SessionPricingFormComponent />
          </div>
          <div className="flex flex-row w-full items-center justify-end gap-4 mt-4">
            <div>
              <Button
                variant={"secondary"}
                type="button"
                onClick={() => {
                  handleOpenModal("ONCANCEL");
                }}
              >
                Cancel
              </Button>
            </div>
            <div>
              <Button type="submit">Create Session</Button>
            </div>
          </div>
        </form>
      </FormProvider>

      {open.ONCANCEL && (
        <BaseDialogConfirmation
          image="warning-1"
          onCancel={() => handleOpenModal("ONCANCEL")}
          open={open.ONCANCEL}
          title="Session Not Saved"
          subtitle="If you exit now, unsaved changes will be lost and cannot be recovered. Continue?"
          onConfirm={() => router.push("/admin/session")}
          cancelText="Cancel"
          confirmText="Continue"
        />
      )}

      {open.ONSUCCESS && (
        <BaseDialogConfirmation
          image="success-add"
          onCancel={() => router.push("/admin/session")}
          open={open.ONSUCCESS}
          title="Session Created Successfully"
          subtitle="Your new session has been successfully added."
          onConfirm={() => {
            methods.reset();
            handleOpenModal("ONSUCCESS");
            window.location.reload();
          }}
          cancelText="Session List"
          confirmText="Create More"
        />
      )}
    </div>
  );
};
