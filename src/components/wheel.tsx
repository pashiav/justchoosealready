"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useWheelStore } from "@/lib/store";
import { PlaceOption } from "@/lib/google";
import seedrandom from "seedrandom";
import {
  FaMapMarkerAlt,
  FaStar,
  FaRedo,
  FaCheck,
  FaDirections,
  FaHeart,
} from "react-icons/fa";
import Pattern from "@/components/Pattern";
import { useSession } from "next-auth/react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Link from "next/link";


export function Wheel() {
  const { selectedOptions } = useWheelStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(1.2); // Initialize with the default rotation
  const [winner, setWinner] = useState<PlaceOption | null>(null);
  const [seed, setSeed] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGoogleAccess, setHasGoogleAccess] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const { data: session } = useSession();

  const canSpin = selectedOptions.length >= 2;

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

  const checkFavoriteStatus = useCallback(async () => {
    if (!winner || !session) return;

    try {
      const response = await fetch('/api/favorites');
      if (response.ok) {
        const favorites = await response.json();
        const isFav = favorites.some((fav: { place_id: string }) => fav.place_id === winner.place_id);
        setIsFavorite(isFav);
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error);
    }
  }, [winner, session]);

  // Check if this place is already a favorite when winner changes
  useEffect(() => {
    if (winner && session) {
      checkFavoriteStatus();
    }
  }, [winner, session, checkFavoriteStatus]);

  // Check if user has Google API access
  useEffect(() => {
    if (session) {
      checkGoogleAccess();
    }
  }, [session, checkGoogleAccess]);

  const toggleFavorite = async () => {
    if (!winner || !session) {
      console.log('Cannot toggle favorite:', { winner: !!winner, session: !!session });
      return;
    }

    console.log('Toggling favorite for:', winner.place_id, 'Current state:', isFavorite);
    setIsLoading(true);
    try {
      if (isFavorite) {
        // Remove from favorites
        console.log('Removing from favorites...');
        const response = await fetch(`/api/favorites?place_id=${winner.place_id}`, {
          method: 'DELETE',
        });
        console.log('Remove response:', response.status);
        if (response.ok) {
          setIsFavorite(false);
          console.log('Successfully removed from favorites');
        } else {
          const errorData = await response.json();
          console.error('Failed to remove favorite:', errorData);
        }
      } else {
        // Add to favorites
        console.log('Adding to favorites...');
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            place_id: winner.place_id,
            place_data: winner // Send the full place data
          }),
        });
        console.log('Add response:', response.status);
        if (response.ok) {
          setIsFavorite(true);
          console.log('Successfully added to favorites');
        } else {
          const errorData = await response.json();
          console.error('Failed to add favorite:', errorData);
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const spinWheel = () => {
    if (!canSpin || isSpinning) return;

    setIsSpinning(true);
    setWinner(null);
    setIsFavorite(false);

    // Generate a new seed for this spin
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);

    // Use seedrandom for deterministic result
    const rng = seedrandom(newSeed);
    const randomValue = rng();

    // Calculate which slice wins
    const sliceCount = selectedOptions.length;
    const sliceAngle = (2 * Math.PI) / sliceCount;
    const winningIndex = Math.floor(randomValue * sliceCount);

    // Calculate the angle where the winning slice should end up (under the pointer at top)
    // The pointer is at the top (0 degrees in our coordinate system)
    const targetAngle = 0; // 0 degrees (top position where pointer is)

    // Calculate where the center of the winning slice currently is
    const winningSliceCenter = winningIndex * sliceAngle + sliceAngle / 2;

    // Calculate how much we need to rotate to get the winning slice to the target position
    // We need to rotate the wheel so that the winning slice center aligns with the pointer
    let rotationNeeded = targetAngle - winningSliceCenter;

    // Normalize the rotation to be between 0 and 2π
    while (rotationNeeded < 0) {
      rotationNeeded += 2 * Math.PI;
    }
    while (rotationNeeded >= 2 * Math.PI) {
      rotationNeeded -= 2 * Math.PI;
    }

    // Add multiple full rotations (5-8 spins) plus the needed rotation
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation =
      rotation + fullRotations * 2 * Math.PI + rotationNeeded;

    // Animate the spin
    setRotation(finalRotation);

    // Set winner after animation
    setTimeout(() => {
      setWinner(selectedOptions[winningIndex]);
      setIsSpinning(false);

      // Save spin to database
      saveSpin(newSeed, selectedOptions[winningIndex]);
    }, 3000);
  };

  const saveSpin = async (spinSeed: string, selectedPlace: PlaceOption) => {
    try {
      await fetch("/api/spin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seed: spinSeed,
          options: selectedOptions,
          selectedId: selectedPlace.place_id,
        }),
      });
    } catch (error) {
      console.error("Failed to save spin:", error);
    }
  };

  const resetWheel = () => {
    setRotation(1.2); // Reset to the default rotation instead of 0
    setWinner(null);
    setTimeout(() => {
      // Automatically spin again after closing modal
      spinWheel();
    }, 100);
  };

  const closeModal = () => {
    setWinner(null);
    setIsFavorite(false);
  };

  // Default wheel options for empty state
  const defaultOptions = [
    { name: "Spin Me!", place_id: "default-1" },
    { name: "Add Options", place_id: "default-2" },
    { name: "Hungry?", place_id: "default-3" },
    { name: "Let's Go!", place_id: "default-4" },
  ];

  const wheelOptions =
    selectedOptions.length > 0 ? selectedOptions : defaultOptions;
  const sliceCount = wheelOptions.length;
  const sliceAngle = (2 * Math.PI) / sliceCount;
  const radius = 180; // Reduced radius to fit within the gold border

  return (
    <>
      <div className="max-w-full text-center">
        <div className="flex justify-center w-full">
          <div className="relative inline-block w-full max-w-[440px]">
            {/* Fixed Pointer (stays at top, pointing down into the wheel) */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3 z-10">
              <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-t-[70px] border-l-transparent border-r-transparent border-t-[#df2124]" />
            </div>

            {/* SVG Wheel */}
            <svg
              ref={svgRef}
              width="100%"
              height="440"
              viewBox="0 0 440 440"
              className="max-w-[440px] w-full h-auto transform transition-transform duration-3000 ease-out cursor-pointer"
              style={{ transform: `rotate(${rotation}rad)` }}
              role="img"
              aria-label={`Restaurant wheel with ${sliceCount} options`}
              onClick={canSpin && !isSpinning ? spinWheel : undefined}
            >
              {/* Define shadow gradients */}
              <defs>
                {/* Inset shadow from the gold border */}
                <radialGradient id="borderShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="85%" stopColor="rgba(0,0,0,0)" />
                  <stop offset="95%" stopColor="rgba(0,0,0,0.2)" />
                  <stop offset="100%" stopColor="rgba(0,0,0,0.4)" />
                </radialGradient>
              </defs>
              {/* Large Gold border - outer ring */}
              <circle cx="220" cy="220" r="220" fill="#fbc01c" />
              {/* Inner wheel area */}
              <circle cx="220" cy="220" r="180" fill="#fff" />
              {/* Border lights on the gold ring */}
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (2 * Math.PI * i) / 24;
                const x = Number((220 + 200 * Math.cos(angle)).toFixed(2));
                const y = Number((220 + 200 * Math.sin(angle)).toFixed(2));
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="8"
                    fill="#fff"
                    stroke="#E6B800"
                    strokeWidth="2"
                  />
                );
              })}
              {/* Wheel slices */}
              {wheelOptions.map((option, index) => {
                const startAngle = index * sliceAngle;
                const endAngle = startAngle + sliceAngle;

                // Calculate slice path
                const x1 = 220 + radius * Math.cos(startAngle);
                const y1 = 220 + radius * Math.sin(startAngle);
                const x2 = 220 + radius * Math.cos(endAngle);
                const y2 = 220 + radius * Math.sin(endAngle);

                const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

                const pathData = [
                  `M 220 220`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  "Z",
                ].join(" ");

                const brightColors = [
                  "#df2124",
                  "#fbc616",
                  "#3f546c",
                  "#f06519",
                  "#6bbd42",
                  "#45a1df",
                  "#4055a3",
                  "#df2124",
                  "#fbc616",
                  "#3f546c",
                  "#f06519",
                  "#6bbd42",
                  "#45a1df",
                  "#4055a3",
                ];
                const fillColor = brightColors[index % brightColors.length];

                return (
                  <g key={option.place_id}>
                    {/* Main colored slice */}
                    <path d={pathData} fill={fillColor} stroke="none" />
                    {/* Text label */}
                    <text
                      x={
                        220 +
                        radius * 0.7 * Math.cos(startAngle + sliceAngle / 2)
                      }
                      y={
                        220 +
                        radius * 0.7 * Math.sin(startAngle + sliceAngle / 2)
                      }
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-bold fill-zinc-100 font-nunito"
                      transform={`rotate(${
                        (startAngle + sliceAngle / 2) * (180 / Math.PI)
                      }, ${
                        220 +
                        radius * 0.7 * Math.cos(startAngle + sliceAngle / 2)
                      }, ${
                        220 +
                        radius * 0.7 * Math.sin(startAngle + sliceAngle / 2)
                      })`}
                    >
                      {option.name.length > 12
                        ? option.name.substring(0, 12) + "..."
                        : option.name}
                    </text>
                  </g>
                );
              })}

              {/* Border shadow cast onto the wheel options */}
              <circle cx="220" cy="220" r="180" fill="url(#borderShadow)" />

              {/* Center circle */}
              <circle
                cx="220"
                cy="220"
                r="25"
                fill="#FFD700"
                stroke="#E6B800"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        {/* Controls and info */}
        {selectedOptions.length === 0 ? (
          <div className="py-8 tracking-wide">
            <h3 className="text-xl font-semibold mb-2 text-gray-700 font-lilita uppercase">
              No restaurants yet...
            </h3>
            <p className="text-gray-900 font-nunito">
              Use the filters to search for restaurants, then spin the wheel!
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {!canSpin && (
              <p className="text-sm text-gray-500 font-nunito">
                Need at least 2 restaurants to spin
              </p>
            )}

            {seed && <p className="text-xs text-gray-400">Seed: {seed}</p>}
          </div>
        )}
      </div>

      {/* Winner Modal */}
      {winner && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-[#d8bf9f] border-4 px-4 py-2 border-[#3d3d3d] rounded-2xl   2xl max-w-xl w-full mx-4 relative animate-in fade-in duration-300 overflow-hidden">
            {/* Pattern background - always first, z-0 */}
            <Pattern
              screen="absolute"
              opacity="opacity-[0.25]"
              top="top-0"
              left="left-0"
              rounded="rounded-2xl"
            />
            {/* Close button - z-10 */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-5 text-[#3d3d3d] transition-all hover:text-[#f9f9f9] hover:cursor-pointer text-2xl font-bold z-20"
              aria-label="Close modal"
            >
              ×
            </button>
            {/* Modal content - z-10 */}
            <div className="p-4 py-8 text-center uppercase relative z-10">
              <h3 className="text-[0.7rem] font-league-spartan italic font-semibold text-[#6f5142] mb-1 tracking-widest">
                You&apos;re eating at
              </h3>

              <h2
                className="text-5xl text-white font-lilita uppercase font-extrabold mb-6 break-words tracking-wide"
                style={{ textShadow: "3px 3px 0px #997856" }}
              >
                {winner.name}
              </h2>
              {(winner.formatted_address || winner.vicinity) && 
               (winner.formatted_address !== 'Address not available' && winner.vicinity !== 'Address not available') && (
                <p className="text-sm mb-4 flex items-center justify-center gap-2 font-league-spartan font-bold text-[#3d3d3d]">
                  <FaMapMarkerAlt className="text-lg text-red-500" />
                  {winner.formatted_address || winner.vicinity}
                </p>
              )}

              {/* Rating and price */}
              <div className="flex items-center justify-center gap-6 mb-6 text-lg">
                {winner.rating && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <FaStar className="text-xl text-yellow-500" />
                    <span className="font-semibold">{winner.rating}/5</span>
                  </div>
                )}
                {winner.price_level && (
                  <div className="text-green-600 font-bold text-xl">
                    {Array(winner.price_level).fill("$").join("")}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    if (hasGoogleAccess && !winner.place_id.startsWith('osm_')) {
                      // For users with Google API access and Google Places results, use direct Google Maps link
                      const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${winner.place_id}`;
                      window.open(mapsUrl, "_blank");
                    } else {
                      // For OpenStreetMap results or users without Google access, use Google search
                      let addressToUse = '';
                      if (winner.formatted_address && winner.formatted_address !== 'Address not available') {
                        addressToUse = winner.formatted_address;
                      } else if (winner.vicinity && winner.vicinity !== 'Address not available') {
                        addressToUse = winner.vicinity;
                      }
                      
                      const searchQuery = encodeURIComponent(
                        addressToUse ? `${winner.name} ${addressToUse}`.trim() : winner.name
                      );
                      const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
                      window.open(searchUrl, "_blank");
                    }
                  }}
                  className="w-full uppercase text-xl font-bold px-4 pb-5 pt-6 bg-[#ef4e2d] border-b-4 border-[#c83e22] font-league-spartan transition-all duration-200 rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:cursor-pointer tracking-wide group"
                >
                  <span className="flex items-center justify-center gap-4">
                    <span className="flex items-center gap-2">
                      <FaStar className="-mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      Reviews
                    </span>
                    <span>&</span>
                    <span className="flex items-center gap-2">
                      Directions
                      <FaDirections className="-mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </span>
                  </span>
                </Button>

                {/* Favorites Button */}
                {session ? (
                  <Button
                    onClick={toggleFavorite}
                    variant="outline"
                    className="w-full bg-[#f3ece3] py-3 font-bold font-nunito hover:cursor-pointer group border-2 border-[#3d3d3d]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : isFavorite ? (
                      <span className="flex items-center justify-center gap-2">
                        <FaHeart className="text-red-500" />
                        Remove from Favorites
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaHeart className="text-gray-500" />
                        Add to Favorites
                      </span>
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full bg-[#f3ece3] py-3 font-bold font-nunito opacity-50 border-2 border-[#3d3d3d]"
                    title="Sign in to save favorites"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Link href="/api/auth/signin" className="underline hover:cursor-pointer">
                        Sign in
                      </Link> to Save to Favorites
                    </span>
                  </Button>
                )}

                <div className="flex w-full gap-3 align-middle text-gray-700 text-xs">
                  <Button
                    onClick={resetWheel}
                    variant="outline"
                    className="bg-[#f3ece3] flex-1 py-3 font-bold flex items-center justify-center gap-2 font-nunito hover:cursor-pointer group"
                  >
                    <FaRedo className="group-hover:animate-[spin_0.3s_ease-in-out]" />{" "}
                    Spin Again
                  </Button>

                  <Button
                    onClick={closeModal}
                    variant="outline"
                    className="bg-[#f3ece3] flex-1 py-3 font-bold font-nunito hover:cursor-pointer group"
                  >
                    <FaCheck className="group-hover:scale-125 transition-all" />
                    Keep Result
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
