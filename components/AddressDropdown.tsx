"use client";

import { cn } from "@/lib/utils";
import type { StoredSearch, StoredSavedAddress } from "@/types";

interface AddressDropdownProps {
  recentSearches: StoredSearch[];
  savedAddresses: StoredSavedAddress[];
  onSelectRecent: (search: StoredSearch) => void;
  onSelectSaved: (address: StoredSavedAddress) => void;
  onClearRecents: () => void;
  onRemoveSaved: (id: string) => void;
  isVisible: boolean;
}

export function AddressDropdown({
  recentSearches,
  savedAddresses,
  onSelectRecent,
  onSelectSaved,
  onClearRecents,
  onRemoveSaved,
  isVisible,
}: AddressDropdownProps) {
  if (!isVisible || (recentSearches.length === 0 && savedAddresses.length === 0)) {
    return null;
  }

  return (
    <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 overflow-auto rounded-xl border border-neutral-200 bg-white shadow-elevated animate-slide-down">
      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between border-b border-neutral-100 border-l-2 border-l-primary-300 bg-primary-50/30 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Recent
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClearRecents();
              }}
              className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Clear all
            </button>
          </div>
          <ul>
            {recentSearches.map((search) => (
              <li key={search.id}>
                <button
                  type="button"
                  onClick={() => onSelectRecent(search)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left",
                    "hover:bg-neutral-50 focus:bg-neutral-50 focus:outline-none transition-colors"
                  )}
                >
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="truncate text-sm text-neutral-700">
                    {search.formattedAddress}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Saved Addresses Section */}
      {savedAddresses.length > 0 && (
        <div className={recentSearches.length > 0 ? "border-t border-neutral-200" : ""}>
          <div className="border-b border-neutral-100 border-l-2 border-l-amber-300 bg-amber-50/30 px-4 py-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Saved
            </span>
          </div>
          <ul>
            {savedAddresses.map((address) => (
              <li key={address.id}>
                <div
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-4 py-2.5",
                    "hover:bg-neutral-50 transition-colors"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSaved(address)}
                    className="flex flex-1 items-center gap-3 text-left focus:outline-none"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-800">
                        {address.nickname || address.formattedAddress}
                      </p>
                      {address.nickname && (
                        <p className="truncate text-xs text-neutral-500">
                          {address.city}, {address.state}
                        </p>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSaved(address.id);
                    }}
                    className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 transition-colors"
                    aria-label="Remove saved address"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
