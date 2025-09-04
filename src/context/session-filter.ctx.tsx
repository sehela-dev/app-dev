"use client";

import type React from "react";

import { createContext, useContext, useMemo, useState } from "react";
type TFilterType = "availbility" | "instructor" | "classType";

type ISessionFilterCtx = {
  filterData: FilterData | null;
  setFilterData: React.Dispatch<React.SetStateAction<FilterData | null>>;
  classAvailibility: string[];
  instructors: string[];
  classTypes: string[];
  handleChageCheckBox: (type: TFilterType, value: string) => void;
  onApply: () => void;
};

interface FilterData {
  availbility: string | string[];
  instructors: string | string[];
  classTypes: string | string[];
}

const SessionFilterContext = createContext<ISessionFilterCtx | undefined>(undefined);

export function SessionFilterCtxProvider({ children }: { children: React.ReactNode }) {
  const [filterData, setFilterData] = useState<FilterData | null>(null);
  const [classAvailibility, setClassAvailibility] = useState<string[]>(["all"]);
  const [instructors, setInstructors] = useState<string[]>(["all"]);
  const [classTypes, setClassTypes] = useState<string[]>(["all"]);

  const handleChageCheckBox = (type: TFilterType, value: string) => {
    console.log(value, type);
    const map = {
      availbility: [classAvailibility, setClassAvailibility],
      instructor: [instructors, setInstructors],
      classType: [classTypes, setClassTypes],
    } as const;

    const [current, setter] = map[type];

    setter((prev) => {
      // 1) Click on "all" => exclusive
      if (value === "all") return ["all"];

      // 2) Any specific value: remove "all" if present
      const withoutAll = prev.filter((v) => v !== "all");

      // toggle the specific value
      const exists = withoutAll.includes(value);
      const next = exists
        ? withoutAll.filter((v) => v !== value) // uncheck
        : [...withoutAll, value]; // check

      // 3) If nothing selected, fall back to "all"
      return next.length ? next : ["all"];
    });
  };
  const onApply = () => {
    setFilterData({
      availbility: classAvailibility,
      classTypes,
      instructors,
    });
  };

  const ctxValue = useMemo(
    () => ({
      filterData,
      setFilterData,
      classAvailibility,
      instructors,
      classTypes,
      handleChageCheckBox,
      onApply,
    }),
    [filterData, classAvailibility, instructors, classTypes], // functions are stable enough here
  );

  return <SessionFilterContext.Provider value={ctxValue}>{children}</SessionFilterContext.Provider>;
}

export function useSessionFilter() {
  const ctx = useContext(SessionFilterContext);
  if (!ctx) throw new Error("useSessionFilter must be used within SessionFilterCtxProvider");
  return ctx;
}
