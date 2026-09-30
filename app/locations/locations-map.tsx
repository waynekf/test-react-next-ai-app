"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useState } from "react";
import { Map, Marker, Popup } from "react-map-gl/mapbox";

interface Parkrun {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	locationLabel: string;
	slug: string;
}

interface HomeLocation {
	id: string;
	latitude: number;
	longitude: number;
}

type HoveredMarker =
	| { type: "parkrun"; id: string }
	| { type: "home"; id: string }
	| null;

interface LocationsMapProps {
	homeLocations: HomeLocation[];
}

export default function LocationsMap({ homeLocations }: LocationsMapProps) {
	const [parkruns, setParkruns] = useState<Parkrun[]>([]);
	const [completedParkruns, setCompletedParkruns] = useState<Set<string>>(
		() => new Set(),
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker>(null);

	const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

	useEffect(() => {
		const fetchParkruns = async () => {
			try {
				setLoading(true);
				const [parkrunsResponse, completedResponse] = await Promise.all([
					fetch("/api/parkruns"),
					fetch("/api/parkruns/completed"),
				]);

				if (!parkrunsResponse.ok) {
					throw new Error(`API error: ${parkrunsResponse.status}`);
				}

				if (!completedResponse.ok) {
					throw new Error(`API error: ${completedResponse.status}`);
				}

				const [parkrunData, completedData] = await Promise.all([
					parkrunsResponse.json() as Promise<Parkrun[]>,
					completedResponse.json() as Promise<string[]>,
				]);

				setParkruns(parkrunData);
				setCompletedParkruns(new Set(completedData));
			} catch (err) {
				setError(
					err instanceof Error ? err.message : "Failed to fetch parkruns",
				);
			} finally {
				setLoading(false);
			}
		};

		fetchParkruns();
	}, []);

	if (!mapboxToken) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">
						Configuration Error
					</h1>
					<p className="text-zinc-600 dark:text-zinc-400">
						Mapbox token is not configured. Please set{" "}
						<code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
							NEXT_PUBLIC_MAPBOX_TOKEN
						</code>{" "}
						in{" "}
						<code className="bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded">
							.env.local
						</code>
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
				<div className="text-center">
					<p className="text-lg text-zinc-600 dark:text-zinc-400">
						Loading parkruns...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
					<p className="text-zinc-600 dark:text-zinc-400">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-screen">
			<Map
				initialViewState={{
					longitude: -2,
					latitude: 54,
					zoom: 6,
				}}
				style={{ width: "100%", height: "100%" }}
				mapStyle="mapbox://styles/mapbox/streets-v12"
				mapboxAccessToken={mapboxToken}
			>
				{parkruns.map((parkrun) => {
					const isCompleted = completedParkruns.has(parkrun.name);
					const isHovered =
						hoveredMarker?.type === "parkrun" &&
						hoveredMarker.id === parkrun.id;

					return (
						<Marker
							key={parkrun.id}
							longitude={parkrun.longitude}
							latitude={parkrun.latitude}
							onClick={(e) => {
								e.originalEvent.stopPropagation();
								setHoveredMarker(
									isHovered ? null : { type: "parkrun", id: parkrun.id },
								);
							}}
						>
							<div
								className="cursor-pointer"
								onMouseEnter={() =>
									setHoveredMarker({ type: "parkrun", id: parkrun.id })
								}
								onMouseLeave={() => setHoveredMarker(null)}
							>
								<svg
									className={`w-8 h-8 drop-shadow-md ${isCompleted ? "text-yellow-400" : "text-blue-600"}`}
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>

							{isHovered && (
								<Popup
									longitude={parkrun.longitude}
									latitude={parkrun.latitude}
									anchor="bottom"
									onClose={() => setHoveredMarker(null)}
									closeButton={false}
								>
									<div className="p-2">
										<h3 className="font-semibold text-sm text-zinc-900">
											{parkrun.name}
										</h3>
										<p className="text-xs text-zinc-600">
											{parkrun.locationLabel}
										</p>
									</div>
								</Popup>
							)}
						</Marker>
					);
				})}

				{homeLocations.map((homeLocation) => {
					const isHovered =
						hoveredMarker?.type === "home" &&
						hoveredMarker.id === homeLocation.id;

					return (
						<Marker
							key={homeLocation.id}
							longitude={homeLocation.longitude}
							latitude={homeLocation.latitude}
							onClick={(e) => {
								e.originalEvent.stopPropagation();
								setHoveredMarker(
									isHovered ? null : { type: "home", id: homeLocation.id },
								);
							}}
						>
							<div
								className="cursor-pointer"
								onMouseEnter={() =>
									setHoveredMarker({ type: "home", id: homeLocation.id })
								}
								onMouseLeave={() => setHoveredMarker(null)}
							>
								<svg
									className="w-8 h-8 drop-shadow-md text-orange-500"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
										clipRule="evenodd"
									/>
								</svg>
							</div>

							{isHovered && (
								<Popup
									longitude={homeLocation.longitude}
									latitude={homeLocation.latitude}
									anchor="bottom"
									onClose={() => setHoveredMarker(null)}
									closeButton={false}
								>
									<div className="p-2">
										<h3 className="font-semibold text-sm text-zinc-900">
											Home
										</h3>
									</div>
								</Popup>
							)}
						</Marker>
					);
				})}
			</Map>

			<div className="absolute top-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 max-w-xs z-10">
				<h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
					UK Parkruns
				</h1>
				<p className="text-sm text-zinc-600 dark:text-zinc-400">
					{parkruns.length} locations found. Hover over pins to see details.
				</p>
			</div>
		</div>
	);
}
