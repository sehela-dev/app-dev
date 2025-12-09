import * as React from "react";
export const Divider = ({ className, ...props }: React.ComponentProps<"hr">) => {
  return <hr style={{ color: "var(--color-brand-100" }} className={className} {...props} />;
};
