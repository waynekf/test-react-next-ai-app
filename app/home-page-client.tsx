"use client";

import { useEffect, useState } from "react";

import LocationsMap from "./locations/locations-map";
import OverviewCompletionSummary from "./overview-completion-summary";

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

type StatusFilter = "all" | "completed" | "notCompleted";

interface HomePageClientProps {
	homeLocations: HomeLocation[];
}

export default function HomePageClient({ homeLocations }: HomePageClientProps) {
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
					/>
				</div>

				<aside className="w-1/4 overflow-y-auto border-l border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800">
					<div className="space-y-6 p-4">
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
										<option value="notCompleted">Not Completed</option>
									</select>
								</div>
								<div>
									<label className="mb-1 block text-xs font-medium text-neutral-600 dark:text-neutral-400">
										Distance (km)
									</label>
									<input
										type="range"
										min="0"
										max="100"
										defaultValue="100"
										className="w-full"
									/>
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
										style={{ backgroundColor: "var(--color-parkrun-orange)" }}
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
								<button className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600">
									Reset View
								</button>
								<button className="w-full rounded bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600">
									Export Data
								</button>
							</div>
						</section>
					</div>
				</aside>
			</div>
		</div>
	);
}
