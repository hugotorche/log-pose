// Expedition Journey Map Application
class ExpeditionMap {
    constructor() {
        this.map = null;
        this.routeLayer = null;
        this.markersLayer = null;
        this.currentLocationMarker = null;
        this.animatedRoute = null;
        
        // Application data
        this.locations = [
            {
                id: "bordeaux",
                name: "Bordeaux, France",
                coordinates: [44.837789, -0.57918],
                status: "completed",
                description: "Journey begins in the port city of Bordeaux, famous for its wine trade routes and maritime history.",
                arrivalDate: "August 1, 2025",
                departureDate: "August 5, 2025",
                highlights: ["Historic Port", "Wine Museums", "Garonne River"]
            },
            {
                id: "paris", 
                name: "Paris, France",
                coordinates: [48.8566, 2.3522],
                status: "completed",
                description: "Passing through the capital of France, a hub of adventure and culture with centuries of history.",
                arrivalDate: "August 6, 2025", 
                departureDate: "August 10, 2025",
                highlights: ["Eiffel Tower", "Louvre Museum", "Seine River Cruise"]
            },
            {
                id: "copenhagen",
                name: "Copenhagen, Denmark", 
                coordinates: [55.6761, 12.5683],
                status: "current",
                description: "Currently exploring the maritime capital of Denmark, known for its Viking heritage and modern design.",
                arrivalDate: "August 11, 2025",
                departureDate: "TBD",
                highlights: ["Nyhavn Harbor", "Tivoli Gardens", "Little Mermaid Statue"]
            }
        ];

        this.route = [
            [44.837789, -0.57918],
            [48.8566, 2.3522], 
            [55.6761, 12.5683]
        ];

        this.legendItems = [
            {icon: "⚓", label: "Journey Waypoint", color: "#FFD700"},
            {icon: "🏛️", label: "Museum/Culture", color: "#87CEEB"},
            {icon: "🏨", label: "Accommodation", color: "#DDA0DD"},
            {icon: "🍽️", label: "Dining", color: "#F0E68C"},
            {icon: "🌊", label: "Natural Feature", color: "#40E0D0"}
        ];
        
        this.markers = [];
        this.init();
    }

    init() {
        this.initializeMap();
        this.createLayers();
        this.addMarkers();
        this.createAnimatedRoute();
        this.populateLegend();
        this.addCompassRose();
        this.startAnimations();
        
        // Fit map to show all locations
        setTimeout(() => {
            this.resetMapView();
        }, 1000);
    }

    initializeMap() {
        this.map = L.map('map').setView([49.2125578, 16.62662018], 14); //starting position

        L.tileLayer('/tiles/{z}/{x}/{y}.png', {
            tileSize: 512,
            zoomOffset: -1,
            minZoom: 1,
            attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
            crossOrigin: true
        }).addTo(this.map);

        // Add custom styling
        this.map.getContainer().style.filter = 'sepia(10%) saturate(0.9) hue-rotate(200deg) brightness(0.8) contrast(1.1)';
    }

    createLayers() {
        this.routeLayer = L.layerGroup().addTo(this.map);
        this.markersLayer = L.layerGroup().addTo(this.map);
    }

