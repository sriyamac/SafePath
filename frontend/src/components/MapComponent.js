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
      const location = await geocodeAddress(address);
      map.setCenter(location);
      map.setZoom(15);

      setStartPoint(location);

      // Place start marker
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

      // Send coordinates to backend
      sendStartCoordinates(location.lat(), location.lng());

      // Generate safe zone and simulate tornado
      generateSafeZone();
      simulateTornadoPath();

      // Update path and tornado position
      updatePath();
      const intervalId = setInterval(() => {
        updateTornadoPosition();
      }, 5000);
      setTornadoIntervalId(intervalId);
    } catch (error) {
      console.error(error);
    }
  };

  // Send start coordinates to backend
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

  // Generate safe zone
  const generateSafeZone = () => {
    const google = window.google;
    const bounds = map.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const lat = sw.lat() + Math.random() * (ne.lat() - sw.lat());
    const lng = sw.lng() + Math.random() * (ne.lng() - sw.lng());

    const safeZoneLocation = new google.maps.LatLng(lat, lng);
    setSafeZone(safeZoneLocation);

    // Place safe zone marker
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

  // Simulate tornado path
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

    // Place tornado marker
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

    // Draw tornado path
    const tornadoPolyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 2,
    });
    tornadoPolyline.setMap(map);
  };

  // Update tornado position
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

    // Send tornado coordinates to backend
    sendTornadoCoordinates(nextPosition.lat(), nextPosition.lng());

    // Update evacuation path
    updatePath();
  };

  // Send tornado coordinates to backend
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

  // Update evacuation path
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

    // Request directions
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

  // Draw path from backend
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
    <div
      id="map"
      ref={mapRef}
      style={{ width: '100%', height: '80vh' }}
    ></div>
  );
};

export default MapComponent;
