import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, MapPin, Globe, Loader2 } from 'lucide-react';
import { searchDelhiNominatim } from '../lib/apiClient.js';

export default function SearchCombobox({
  label,
  badgeText,
  badgeBg = 'bg-[#4ADE80]',
  badgeTextColor = 'text-[#09090B]',
  selectedNode,
  allNodes = [],
  placeholder = 'Search campus landmark or Delhi place...',
  onSelectNodeId,
  onSelectCustomLocation,
  onClear,
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [nominatimResults, setNominatimResults] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Sync input value with selectedNode when it changes externally
  useEffect(() => {
    if (selectedNode) {
      setInputValue(selectedNode.name || selectedNode.shortName || '');
    } else {
      setInputValue('');
    }
  }, [selectedNode]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tier 1: Instant Local Graph Fuzzy Filtering
  const localMatches = useMemo(() => {
    const q = (inputValue || '').trim().toLowerCase();
    if (!q) {
      // If focused with empty query, show top NSUT campus nodes first, then central hubs
      const campus = allNodes.filter((n) => n.isCampus);
      const city = allNodes.filter((n) => !n.isCampus).slice(0, 8);
      return [...campus, ...city];
    }

    return allNodes
      .map((node) => {
        const nameMatch = (node.name || '').toLowerCase().includes(q);
        const shortMatch = (node.shortName || '').toLowerCase().includes(q);
        const zoneMatch = (node.zone || '').toLowerCase().includes(q);
        const aliasMatch = (node.aliases || []).some((a) =>
          a.toLowerCase().includes(q)
        );

        let score = 0;
        if (shortMatch) score += 3;
        if (nameMatch) score += 2;
        if (aliasMatch) score += 2;
        if (zoneMatch) score += 1;

        return { node, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.node)
      .slice(0, 10);
  }, [inputValue, allNodes]);

  // Tier 2: Debounced (300ms) Nominatim Live Delhi Search
  useEffect(() => {
    const q = (inputValue || '').trim();

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't live-search if query matches the current selection exactly or is short
    if (q.length < 3 || (selectedNode && q === selectedNode.name)) {
      setNominatimResults([]);
      setIsSearchingLive(false);
      return;
    }

    setIsSearchingLive(true);
    debounceTimerRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();
      try {
        const results = await searchDelhiNominatim(
          q,
          abortControllerRef.current.signal
        );
        setNominatimResults(results);
      } catch {
        setNominatimResults([]);
      } finally {
        setIsSearchingLive(false);
      }
    }, 320);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [inputValue, selectedNode]);

  // Combined List for keyboard navigation
  const combinedList = useMemo(() => {
    const list = [...localMatches.map((n) => ({ type: 'local', data: n }))];
    for (const r of nominatimResults) {
      list.push({ type: 'live', data: r });
    }
    return list;
  }, [localMatches, nominatimResults]);

  // Handle Selection
  const handleSelect = (item) => {
    if (item.type === 'local') {
      onSelectNodeId(item.data.id);
      setInputValue(item.data.name);
    } else {
      if (onSelectCustomLocation) {
        onSelectCustomLocation(item.data);
      }
      setInputValue(item.data.name);
    }
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Keyboard Navigation
  const handleKeyDown = (e) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < combinedList.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : combinedList.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < combinedList.length) {
        handleSelect(combinedList[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleClearInput = (e) => {
    e.stopPropagation();
    setInputValue('');
    setNominatimResults([]);
    setHighlightedIndex(-1);
    if (onClear) onClear();
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Surface */}
      <div
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className="bg-[#1C1C20] rounded-2xl px-3.5 py-2.5 border border-white/[0.06] hover:border-white/15 focus-within:border-white/25 flex items-center gap-3 transition shadow-sm cursor-text"
      >
        {/* Left Badge (A, B, or Stop #) */}
        {badgeText && (
          <span
            className={`w-5 h-5 rounded-full ${badgeBg} ${badgeTextColor} text-[11px] font-black flex items-center justify-center shrink-0 shadow-sm`}
          >
            {badgeText}
          </span>
        )}

        <div className="flex-1 min-w-0">
          {label && (
            <label className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider block leading-tight">
              {label}
            </label>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-transparent text-white text-xs sm:text-sm font-semibold focus:outline-none placeholder:text-zinc-500 placeholder:font-normal truncate"
            />
          </div>
        </div>

        {/* Loading Spinner or Clear Button */}
        {isSearchingLive ? (
          <Loader2 className="w-4 h-4 text-[#A594F9] animate-spin shrink-0" />
        ) : inputValue ? (
          <button
            type="button"
            onClick={handleClearInput}
            title="Clear search"
            className="w-6 h-6 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Floating Dark Obsidian Dropdown */}
      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 bg-[#141417] border border-white/10 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.85)] overflow-hidden max-h-[300px] overflow-y-auto backdrop-blur-2xl">
          {combinedList.length === 0 ? (
            <div className="p-4 text-center text-xs text-zinc-500">
              No matching campus landmarks or Delhi locations.
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {/* Local Graph Matches */}
              {localMatches.length > 0 && (
                <div>
                  <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
                    Campus &amp; City Landmarks
                  </div>
                  {localMatches.map((node) => {
                    const idx = combinedList.findIndex(
                      (item) => item.type === 'local' && item.data.id === node.id
                    );
                    const isSelected = selectedNode?.id === node.id;
                    const isHighlighted = highlightedIndex === idx;

                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() =>
                          handleSelect({ type: 'local', data: node })
                        }
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition ${
                          isHighlighted
                            ? 'bg-[#282249] text-white'
                            : isSelected
                            ? 'bg-white/10 text-white font-semibold'
                            : 'hover:bg-white/5 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <MapPin
                            className={`w-3.5 h-3.5 shrink-0 ${
                              node.isCampus ? 'text-[#A594F9]' : 'text-zinc-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate text-white">
                              {node.name}
                            </div>
                            {node.aliases && node.aliases.length > 0 && (
                              <div className="text-[10px] text-zinc-400 truncate">
                                {node.aliases.slice(0, 2).join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                            node.isCampus
                              ? 'bg-[#282249] text-[#A594F9] border border-[#A594F9]/40'
                              : 'bg-white/5 text-zinc-400 border border-white/5'
                          }`}
                        >
                          {node.zone}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Live Geocoded Results (from Nominatim) */}
              {nominatimResults.length > 0 && (
                <div className="pt-2 border-t border-white/5">
                  <div className="px-3 pt-1 pb-1 text-[10px] uppercase tracking-wider font-semibold text-zinc-500 flex items-center justify-between">
                    <span>Live Map Search Results</span>
                    <span className="text-[#67E8F9] text-[9px]">OSM Delhi</span>
                  </div>
                  {nominatimResults.map((item) => {
                    const idx = combinedList.findIndex(
                      (c) => c.type === 'live' && c.data.id === item.id
                    );
                    const isHighlighted = highlightedIndex === idx;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          handleSelect({ type: 'live', data: item })
                        }
                        className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition ${
                          isHighlighted
                            ? 'bg-[#1A313D] text-white'
                            : 'hover:bg-white/5 text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Globe className="w-3.5 h-3.5 text-[#67E8F9] shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {item.name}
                            </div>
                            <div className="text-[10px] text-zinc-400 truncate">
                              {item.fullName}
                            </div>
                          </div>
                        </div>

                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-[#1A313D] text-[#67E8F9] border border-[#67E8F9]/40 shrink-0">
                          Live Map Result
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
