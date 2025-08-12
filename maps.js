// maps.js — simple map helpers for create-rescue and rescue-nearby
// Loads after Maps API; creates draggable marker and writes lat/lng inputs.
// Exposes initMapSimple for rescue-nearby.

(function(global){
    function initCreateRescueMap() {
      const latInput = document.getElementById('latitude');
      const lngInput = document.getElementById('longitude');
      const mapEl = document.getElementById('map');
      if (!mapEl || !window.google) return;
  
      // default center: user's location or fallback
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        createMap(mapEl, lat, lng, latInput, lngInput);
      }, () => {
        // fallback center
        createMap(mapEl, 20.5937, 78.9629, latInput, lngInput); // India center
      });
    }
  
    function createMap(mapEl, lat, lng, latInput, lngInput) {
      const center = { lat: Number(lat) || 20.5937, lng: Number(lng) || 78.9629 };
      const map = new google.maps.Map(mapEl, { center, zoom: 12 });
      const marker = new google.maps.Marker({
        position: center,
        map,
        draggable: true
      });
      if (latInput) latInput.value = center.lat;
      if (lngInput) lngInput.value = center.lng;
  
      marker.addListener('dragend', () => {
        const p = marker.getPosition();
        latInput.value = p.lat().toFixed(6);
        lngInput.value = p.lng().toFixed(6);
      });
  
      // clicking map moves marker
      map.addListener('click', e => {
        marker.setPosition(e.latLng);
        latInput.value = e.latLng.lat().toFixed(6);
        lngInput.value = e.latLng.lng().toFixed(6);
      });
    }
  
    // For rescue-nearby: simple marker set for each case
    function initMapSimple({ lat, lng, markers=[] } = {}) {
      const mapEl = document.getElementById('map');
      if (!mapEl || !window.google) return;
      const center = { lat: Number(lat) || 20.5937, lng: Number(lng) || 78.9629 };
      const map = new google.maps.Map(mapEl, { center, zoom: 12 });
  
      // user position marker
      new google.maps.Marker({ position: center, map, title: 'You', label: 'You' });
  
      markers.forEach(m => {
        if (!m.latitude || !m.longitude) return;
        const pos = { lat: Number(m.latitude), lng: Number(m.longitude) };
        const marker = new google.maps.Marker({ position: pos, map, title: m.title || 'Rescue case' });
        const infow = new google.maps.InfoWindow({
          content: `<div style="max-width:220px"><strong>${escapeHtml(m.title)}</strong><p>${escapeHtml(m.description || '')}</p><p>Status: ${escapeHtml(m.status)}</p></div>`
        });
        marker.addListener('click', () => infow.open(map, marker));
      });
    }
  
    // small escape for content
    function escapeHtml(s='') {
      return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }
  
    // auto init create-rescue map if that page is loaded
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('map') && document.getElementById('rescueForm')) {
        // Wait briefly for the Maps API to be ready
        const tryInit = setInterval(() => {
          if (window.google && google.maps) {
            clearInterval(tryInit);
            initCreateRescueMap();
          }
        }, 200);
        // time out after 6s
        setTimeout(()=>clearInterval(tryInit), 6000);
      }
    });
  
    // expose function
    global.initMapSimple = initMapSimple;
  })(window);
  