interface Parkrun {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	locationLabel: string;
	slug: string;
}

interface OverviewCompletionSummaryProps {
	parkruns: Parkrun[];
	completedParkruns: Set<string>;
	loading: boolean;
	error: string | null;
}

export default function OverviewCompletionSummary({
	parkruns,
	completedParkruns,
	loading,
	error,
}: OverviewCompletionSummaryProps) {
	if (loading) {
		return (
			<div className="mb-3">
				<p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
					Completed parkruns
				</p>
				<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
					Loading...
				</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="mb-3">
				<p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
					Completed parkruns
				</p>
				<p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
					Unavailable
				</p>
			</div>
		);
	}

	const actualParkrunNames = new Set(parkruns.map((parkrun) => parkrun.name));
	const completedActualParkruns = Array.from(completedParkruns).filter((name) =>
		actualParkrunNames.has(name),
	).length;
	const totalActualParkruns = parkruns.length;
	const completionPercentage =
		totalActualParkruns === 0
			? 0
			: Math.floor((completedActualParkruns / totalActualParkruns) * 100);

	return (
		<div className="mb-3">
			<p className="text-xs uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
				Completed parkruns
			</p>
			<p className="mt-1 text-base font-bold text-neutral-900 dark:text-neutral-50">
				{completedActualParkruns}/{totalActualParkruns} ({completionPercentage}
				%)
			</p>
		</div>
	);
}
