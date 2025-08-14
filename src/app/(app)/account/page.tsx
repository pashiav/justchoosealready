"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Pattern from "@/components/Pattern";
import {
  FaHeart,
  FaSpinner,
  FaPizzaSlice,
  FaBullseye,
  FaUser,
  FaRedo,
  FaStar,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface Favorite {
  id: string;
  place_id: string;
  snapshot: {
    name: string;
    formatted_address: string;
    rating?: number;
    price_level?: number;
  };
  created_at: string;
}

interface Spin {
  id: string;
  seed: string;
  options: Array<{
    place_id: string;
    name: string;
    vicinity?: string;
    rating?: number;
    price_level?: number;
  }>;
  selected_id: string;
  created_at: string;
  query: Record<string, unknown>;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSpins, setIsLoadingSpins] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [favoriteToDelete, setFavoriteToDelete] = useState<Favorite | null>(null);
  const [showRemoveFromSpinsModal, setShowRemoveFromSpinsModal] = useState(false);
  const [spinPlaceToRemove, setSpinPlaceToRemove] = useState<{place_id: string, name: string} | null>(null);

  // Fetch data when component mounts
  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
      fetchSpins();
    }
  }, [status]);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#ef4e2d]"></div>
      </div>
    );
  }

  if (!session) {
    redirect("/");
  }

  const fetchFavorites = async () => {
    try {
      const response = await fetch("/api/favorites");
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSpins = async () => {
    try {
      const response = await fetch("/api/spin");
      if (response.ok) {
        const data = await response.json();
        setSpins(data);
      }
    } catch (error) {
      console.error("Failed to fetch spins:", error);
    } finally {
      setIsLoadingSpins(false);
    }
  };

  const confirmDelete = (favorite: Favorite) => {
    setFavoriteToDelete(favorite);
    setShowConfirmModal(true);
  };

  const removeFavorite = async () => {
    if (!favoriteToDelete) return;
    
    try {
      const response = await fetch(`/api/favorites?place_id=${favoriteToDelete.place_id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav.place_id !== favoriteToDelete.place_id));
        setShowConfirmModal(false);
        setFavoriteToDelete(null);
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const addToFavorites = async (place_id?: string, name?: string, vicinity?: string, rating?: number, price_level?: number) => {
    if (!place_id || !name) return;
    
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          place_id,
          snapshot: {
            name,
            formatted_address: vicinity || '',
            rating,
            price_level
          }
        }),
      });
      
      if (response.ok) {
        // Add to local favorites state
        const newFavorite: Favorite = {
          id: Date.now().toString(), // Temporary ID
          place_id,
          snapshot: {
            name,
            formatted_address: vicinity || '',
            rating,
            price_level
          },
          created_at: new Date().toISOString()
        };
        setFavorites([...favorites, newFavorite]);
      } else {
        console.error('Failed to add to favorites');
      }
    } catch (error) {
      console.error('Failed to add to favorites:', error);
    }
  };

  const removeFromFavorites = async (place_id?: string, name?: string) => {
    if (!place_id) return;
    
    // Show confirmation modal
    setSpinPlaceToRemove({ place_id, name: name || 'this place' });
    setShowRemoveFromSpinsModal(true);
  };

  const confirmRemoveFromSpins = async () => {
    if (!spinPlaceToRemove) return;
    
    try {
      const response = await fetch(`/api/favorites?place_id=${spinPlaceToRemove.place_id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local favorites state
        setFavorites(favorites.filter(fav => fav.place_id !== spinPlaceToRemove.place_id));
        setShowRemoveFromSpinsModal(false);
        setSpinPlaceToRemove(null);
      } else {
        console.error('Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }
  };

  const cancelRemoveFromSpins = () => {
    setShowRemoveFromSpinsModal(false);
    setSpinPlaceToRemove(null);
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setFavoriteToDelete(null);
  };

  const getSelectedPlace = (spin: Spin) => {
    return spin.options.find((option) => option.place_id === spin.selected_id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2d2e40] mb-2 font-league-spartan uppercase">
              Welcome back!
            </h1>
            <p className="text-md font-nunito tracking-wide text-[#3d3d3d] flex items-center justify-center gap-2">
              <FaUser className="text-[#ef4e2d]" />
              {session.user?.email}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Favorites */}
            <div
              className="py-3 px-3 bg-transparent rounded-2xl border border-amber-950"
              style={{ backgroundColor: "rgba(255,255,255,0.30)" }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-[#2d2e40] flex items-center font-league-spartan uppercase">
                <FaHeart className="mr-2 -mt-1 text-red-500 pr-2" />
                My Favorites
              </h2>
              <Suspense
                fallback={
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                }
              >
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : favorites.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {favorites.map((favorite) => (
                                              <div
                          key={favorite.id}
                          className="border border-[#3d3d3d] rounded-2xl p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <a
                                href={`https://www.google.com/maps/place/?q=place_id:${favorite.place_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-900 font-nunito tracking-wide hover:text-[#ef4e2d] underline transition-colors cursor-pointer block mb-1"
                              >
                                {favorite.snapshot.name}
                              </a>
                            <p className="text-sm text-gray-600 font-nunito tracking-wide">
                              <FaMapMarkerAlt
                                className="inline mr-1 -mt-1"
                                color="#ef4e2d"
                              />
                              {favorite.snapshot.formatted_address}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {favorite.snapshot.rating && (
                                <span className="text-xs text-yellow-600 flex items-center gap-1 font-nunito tracking-wide">
                                  <FaStar className="text-yellow-500" />
                                  {favorite.snapshot.rating}
                                </span>
                              )}
                              {favorite.snapshot.price_level && (
                                <span className="text-xs text-green-600 font-nunito tracking-wide">
                                  {Array(favorite.snapshot.price_level)
                                    .fill("$")
                                    .join("")}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => confirmDelete(favorite)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 text-xl font-nunito font-bold hover:text-red-700 hover:bg-red-300 hover:cursor-pointer"
                          >
                            x
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaPizzaSlice className="text-6xl mb-4 text-gray-400 mx-auto" />
                    <p className="text-gray-500 mb-2">No favorites yet</p>
                    <p className="text-sm text-gray-400">
                      Start spinning the wheel to discover places!
                    </p>
                  </div>
                )}
              </Suspense>
            </div>

            {/* Past Spins */}
            <div
              className="py-3 px-3 bg-transparent rounded-2xl border border-amber-950"
              style={{ backgroundColor: "rgba(255,255,255,0.30)" }}
            >
              {" "}
              <h2 className="text-2xl font-semibold mb-4 text-[#2d2e40] flex items-center font-league-spartan uppercase">
                <FaRedo className="mr-2 -mt-1 text-[#ef4e2d] pr-2" />
                Past Spins
              </h2>
              <Suspense
                fallback={
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                }
              >
                {isLoadingSpins ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : spins.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {spins.map((spin) => {
                      const selectedPlace = getSelectedPlace(spin);
                      return (
                        <div
                          key={spin.id}
                          className="border border-[#3d3d3d] rounded-2xl p-3"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <a
                                href={`https://www.google.com/maps/place/?q=place_id:${selectedPlace?.place_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-900 font-nunito tracking-wide hover:text-[#ef4e2d] underline transition-colors cursor-pointer block mb-1"
                              >
                                {selectedPlace?.name || "Unknown Place"}
                              </a>
                              {selectedPlace?.vicinity && (
                                <p className="text-sm text-gray-600 font-nunito tracking-wide">
                                  <FaMapMarkerAlt
                                    className="inline mr-1 -mt-1"
                                    color="#ef4e2d"
                                  />
                                  {selectedPlace.vicinity}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-1">
                                {selectedPlace?.rating && (
                                  <span className="text-xs text-yellow-600 flex items-center gap-1 font-nunito tracking-wide">
                                    <FaStar className="text-yellow-500" />
                                    {selectedPlace.rating}
                                  </span>
                                )}
                                {selectedPlace?.price_level && (
                                  <span className="text-xs text-green-600 font-nunito tracking-wide">
                                    {Array(selectedPlace.price_level)
                                      .fill("$")
                                      .join("")}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1 font-nunito tracking-wide">
                                {formatDate(spin.created_at)} •{" "}
                                {spin.options.length} options
                              </p>
                            </div>
                            {(() => {
                              const isAlreadyFavorited = favorites.some(fav => fav.place_id === selectedPlace?.place_id);
                              return isAlreadyFavorited ? (
                                <Button
                                  onClick={() => removeFromFavorites(selectedPlace?.place_id, selectedPlace?.name)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-500 text-xl font-nunito font-bold hover:text-red-700 hover:bg-red-300 hover:cursor-pointer"
                                  title="Remove from favorites"
                                >
                                  <FaHeart />
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => addToFavorites(selectedPlace?.place_id, selectedPlace?.name, selectedPlace?.vicinity, selectedPlace?.rating, selectedPlace?.price_level)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-400 text-xl font-nunito font-bold hover:text-red-500 hover:bg-red-300 hover:cursor-pointer"
                                  title="Add to favorites"
                                >
                                  <FaHeart />
                                </Button>
                              );
                            })()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FaBullseye className="text-6xl mb-4 text-gray-400 mx-auto" />
                    <p className="text-gray-500 mb-2">No spin history yet</p>
                    <p className="text-sm text-gray-400">
                      Your spins will appear here
                    </p>
                  </div>
                )}
              </Suspense>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 text-center">
            <Button
              asChild
              className="text-[1.5rem] font-bold w-auto h-auto px-4 py-1 bg-[#ef4e2d] border-b-8 border-[#c83e22] font-league-spartan transition-all duration-200 uppercase rounded-2xl hover:bg-[#e03c24] hover:border-[#b32f1a] hover:cursor-pointer"
            >
              <a href="/spin">
                <FaRedo className="mr-2 -mt-1" />
                Spin the Wheel Again
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && favoriteToDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-[#d8bf9f] border-4 px-4 py-2 border-[#3d3d3d] rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in fade-in duration-300 overflow-hidden">
            {/* Pattern background - always first, z-0 */}
            <Pattern
              screen="absolute"
              opacity="opacity-[0.25]"
              top="top-0"
              left="left-0"
              rounded="rounded-2xl"
            />
            {/* Modal content - z-10 */}
            <div className="p-4 py-6 text-center relative z-10">
              <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 font-league-spartan uppercase">
                Remove Favorite?
              </h3>
              <p className="text-[#3d3d3d] mb-6 font-nunito">
                Are you sure you want to remove <span className="font-semibold">&ldquo;{favoriteToDelete.snapshot.name}&rdquo;</span> from your favorites? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={cancelDelete}
                  variant="outline"
                  className="bg-[#f3ece3] font-nunito border-2 border-[#3d3d3d] hover:bg-[#e8d8c8] hover:cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={removeFavorite}
                  className="bg-red-500 hover:bg-red-600 text-white font-nunito border-2 border-[#3d3d3d] hover:cursor-pointer"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Removing from Past Spins */}
      {showRemoveFromSpinsModal && spinPlaceToRemove && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-[#d8bf9f] border-4 px-4 py-2 border-[#3d3d3d] rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in fade-in duration-300 overflow-hidden">
            {/* Pattern background - always first, z-0 */}
            <Pattern
              screen="absolute"
              opacity="opacity-[0.25]"
              top="top-0"
              left="left-0"
              rounded="rounded-2xl"
            />
            {/* Modal content - z-10 */}
            <div className="p-4 py-6 text-center relative z-10">
              <h3 className="text-lg font-semibold text-[#3d3d3d] mb-4 font-league-spartan uppercase">
                Remove from Favorites?
              </h3>
              <p className="text-[#3d3d3d] mb-6 font-nunito">
                Are you sure you want to remove <span className="font-semibold">&ldquo;{spinPlaceToRemove.name}&rdquo;</span> from your favorites? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={cancelRemoveFromSpins}
                  variant="outline"
                  className="bg-[#f3ece3] font-nunito border-2 border-[#3d3d3d] hover:bg-[#e8d8c8] hover:cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRemoveFromSpins}
                  className="bg-red-500 hover:bg-red-600 text-white font-nunito border-2 border-[#3d3d3d] hover:cursor-pointer"
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
