// src/components/MapComponent.js

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import loadScript from 'load-script';

const MapComponent = ({ location }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [tornadoMarker, setTornadoMarker] = useState(null);
  const [tornadoPath, setTornadoPath] = useState([]);
  const [tornadoIndex, setTornadoIndex] = useState(0);
  const [safeZone, setSafeZone] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [tornadoIntervalId, setTornadoIntervalId] = useState(null);

  // Load Google Maps script when the component mounts
  useEffect(() => {
    if (!window.google) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,geometry`,
        () => {
          console.log('Google Maps script loaded');
          initializeMap();
        }
      );
    } else {
      initializeMap();
    }

    // Cleanup intervals on unmount
    return () => {
      if (tornadoIntervalId) {
        clearInterval(tornadoIntervalId);
      }
    };
  }, []);

  // Handle new location input
  useEffect(() => {
    if (map && location) {
      handleSearch(location);
    }
  }, [location, map]);

  // Initialize map
  const initializeMap = () => {
    const google = window.google;

    const initialMap = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
      zoom: 5,
    });

    setMap(initialMap);
  };

  // Geocode address
  const geocodeAddress = (address) => {
    const google = window.google;
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK') {
          resolve(results[0].geometry.location);
        } else {
          reject('Geocode was not successful: ' + status);
        }
      });
    });
  };

  // Handle search operation
  const handleSearch = async (address) => {
    try {
      // Clear previous intervals and markers
      if (tornadoIntervalId) {
        clearInterval(tornadoIntervalId);
      }
      if (tornadoMarker) {
        tornadoMarker.setMap(null);
      }
      if (endMarker) {
        endMarker.setMap(null);
      }
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(null); // Reset the directionsRenderer
      }
      if (startMarker) {
        startMarker.setMap(null);
      }

      const location = await geocodeAddress(address);
      map.setCenter(location);
      map.setZoom(15);

      setStartPoint(location);

      // Place start marker
      const google = window.google;
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        label: 'Start',
      });
      setStartMarker(marker);

      // Simulate tornado path and generate safe zone
      simulateTornadoPath(() => {
        generateSafeZone();

        // Start tornado movement
        const intervalId = setInterval(() => {
          updateTornadoPosition();
        }, 200); // Move tornado every 200 ms for faster movement
        setTornadoIntervalId(intervalId);
      });
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect to update path when startPoint, safeZone, or tornadoMarker change
  useEffect(() => {
    if (startPoint && safeZone && tornadoMarker) {
      updatePath();
    }
  }, [startPoint, safeZone, tornadoMarker]);

  // useEffect to update path when tornado moves
  useEffect(() => {
    if (startPoint && safeZone && tornadoMarker) {
      updatePath();
    }
  }, [tornadoIndex]);

  // Generate safe zone, ensuring it is not in the tornado's path
  const generateSafeZone = () => {
    const google = window.google;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    let attempts = 0;
    let safeZoneLocation;

    // Ensure the safe zone is not in the tornado's path
    do {
      const lat = sw.lat() + Math.random() * (ne.lat() - sw.lat());
      const lng = sw.lng() + Math.random() * (ne.lng() - sw.lng());
      safeZoneLocation = new google.maps.LatLng(lat, lng);

      attempts++;
      if (attempts > 50) {
        console.warn(
          'Could not find a safe zone outside the tornado path after 50 attempts'
        );
        break;
      }
    } while (isPointNearPolyline(safeZoneLocation, tornadoPath, 0.001)); // Adjust tolerance as needed

    setSafeZone(safeZoneLocation);

    // Place safe zone marker
    const marker = new google.maps.Marker({
      position: safeZoneLocation,
      map: map,
      label: 'Safe Zone',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
    });
    setEndMarker(marker);
  };

  // Function to check if a point is near a polyline
  const isPointNearPolyline = (point, polylineCoords, tolerance) => {
    const google = window.google;
    const polyline = new google.maps.Polyline({ path: polylineCoords });
    const isNear = google.maps.geometry.poly.isLocationOnEdge(
      point,
      polyline,
      tolerance || 10e-3
    );
    return isNear;
  };

  // Simulate tornado path
  const simulateTornadoPath = (callback) => {
    const google = window.google;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Generate a series of waypoints within the map bounds to create a more realistic path
    const path = [];
    const numberOfPoints = 1000; // Increase number of points for smoother movement
    for (let i = 0; i < numberOfPoints; i++) {
      const lat =
        sw.lat() +
        Math.random() * (ne.lat() - sw.lat()) +
        (Math.sin(i / 10) * 0.001); // Add slight sine wave for realism
      const lng =
        sw.lng() +
        Math.random() * (ne.lng() - sw.lng()) +
        (Math.cos(i / 10) * 0.001);
      path.push({ lat, lng });
    }

    // Sort waypoints to create a continuous path
    path.sort((a, b) => a.lng - b.lng);

    setTornadoPath(path);

    // Place tornado marker
    const marker = new google.maps.Marker({
      position: path[0],
      map: map,
      label: 'Tornado',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });
    setTornadoMarker(marker);
    setTornadoIndex(0);

    if (callback) callback();
  };

  // Update tornado position
  const updateTornadoPosition = () => {
    if (!tornadoPath || tornadoPath.length === 0) return;
    let index = tornadoIndex + 5; // Move 5 steps at a time for faster movement
    if (index >= tornadoPath.length) {
      index = 0;
    }
    setTornadoIndex(index);

    const nextPosition = new window.google.maps.LatLng(
      tornadoPath[index].lat,
      tornadoPath[index].lng
    );
    tornadoMarker.setPosition(nextPosition);
  };

  // Update evacuation path
  const updatePath = () => {
    if (!startPoint || !safeZone || !tornadoMarker) {
      return;
    }

    const google = window.google;
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null); // Reset the directionsRenderer
    }

    const directionsService = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: 'blue',
      },
    });
    setDirectionsRenderer(renderer);

    // Request directions without waypoints to see if the route goes directly to the safe zone
    directionsService.route(
      {
        origin: startPoint,
        destination: safeZone,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          renderer.setDirections(response);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  return (
    <div
      id="map"
      ref={mapRef}
      style={{ width: '100%', height: '80vh' }}
    ></div>
  );
};

export default MapComponent;
