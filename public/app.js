class ExpeditionMap {
    constructor() {
      this.map = null;
      this.routeLayer = null;
      this.markersLayer = null;
      this.currentLocationMarker = null;
      this.locations = [
        {
            id: "bordeaux",
            name: "Bordeaux, France",
            coordinates: [44.841225, -0.5800364],
            status: "completed",
            description: "Journey begins in the port city of Bordeaux, famous for its wine trade routes and maritime history. Here I was born and made all my education until the last years of graduate school.",
            startDate: "2016-09-01",
            endDate: "2020-06-30",
            highlights: ["❣️ Rue des Rempats / Librairie Mollat", "🎾 Best Tennis Ranking: 15", "📖 DCG obtained (Accounting National Diploma)"]
        },
        {
            id: "paris", 
            name: "Paris, France",
            coordinates: [48.8534951, 2.3483915],
            status: "completed",
            description: "Passing through the capital of France, a hub of adventure and culture. For the first time I moved to Paris to work 6 months at Chanel. A transformative experience that shaped the end of my studies.",
            startDate: "2020-07-01",
            endDate: "2020-12-31",
            highlights: ["❣️ Place de la Madeleine / Les Madeleines", "🏃 Sine Qua Non Run", "📖 IBM Data Science Coursera Certificate"]
        },
        {
            id: "copenhagen",
            name: "Copenhagen, Denmark", 
            coordinates: [55.6867243, 12.5700724],
            status: "completed",
            description: "International Exchange in the maritime capital of Denmark, known for its Viking heritage and modern design. I enjoyed everything from the courses at Copenhagen Business School to the roadtrip in all Scandinavia.",
            startDate: "2021-09-01",
            endDate: "2021-12-31",
            highlights: [ "❣️ Frederiksberg & Nørrebro", "🎢 Tivoli Gardens", "🏃 Copenhagen Half Marathon 2021", "📖 Maximum grade on all CBS courses"]
        },
        {
            id: "geneva",
            name: "Geneva, Switzerland", 
            coordinates: [46.2017559, 6.1466014],
            status: "current",
            description: "Currently exploring Switzerland with a bold experience at L'Occitane in Geneva. I could spend my all life in this swiss train. I would keep looking at Lake Leman, waiting to arrive at the bottom of the Ski slopes.",
            startDate: "2022-01-01",
            endDate: "-",
            highlights: [ "❣️ The small streets of Carouge", "🍃 Parc des Bastions & the giant Chess boards", "♟️ +1800 elo chess.com", "🧗 Started indoor Bouldering"]
        },
        {
            id: "tokyo",
            name: "Tokyo, Japan", 
            coordinates: [35.6768601, 139.7638947],
            status: "completed",
            description: "Spent 6 months on this island called Japan. Most of it was filled with a Short Term Assignment as a Data Expert for L'Occitane Group. I took the time to learn Japanese and to prepare for the JLPT N4 exam. The trees are so beautiful there, I wish I will see them again.",
            startDate: "2024-03-01",
            endDate: "2024-08-31",
            highlights: [ "❣️ Likurakumano Shrine", "👷 Chiyoda-ku (千代田区)", "📖 Passed JLPT N4", "👘 Shimo-Kitazawa (下北沢)", "🏃 Workout around Tokyo Tower (東京タワー)"]
        }
      ];
      this.routes = [
        { from: "bordeaux", to: "paris", type: "unidirectional" },
        { from: "paris", to: "copenhagen", type: "unidirectional" },
        { from: "copenhagen", to: "geneva", type: "unidirectional" },
        { from: "geneva", to: "tokyo", type: "bidirectional" }
      ];

      this.legendItems = [
        {
          icon: `
            <svg width="20" height="20" viewBox="0 0 20 20" style="display:inline;vertical-align:middle">
              <circle cx="10" cy="10" r="8" fill="#96705B" stroke="#fff" stroke-width="4"/>
            </svg>`,
          label: "Location Lived in"
        },
        {
          icon: `
<svg width="27" height="18" viewBox="0 0 27 18" style="display:inline;vertical-align:middle">
  <line x1="2" y1="9" x2="15" y2="9" stroke="#a7a7a7" stroke-width="2" stroke-dasharray="5 3 5 2"/>
  <polygon points="17,2 25,9 17,14 21,9" fill="#413f41"/>
</svg>`,
          label: "Route Direction"
        },
        {
          icon: `<span style="font-size:8px;">🟣</span>`,
          label: "Explorations"
        },
        {
          icon: "🧭",
          label: "Click to Reset view"
        }
      ];      
      this.markers = [];
      this.init();
    }
  
    init() {
      this.initializeMap();
      this.createLayers();
      this.addMarkers();
      this.addIcons();
      this.addCurvedRoutesAndArrows();
      this.populateLegend();
      this.addCompassRose();
      this.startAnimations();

      // Fit map to show all locations
      setTimeout(() => {
        this.resetMapView();
      }, 1000);
    }
  
    initializeMap() {
      this.map = L.map('map', { attributionControl: false }).setView([48, 17], 3.2);
      L.tileLayer('/tiles/{z}/{x}/{y}.png', {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e \u003ca href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\"\u003e\u0026copy; OpenStreetMap contributors\u003c/a\u003e",
        crossOrigin: true
    }).addTo(this.map);

    this.map.getContainer().style.filter = 'sepia(15%) brightness(0.75)';
    this.map.createPane('markerPane');
    this.map.getPane('markerPane').style.zIndex = 650;
    this.map.createPane('arrowPane');
    this.map.getPane('arrowPane').style.zIndex = 600;
    this.map.createPane('iconPane');
    this.map.getPane('iconPane').style.zIndex = 550;
    }
  
    createLayers() {
      this.routeLayer = L.layerGroup().addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);
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
                    <strong>Arrival:</strong> ${location.startDate}<br>
                    <strong>Departure:</strong> ${location.endDate}
                </div>
                <div class="popup-highlights">
                    <br>
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
      for (const loc of this.locations) {
        const color = loc.status === "current" ? "#AB8476" : "#96705B";
        const pulseHTML = loc.status === 'current' ?
            `<div class="marker-pulse" style="
                position: absolute;
                top: -12%;
                left: -12%;
                transform: translate(-50%, -50%);
                width: 25px;
                height: 25px;
                background: rgba(98, 71, 171, 0.3);
                border-radius: 50%;
                animation: pulseShadow 2s infinite ease-in-out;
                z-index: 1;
            "></div>` : '';

        const marker = L.marker(loc.coordinates, {
          icon: L.divIcon({
            className: "expedition-marker",
            html: `
                <div style="position: relative; width: 20px; height: 20px;">
                    ${pulseHTML}
                    <div style="
                        width: 20px;
                        height: 20px;
                        background: ${color};
                        border: 4px solid #fff;
                        border-radius: 50%;
                        box-shadow:0 0 12px #1a1423c0;
                        cursor: pointer;
                    "></div>
                </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          }), pane: 'markerPane'
        });

        marker.bindPopup(this.createPopupContent(loc), {
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
      }
    }

    addIcons() {
      const cityPopCoords = [
          [46.94809, 7.44744],         // Bern, Switzerland
          [47.37445, 8.54104],         // Zurich, Switzerland
          [46.00368, 8.95105],         // Lugano, Switzerland
          [45.91600, 6.13300],         // Annecy, France
          [45.76342, 4.83428],         // Lyon, France
          [59.91333, 10.73897],        // Oslo, Norway
          [60.391263, 5.322054],       // Bergen, Norway
          [55.64152, 12.08035],        // Roskilde, Denmark
          [59.334591, 18.063240],      // Stockholm, Sweden
          [60.192059, 24.945831],      // Helsinki, Finland
          [59.436962, 24.753574],      // Tallinn, Estonia
          [35.011665, 135.768326],     // Kyoto, Japan
          [34.672314, 135.484802],     // Osaka, Japan
          [35.183334, 136.899994],     // Nagoya, Japan
          [50.073658, 14.418540],      // Prague, Czech Republic
          [37.5665, 126.9780],         // Seoul, South Korea
          [41.3874, 2.1686],           // Barcelona, Spain
          [51.5072, -0.1276],          // London, UK
          [53.3498, -6.2603],          // Dublin, Ireland
          [41.9028, 12.4964],          // Roma, Italy
          [42.9065518,-0.720481],      // Laruns, France
          [68.4059, 18.6836],          // Björkliden, Sweden
          [68.4385, 17.4273],          // Narvik, Norway
          [33.9390665,136.182737],     // Nigishima, Japan
          [35.4526128,139.4302524],    // Yokohama, Japan
          [43.6701553,-1.4299441],     // Hossegor, France
          [45.6343354,-1.0538619],     // Royan, France
          [43.8896602,1.695105],       // Lisle sur Tarn, France
          [49.6558436,0.5157681],      // Hattenville, France
          [44.8653966,15.579437]       // Plitvices Lakes, Croatia
      ];

      cityPopCoords.forEach(([lat, lng]) => {
        const triangleSvg = `
          <svg width="8" height="8" viewBox="0 0 8 8">
            <polygon points="4,1 7,7 1,7" fill="#a38023"/>
          </svg>
        `;
      
        const cityPopIcon = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'city-pop-icon',
            html: `<span>🟣</span>`,
            iconSize: [4, 4],
            iconAnchor: [2, 2]
          }),
          pane: 'iconPane'
        }).addTo(this.map);
      });
    }

    addCurvedRoutesAndArrows() {
      // Plain arrow SVG (16x16, #1A1423)
      const plainArrowSvg = `
        <svg width="14" height="14" viewBox="0 0 14 14">
          <polygon points="3,2 13,8 3,14 7,8" fill="#1A1423"/>
        </svg>`;
  
      for (const route of this.routes) {
        const start = this.locations.find(l => l.id === route.from).coordinates;
        const end = this.locations.find(l => l.id === route.to).coordinates;

        let curveFactor = 0.19; // default
        if ((route.from === "paris" && route.to === "copenhagen") || 
            (route.from === "copenhagen" && route.to === "paris")) {
            curveFactor = 0.30; // more curve for Paris-Copenhagen
        } else if ((route.from === "copenhagen" && route.to === "geneva") || 
                  (route.from === "geneva" && route.to === "copenhagen")) {
            curveFactor = 0.30; // more curve for Copenhagen-Geneva
        }
        const ctrl = this.computeCurveControlPoint(start, end, curveFactor);
        const curvePts = this.bezierPoints(start, ctrl, end, 40);
  
        // Route line: #1A1423
        L.polyline(curvePts, {
          color: "#1A1423",
          weight: 2.5,
          dashArray: "2 10",
          opacity: 0.50
        }).addTo(this.routeLayer);
  
        if (route.type === "bidirectional") {
          // Arrow towards Tokyo (forward): t = 0.30
          this.drawArrowOnCurve(curvePts, plainArrowSvg, 0.30);
          // Arrow towards Geneva (reverse): t = 0.30 on reversed curve (= 0.70 on forward)
          this.drawArrowOnCurve(curvePts.slice().reverse(), plainArrowSvg, 0.30);
        } else if (route.from === "bordeaux" && route.to === "paris") {
          this.drawArrowOnCurve(curvePts, plainArrowSvg, 0.50); // exactly at midpoint
        } else if (route.from === "paris" && route.to === "copenhagen") {
          this.drawArrowOnCurve(curvePts, plainArrowSvg, 0.62);
        } else if (route.from === "copenhagen" && route.to === "geneva") {
            this.drawArrowOnCurve(curvePts, plainArrowSvg, 0.52);
        } else {
          this.drawArrowOnCurve(curvePts, plainArrowSvg, 0.45);
        }
      }
    }
  
    computeCurveControlPoint(start, end, factor = 0.15) {
      const lat1 = start[0], lng1 = start[1];
      const lat2 = end[0], lng2 = end[1];
      const midLat = (lat1 + lat2) / 2;
      const midLng = (lng1 + lng2) / 2;
      const dx = lat2 - lat1, dy = lng2 - lng1;
      const norm = Math.sqrt(dx * dx + dy * dy) || 1;
      const perpLat = -dy / norm, perpLng = dx / norm;
      const offset = factor * norm;
      return [midLat + perpLat * offset, midLng + perpLng * offset];
    }
  
    bezierPoints(from, control, to, segments = 40) {
      const pts = [];
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const lat = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * control[0] + t * t * to[0];
        const lng = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * control[1] + t * t * to[1];
        pts.push([lat, lng]);
      }
      return pts;
    }
  
    drawArrowOnCurve(curvePoints, arrowSvg, t = 0.45) {
      const points = curvePoints.map(ll => this.map.latLngToLayerPoint(L.latLng(ll)));
      let totalDist = 0, dists = [0];
      for (let i = 1; i < points.length; i++) {
        totalDist += points[i].distanceTo(points[i - 1]);
        dists.push(totalDist);
      }
      const targetDist = t * totalDist;
      let idx = 0;
      for (; idx < dists.length - 1; idx++) {
        if (dists[idx + 1] >= targetDist) break;
      }
      if (idx >= points.length - 1) idx = points.length - 2;
      const segLen = dists[idx + 1] - dists[idx];
      const segFraction = (targetDist - dists[idx]) / segLen;
      const midPx = points[idx].add(points[idx + 1].subtract(points[idx]).multiplyBy(segFraction));
      const beforePx = points[Math.max(idx - 1, 0)];
      const afterPx = points[Math.min(idx + 2, points.length - 1)];
      const dx = afterPx.x - beforePx.x, dy = afterPx.y - beforePx.y;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      const latlng = this.map.layerPointToLatLng(midPx);
  
      const icon = L.divIcon({
        className: 'route-arrow-icon',
        html: `<div style="transform: rotate(${angle}deg); width:16px; height:16px; display:flex; align-items:center; justify-content:center;">${arrowSvg}</div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker(latlng, { icon, interactive: false, keyboard: false, pane: 'arrowPane' }).addTo(this.routeLayer);
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
                <span class="legend-icon" style="color: ${item.color};">${item.icon}</span>
                <span class="legend-label">${item.label}</span>
            `;
            legendContainer.appendChild(legendItem);
        });
        
        console.log('Legend populated with', this.legendItems.length, 'items');
    }

    addCompassRose() {
        const compassDiv = document.createElement('div');
        compassDiv.className = 'compass-rose';
        compassDiv.innerHTML = '<span class="compass-emoji">🧭</span>';
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
  }
  
// Initialize map on page load
document.addEventListener("DOMContentLoaded", () => {
    window.expeditionMap = new ExpeditionMap();
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