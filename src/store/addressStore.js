import { create } from "zustand";

/**
 * Zustand store for managing address state across components
 */
export const useAddressStore = create((set) => ({
  // Address components
  building: "",
  street: "",
  area: "",
  city: "",
  postalCode: "",

  // Formatted address
  formattedAddress: "",

  // Validation state
  validation: {
    isValid: false,
    severity: "info",
    message: "",
  },

  // Actions
  setBuilding: (building) => set({ building }),
  setStreet: (street) => set({ street }),
  setArea: (area) => set({ area }),
  setCity: (city) => set({ city }),
  setPostalCode: (postalCode) => set({ postalCode }),

  setFormattedAddress: (formattedAddress) => set({ formattedAddress }),
  setValidation: (validation) => set({ validation }),

  // Bulk update for Google Places results
  updateAddressComponents: (components) =>
    set({
      building: components.building || "",
      street: components.street || "",
      area: components.area || "",
      city: components.city || "",
      postalCode: components.postalCode || "",
    }),

  // Reset all
  reset: () =>
    set({
      building: "",
      street: "",
      area: "",
      city: "",
      postalCode: "",
      formattedAddress: "",
      validation: { isValid: false, severity: "info", message: "" },
    }),
}));
