import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import "./App.css";
import HeaderSection from "./Header";
import AddContact from "./AddContact";
import ContactList from "./ContactList";
import ContactDetail from "./ContactDetail";
import ConfirmDelete from "./ConfirmDelete";
import useContacts from "../hooks/useContacts";

function App() {
	const { contacts, addContactHandler, removeContactHandler } = useContacts();

	const [worldData, setWorldData] = useState({});
	const [countryData, setCountryData] = useState([]);
	const [chartData, setChartData] = useState({});

	const [mapCenter, setMapCenter] = useState([0, 0]);
	const [mapZoom, setMapZoom] = useState(2);

	useEffect(() => {
		async function fetchWorldData() {
			const response = await fetch("https://disease.sh/v3/covid-19/all");
			const data = await response.json();
			setWorldData(data);
		}

		async function fetchCountryData() {
			const response = await fetch("https://disease.sh/v3/covid-19/countries");
			const data = await response.json();
			setCountryData(data);
		}

		async function fetchChartData() {
			const response = await fetch(
				"https://disease.sh/v3/covid-19/historical/all?lastdays=all"
			);
			const data = await response.json();
			const chartData = {
				labels: Object.keys(data.cases),
				datasets: [
					{
						label: "Cases",
						data: Object.values(data.cases),
						fill: false,
						borderColor: "rgba(75,192,192,1)",
						tension: 0.1,
					},
					{
						label: "Recovered",
						data: Object.values(data.recovered),
						fill: false,
						borderColor: "rgba(54, 162, 235, 1)",
						tension: 0.1,
					},
					{
						label: "Deaths",
						data: Object.values(data.deaths),
						fill: false,
						borderColor: "rgba(255, 99, 132, 1)",
						tension: 0.1,
					},
				],
			};
			setChartData(chartData);
		}

		fetchWorldData();
		fetchCountryData();
		fetchChartData();
	}, []);

	return (
		<div className="ui container">
			<Router>
				<HeaderSection />
				<Switch>
					<Route
						path="/"
						exact
						render={(props) => (
							<>
								<Line data={chartData} />
								<MapContainer center={mapCenter} zoom={mapZoom}>
									<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
									{countryData.map((country) => (
										<Marker
											key={country.countryInfo._id}
											position={[
												country.countryInfo.lat,
												country.countryInfo.long,
											]}
										>
											<Popup>
												<div>
													<h3>{country.country}</h3>
													<p>Total Cases: {country.cases}</p>
													<p>Recovered: {country.recovered}</p>
													<p>Deaths: {country.deaths}</p>
												</div>
											</Popup>
										</Marker>
									))}
								</MapContainer>
							</>
						)}
					/>
					<Route path="/charts">
						<Line data={chartData} />
					</Route>

					<Route path="/maps">
						<MapContainer center={mapCenter} zoom={mapZoom}>
							{countryData.map((country) => (
								<Marker
									key={country.countryInfo._id}
									position={[country.countryInfo.lat, country.countryInfo.long]}
								>
									<Popup>
										<div>
											<h3>{country.country}</h3>
											<p>Total Cases: {country.cases}</p>
											<p>Recovered: {country.recovered}</p>
											<p>Deaths: {country.deaths}</p>
										</div>
									</Popup>
								</Marker>
							))}
						</MapContainer>
					</Route>
                </Switch>
			</Router>
		</div>
	)
}

export default App;

