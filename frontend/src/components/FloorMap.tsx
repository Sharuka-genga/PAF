import React, { useState, useMemo } from 'react';
import type { Resource } from '../types/resource';

interface FloorMapProps {
  resources: Resource[];
  onSelectResource: (resource: Resource) => void;
  selectedResource: Resource | null;
}

const BLOCKS = ['Block A', 'Block B', 'Block C'];
const FLOORS = ['GF', 'F1', 'F2'];

export default function FloorMap({ resources, onSelectResource, selectedResource }: FloorMapProps) {
  const [activeBlock, setActiveBlock] = useState('Block A');
  const [activeFloor, setActiveFloor] = useState('GF');

  // Filter resources by selected block and floor
  const filteredResources = useMemo(() => {
    return resources.filter(r => {
      const loc = r.location?.toLowerCase() || '';
      
      // Match block
      const blockMatch = 
        (activeBlock === 'Block A' && loc.includes('block a')) ||
        (activeBlock === 'Block B' && loc.includes('block b')) ||
        (activeBlock === 'Block C' && loc.includes('block c')) ||
        (!loc.includes('block a') && !loc.includes('block b') && !loc.includes('block c')); // fallback if no block specified
      
      // Match floor
      const floorMatch = 
        (activeFloor === 'GF' && (loc.includes('ground') || loc.includes('gf'))) ||
        (activeFloor === 'F1' && (loc.includes('floor 1') || loc.includes('1st') || loc.includes('f1'))) ||
        (activeFloor === 'F2' && (loc.includes('floor 2') || loc.includes('2nd') || loc.includes('f2'))) ||
        (!loc.includes('ground') && !loc.includes('gf') && !loc.includes('floor 1') && !loc.includes('1st') && !loc.includes('f1') && !loc.includes('floor 2') && !loc.includes('2nd') && !loc.includes('f2')); // fallback if no floor specified

      return blockMatch && floorMatch;
    });
  }, [resources, activeBlock, activeFloor]);

  // Split into two rows for the map layout
  const midPoint = Math.ceil(filteredResources.length / 2);
  const row1 = filteredResources.slice(0, midPoint);
  const row2 = filteredResources.slice(midPoint);

  const getStatusStyles = (resource: Resource) => {
    const isSelected = selectedResource?.id === resource.id;
    
    if (isSelected) {
      return 'bg-white border-2 border-purple-600 shadow-lg text-[#1A1730] scale-105';
    }

    switch (resource.status) {
      case 'ACTIVE':
        return 'bg-purple-100 border-2 border-purple-300 text-purple-900';
      case 'MAINTENANCE':
        return 'bg-yellow-100 border-2 border-yellow-300 text-yellow-900';
      case 'OUT_OF_SERVICE':
        return 'bg-red-100 border-2 border-red-200 text-red-900';
      default:
        return 'bg-gray-100 border-2 border-gray-200 text-gray-500';
    }
  };

  const getFloorLabel = () => {
    if (activeFloor === 'GF') return 'GROUND FLOOR';
    if (activeFloor === 'F1') return 'FLOOR 1';
    if (activeFloor === 'F2') return 'FLOOR 2';
    return activeFloor;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1A1730]">Interactive Floor Map</h2>
          <p className="text-sm text-[#9B97B8] mt-1">Click a room to select · Colour = availability status</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {BLOCKS.map(block => (
              <button
                key={block}
                onClick={() => setActiveBlock(block)}
                className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                  activeBlock === block 
                    ? 'bg-purple-100 border-purple-400 text-purple-700 font-semibold' 
                    : 'bg-white border-[#E2E0EC] text-[#5A5680] hover:bg-gray-50'
                }`}
              >
                {block}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-l border-[#E2E0EC] pl-4">
            {FLOORS.map(floor => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-4 py-2 rounded-xl border text-sm transition-colors ${
                  activeFloor === floor 
                    ? 'bg-purple-100 border-purple-400 text-purple-700 font-semibold' 
                    : 'bg-white border-[#E2E0EC] text-[#5A5680] hover:bg-gray-50'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-[#F5F4F8] border border-[#E2E0EC] rounded-2xl p-6 relative">
        <div className="absolute top-4 left-6 text-xs font-mono text-[#9B97B8] tracking-widest uppercase">
          {getFloorLabel()} · {activeBlock}
        </div>

        <div className="mt-8 flex flex-col">
          {filteredResources.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-[#9B97B8]">No rooms on this floor</p>
            </div>
          ) : (
            <>
              {/* Row 1 */}
              <div className="flex gap-3 flex-wrap min-h-[5rem]">
                {row1.map(r => (
                  <div
                    key={r.id}
                    onClick={() => onSelectResource(r)}
                    className={`w-32 h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getStatusStyles(r)}`}
                  >
                    <div className="font-mono font-bold text-sm text-center px-2 truncate w-full">
                      {r.name}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {r.status === 'MAINTENANCE' || r.status === 'OUT_OF_SERVICE' 
                        ? (r.status === 'MAINTENANCE' ? 'maint.' : 'out of svc') 
                        : (r.capacity ? `${r.capacity} pax` : 'N/A')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Corridor Separator */}
              <div className="h-4 bg-[#E2E0EC] rounded mx-[-24px] my-4" />

              {/* Row 2 */}
              <div className="flex gap-3 flex-wrap min-h-[5rem]">
                {row2.map(r => (
                  <div
                    key={r.id}
                    onClick={() => onSelectResource(r)}
                    className={`w-32 h-20 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${getStatusStyles(r)}`}
                  >
                    <div className="font-mono font-bold text-sm text-center px-2 truncate w-full">
                      {r.name}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {r.status === 'MAINTENANCE' || r.status === 'OUT_OF_SERVICE' 
                        ? (r.status === 'MAINTENANCE' ? 'maint.' : 'out of svc') 
                        : (r.capacity ? `${r.capacity} pax` : 'N/A')}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Legend Row */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-purple-100 border-purple-300" />
            <span className="text-xs text-[#5A5680]">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-yellow-100 border-yellow-300" />
            <span className="text-xs text-[#5A5680]">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 bg-red-100 border-red-200" />
            <span className="text-xs text-[#5A5680]">Out of service</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 bg-white border-purple-600" />
          <span className="text-xs text-[#5A5680]">Selected</span>
        </div>
      </div>
    </div>
  );
}
