import React from "react";

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={[
      "text-sm font-medium leading-none text-gray-800",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      "dark:text-gray-200",
      className,
    ]
      .filter(Boolean)
      .join(" ")}
    {...props}
  />
));
Label.displayName = "Label";