// client/src/components/ui/tabs.jsx
import React, { useId, useMemo, useState, useCallback } from "react";

const TabsContext = React.createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children, className = "" }) {
  const stableId = useId();
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);

  const current = isControlled ? value : internal;

  const setValue = useCallback(
    (v) => {
      if (!isControlled) setInternal(v);
      onValueChange?.(v);
    },
    [isControlled, onValueChange]
  );

  const ctx = useMemo(
    () => ({ current, setValue, baseId: stableId }),
    [current, setValue, stableId]
  );

  return (
    <TabsContext.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  const { current } = React.useContext(TabsContext);
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex items-center gap-1 rounded-md border bg-white p-1 ${className}`}
      data-current={current}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }) {
  const { current, setValue, baseId } = React.useContext(TabsContext);
  const selected = current === value;

  const id = `${baseId}-tab-${value}`;
  const panelId = `${baseId}-panel-${value}`;

  return (
    <button
      id={id}
      role="tab"
      aria-selected={selected}
      aria-controls={panelId}
      tabIndex={selected ? 0 : -1}
      onClick={() => setValue(value)}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors
        ${selected ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}
        ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const { current, baseId } = React.useContext(TabsContext);
  const hidden = current !== value;
  const id = `${baseId}-panel-${value}`;
  const tabId = `${baseId}-tab-${value}`;

  return (
    <div
      id={id}
      role="tabpanel"
      aria-labelledby={tabId}
      hidden={hidden}
      className={`mt-3 ${hidden ? "hidden" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
