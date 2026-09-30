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

	return <LocationsMap homeLocations={homeLocations} />;
}
