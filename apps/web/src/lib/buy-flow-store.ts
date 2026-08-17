import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CoverType, DriverDetails, VehicleLookupResult } from "@motorcover/shared-types";

export interface BuyFlowState {
  coverType: CoverType;
  vehicle: (VehicleLookupResult & { id: string }) | null;
  startDate: string | null;
  endDate: string | null;
  driver: DriverDetails | null;
  quoteId: string | null;

  setCoverType: (coverType: CoverType) => void;
  setVehicle: (vehicle: (VehicleLookupResult & { id: string }) | null) => void;
  setCoverDetails: (startDate: string, endDate: string) => void;
  setDriver: (driver: DriverDetails) => void;
  setQuoteId: (quoteId: string | null) => void;
  reset: () => void;
}

const initialState = {
  coverType: "PERSONAL" as CoverType,
  vehicle: null,
  startDate: null,
  endDate: null,
  driver: null,
  quoteId: null,
};

/**
 * Holds the in-progress buy-flow state client-side, persisted to
 * sessionStorage so a page refresh mid-journey doesn't lose progress.
 * Once a Quote is created server-side, `quoteId` becomes the source of truth
 * and the rest of this state is just for re-displaying what was entered.
 */
export const useBuyFlowStore = create<BuyFlowState>()(
  persist(
    (set) => ({
      ...initialState,
      setCoverType: (coverType) => set({ coverType }),
      setVehicle: (vehicle) => set({ vehicle }),
      setCoverDetails: (startDate, endDate) => set({ startDate, endDate }),
      setDriver: (driver) => set({ driver }),
      setQuoteId: (quoteId) => set({ quoteId }),
      // Cover type is chosen on the landing page *before* the lookup that
      // starts a new flow, and reset() runs on that lookup — so clearing it
      // here would silently discard the customer's Business selection.
      reset: () => set((s) => ({ ...initialState, coverType: s.coverType })),
    }),
    {
      name: "daydrive-buy-flow",
      storage: {
        getItem: (name) => {
          const value = sessionStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => sessionStorage.setItem(name, JSON.stringify(value)),
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);
