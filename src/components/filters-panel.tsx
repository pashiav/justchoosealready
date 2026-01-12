"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWheelStore } from "@/lib/store";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { generateLocationSuggestions } from "@/lib/utils";

const CUISINES = [
  "Italian",
  "Mexican",
  "Chinese",
  "Japanese",
  "Thai",
  "Indian",
  "American",
  "Mediterranean",
  "Greek",
  "French",
  "Spanish",
  "Korean",
  "Vietnamese",
  "Lebanese",
  "Turkish",
  "Brazilian",
  "Peruvian",
];

interface LocationSuggestion {
  description: string;
  placeId: string;
  types: string[];
}

export function FiltersPanel() {
  const { filters, setFilters, setSelectedOptions } = useWheelStore();
  const { data: session } = useSession();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [hasGoogleAccess, setHasGoogleAccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Check if user has Google API access (premium)
  const checkGoogleAccess = useCallback(async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/user/access');
      if (response.ok) {
        const data = await response.json();
        setHasGoogleAccess(data.google_api_access || false);
      }
    } catch (error) {
      console.error('Failed to check Google API access:', error);
      setHasGoogleAccess(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      checkGoogleAccess();
    }
  }, [session, checkGoogleAccess]);

  // Debounced autocomplete function (only works with Google Maps API)
  const debouncedAutocomplete = useCallback((locationText: string) => {
    // Don't use autocomplete if user doesn't have Google access (OpenStreetMap doesn't support it)
    if (!hasGoogleAccess) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      if (locationText.trim().length > 2) {
        try {
          const response = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ locationText, type: "autocomplete" }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.type === "autocomplete") {
              setSuggestions(data.suggestions);
              setShowSuggestions(true);
              setSelectedSuggestionIndex(-1);
            }
          }
        } catch (error) {
          console.error("Autocomplete failed:", error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300); // Reduced to 300ms for better UX
  }, [hasGoogleAccess]);

  // Handle location input changes
  const handleLocationChange = (locationText: string) => {
    setFilters({ locationText });
    setShowSuggestions(false);
    setSuggestions([]);

    // Clear previous coordinates when text changes
    setFilters({ lat: undefined, lng: undefined });

    // Get autocomplete suggestions
    debouncedAutocomplete(locationText);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = async (suggestion: LocationSuggestion) => {
    setFilters({ locationText: suggestion.description });
    setShowSuggestions(false);
    setSuggestions([]);

    // Get exact coordinates for the selected suggestion
    try {
      setIsGeocoding(true);
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locationText: suggestion.description,
          type: "geocode",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.type === "geocode") {
          setFilters({
            locationText: data.formattedAddress || suggestion.description,
            lat: data.lat,
            lng: data.lng,
          });
        }
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev: number) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev: number) =>
          prev > 0 ? prev - 1 : -1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (
      suggestionsRef.current &&
      !suggestionsRef.current.contains(e.target as Node)
    ) {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Add click outside listener
  useEffect(() => {
    const listener = (e: MouseEvent) => handleClickOutside(e);
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  const handleSearch = async () => {
    if (!filters.locationText.trim()) {
      setError("Please enter a location");
      return;
    }

    setIsSearching(true);
    setError(null);
    setErrorSuggestions([]);

    try {
      const cleanQuery = {
        ...filters,
        cuisine: filters.cuisine || "any",
        price: filters.price === 0 ? undefined : filters.price,
        priceRanges:
          filters.priceRanges && filters.priceRanges.length > 0
            ? filters.priceRanges
            : undefined,
      };

      console.log("Sending search query:", cleanQuery);

      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanQuery),
      });

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setErrorSuggestions(data.suggestions || []);
      } else {
        // Handle different API response structures
        let options;
        if (data.places) {
          // OpenStreetMap response structure
          options = data.places;
          console.log('OpenStreetMap search results:', data);
        } else if (Array.isArray(data)) {
          // Google Maps response structure (direct array)
          options = data;
          console.log('Google Maps search results:', data);
        } else {
          // Fallback - try to extract options from any structure
          options = data.results || data.options || [];
          console.log('Unknown response structure, extracted options:', options);
        }
        
        if (options && options.length > 0) {
          setSelectedOptions(options);
        } else {
          setError('No restaurants found in this area');
          // Generate helpful suggestions based on the location entered
          const locationSuggestions = generateLocationSuggestions(filters.locationText || '');
          if (locationSuggestions.length > 0) {
            setErrorSuggestions(locationSuggestions);
          } else {
            setErrorSuggestions([
              'Try expanding your search radius',
              'Try a different location or neighborhood',
              'Try removing cuisine filters'
            ]);
          }
        }
      }
    } catch {
      setError("Couldn't complete the search");
      setErrorSuggestions([
        'Make sure your location includes city and state (e.g., "Kansas City, MO")',
        'Try using a full street address if a city name isn\'t working',
        'Check your internet connection and try again'
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGeolocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters({
            locationText: "Current Location",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError("Couldn't get your location");
          setErrorSuggestions([
            'Make sure location permissions are enabled',
            'Try entering your location manually'
          ]);
        }
      );
    } else {
      setError("Geolocation not supported");
      setErrorSuggestions(['Please enter your location manually']);
    }
  };

  return (
    <div className="max-w-full rounded-lg p-4 md:p-6 font-lilita uppercase">
      <div className="space-y-6">
        {/* Location */}
        <div>
          <label className="block text-lg font-medium text-[#ef4e2d] mb-2">
            Location
          </label>
          <div className="space-y-2 font-nunito tracking-wider">
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-black text-sm pointer-events-none z-10">
                <FaMapMarkerAlt />
              </span>
              <Input
                ref={inputRef}
                placeholder="Enter city, address, or landmark"
                value={filters.locationText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleLocationChange(e.target.value)
                }
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="pl-8 pr-3"
              />

              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg   lg max-h-60 overflow-y-auto"
                >
                  {suggestions.map(
                    (suggestion: LocationSuggestion, index: number) => (
                      <div
                        key={suggestion.placeId}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                          index === selectedSuggestionIndex ? "bg-gray-100" : ""
                        }`}
                        onClick={() => handleSuggestionSelect(suggestion)}
                      >
                        <div className="text-sm text-gray-800">
                          {suggestion.description}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {suggestion.types[0]?.replace(/_/g, " ")}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {isGeocoding && (
              <div className="text-xs text-[#ef4e2d] text-center">
                <div className="flex items-center justify-center gap-1">
                  <FaSearch color="#ef4e2d" size={12} />
                  <span>Finding location...</span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGeolocate}
              className="w-full border-2 border-black"
            >
              📍 Use My Location
            </Button>
          </div>
        </div>

        {/* Cuisine */}
        <div>
          <label className="block text-lg font-medium text-[#ef4e2d] mb-2">
            Cuisine Type
          </label>
          <Select
            value={filters.cuisine || "any"}
            onValueChange={(value: string) =>
              setFilters({ cuisine: value === "any" ? "any" : value })
            }
          >
            <SelectTrigger className="font-nunito tracking-wider">
              <SelectValue
                placeholder="Any cuisine"
                className="font-nunito tracking-wider"
              />
            </SelectTrigger>
            <SelectContent className="font-nunito tracking-wider">
              <SelectItem value="any" className="font-nunito tracking-wider">
                Any cuisine
              </SelectItem>
              {CUISINES.map((cuisine) => (
                <SelectItem
                  key={cuisine}
                  value={cuisine.toLowerCase()}
                  className="font-nunito tracking-wider"
                >
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Ranges - Only for premium users with Google API access */}
        {hasGoogleAccess && (
          <div>
            <label className="block text-lg font-medium text-[#ef4e2d] mb-2">
              Price Ranges
            </label>
            <div className="space-y-2 font-nunito tracking-wider">
              {[
                { value: 1, label: "$", description: "Under $10" },
                { value: 2, label: "$$", description: "$11-$30" },
                { value: 3, label: "$$$", description: "$31-$60" },
                { value: 4, label: "$$$$", description: "Over $60" },
              ].map((priceOption) => (
                <label
                  key={priceOption.value}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={
                      filters.priceRanges?.includes(priceOption.value) || false
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const currentRanges = filters.priceRanges || [];
                      if (e.target.checked) {
                        setFilters({
                          priceRanges: [...currentRanges, priceOption.value],
                        });
                      } else {
                        setFilters({
                          priceRanges: currentRanges.filter(
                            (p: number) => p !== priceOption.value
                          ),
                        });
                      }
                    }}
                    className="w-4 h-4 text-[#ef4e2d] bg-white border-2 border-black rounded focus:ring-[#ef4e2d] focus:ring-2"
                  />
                  <span className="text-lg font-bold text-black">
                    {priceOption.label}
                  </span>
                  <span className="text-sm text-gray-600">
                    {priceOption.description}
                  </span>
                </label>
              ))}
              {(!filters.priceRanges || filters.priceRanges.length === 0) && (
                <p className="text-xs text-gray-500 italic">
                  Select price ranges or leave empty for any price
                </p>
              )}
            </div>
          </div>
        )}

        {/* Distance */}
        <div>
          <label className="block text-lg font-medium text-[#ef4e2d] mb-2">
            Distance: {filters.radiusMiles} miles
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={filters.radiusMiles}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFilters({ radiusMiles: parseInt(e.target.value) })
            }
            className="w-full h-2 rounded-lg appearance-none cursor-pointer slider border-1 border-black"
          />
          <div className="flex justify-between text-xs text-black font-nunito tracking-wider font-bold mt-1 lowercase">
            <span>1 mi</span>
            <span>25 mi</span>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={isSearching || !filters.locationText.trim()}
          className="w-full text-[1rem] font-bold px-4 pb-5 pt-6 bg-[#ef4e2d] border-b-4 border-[#c83e22] font-nunito tracking-wider transition-all duration-200 uppercase rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:cursor-pointer"
        >
          {isSearching ? (
            <span className="flex items-center justify-center gap-2">
              <FaSearch className="w-[4rem] h-[4rem] animate-spin" />{" "}
              Searching...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FaSearch className="w-[4rem] h-[4rem]" />
            </span>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="text-sm text-gray-700 text-center p-4 bg-amber-50/50 rounded-lg border border-amber-200/50">
            <div className="font-medium mb-2">{error}</div>
            {errorSuggestions.length > 0 && (
              <div className="mt-3 space-y-1.5 text-left">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                  Try this:
                </div>
                {errorSuggestions.map((suggestion, index) => (
                  <div key={index} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Subtitle */}
        {(filters.cuisine && filters.cuisine !== "any") ||
        (hasGoogleAccess && filters.priceRanges && filters.priceRanges.length > 0) ? (
          <p className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded-lg">
            {filters.cuisine !== "any" ? filters.cuisine : "Any"} within{" "}
            {filters.radiusMiles} miles
            {hasGoogleAccess &&
              filters.priceRanges &&
              filters.priceRanges.length > 0 &&
              ` • ${filters.priceRanges
                .map((p: number) => "$".repeat(p))
                .join(" + ")}`}
          </p>
        ) : null}
      </div>
    </div>
  );
}
