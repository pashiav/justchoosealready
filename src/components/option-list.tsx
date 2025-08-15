"use client";

import { Button } from "@/components/ui/button";
import { useWheelStore } from "@/lib/store";
import { PlaceOption } from "@/lib/google";
import { FaMapMarkerAlt, FaStar, FaInfoCircle } from "react-icons/fa";

export function OptionList() {
  const { selectedOptions, removeOption } = useWheelStore();

  // Debug logging
  console.log('OptionList render - selectedOptions:', selectedOptions);
  console.log('OptionList render - selectedOptions type:', typeof selectedOptions);
  console.log('OptionList render - isArray:', Array.isArray(selectedOptions));

  // Ensure selectedOptions is always an array with better error handling
  let options: PlaceOption[] = [];
  try {
    if (Array.isArray(selectedOptions)) {
      options = selectedOptions;
    } else if (selectedOptions && typeof selectedOptions === 'object' && selectedOptions !== null) {
      // If it's an object, try to extract an array from it
      const obj = selectedOptions as Record<string, unknown>;
      options = (obj.places as PlaceOption[]) || (obj.results as PlaceOption[]) || (obj.options as PlaceOption[]) || [];
    } else {
      console.warn('selectedOptions is not an array:', selectedOptions);
      options = [];
    }
  } catch (error) {
    console.error('Error processing selectedOptions:', error);
    options = [];
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-lg font-nunito">
      <h3 className="text-2xl font-semibold mb-4 text-[#3d3d3d] font-lilita uppercase">
        Food Options ({options.length})
      </h3>
      <hr className="-mt-4 pb-4 border-t-3 border-black" />
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <div
            key={option.place_id}
            className="flex items-start justify-between py-3 px-3 bg-transparent rounded-2xl border border-amber-950"
            style={{ backgroundColor: "rgba(255,255,255,0.30)" }}
          >
            <div className="min-w-0 flex-1">
              {/* First line: Restaurant name - clickable */}
              <a
                href={(() => {
                  // Build Google search URL with restaurant name and full address (prefer formatted_address over vicinity)
                  let addressToUse = '';
                  if (option.formatted_address && option.formatted_address !== 'Address not available') {
                    addressToUse = option.formatted_address;
                  } else if (option.vicinity && option.vicinity !== 'Address not available') {
                    addressToUse = option.vicinity;
                  }
                  
                  const searchQuery = encodeURIComponent(
                    addressToUse ? `${option.name} ${addressToUse}`.trim() : option.name
                  )
                  return `https://www.google.com/search?q=${searchQuery}`
                })()}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#3d3d3d] truncate mb-1 block hover:text-[#ef4e2d] underline transition-colors cursor-pointer"
              >
                {option.name}
              </a>
              
              {/* Second line: Address, rating, and price */}
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                {/* Show full address if available, otherwise show vicinity */}
                {(option.formatted_address || option.vicinity) && 
                 (option.formatted_address !== 'Address not available' && option.vicinity !== 'Address not available') && (
                  <span className="flex items-center gap-1 truncate">
                    <FaMapMarkerAlt className="text-red-500 text-xs" /> 
                    {option.formatted_address || option.vicinity}
                  </span>
                )}
                
                {/* Show "Address not available" message if no address */}
                {(!option.formatted_address && !option.vicinity) || 
                 (option.formatted_address === 'Address not available' && option.vicinity === 'Address not available') && (
                  <div className="relative group">
                    <span className="flex items-center gap-1 text-gray-400 italic cursor-help">
                      <FaMapMarkerAlt className="text-gray-400 text-xs" /> 
                      Address not available
                      <FaInfoCircle className="text-gray-600 text-xs ml-1" />
                    </span>
                    
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      Get better results by logging in to use Google Maps.
                      {/* Tooltip arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                )}

                {option.rating && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <FaStar className="text-yellow-500 text-xs" /> {option.rating}
                    {option.user_ratings_total && (
                      <span className="text-gray-500">
                        ({option.user_ratings_total})
                      </span>
                    )}
                  </span>
                )}

                {option.price_level && (
                  <span className="text-green-600 font-medium whitespace-nowrap">
                    {Array(option.price_level).fill("$").join("")}
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeOption(option.place_id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-2 p-1 h-auto min-w-[24px] mt-1"
              aria-label={`Remove ${option.name} from options`}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      {options.length < 2 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Need at least 2 restaurants to spin the wheel
          </p>
        </div>
      )}
    </div>
  );
}