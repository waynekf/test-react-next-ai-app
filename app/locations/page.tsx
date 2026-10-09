import LocationsMap from "./locations-map";

interface HomeLocation {
	id: string;
	latitude: number;
	longitude: number;
}

function parseHomeLocations(value: string | undefined): HomeLocation[] {
	if (!value) {
		return [];
	}

	try {
		const parsed = JSON.parse(value);

		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter((location): location is HomeLocation => {
			if (typeof location !== "object" || location === null) {
				return false;
			}

			const candidate = location as Record<string, unknown>;

			return (
				typeof candidate.id === "string" &&
				typeof candidate.latitude === "number" &&
				typeof candidate.longitude === "number"
			);
		});
	} catch {
		return [];
	}
}

export default function LocationsPage() {
	const homeLocations = parseHomeLocations(process.env.HOME_LOCATIONS);

	return (
		<div className="flex flex-col h-screen bg-neutral-50 dark:bg-neutral-900">
			{/* Header Panel - 10% height */}
			<header className="h-[10%] border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 flex items-center px-6 shadow-sm">
				<div className="flex items-center gap-3">
					<div
						className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
						style={{ backgroundColor: "var(--color-skipton-primary)" }}
					>
						P
					</div>
					<h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
						UK Parkruns
					</h1>
				</div>
			</header>

			{/* Main Content - 90% height with flex layout */}
			<div className="flex flex-1 overflow-hidden">
				{/* Map Section - 75% width */}
				<div className="flex-1 w-3/4">
					<LocationsMap homeLocations={homeLocations} />
				</div>

				{/* Sidebar - 25% width */}
				<aside className="w-1/4 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 overflow-y-auto">
					<div className="p-4 space-y-6">
						{/* Statistics Section */}
						<section>
							<h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 uppercase tracking-wide">
								Statistics
							</h2>
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-neutral-600 dark:text-neutral-400">
										Total Locations
									</span>
									<span className="font-semibold text-neutral-900 dark:text-neutral-50">
										—
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-neutral-600 dark:text-neutral-400">
										Completed
									</span>
									<span className="font-semibold text-neutral-900 dark:text-neutral-50">
										—
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-neutral-600 dark:text-neutral-400">
										Progress
									</span>
									<span className="font-semibold text-neutral-900 dark:text-neutral-50">
										—
									</span>
								</div>
							</div>
						</section>

						{/* Filters Section */}
						<section>
							<h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 uppercase tracking-wide">
								Filters
							</h2>
							<div className="space-y-3">
								<div>
									<label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
										Status
									</label>
									<select className="w-full px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-50 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50">
										<option>All</option>
										<option>Completed</option>
										<option>Not Completed</option>
									</select>
								</div>
								<div>
									<label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
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

						{/* Legend Section */}
						<section>
							<h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 uppercase tracking-wide">
								Legend
							</h2>
							<div className="space-y-2 text-sm">
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded-full"
										style={{
											backgroundColor: "var(--color-skipton-secondary)",
										}}
									></div>
									<span className="text-neutral-600 dark:text-neutral-400">
										Parkrun (not completed)
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 rounded-full bg-yellow-400"></div>
									<span className="text-neutral-600 dark:text-neutral-400">
										Parkrun (completed)
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div
										className="w-4 h-4 rounded-full"
										style={{ backgroundColor: "var(--color-parkrun-orange)" }}
									></div>
									<span className="text-neutral-600 dark:text-neutral-400">
										Home Location
									</span>
								</div>
							</div>
						</section>

						{/* Map Controls Section */}
						<section>
							<h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-50 mb-3 uppercase tracking-wide">
								Controls
							</h2>
							<div className="space-y-2">
								<button className="w-full px-3 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition">
									Reset View
								</button>
								<button className="w-full px-3 py-2 text-sm font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 rounded hover:bg-neutral-200 dark:hover:bg-neutral-600 transition">
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
