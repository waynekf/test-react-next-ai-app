"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useMemo, useState } from "react";
import {
	Layer,
	Map,
	Marker,
	Popup,
	Source,
	ViewStateChangeEvent,
} from "react-map-gl/mapbox";

import {
	convertKmToMiles,
	getDistanceFromNearestHome,
	createCirclePolygonCoordinates,
	isWithinDistanceLimit,
} from "./location-distance";

const DEFAULT_MAP_VIEW = { longitude: -2, latitude: 54, zoom: 6 };

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

interface ViewState {
	longitude: number;
	latitude: number;
	zoom: number;
}

interface CircleFeatureCollection {
	type: "FeatureCollection";
	features: Array<{
		type: "Feature";
		properties: {
			id: string;
		};
		geometry: {
			type: "Polygon";
			coordinates: [number, number][][];
		};
	}>;
}

type HoveredMarker =
	| { type: "parkrun"; id: string }
	| { type: "home"; id: string }
	| null;

type StatusFilter = "all" | "completed" | "notCompleted";

interface LocationsMapProps {
	parkruns: Parkrun[];
	completedParkruns: Set<string>;
	loading: boolean;
	error: string | null;
	homeLocations: HomeLocation[];
	statusFilter: StatusFilter;
	maxDistanceMiles: number | null;
	viewState?: ViewState;
	onViewStateChange?: (viewState: ViewState) => void;
	selectedParkrunId: string | null;
	onParkrunSelect: (parkrun: Parkrun) => void;
}