    createCustomIcon(location) {
        const iconSize = location.status === 'current' ? 40 : 30;
        const iconColor = location.status === 'current' ? '#FFD700' : 
                         location.status === 'completed' ? '#32CD32' : '#87CEEB';
        
        const pulseHTML = location.status === 'current' ? 
            `<div class="marker-pulse" style="
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 60px;
                height: 60px;
                background: rgba(255, 215, 0, 0.3);
                border-radius: 50%;
                animation: pulseShadow 2s infinite ease-in-out;
                z-index: 1;
            "></div>` : '';
        
        return L.divIcon({
            className: `expedition-marker ${location.status}`,
            html: `
                <div class="marker-container" style="position: relative; width: ${iconSize}px; height: ${iconSize}px;">
                    ${pulseHTML}
                    <div class="marker-icon" style="
                        position: relative;
                        z-index: 10;
                        width: ${iconSize}px;
                        height: ${iconSize}px;
                        background: ${iconColor};
                        border: 3px solid #8b4513;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        color: #1a2332;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    ">⚓</div>
                </div>
            `,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2],
            popupAnchor: [0, -iconSize/2 - 5]
        });
    }

    createPopupContent(location) {
        const statusClass = location.status;
        const statusText = location.status === 'current' ? 'Currently Here' :
                          location.status === 'completed' ? 'Journey Complete' : 'Planned Visit';
        
        return `
            <div class="expedition-popup">
                <h3 class="popup-title">${location.name}</h3>
                <div class="popup-status ${statusClass}">${statusText}</div>
                <p class="popup-description">${location.description}</p>
                <div class="popup-dates">
                    <strong>Arrival:</strong> ${location.arrivalDate}<br>
                    <strong>Departure:</strong> ${location.departureDate}
                </div>
                <div class="popup-highlights">
                    <h4>🌟 Highlights</h4>
                    <ul>
                        ${location.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                    </ul>
                </div>
                <button class="popup-button" onclick="expeditionMap.viewDetails('${location.id}')">
                    📖 View Detailed Log
                </button>
            </div>
        `;
    }

    addMarkers() {
        this.locations.forEach((location, index) => {
            const marker = L.marker(location.coordinates, {
                icon: this.createCustomIcon(location),
                riseOnHover: true
            });

            marker.bindPopup(this.createPopupContent(location), {
                maxWidth: 320,
                className: 'expedition-popup-wrapper'
            });

            marker.addTo(this.markersLayer);
            this.markers.push(marker);

            // Store reference for current location
            if (location.status === 'current') {
                this.currentLocationMarker = marker;
            }

            // Add click event for enhanced interaction
            marker.on('click', (e) => {
                this.onMarkerClick(location, e);
            });

            console.log(`Added marker for ${location.name} at [${location.coordinates[0]}, ${location.coordinates[1]}]`);
        });
    }

    createAnimatedRoute() {
        // Create main route polyline
        const mainRoute = L.polyline(this.route, {
            color: '#FFD700',
            weight: 4,
            opacity: 0.9,
            dashArray: '10, 5',
            lineCap: 'round',
            lineJoin: 'round'
        }).addTo(this.routeLayer);

        // Create individual segments with animation delay
        this.route.forEach((point, index) => {
            if (index > 0) {
                const segment = [this.route[index - 1], this.route[index]];
                
                setTimeout(() => {
                    const segmentLine = L.polyline(segment, {
                        color: '#32CD32',
                        weight: 6,
                        opacity: 0.7,
                        dashArray: '15, 10'
                    }).addTo(this.routeLayer);

                    // Add direction arrows using simple CSS-based approach
                    this.addDirectionArrows(segment);
                }, index * 1500);
            }
        });

        // Add a glowing effect to the main route
        const glowRoute = L.polyline(this.route, {
            color: '#FFD700',
            weight: 8,
            opacity: 0.3,
            lineCap: 'round'
        }).addTo(this.routeLayer);

        console.log('Route created with', this.route.length, 'waypoints');
    }

    addDirectionArrows(segment) {
        // Calculate midpoint and bearing for arrow placement
        const startLatLng = L.latLng(segment[0]);
        const endLatLng = L.latLng(segment[1]);
        const midLatLng = L.latLng(
            (startLatLng.lat + endLatLng.lat) / 2,
            (startLatLng.lng + endLatLng.lng) / 2
        );

        // Create arrow marker
        const arrowIcon = L.divIcon({
            html: '➤',
            className: 'route-arrow',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        const arrowMarker = L.marker(midLatLng, { icon: arrowIcon }).addTo(this.routeLayer);
        
        // Calculate rotation angle
        const bearing = startLatLng.bearingTo(endLatLng);
        const arrowElement = arrowMarker.getElement();
        if (arrowElement) {
            arrowElement.style.transform += ` rotate(${bearing}deg)`;
            arrowElement.style.color = '#FFD700';
            arrowElement.style.fontSize = '16px';
            arrowElement.style.textShadow = '0 0 4px rgba(0,0,0,0.8)';
        }
    }

    populateLegend() {
        const legendContainer = document.getElementById('legendItems');
        if (!legendContainer) return;
        
        // Clear existing content
        legendContainer.innerHTML = '';
        
        this.legendItems.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.innerHTML = `
                <span class="legend-icon" style="color: ${item.color}; font-size: 16px;">${item.icon}</span>
                <span class="legend-label">${item.label}</span>
            `;
            legendContainer.appendChild(legendItem);
        });
        
        console.log('Legend populated with', this.legendItems.length, 'items');
    }

    addCompassRose() {
        const compassDiv = document.createElement('div');
        compassDiv.className = 'compass-rose';
        compassDiv.innerHTML = '🧭';
        compassDiv.title = 'Reset View (Press R)';
        compassDiv.onclick = () => this.resetMapView();
        
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.appendChild(compassDiv);
        }
    }

    resetMapView() {
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    onMarkerClick(location, event) {
        // Add sparkle effect on click
        this.addSparkleEffect(event.latlng);
        
        // Update journey info if it's the current location
        if (location.status === 'current') {
            this.updateJourneyInfo(location);
        }

        console.log(`Clicked on ${location.name}`);
    }

    addSparkleEffect(latlng) {
        const sparkles = [];
        for (let i = 0; i < 8; i++) {
            const angle = (i * 45) * Math.PI / 180;
            const distance = 0.01;
            const sparkleLatLng = [
                latlng.lat + Math.cos(angle) * distance,
                latlng.lng + Math.sin(angle) * distance
            ];
            
            const sparkle = L.circleMarker(sparkleLatLng, {
                radius: 4,
                color: '#FFD700',
                fillColor: '#FFD700',
                fillOpacity: 1,
                weight: 2,
                opacity: 1
            }).addTo(this.routeLayer);
            
            sparkles.push(sparkle);
        }
        
        // Remove sparkles after animation
        setTimeout(() => {
            sparkles.forEach(sparkle => this.routeLayer.removeLayer(sparkle));
        }, 1500);
    }

    updateJourneyInfo(location) {
        const journeyInfo = document.getElementById('journeyInfo');
        if (journeyInfo) {
            const currentLocationSpan = journeyInfo.querySelector('.current-location span:last-child');
            if (currentLocationSpan) {
                currentLocationSpan.innerHTML = `Currently in: <strong>${location.name}</strong>`;
            }
            
            // Add a brief flash effect
            journeyInfo.style.background = 'rgba(25, 25, 112, 0.5)';
            setTimeout(() => {
                journeyInfo.style.background = 'rgba(25, 25, 112, 0.3)';
            }, 200);
        }
    }

    startAnimations() {
        this.startPulsingAnimation();
        this.startRouteGlow();
    }

    startPulsingAnimation() {
        // Ensure current location marker pulses
        if (this.currentLocationMarker) {
            const markerElement = this.currentLocationMarker.getElement();
            if (markerElement) {
                const pulseElement = markerElement.querySelector('.marker-pulse');
                if (pulseElement) {
                    pulseElement.classList.add('pulsing');
                }
            }
        }
    }

    startRouteGlow() {
        // Add subtle glow animation to routes
        setInterval(() => {
            const routeElements = document.querySelectorAll('path[stroke="#FFD700"]');
            routeElements.forEach(element => {
                element.style.filter = 'drop-shadow(0 0 6px #FFD700)';
                setTimeout(() => {
                    element.style.filter = 'drop-shadow(0 0 3px #FFD700)';
                }, 1000);
            });
        }, 3000);
    }

    // Public method for viewing details (called from popup buttons)
    viewDetails(locationId) {
        const location = this.locations.find(loc => loc.id === locationId);
        if (location) {
            alert(`🗞️ Detailed expedition log for ${location.name} will be available soon!\n\nThis feature will include:\n• Photo gallery\n• Detailed journey notes\n• Interactive timeline\n• Local discoveries\n\nCurrent Status: ${location.status.toUpperCase()}`);
        }
    }

    // Public method to add new locations (for easy extensibility)
    addLocation(locationData) {
        this.locations.push(locationData);
        const marker = L.marker(locationData.coordinates, {
            icon: this.createCustomIcon(locationData)
        });
        
        marker.bindPopup(this.createPopupContent(locationData));
        marker.addTo(this.markersLayer);
        this.markers.push(marker);
        
        return marker;
    }

    // Public method to add new route segment
    addRouteSegment(fromCoords, toCoords, options = {}) {
        const segmentLine = L.polyline([fromCoords, toCoords], {
            color: options.color || '#FFD700',
            weight: options.weight || 4,
            opacity: options.opacity || 0.8,
            dashArray: options.dashArray || '10, 5'
        });
        
        segmentLine.addTo(this.routeLayer);
        return segmentLine;
    }
}

// Add Leaflet bearing calculation method
L.LatLng.prototype.bearingTo = function(other) {
    const lat1 = this.lat * Math.PI / 180;
    const lat2 = other.lat * Math.PI / 180;
    const deltaLng = (other.lng - this.lng) * Math.PI / 180;
    
    const x = Math.sin(deltaLng) * Math.cos(lat2);
    const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
    
    return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360;
};

// Initialize the application when the page loads
let expeditionMap;

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌊 Initializing Expedition Map...');
    
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
        expeditionMap = new ExpeditionMap();
        console.log('🗺️ Expedition Map loaded successfully!');
        console.log('⚓ Ready to explore the journey from Bordeaux to Copenhagen');
    }, 100);
});

// Add keyboard shortcuts for better UX
document.addEventListener('keydown', (e) => {
    if (!expeditionMap) return;
    
    switch(e.key.toLowerCase()) {
        case 'r':
            expeditionMap.resetMapView();
            break;
        case 'escape':
            expeditionMap.map.closePopup();
            break;
    }
});

// Add window resize handler
window.addEventListener('resize', () => {
    if (expeditionMap && expeditionMap.map) {
        setTimeout(() => {
            expeditionMap.map.invalidateSize();
        }, 100);
    }
});