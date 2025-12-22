import { create } from "zustand";

/**
 * Zustand store for managing address state across components
 */
export const useAddressStore = create((set) => ({
  // Country selection (global support)
  country: "KE", // Default to Kenya, but supports worldwide
  countryName: "Kenya",

  // Address components
  building: "",
  street: "",
  area: "",
  city: "",
  state: "", // State/Province/Region
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
  setCountry: (country, countryName) => set({ country, countryName }),
  setBuilding: (building) => set({ building }),
  setStreet: (street) => set({ street }),
  setArea: (area) => set({ area }),
  setCity: (city) => set({ city }),
  setState: (state) => set({ state }),
  setPostalCode: (postalCode) => set({ postalCode }),

  setFormattedAddress: (formattedAddress) => set({ formattedAddress }),
  setValidation: (validation) => set({ validation }),

  // Bulk update for OpenStreetMap results
  updateAddressComponents: (components) =>
    set({
      building: components.building || "",
      street: components.street || "",
      area: components.area || "",
      city: components.city || "",
      state: components.state || "",
      postalCode: components.postalCode || "",
    }),

  // Reset all
  reset: () =>
    set({
      building: "",
      street: "",
      area: "",
      city: "",
      state: "",
      postalCode: "",
      formattedAddress: "",
      validation: { isValid: false, severity: "info", message: "" },
    }),
}));
