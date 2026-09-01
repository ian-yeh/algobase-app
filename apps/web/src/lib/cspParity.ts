import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthStore } from "@/stores/authStore";
import type { CspParity } from "@algobase/square-one";

// Some people trace Square-1 CSP parity the opposite way round - what they call
// "even" is what this app's algorithm data calls "odd", and vice versa. The flip
// is its own inverse, so one function handles both display and un-display.
export function flipParity(parity: CspParity): CspParity {
  return parity === "even" ? "odd" : "even";
}

export function useSwapCspParity(): boolean {
  const token = useAuthStore((s) => s.token);
  const me = useQuery(api.user.getMe, token ? { token } : "skip");
  return me?.swapCspParity ?? false;
}