export default function LocationsMap({
	parkruns,
	completedParkruns,
	loading,
	error,
	homeLocations,
	statusFilter,
	maxDistanceMiles,
	viewState: externalViewState,
	onViewStateChange,
	selectedParkrunId,
	onParkrunSelect,
}: LocationsMapProps) {
	const [hoveredMarker, setHoveredMarker] = useState<HoveredMarker>(null);
	const [internalViewState, setInternalViewState] =
		useState<ViewState>(DEFAULT_MAP_VIEW);

	const currentViewState = externalViewState ?? internalViewState;
	const distanceLimitCircleData =
		useMemo<CircleFeatureCollection | null>(() => {
			if (maxDistanceMiles === null) {
				return null;
			}

			return {
				type: "FeatureCollection",
				features: homeLocations.map((homeLocation) => ({
					type: "Feature",
					properties: {
						id: homeLocation.id,
					},
					geometry: {
						type: "Polygon",
						coordinates: [
							createCirclePolygonCoordinates(homeLocation, maxDistanceMiles),
						],
					},
				})),
			};
		}, [homeLocations, maxDistanceMiles]);

	const handleViewStateChange = useCallback(
		(event: ViewStateChangeEvent) => {
			const newViewState = {
				longitude: event.viewState.longitude,
				latitude: event.viewState.latitude,
				zoom: event.viewState.zoom,
			};

			if (!externalViewState) {
				setInternalViewState(newViewState);
			}

			onViewStateChange?.(newViewState);
		},
		[externalViewState, onViewStateChange],
	);

	const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

	if (!mapboxToken) {
		return (
			<div className="flex items-center justify-center w-full h-full bg-neutral-50 dark:bg-neutral-900">
				<div className="text-center">
					<h1
						className="text-2xl font-bold mb-2"
						style={{ color: "var(--color-parkrun-red)" }}
					>
						Configuration Error
					</h1>
					<p className="text-neutral-600 dark:text-neutral-400">
						Mapbox token is not configured. Please set{" "}
						<code className="bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded">
							NEXT_PUBLIC_MAPBOX_TOKEN
						</code>{" "}
						in{" "}
						<code className="bg-neutral-200 dark:bg-neutral-800 px-2 py-1 rounded">
							.env.local
						</code>
					</p>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center w-full h-full bg-neutral-50 dark:bg-neutral-900">
				<div className="text-center">
					<p className="text-lg text-neutral-600 dark:text-neutral-400">
						Loading parkruns...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center w-full h-full bg-neutral-50 dark:bg-neutral-900">
				<div className="text-center">
					<h1
						className="text-2xl font-bold mb-2"
						style={{ color: "var(--color-parkrun-red)" }}
					>
						Error
					</h1>
					<p className="text-neutral-600 dark:text-neutral-400">{error}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full">
			<Map
				{...currentViewState}
				onMove={handleViewStateChange}
				style={{ width: "100%", height: "100%" }}
				mapStyle="mapbox://styles/mapbox/streets-v12"
				mapboxAccessToken={mapboxToken}
			>
				{distanceLimitCircleData && (
					<Source
						id="home-distance-limits"
						type="geojson"
						data={distanceLimitCircleData}
					>
						<Layer
							id="home-distance-limit-fill"
							type="fill"
							paint={{
								"fill-color": "#00a3e0",
								"fill-opacity": 0.12,
							}}
						/>
						<Layer
							id="home-distance-limit-outline"
							type="line"
							paint={{
								"line-color": "#00a3e0",
								"line-width": 1.5,
								"line-opacity": 0.4,
							}}
						/>
					</Source>
				)}
				{parkruns
					.filter((parkrun) => {
						const isCompleted = completedParkruns.has(parkrun.name);
						const distanceFromHome = getDistanceFromNearestHome(homeLocations, {
							latitude: parkrun.latitude,
							longitude: parkrun.longitude,
						});

						if (statusFilter === "completed") {
							return (
								isCompleted &&
								isWithinDistanceLimit(distanceFromHome, maxDistanceMiles)
							);
						}

						if (statusFilter === "notCompleted") {
							return (
								!isCompleted &&
								isWithinDistanceLimit(distanceFromHome, maxDistanceMiles)
							);
						}

						return isWithinDistanceLimit(distanceFromHome, maxDistanceMiles);
					})
					.map((parkrun) => {
						const isCompleted = completedParkruns.has(parkrun.name);
						const isHovered =
							hoveredMarker?.type === "parkrun" &&
							hoveredMarker.id === parkrun.id;
						const isSelected = selectedParkrunId === parkrun.id;
						const distanceFromHome = getDistanceFromNearestHome(homeLocations, {
							latitude: parkrun.latitude,
							longitude: parkrun.longitude,
						});

						return (
							<Marker
								key={parkrun.id}
								longitude={parkrun.longitude}
								latitude={parkrun.latitude}
								onClick={(e) => {
									e.originalEvent.stopPropagation();
									onParkrunSelect(parkrun);
								}}
							>
								<div
									className={`relative cursor-pointer transition-transform ${isHovered || isSelected ? "scale-110" : ""}`}
									onMouseEnter={() =>
										setHoveredMarker({ type: "parkrun", id: parkrun.id })
									}
									onMouseLeave={() => setHoveredMarker(null)}
								>
									<svg
										className={`h-8 w-8 drop-shadow-md ${isSelected ? "text-(--color-skipton-primary)" : isCompleted ? "text-yellow-400" : "text-sky-600"}`}
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
											clipRule="evenodd"
										/>
									</svg>
									{isSelected && (
										<div className="absolute inset-0 rounded-full ring-2 ring-(--color-skipton-secondary) ring-offset-2 ring-offset-transparent" />
									)}
								</div>

								{(isHovered || isSelected) && (
									<Popup
										longitude={parkrun.longitude}
										latitude={parkrun.latitude}
										anchor="bottom"
										onClose={() => setHoveredMarker(null)}
										closeButton={false}
									>
										<div className="p-2">
											<h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
												{parkrun.name}
											</h3>
											<p className="text-xs text-neutral-600 dark:text-neutral-400">
												{parkrun.locationLabel}
											</p>
											{distanceFromHome !== null && (
												<p className="text-xs text-neutral-600 dark:text-neutral-400">
													{convertKmToMiles(distanceFromHome).toFixed(1)} mi
													from home
												</p>
											)}
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
									className="w-8 h-8 drop-shadow-md"
									fill="currentColor"
									style={{ color: "var(--color-parkrun-orange)" }}
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
										<h3 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
											Home
										</h3>
									</div>
								</Popup>
							)}
						</Marker>
					);
				})}
			</Map>
		</div>
	);
}
