import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useState, useEffect } from 'react';

// Roasters & their outlets
const ROASTERS = [
    // HOMEGROUND
    { name: 'Homeground Coffee Roasters', branch: 'Bukit Timah', lat: 1.3332, long: 103.7890, address: '911 Bukit Timah Rd' },

    // NYLON
    { name: 'Nylon Coffee', branch: 'Everton Park', lat: 1.2769, long: 103.8400, address: '4 Everton Park #01-40' },

    // TIONG HOE
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Queenstown', lat: 1.2910, long: 103.8031, address: '170 Stirling Rd #01-1133' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Balmoral Plaza', lat: 1.3167, long: 103.8353, address: '271 Bukit Timah Rd #01-08' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Parkway Parade', lat: 1.3011, long: 103.9053, address: '80 Marine Parade Rd #03-28' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'One North', lat: 1.2999, long: 103.7880, address: '1 Fusionopolis Pl #01-28/29' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'SingPost Centre', lat: 1.3189, long: 103.8940, address: '10 Eunos Rd 8 #01-117' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Raffles Place', lat: 1.2842, long: 103.8511, address: '1 Raffles Pl B1-34' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'SBF Centre', lat: 1.2783, long: 103.8479, address: '160 Robinson Rd #01-03' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Tanjong Pagar', lat: 1.2769, long: 103.8454, address: '7 Wallich St B1-09 Guoco Tower' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'VivoCity', lat: 1.2648, long: 103.8229, address: '1 Harbourfront Walk #B2-23' },
    { name: 'Tiong Hoe Specialty Coffee', branch: 'Woodleigh Mall', lat: 1.3390, long: 103.8716, address: '11 Bidadari Park Dr #B1-32/33' },

    // ALCHEMIST
    { name: 'Alchemist Coffee', branch: 'International Plaza', lat: 1.2764, long: 103.8458, address: '10 Anson Rd #01-34' },
    { name: 'Alchemist Coffee', branch: 'The Mill', lat: 1.2853, long: 103.8097, address: '5 Jln Kilang #02-02' },
    { name: 'Alchemist Coffee', branch: 'The Heeren', lat: 1.3023, long: 103.8376, address: '260 Orchard Rd #01-ORA' },
    { name: 'Alchemist Coffee', branch: 'Plaza Singapura', lat: 1.3003, long: 103.8455, address: '68 Orchard Rd #01-50' },
    { name: 'Alchemist Coffee', branch: '71 Robinson', lat: 1.2785, long: 103.8489, address: '71 Robinson Rd #01-01' },
    { name: 'Alchemist Coffee', branch: 'Asia Square', lat: 1.2795, long: 103.8511, address: '8 Marina Vw #01-07' },
    { name: 'Alchemist Coffee', branch: 'Ocean Financial Centre', lat: 1.2834, long: 103.8518, address: '10 Collyer Quay #01-K1' },
    { name: 'Alchemist Coffee', branch: 'Arab Street', lat: 1.3018, long: 103.8586, address: '119 Arab St' },
    { name: 'Alchemist Coffee', branch: 'Funan', lat: 1.2916, long: 103.8506, address: '107 N Bridge Rd #01-01' },

    // COMMUNITY
    { name: 'The Community Coffee', branch: 'Hamilton', lat: 1.3116, long: 103.8614, address: '38 Hamilton Rd' },
    { name: 'The Community Coffee', branch: 'Far East Plaza', lat: 1.3073, long: 103.8337, address: '14 Scotts Rd #02-94' },
    { name: 'The Community Coffee', branch: 'Odeon', lat: 1.2959, long: 103.8535, address: '333 N Bridge Rd #01-12' },
]

// Colour-coding of roasters according to respective brand colours
const ROASTER_COLOURS: Record<string, string> = {
    'Homeground Coffee Roasters': '#5d6e5c',
    'Nylon Coffee': '#6ad1be',
    'Tiong Hoe Specialty Coffee': '#43643b',
    'Alchemist Coffee': '#07446e',
    'The Community Coffee': '#e43c90'
};

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
    async function geoPostalCode(postal: string) {
        const res = await fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${postal}&returnGeom=Y&getAddrDetails=Y`);
        const data = await res.json();
        const result = data.results?.[0];
        if (result) {
            setUserLocation([parseFloat(result.LATITUDE), parseFloat(result.LONGITUDE)]);
        }
    }

    return (
        <div className='roaster_page'>
            <div className='area_search'>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e3ded6', borderRadius: '12px', background: '#fff', padding: '0 12px 6px 12px', gap: '8px', width: 'fit-content' }}>
                    <input type='number' value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Enter postal code" style={{ border: 'none', outline: 'none', fontSize: '14px', padding: '10px 0', background: 'transparent', width: '160px' }} />
                    <button onClick={() => geoPostalCode(postalCode)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '36px', padding: '0', color: '#4a2418' }}> ⌕</button>
                </div>
            </div>
            <div className='map_component'>
                <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: '400px', width: '100%', border: '6px solid #fff', borderRadius: '20px' }}>
                    <MapCenter location={userLocation} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors" />
                    {
                        ROASTERS.map(roaster => {
                            const icon = L.divIcon({
                                className: 'roaster_icon',
                                html: `<div style="width:12px; height:12px; border-radius:50%; background:${ROASTER_COLOURS[roaster.name]}; border:2px solid #fff; box-shadow:0 1px 4px rgba(0, 0, 0, 0.3)"></div>`,
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
                            <Marker position={userLocation} icon={L.divIcon({
                                className: 'user_pin',
                                html: `<div style="font-size:20px; line-height:1">📍</div>`,
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                            })}>
                                <Popup>You are here</Popup>
                            </Marker>
                        )
                    }
                </MapContainer>
                <div className='map_legend' style={{ display: 'flex', flexWrap: 'wrap', gap: '25px', marginTop: '8px' }}>
                    {
                        Object.entries(ROASTER_COLOURS).map(([name, colour]) => (
                            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#2b2926' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colour, border: '1px solid #fff', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)', flexShrink: 0 }} />
                                {name}
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    );
}
