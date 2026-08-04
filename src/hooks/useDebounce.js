import { useState, useEffect } from "react";

/**
 * useDebounce – delays updating the returned value until `delay` ms have
 * passed since the last change to `value`.
 *
 * @param {*}      value  The value to debounce
 * @param {number} delay  Milliseconds to wait (default 350)
 * @returns {*}           The debounced value
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
