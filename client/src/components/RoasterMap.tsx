import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';
import type { Outlet } from '../types';

// Helper function to center map around user location once entered
function MapCenter({ location }: { location: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.setView(location, 14);
        }
    }, [location]);
    return null;
}

// Page
export default function RoasterMap() {

    // Postal code radius search
    // Search vicinity by postal code
    const [postalCode, setPostalCode] = useState('');
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [radius, setRadius] = useState(2);
    const [error, setError] = useState('');
    const [outlets, setOutlets] = useState<Outlet[]>([]);

    // Fetch outlet data from db
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/outlets`)
            .then(res => res.json())
            .then(data => setOutlets(data));
    }, []);

    async function geoPostalCode(postal: string) {
        setError('');
        if (!/^\d{6}/.test(postal)) {
            setError('Please enter a valid 6-digit postal code.');
            return;
        }
        const res = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postal}&returnGeom=Y&getAddrDetails=Y`);
        const data = await res.json();
        const result = data.results?.[0];
        if (result) {
            setUserLocation([parseFloat(result.LATITUDE), parseFloat(result.LONGITUDE)]);
        } else {
            setError('Invalid postal code. Please enter a valid postal code.')
        }
    }

    function getDistanceKm(lat1: number, long1: number, lat2: number, long2: number) {
        const R = 6371; // Earth radius
        const dLat = (lat2 - lat1) * Math.PI / 180; // Degree to radian conversion
        const dLong = (long2 - long1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLong / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const visibleRoasters = userLocation
        ? outlets.filter(r => getDistanceKm(userLocation[0], userLocation[1], r.lat, r.long) <= radius)
        : outlets;

    const uniqueRoasters = outlets.filter((outlet, index, self) => index === self.findIndex(o => o.name === outlet.name));

    return (
        <div className='roaster_page'>
            <div className='area_search' style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div className='postal_code_input' style={{ display: 'flex', alignItems: 'center', border: '1px solid #e3ded6', borderRadius: '12px', background: '#fff', padding: '0 12px', gap: '8px', width: 'fit-content' }}>
                    <input type='number' value={postalCode} onChange={e => setPostalCode(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') geoPostalCode(postalCode); }} placeholder="Enter postal code" style={{ border: 'none', outline: 'none', fontSize: '14px', padding: '10px 0', background: 'transparent', width: '160px' }} />
                    <button onClick={() => geoPostalCode(postalCode)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '36px', padding: '0', color: '#4a2418' }}> ⌕</button>
                </div>
                <button className='geolocation_request' style={{ display: 'flex', alignItems: 'center', border: '1px solid #7a594b', borderRadius: '6px', background: '#7a594b', color: '#fff', padding: '0 6px', width: 'fit-content' }}
                    onClick={() => {
                        navigator.geolocation.getCurrentPosition(pos => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                            () => setError('Unable to get location. Please enter a postal code instead.')
                        )
                    }}>Use my location
                </button>
            </div>
            {error && <p style={{ color: '#c0329b', fontSize: '13px', marginTop: '6px' }}>{error}</p>}
            {userLocation && (
                <div className='radius_selector' style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    <input type="range" min={1} max={50} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '200px', cursor: 'pointer', background: '#fff' }} />
                    <input type="number" min={1} max={50} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '60px', border: '1px solid #e3ded6', borderRadius: '6px', background: '#fff', padding: '4px 8px', fontSize: '14px' }} />
                    <span style={{ fontSize: '13px', color: '#6f6962' }}>km</span>
                </div>
            )}
            <div className='map_component'>
                <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: '400px', width: '100%', border: '6px solid #fff', borderRadius: '20px', marginTop: '6px' }}>
                    <MapCenter location={userLocation} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors" />
                    {
                        visibleRoasters.map(roaster => {
                            const icon = L.divIcon({
                                className: 'roaster_icon',
                                html: `<div style="width:12px; height:12px; border-radius:50%; background:${roaster.colour}; border:2px solid #fff; box-shadow:0 1px 4px rgba(0, 0, 0, 0.3)"></div>`,
                                iconSize: [12, 12],
                                iconAnchor: [6, 6],
                                popupAnchor: [0, 10],
                            });
                            return (
                                <Marker key={roaster.name + ' | ' + roaster.branch} position={[roaster.lat, roaster.long]} icon={icon}>
                                    <Popup>
                                        <strong>{roaster.name}</strong>
                                        <br />
                                        <span style={{ fontSize: '11px', color: '#6F6962' }}><strong>{roaster.branch}</strong></span>
                                        <br />
                                        <span style={{ fontSize: '9px', fontStyle: 'italic', color: '#6F6962' }}>{roaster.address}</span>
                                    </Popup>
                                </Marker>
                            );
                        })
                    }
                    {
                        userLocation && (
                            <>
                                <Marker position={userLocation} icon={L.divIcon({
                                    className: 'user_pin',
                                    html: `<div style="font-size:20px; line-height:1">📍</div>`,
                                    iconSize: [20, 20],
                                    iconAnchor: [10, 10],
                                })}>
                                    <Popup>You are here</Popup>
                                </Marker>
                                <Circle center={userLocation} radius={radius * 1000} pathOptions={{ color: '#c56a49', fillColor: '#c56a49', fillOpacity: 0.1, weight: 1.5 }} />
                            </>
                        )
                    }
                </MapContainer>
                <div className='map_legend' style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginTop: '8px' }}>
                    {
                        uniqueRoasters.map(roaster => (
                            <div key={roaster.name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#2b2926' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: roaster.colour, border: '1px solid #fff', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', flexShrink: 0 }} />
                                {roaster.name}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
