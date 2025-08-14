"use client";

import { Button } from "@/components/ui/button";
import { useWheelStore } from "@/lib/store";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";

export function OptionList() {
  const { selectedOptions, removeOption } = useWheelStore();

   if (selectedOptions.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-lg font-nunito">
      <h3 className="text-2xl font-semibold mb-4 text-[#3d3d3d] font-lilita uppercase">
        Food Options ({selectedOptions.length})
      </h3>
      <hr className="-mt-4 pb-4 border-t-3 border-black" />
      <div className="flex flex-col gap-2">
        {selectedOptions.map((option) => (
          <div
            key={option.place_id}
            className="flex items-start justify-between py-3 px-3 bg-transparent rounded-2xl border border-amber-950"
            style={{ backgroundColor: "rgba(255,255,255,0.30)" }}
          >
            <div className="min-w-0 flex-1">
              {/* First line: Restaurant name - clickable */}
              <a
                href={`https://www.google.com/maps/place/?q=place_id:${option.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#3d3d3d] truncate mb-1 block hover:text-[#ef4e2d] underline transition-colors cursor-pointer"
              >
                {option.name}
              </a>
              
              {/* Second line: Address, rating, and price */}
              <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                {option.vicinity && (
                  <span className="flex items-center gap-1 truncate">
                    <FaMapMarkerAlt className="text-red-500 text-xs" /> {option.vicinity}
                  </span>
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

      {selectedOptions.length < 2 && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Need at least 2 restaurants to spin the wheel
          </p>
        </div>
      )}
    </div>
  );
}