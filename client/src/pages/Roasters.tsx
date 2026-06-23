import RoasterMap from "../components/RoasterMap";
import NavBar from "../components/NavBar";

export default function Roasters() {
    return (
        <div className="roaster_page">
            <NavBar />
            <div className="roasters-shell">
                <div className="page-heading">
                    <h1>Roasters</h1>
                    <p>Find specialty coffee near you</p>
                </div>
                <RoasterMap />
            </div>
        </div>
    )
}
