import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { icon } from 'leaflet';

const ROASTERS = [
    { name: 'Homeground Coffee Roasters', lat: 1.3332, long: 103.7890, address: '911 Bukit Timah Rd' },
    { name: 'Nylon Coffee', lat: 1.2769, long: 103.8400, address: '4 Everton Park #01-40' },
    { name: 'Tiong Hoe Specialty Coffee', lat: 1.2910, long: 103.8031, address: '170 Stirling Rd #01-1133' },
    { name: 'Alchemist Coffee', lat: 1.3023, long: 103.8376, address: '260 Orchard Rd' },
]

const defaultIcon = icon({
    iconUrl: '/marker-icon.png',
    iconRetinaUrl: '/marker-icon-2x.png',
    shadowUrl: '/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
})

export default function RoasterMap() {
    return (
        <MapContainer center={[1.3521, 103.8198]} zoom={12} style={{ height: '400px', width: "100%" }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors" />
            {
                ROASTERS.map(roaster => (
                    <Marker key={roaster.name} position={[roaster.lat, roaster.long]} icon={defaultIcon}>
                        <Popup>{roaster.name}</Popup>
                    </Marker>
                ))
            }
        </MapContainer>
    );
}