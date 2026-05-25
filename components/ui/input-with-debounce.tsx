"use client";

import * as React from "react";
import { Input } from "./input";

type InputWithDebounceProps = React.ComponentPropsWithoutRef<"input"> & {
  onDebouncedChange?: (value: string) => void;
  debounceMs?: number;
};

export function InputWithDebounce({
  onDebouncedChange,
  debounceMs = 500,
  className,
  value: controlledValue,
  defaultValue = "",
  onChange,
  ...props
}: InputWithDebounceProps) {
  const [internalValue, setInternalValue] = React.useState(
    controlledValue !== undefined ? controlledValue : defaultValue,
  );
  const timeoutRef = React.useRef<number | null>(null);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  React.useEffect(
    () => () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onChange?.(event);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    if (onDebouncedChange) {
      timeoutRef.current = window.setTimeout(() => {
        onDebouncedChange(nextValue);
      }, debounceMs);
    }
  };

  return (
    <Input
      {...props}
      value={value}
      onChange={handleChange}
      className={className}
    />
  );
}
