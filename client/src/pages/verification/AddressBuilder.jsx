import { useEffect, useState, useCallback, useRef } from 'react';
import { MapPin, AlertCircle, CheckCircle2, Search, Copy, Share2, Check, Globe, Shield } from 'lucide-react';
import { useAddressStore } from '../../store/addressStore';
import { formatAddress, validateAddress } from '../../utils/addressLogic';
import { getCountriesSorted, getCountryByCode, getAllRegions } from '../../data/countries';
import PreflightChecker from '../../components/PreflightChecker';
import AddressAnalysis from '../../components/AddressAnalysis';

// OpenStreetMap Nominatim API endpoint
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

export default function AddressBuilder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const resultsRef = useRef(null);
  
  const countries = getCountriesSorted();
  
  const {
    country,
    countryName,
    building,
    street,
    area,
    city,
    state,
    postalCode,
    formattedAddress,
    validation,
    setCountry,
    setBuilding,
    setStreet,
    setArea,
    setCity,
    setState,
    setPostalCode,
    setFormattedAddress,
    setValidation,
    updateAddressComponents,
  } = useAddressStore();
  
  // Handle country change
  const handleCountryChange = (e) => {
    const code = e.target.value;
    const countryData = getCountryByCode(code);
    if (countryData) {
      setCountry(code, countryData.name);
    }
  };
  
  // Search for places using OpenStreetMap Nominatim (worldwide)
  const searchPlaces = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const params = {
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5',
      };
      
      // Add country filter if selected
      if (country) {
        params.countrycodes = country.toLowerCase();
      }
      
      const response = await fetch(
        `${NOMINATIM_API}?` + new URLSearchParams(params),
        {
          headers: {
            'User-Agent': 'VeriBridge/1.0',
          },
        }
      );
      
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching places:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [country]);
  
  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 500);
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchPlaces]);
  
  // Handle clicking outside to close results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle selecting a search result
  const handleSelectPlace = (place) => {
    const address = place.address || {};
    
    updateAddressComponents({
      building: address.building || address.house || address.amenity || '',
      street: address.road || address.street || '',
      area: address.suburb || address.neighbourhood || address.city_district || '',
      city: address.city || address.town || address.village || '',
      state: address.state || address.county || address.region || '',
      postalCode: address.postcode || '',
    });
    
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };
  
  // Update formatted address whenever components change
  useEffect(() => {
    const addressComponents = { building, street, area, city, state, postalCode, countryName };
    const formatted = formatAddress(addressComponents);
    setFormattedAddress(formatted);
    
    const validationResult = validateAddress(formatted);
    setValidation(validationResult);
  }, [building, street, area, city, state, postalCode, countryName, setFormattedAddress, setValidation]);
  
  return (
    <div className="space-y-6">
      {/* Country Selector */}
      <div>
        <label className="label flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          Select Your Country
        </label>
        <select
          value={country}
          onChange={handleCountryChange}
          className="select-field"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-2">
          VeriBridge works in 35+ countries worldwide
        </p>
      </div>
      
      {/* OpenStreetMap Search */}
      <div className="relative" ref={resultsRef}>
        <label className="label flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-400" />
          Search Location (Optional)
        </label>
        
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder={`Type to search places in ${countryName}...`}
            className="input-field pr-10"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Powered by OpenStreetMap • Start typing an address or landmark
        </p>
        
        {/* Search Results Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-2 rounded-lg shadow-xl max-h-64 overflow-y-auto"
               style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            {searchResults.map((place) => (
              <button
                key={place.place_id}
                onClick={() => handleSelectPlace(place)}
                className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-gray-700/50 last:border-b-0 transition-colors"
              >
                <div className="font-medium text-sm text-white">
                  {place.display_name.split(',')[0]}
                </div>
                <div className="text-xs text-gray-400 mt-1 truncate">
                  {place.display_name}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Manual Address Input Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="building" className="label">
            Building / Apartment / Landmark Name
          </label>
          <input
            id="building"
            type="text"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            placeholder="e.g., Green Valley Apartments, Unit 12B"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="street" className="label">
            Street Name & Number
          </label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="e.g., 123 Main Street"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="area" className="label">
            Area / Neighborhood / District
          </label>
          <input
            id="area"
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g., Downtown, Westside"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="city" className="label">
            City / Town
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Lagos, Manila, Mumbai"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="state" className="label">
            State / Province / Region
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="e.g., California, Lagos State"
            className="input-field"
          />
        </div>
        
        <div>
          <label htmlFor="postalCode" className="label">
            Postal / ZIP Code
          </label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="e.g., 10001, 00100"
            className="input-field"
          />
        </div>
      </div>
      
      {/* Formatted Address Preview */}
      {formattedAddress && (
        <div className="mt-6 pt-6 border-t border-gray-700/50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-300">Formatted Address</h3>
            {validation && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                validation.severity === 'error' ? 'bg-red-500/20 text-red-400' :
                validation.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                {validation.severity === 'success' ? 'Valid' : validation.severity.toUpperCase()}
              </span>
            )}
          </div>
          
          <div className={`address-preview ${
            validation?.severity === 'error' ? 'address-preview-error' :
            validation?.severity === 'warning' ? 'address-preview-warning' :
            'address-preview-success'
          }`}>
            <p className="text-white mb-3">{formattedAddress}</p>
            
            <div className={`flex items-start gap-2 text-sm ${
              validation?.severity === 'error' ? 'text-red-400' :
              validation?.severity === 'warning' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {validation?.severity === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              {(validation?.severity === 'error' || validation?.severity === 'warning') && <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
              <span>{validation?.message}</span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <CopyButton text={formattedAddress} />
            <WhatsAppShareButton address={formattedAddress} />
          </div>
          
          {/* Kenya-Specific Analysis & Options */}
          {countryName === 'Kenya' && (
            <AddressAnalysis 
              addressComponents={{ building, street, area, city, state, postalCode, countryName }}
              formattedAddress={formattedAddress}
            />
          )}
          
          {/* Pre-Flight Verification */}
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              <h3 className="text-sm font-semibold text-gray-300">Pre-Flight Verification</h3>
            </div>
            <PreflightChecker />
          </div>
        </div>
      )}
    </div>
  );
}

// Copy to Clipboard Button Component
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
      style={{ 
        background: copied ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-secondary)',
        border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-color)'}`,
        color: copied ? '#10b981' : '#fff'
      }}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          Copy Address
        </>
      )}
    </button>
  );
}

// WhatsApp Share Button Component
function WhatsAppShareButton({ address }) {
  const handleShare = () => {
    const message = encodeURIComponent(
      `📍 My Verified Address (VeriBridge):\n\n${address}\n\n✅ This address is formatted for international KYC compliance.`
    );
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };
  
  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
      style={{ 
        background: '#25D366',
        color: '#fff'
      }}
    >
      <Share2 className="w-4 h-4" />
      Share via WhatsApp
    </button>
  );
}
