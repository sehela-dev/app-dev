"use client";
import { useCallback, useState } from "react";

type TFilterType = "availbility" | "instructor" | "classType";

export const useSessionFilterState = () => {
  const [classAvailibility, setClassAvailibility] = useState<string[]>(["all"]);
  const [instructors, setInstructors] = useState<string[]>(["all"]);
  const [classTypes, setClassTypes] = useState<string[]>(["all"]);

  const handleChageCheckBox = (type: TFilterType, value: string) => {
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

  return {
    classAvailibility,
    instructors,
    classTypes,
    handleChageCheckBox,
  };
};
