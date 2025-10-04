'use client';

import { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Target } from 'lucide-react';
import { PopulationService } from '@/lib/population-service';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapController() {
  const { impactParameters, simulationResults } = useAppStore();
  const map = useMap();

  useEffect(() => {
    // Auto-adjust zoom based on simulation results
    if (simulationResults) {
      // Get the largest radius to determine appropriate zoom
      const maxRadius = Math.max(
        simulationResults.atmospheric.thermalRadiation,
        simulationResults.atmospheric.overpressure,
        simulationResults.seismic.radius * 0.3 // Only show 30% of seismic zone for better view
      );
      
      // Calculate zoom level based on radius (in km)
      let zoom = 6;
      if (maxRadius < 50) zoom = 8;
      else if (maxRadius < 100) zoom = 7;
      else if (maxRadius < 200) zoom = 6;
      else if (maxRadius < 500) zoom = 5;
      else zoom = 4;
      
      map.setView([impactParameters.impactLocation.lat, impactParameters.impactLocation.lng], zoom);
    } else {
      map.setView([impactParameters.impactLocation.lat, impactParameters.impactLocation.lng], 6);
    }
  }, [impactParameters.impactLocation, simulationResults, map]);

  return null;
}

// Component to handle map clicks
function MapClickHandler() {
  const { setImpactParameters } = useAppStore();

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setImpactParameters({
        impactLocation: { lat, lng },
      });
    },
  });

  return null;
}

export default function ImpactMap() {
  const { simulationResults, impactParameters, showEnvironmentalOverlays, setImpactParameters, selectedAsteroid } = useAppStore();
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Get major cities from PopulationService
  const majorCities = PopulationService.getMajorCities();

  if (typeof window === 'undefined') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-400">
          <p>Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  const { lat, lng } = impactParameters.impactLocation;

  const handleCitySelect = (cityName: string) => {
    if (!cityName) return;
    
    const city = majorCities.find(c => c.name === cityName);
    if (city) {
      setSelectedCity(cityName);
      setImpactParameters({
        impactLocation: { lat: city.lat, lng: city.lng },
      });
    }
  };

  return (
    <Card id="impact-map">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-space-cyan flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Impact Zone Map
          </CardTitle>
          
          {/* Controls */}
          <div className="flex items-center gap-3">            
            {/* City Selector Dropdown */}
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-400" />
              <select
                value={selectedCity}
                onChange={(e) => handleCitySelect(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white/5 border border-white/10 rounded-md text-white hover:border-space-cyan/50 focus:outline-none focus:ring-2 focus:ring-space-cyan/50 transition-colors cursor-pointer"
              >
                <option value="" className="bg-space-dark text-white">Select a city...</option>
                {majorCities.map((city) => (
                  <option key={city.name} value={city.name} className="bg-space-dark text-white">
                    {city.name} ({(city.population / 1000000).toFixed(1)}M)
                </option>
              ))}
              </select>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Click anywhere on the map or select a major city to set impact location
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] rounded-lg overflow-hidden">
          <MapContainer
            center={[lat, lng]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | &copy; <a href="https://cartodb.com/attributions">CartoDB</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapController />
            <MapClickHandler />

            <Marker position={[lat, lng]}>
              <Popup>
                <div className="text-sm">
                  <strong>Impact Point</strong>
                  <br />
                  Lat: {lat.toFixed(4)}°
                  <br />
                  Lng: {lng.toFixed(4)}°
                </div>
              </Popup>
            </Marker>

            {simulationResults && showEnvironmentalOverlays.seismic && (
              <>
                {/* Seismic Effects - Draw first (largest, lowest priority) */}
                <Circle
                  center={[lat, lng]}
                  radius={simulationResults.seismic.radius * 1000}
                  pathOptions={{ 
                    color: 'purple', 
                    fillColor: 'purple', 
                    fillOpacity: 0.05,
                    weight: 1,
                    dashArray: '5, 5'
                  }}
                />

                {/* Overpressure Zone (structural damage) */}
                <Circle
                  center={[lat, lng]}
                  radius={simulationResults.atmospheric.overpressure * 1000}
                  pathOptions={{ 
                    color: '#FFA500', 
                    fillColor: '#FFA500', 
                    fillOpacity: 0.15,
                    weight: 2
                  }}
                />

                {/* Thermal Radiation (3rd degree burns) */}
                <Circle
                  center={[lat, lng]}
                  radius={simulationResults.atmospheric.thermalRadiation * 1000}
                  pathOptions={{ 
                    color: 'yellow', 
                    fillColor: 'yellow', 
                    fillOpacity: 0.25,
                    weight: 2
                  }}
                />

                {/* Fireball (complete vaporization) */}
                <Circle
                  center={[lat, lng]}
                  radius={simulationResults.atmospheric.fireballRadius * 1000}
                  pathOptions={{ 
                    color: 'orange', 
                    fillColor: 'orange', 
                    fillOpacity: 0.4,
                    weight: 2
                  }}
                />

                {/* Crater (ground zero) */}
                <Circle
                  center={[lat, lng]}
                  radius={simulationResults.crater.diameter / 2}
                  pathOptions={{ 
                    color: 'red', 
                    fillColor: 'red', 
                    fillOpacity: 0.6,
                    weight: 3
                  }}
                />
              </>
            )}

            {simulationResults?.tsunami && showEnvironmentalOverlays.tsunami && (
              <Circle
                center={[lat, lng]}
                radius={simulationResults.tsunami.affectedRadius * 1000}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }}
              />
            )}
          </MapContainer>
        </div>

        {/* Current Location Info */}
        <div className="mt-3 p-3 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-400">Current Impact Location:</span>
              <span className="ml-2 text-space-cyan font-mono">
                {lat.toFixed(4)}°, {lng.toFixed(4)}°
              </span>
            </div>
            {selectedCity && (
              <div className="text-space-neon font-semibold">
                {selectedCity}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 space-y-2">
          <div className="text-xs font-semibold text-gray-300 mb-2">Impact Zones:</div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            <div className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="text-white font-medium text-xs">Crater</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="text-white font-medium text-xs">Fireball</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
              <div className="text-xs">
                <div className="text-white font-medium text-xs">Thermal</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className="w-2 h-2 rounded-full bg-orange-600 flex-shrink-0" />
              <div className="text-xs">
                <div className="text-white font-medium text-xs">Blast</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-white/5">
              <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0 opacity-50" />
              <div className="text-xs">
                <div className="text-white font-medium text-xs">Seismic</div>
              </div>
            </div>
            {simulationResults?.tsunami && (
              <div className="flex items-center gap-2 p-2 rounded bg-white/5">
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="text-xs">
                  <div className="text-white font-medium">Tsunami</div>
                  <div className="text-gray-400">Wave inundation</div>
                </div>
              </div>
            )}
          </div>
          {simulationResults && (
            <div className="mt-3 p-2 rounded bg-space-cyan/10 border border-space-cyan/30">
              <div className="text-xs text-gray-300">
                <span className="font-semibold text-space-cyan">💡 Tip:</span> 
                {' '}Zoom adjusted automatically based on impact size. 
                {simulationResults.seismic.radius > 200 && ' Seismic zone shown with reduced opacity due to large size.'}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
