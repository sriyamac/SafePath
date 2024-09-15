// src/components/MapComponent.js

import React, { useEffect, useRef, useState } from 'react';
import loadScript from 'load-script';

const MapComponent = ({ location, onTornadoWarning }) => {
  const mapRef = useRef(null);
  const map = useRef(null);
  const [startMarker, setStartMarker] = useState(null);
  const [endMarker, setEndMarker] = useState(null);
  const [tornadoMarker, setTornadoMarker] = useState(null);
  const [tornadoPolyline, setTornadoPolyline] = useState(null);
  const [tornadoEquation, setTornadoEquation] = useState(null);
  const [safeZone, setSafeZone] = useState(null);
  const [startPoint, setStartPoint] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [tornadoIntervalId, setTornadoIntervalId] = useState(null);
  const [tornadoWarningSent, setTornadoWarningSent] = useState(false);
  const [tornadoIndex, setTornadoIndex] = useState(0); // Added this line

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
    if (map.current && location) {
      handleSearch(location);
    }
  }, [location]);

  // Initialize map
  const initializeMap = () => {
    const google = window.google;

    map.current = new google.maps.Map(mapRef.current, {
      center: { lat: 39.8283, lng: -98.5795 }, // Center of the US
      zoom: 5,
    });
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
        setTornadoIntervalId(null);
      }
      if (tornadoMarker) {
        tornadoMarker.setMap(null);
        setTornadoMarker(null);
      }
      if (tornadoPolyline) {
        tornadoPolyline.setMap(null);
        setTornadoPolyline(null);
      }
      if (endMarker) {
        endMarker.setMap(null);
        setEndMarker(null);
      }
      if (directionsRenderer) {
        directionsRenderer.setMap(null);
        setDirectionsRenderer(null); // Reset the directionsRenderer
      }
      if (startMarker) {
        startMarker.setMap(null);
        setStartMarker(null);
      }
      setTornadoWarningSent(false); // Reset tornado warning sent flag
      setTornadoIndex(0); // Reset tornado index

      const location = await geocodeAddress(address);
      map.current.setCenter(location);
      map.current.setZoom(15);

      setStartPoint(location);

      // Place start marker
      const google = window.google;
      const marker = new google.maps.Marker({
        position: location,
        map: map.current,
        label: 'Start',
      });
      setStartMarker(marker);

      // Simulate tornado path and generate safe zone
      simulateTornadoPath(location);
      generateSafeZone();

      // Start tornado movement
      const intervalId = setInterval(() => {
        updateTornadoPosition();
      }, 100); // Move tornado every 100 ms for faster movement
      setTornadoIntervalId(intervalId);
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect to update path when startPoint or safeZone change
  useEffect(() => {
    if (startPoint && safeZone) {
      updatePath();
    }
  }, [startPoint, safeZone]);

  // Generate safe zone mathematically ensuring no overlap with tornado path
  const generateSafeZone = () => {
    const google = window.google;

    // Extract the linear equation of the tornado path: y = m * x + b
    const { m, b } = tornadoEquation;

    // Determine which side of the line the start point is on
    const startLat = startPoint.lat();
    const startLng = startPoint.lng();
    const startSide = startLat > m * startLng + b ? 1 : -1;

    // Generate a safe zone on the same side of the tornado path
    const offsetDistance = 0.01; // Offset distance in degrees (~1.11 km)
    const safeZoneLat = startLat + startSide * offsetDistance;
    const safeZoneLng = startLng + startSide * offsetDistance;

    const safeZoneLocation = new google.maps.LatLng(safeZoneLat, safeZoneLng);
    setSafeZone(safeZoneLocation);

    // Place safe zone marker
    const marker = new google.maps.Marker({
      position: safeZoneLocation,
      map: map.current,
      label: 'Safe Zone',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
    });
    setEndMarker(marker);
  };

  // Simulate tornado path as a straight line and store its equation
  const simulateTornadoPath = (startPoint) => {
    const google = window.google;
    const bounds = map.current.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Define two points for the tornado path (ensuring it goes through the start point)
    const pointA = {
      lat: ne.lat() + 0.1,
      lng: sw.lng() - 0.1,
    };

    const pointB = {
      lat: sw.lat() - 0.1,
      lng: ne.lng() + 0.1,
    };

    // Create a path that goes through startPoint
    const path = [pointA, pointB];

    // Calculate the linear equation y = m * x + b
    const m = (pointB.lat - pointA.lat) / (pointB.lng - pointA.lng);
    const b = pointA.lat - m * pointA.lng;
    setTornadoEquation({ m, b });

    // Draw the tornado path on the map
    const tornadoLine = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    tornadoLine.setMap(map.current);
    setTornadoPolyline(tornadoLine);

    // Place tornado marker at the start of the path
    const marker = new google.maps.Marker({
      position: pointA,
      map: map.current,
      label: 'Tornado',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });
    setTornadoMarker(marker);
  };

  // Update tornado position along the line
  const updateTornadoPosition = () => {
    if (!tornadoPolyline || !tornadoMarker) return;

    const google = window.google;
    const path = tornadoPolyline.getPath();

    const numPoints = path.getLength();
    if (tornadoIndex >= numPoints) {
      // Tornado has reached the end of its path
      tornadoMarker.setMap(null);
      setTornadoMarker(null);
      if (tornadoPolyline) {
        tornadoPolyline.setMap(null);
        setTornadoPolyline(null);
      }
      clearInterval(tornadoIntervalId);
      setTornadoIntervalId(null);
      return;
    }

    const nextPosition = path.getAt(tornadoIndex);
    tornadoMarker.setPosition(nextPosition);
    setTornadoIndex((prevIndex) => prevIndex + 1);
  };

  // Update evacuation route ensuring no overlap with tornado path
  const updatePath = () => {
    if (!startPoint || !safeZone) {
      return;
    }

    const google = window.google;
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null); // Reset the directionsRenderer
    }

    const directionsService = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      map: map.current,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: 'blue',
      },
    });
    setDirectionsRenderer(renderer);

    // Since the tornado path is a straight line, we can ensure the route does not cross it
    // by setting waypoints that stay on the same side of the line

    const request = {
      origin: startPoint,
      destination: safeZone,
      travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        const route = response.routes[0];
        const routePath = route.overview_path;

        // Check if the route crosses the tornado path
        const crossesTornado = routePath.some((point) => {
          const pointLat = point.lat();
          const pointLng = point.lng();
          const { m, b } = tornadoEquation;
          const side = pointLat > m * pointLng + b ? 1 : -1;
          const startSide = startPoint.lat() > m * startPoint.lng() + b ? 1 : -1;
          return side !== startSide;
        });

        if (crossesTornado) {
          // Modify the route to avoid crossing the tornado path
          const avoidPoint = calculateAvoidWaypoint(startPoint, safeZone);
          if (avoidPoint) {
            request.waypoints = [
              {
                location: avoidPoint,
                stopover: false,
              },
            ];
            directionsService.route(request, (newResponse, newStatus) => {
              if (newStatus === google.maps.DirectionsStatus.OK) {
                renderer.setDirections(newResponse);
                triggerTornadoWarning();
              } else {
                console.error('Directions request failed due to ' + newStatus);
              }
            });
          } else {
            // If unable to find a waypoint, display the original route
            renderer.setDirections(response);
            triggerTornadoWarning();
          }
        } else {
          // Route does not cross the tornado path
          renderer.setDirections(response);
          triggerTornadoWarning();
        }
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  };

  // Function to calculate a waypoint to avoid crossing the tornado path
  const calculateAvoidWaypoint = (start, end) => {
    const google = window.google;
    const { m, b } = tornadoEquation;

    // Compute a point that stays on the same side of the tornado path
    const midLat = (start.lat() + end.lat()) / 2;
    const midLng = (start.lng() + end.lng()) / 2;

    const startSide = start.lat() > m * start.lng() + b ? 1 : -1;
    const offsetDistance = 0.005; // Offset distance in degrees (~0.55 km)
    const adjustLat = midLat + startSide * offsetDistance;
    const adjustLng = midLng + startSide * offsetDistance;

    return new google.maps.LatLng(adjustLat, adjustLng);
  };

  // Function to trigger tornado warning notification
  const triggerTornadoWarning = () => {
    if (!tornadoWarningSent && onTornadoWarning) {
      onTornadoWarning();
      setTornadoWarningSent(true);
    }
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
