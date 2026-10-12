"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getDistanceFromNearestHome } from "./locations/location-distance";
import LocationsMap from "./locations/locations-map";
import OverviewCompletionSummary from "./overview-completion-summary";

const DEFAULT_MAP_VIEW = { longitude: -2, latitude: 54, zoom: 6 };

interface HomeLocation {
	id: string;
	latitude: number;
	longitude: number;
}

interface Parkrun {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	locationLabel: string;
	slug: string;
}

interface ViewState {
	longitude: number;
	latitude: number;
	zoom: number;
}

type StatusFilter = "all" | "completed" | "notCompleted";
type RailTab = "overview" | "list";

interface HomePageClientProps {
	homeLocations: HomeLocation[];
}

function formatDistance(distanceInKm: number | null) {
	if (distanceInKm === null) {
		return "—";
	}

	return `${distanceInKm.toFixed(1)} km`;
}

export default function HomePageClient({ homeLocations }: HomePageClientProps) {
	const [activeRailTab, setActiveRailTab] = useState<RailTab>("overview");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [mapViewState, setMapViewState] = useState<ViewState>(DEFAULT_MAP_VIEW);
	const [selectedParkrunId, setSelectedParkrunId] = useState<string | null>(
		null,
	);
	const [parkruns, setParkruns] = useState<Parkrun[]>([]);
	const [completedParkruns, setCompletedParkruns] = useState<Set<string>>(
		() => new Set(),
	);
	const [loadingParkruns, setLoadingParkruns] = useState(true);
	const [parkrunsError, setParkrunsError] = useState<string | null>(null);

	useEffect(() => {
		const fetchParkruns = async () => {
			try {
				setLoadingParkruns(true);
				setParkrunsError(null);

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
				setParkrunsError(
					err instanceof Error ? err.message : "Failed to fetch parkruns",
				);
			} finally {
				setLoadingParkruns(false);
			}
		};

		fetchParkruns();
	}, []);

	const visibleParkruns = useMemo(() => {
		return parkruns
			.map((parkrun) => {
				const isCompleted = completedParkruns.has(parkrun.name);
				const distanceFromHome = getDistanceFromNearestHome(homeLocations, {
					latitude: parkrun.latitude,
					longitude: parkrun.longitude,
				});

				return {
					...parkrun,
					isCompleted,
					distanceFromHome,
				};
			})
			.filter((parkrun) => {
				if (statusFilter === "completed") {
					return parkrun.isCompleted;
				}

				if (statusFilter === "notCompleted") {
					return !parkrun.isCompleted;
				}

				return true;
			})
			.sort((first, second) => {
				const firstDistance =
					first.distanceFromHome ?? Number.POSITIVE_INFINITY;
				const secondDistance =
					second.distanceFromHome ?? Number.POSITIVE_INFINITY;

				if (firstDistance !== secondDistance) {
					return firstDistance - secondDistance;
				}

				const nameComparison = first.name.localeCompare(second.name);

				if (nameComparison !== 0) {
					return nameComparison;
				}

				return first.id.localeCompare(second.id);
			});
	}, [completedParkruns, homeLocations, parkruns, statusFilter]);

	const handleMapViewStateChange = useCallback((viewState: ViewState) => {
		setMapViewState(viewState);
	}, []);

	const handleParkrunSelect = useCallback((parkrun: Parkrun) => {
		setSelectedParkrunId(parkrun.id);
		setMapViewState({
			longitude: parkrun.longitude,
			latitude: parkrun.latitude,
			zoom: 10.5,
		});
	}, []);

	const handleResetView = useCallback(() => {
		setStatusFilter("all");
		setSelectedParkrunId(null);
		setMapViewState(DEFAULT_MAP_VIEW);
	}, []);

	return (
		<div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
			<header className="h-[10%] border-b border-neutral-200 bg-white px-6 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
				<div className="flex h-full items-center gap-3">
					<div
						className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
						style={{ backgroundColor: "var(--color-skipton-primary)" }}
					>
						P
					</div>
					<div>
						<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
							UK Parkruns
						</h1>
						<p className="text-sm text-neutral-600 dark:text-neutral-400">
							Track completed parkruns and home locations on one map.
						</p>
					</div>
				</div>
			</header>

			<div className="flex flex-1 overflow-hidden">
				<div className="flex-1 w-3/4">
					<LocationsMap
						parkruns={parkruns}
						completedParkruns={completedParkruns}
						loading={loadingParkruns}
						error={parkrunsError}
						homeLocations={homeLocations}
						statusFilter={statusFilter}
						viewState={mapViewState}
						onViewStateChange={handleMapViewStateChange}
						selectedParkrunId={selectedParkrunId}
						onParkrunSelect={handleParkrunSelect}
					/>
				</div>

				<aside className="w-1/4 overflow-y-auto border-l border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
					<div className="flex h-full flex-col">
						<div className="border-b border-neutral-200 p-3 dark:border-neutral-700">
							<div
								role="tablist"
								aria-label="Homepage rail tabs"
								className="grid grid-cols-2 rounded-full bg-neutral-100 p-1 dark:bg-neutral-700"
							>
								<button
									type="button"
									role="tab"
									aria-selected={activeRailTab === "overview"}
									onClick={() => setActiveRailTab("overview")}
									className={`rounded-full px-3 py-2 text-sm font-medium transition ${
										activeRailTab === "overview"
											? "bg-white text-(--color-skipton-primary) shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
									}`}
								>
									Overview & filters
								</button>
								<button
									type="button"
									role="tab"
									aria-selected={activeRailTab === "list"}
									onClick={() => setActiveRailTab("list")}
									className={`rounded-full px-3 py-2 text-sm font-medium transition ${
										activeRailTab === "list"
											? "bg-white text-(--color-skipton-primary) shadow-sm dark:bg-neutral-800 dark:text-neutral-50"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-50"
									}`}
								>
									List
								</button>
							</div>
						</div>

						<div className="flex-1 overflow-y-auto p-4">
							{activeRailTab === "overview" ? (
								<div className="space-y-6">
									<section>
										<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50">
											Overview
										</h2>
										<OverviewCompletionSummary
											parkruns={parkruns}
											completedParkruns={completedParkruns}
											loading={loadingParkruns}
											error={parkrunsError}
										/>
										<div className="space-y-2 text-sm">
											<div className="flex justify-between">
												<span className="text-neutral-600 dark:text-neutral-400">
													Home locations
												</span>
												<span className="font-semibold text-neutral-900 dark:text-neutral-50">
													{homeLocations.length}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-neutral-600 dark:text-neutral-400">
													Map source
												</span>
												<span className="font-semibold text-neutral-900 dark:text-neutral-50">
													API
												</span>
											</div>
										</div>
									</section>

									<section>
										<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50">
											Filters
										</h2>
										<div className="space-y-3">
											<div>
												<label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
													Status
												</label>
												<select
													value={statusFilter}
													onChange={(event) =>
														setStatusFilter(event.target.value as StatusFilter)
													}
													className="w-full rounded border border-neutral-300 bg-neutral-50 px-2 py-1 text-sm text-neutral-900 dark:border-neutral-600 dark:bg-neutral-700 dark:text-neutral-50"
												>
													<option value="all">All</option>
													<option value="completed">Completed</option>
													<option value="notCompleted">Not completed</option>
												</select>
											</div>
										</div>
									</section>

									<section>
										<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50">
											Legend
										</h2>
										<div className="space-y-2 text-sm">
											<div className="flex items-center gap-2">
												<div
													className="h-4 w-4 rounded-full"
													style={{
														backgroundColor: "var(--color-skipton-secondary)",
													}}
												/>
												<span className="text-neutral-600 dark:text-neutral-400">
													Parkrun (not completed)
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div className="h-4 w-4 rounded-full bg-yellow-400" />
												<span className="text-neutral-600 dark:text-neutral-400">
													Parkrun (completed)
												</span>
											</div>
											<div className="flex items-center gap-2">
												<div
													className="h-4 w-4 rounded-full"
													style={{
														backgroundColor: "var(--color-parkrun-orange)",
													}}
												/>
												<span className="text-neutral-600 dark:text-neutral-400">
													Home location
												</span>
											</div>
										</div>
									</section>

									<section>
										<h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-900 dark:text-neutral-50">
											Controls
										</h2>
										<div className="space-y-2">
											<button
												onClick={handleResetView}
												className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600"
											>
												Reset View
											</button>
											<button className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600">
												Export Data
											</button>
										</div>
									</section>
								</div>
							) : (
								<div className="space-y-3">
									<div>
										<p className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
											Parkruns list
										</p>
										<p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
											Sorted by nearest-home distance. Click a row to center the
											map.
										</p>
									</div>

									<div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
										<div className="grid grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] gap-3 border-b border-neutral-200 bg-neutral-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
											<span>Parkrun</span>
											<span>Status</span>
											<span className="text-right">Distance</span>
										</div>
										<div className="divide-y divide-neutral-100 dark:divide-neutral-800">
											{loadingParkruns ? (
												<div className="px-3 py-4 text-sm text-neutral-600 dark:text-neutral-400">
													Loading parkruns...
												</div>
											) : parkrunsError ? (
												<div className="px-3 py-4 text-sm text-neutral-600 dark:text-neutral-400">
													{parkrunsError}
												</div>
											) : visibleParkruns.length === 0 ? (
												<div className="px-3 py-4 text-sm text-neutral-600 dark:text-neutral-400">
													No parkruns match the current filter.
												</div>
											) : (
												visibleParkruns.map((parkrun) => {
													const isSelected = selectedParkrunId === parkrun.id;

													return (
														<button
															key={parkrun.id}
															type="button"
															onClick={() => handleParkrunSelect(parkrun)}
															aria-pressed={isSelected}
															className={`grid w-full grid-cols-[minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-neutral-50 focus-visible:bg-neutral-50 focus-visible:outline-none dark:hover:bg-neutral-800/70 dark:focus-visible:bg-neutral-800/70 ${
																isSelected
																	? "bg-[rgba(0,163,224,0.08)] ring-1 ring-inset ring-(--color-skipton-secondary) dark:bg-[rgba(0,163,224,0.16)]"
																	: ""
															}`}
														>
															<span className="truncate font-medium text-neutral-900 dark:text-neutral-50">
																{parkrun.name}
															</span>
															<span>
																<span
																	className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
																		parkrun.isCompleted
																			? "bg-yellow-100 text-yellow-900 dark:bg-yellow-400/20 dark:text-yellow-200"
																			: "bg-sky-100 text-sky-900 dark:bg-sky-500/20 dark:text-sky-200"
																	}`}
																>
																	{parkrun.isCompleted
																		? "Completed"
																		: "Not completed"}
																</span>
															</span>
															<span className="text-right font-medium text-neutral-900 dark:text-neutral-50">
																{formatDistance(parkrun.distanceFromHome)}
															</span>
														</button>
													);
												})
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
