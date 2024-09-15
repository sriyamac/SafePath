// src/components/MapComponent.js

import React, { useEffect, useRef, useState } from 'react';
import SearchBar from './SearchBar';
import axios from 'axios';
import loadScript from 'load-script';

const MapComponent = () => {
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

  // Load Google Maps script dynamically when the component mounts
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

    // Cleanup function to clear intervals when the component unmounts
    return () => {
      if (tornadoIntervalId) {
        clearInterval(tornadoIntervalId);
      }
    };
  }, []);

  // Function to initialize the map
  const initializeMap = () => {
    const google = window.google;

    const initialMap = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
      zoom: 5,
    });

    setMap(initialMap);
  };

  // Function to geocode the address entered by the user
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

  // Function to handle the search operation when the user inputs a location
  const handleSearch = async (address) => {
    try {
      const location = await geocodeAddress(address);
      map.setCenter(location);
      map.setZoom(15);

      setStartPoint(location);

      // Place start marker on the map
      const google = window.google;
      if (startMarker) {
        startMarker.setMap(null);
      }
      const marker = new google.maps.Marker({
        position: location,
        map: map,
        label: 'Start',
      });
      setStartMarker(marker);

      // Send starting coordinates to the backend
      sendStartCoordinates(location.lat(), location.lng());

      // Generate a safe zone within the map bounds
      generateSafeZone();

      // Simulate the tornado path across the map
      simulateTornadoPath();

      // Update the evacuation path and tornado position every 5 seconds
      updatePath();
      const intervalId = setInterval(() => {
        updateTornadoPosition();
      }, 5000);
      setTornadoIntervalId(intervalId);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to send the starting coordinates to the backend
  const sendStartCoordinates = (lat, lng) => {
    axios
      .post('http://localhost:5000/api/start-coordinates', {
        latitude: lat,
        longitude: lng,
      })
      .then((response) => {
        console.log('Backend response:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Function to generate a safe zone randomly within the map bounds
  const generateSafeZone = () => {
    const google = window.google;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lat = sw.lat() + Math.random() * (ne.lat() - sw.lat());
    const lng = sw.lng() + Math.random() * (ne.lng() - sw.lng());

    const safeZoneLocation = new google.maps.LatLng(lat, lng);
    setSafeZone(safeZoneLocation);

    // Place the safe zone marker on the map
    if (endMarker) {
      endMarker.setMap(null);
    }
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

  // Function to simulate the tornado's path across the map
  const simulateTornadoPath = () => {
    const google = window.google;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const middleLat = (ne.lat() + sw.lat()) / 2;

    const path = [
      { lat: middleLat, lng: sw.lng() },
      { lat: middleLat, lng: ne.lng() },
    ];

    setTornadoPath(path);

    // Place the tornado marker at the start of its path
    if (tornadoMarker) {
      tornadoMarker.setMap(null);
    }
    const marker = new google.maps.Marker({
      position: path[0],
      map: map,
      label: 'Tornado',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });
    setTornadoMarker(marker);

    // Draw the tornado's path on the map (optional)
    const tornadoPolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });
    tornadoPolyline.setMap(map);
  };

  // Function to update the tornado's position along its path
  const updateTornadoPosition = () => {
    if (!tornadoPath || tornadoPath.length === 0) return;
    let index = tornadoIndex + 1;
    if (index >= tornadoPath.length) {
      index = 0;
    }
    setTornadoIndex(index);

    const nextPosition = new window.google.maps.LatLng(
      tornadoPath[index].lat,
      tornadoPath[index].lng
    );
    tornadoMarker.setPosition(nextPosition);

    // Send the tornado's current position to the backend
    sendTornadoCoordinates(nextPosition.lat(), nextPosition.lng());

    // Update the evacuation path to the safe zone
    updatePath();
  };

  // Function to send the tornado's coordinates to the backend
  const sendTornadoCoordinates = (lat, lng) => {
    axios
      .post('http://localhost:5000/api/update-tornado', {
        latitude: lat,
        longitude: lng,
      })
      .then((response) => {
        console.log('Backend response:', response.data);
        const path = response.data.path;
        drawPath(path);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  // Function to update the evacuation path to the safe zone
  const updatePath = () => {
    if (!startPoint || !safeZone) {
      return;
    }

    const google = window.google;
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
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

    // Define the tornado's danger zone as a circle
    const tornadoDangerZone = new google.maps.Circle({
      center: tornadoMarker.getPosition(),
      radius: 200, // Radius in meters
      map: map,
      fillOpacity: 0.2,
      fillColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeColor: '#FF0000',
    });

    // Note: The Google Directions API doesn't support avoiding polygons directly
    // For a more accurate pathfinding, a custom algorithm or waypoints would be needed

    // Request directions from the start point to the safe zone
    directionsService.route(
      {
        origin: startPoint,
        destination: safeZone,
        travelMode: google.maps.TravelMode.WALKING,
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

  // Function to draw the path received from the backend
  const drawPath = (pathCoords) => {
    const google = window.google;
    const path = pathCoords.map(
      (coord) => new google.maps.LatLng(coord.lat, coord.lng)
    );

    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const pathLine = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: 'blue',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    pathLine.setMap(map);
    setDirectionsRenderer(pathLine);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <div
        id="map"
        ref={mapRef}
        style={{ width: '100%', height: '80vh' }}
      ></div>
    </div>
  );
};

export default MapComponent;
