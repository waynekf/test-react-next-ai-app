#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");

const athleteId = "68203";
const url = `https://www.parkrun.org.uk/parkrunner/${athleteId}/`;

function fetchUrl(urlString, retries = 3) {
	return new Promise((resolve, reject) => {
		const attempt = (attemptsLeft) => {
			const request = https.get(
				urlString,
				{
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
						Accept:
							"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
						Connection: "keep-alive",
					},
					timeout: 30000,
				},
				(res) => {
					let data = "";
					res.on("data", (chunk) => {
						data += chunk;
					});
					res.on("end", () => resolve(data));
				},
			);

			request.on("error", (error) => {
				if (attemptsLeft > 0) {
					console.log(`Retry attempt ${4 - attemptsLeft}...`);
					setTimeout(() => attempt(attemptsLeft - 1), 2000);
				} else {
					reject(error);
				}
			});

			request.on("timeout", () => {
				request.destroy();
				if (attemptsLeft > 0) {
					console.log(`Timeout, retrying...`);
					setTimeout(() => attempt(attemptsLeft - 1), 2000);
				} else {
					reject(new Error("Request timeout"));
				}
			});
		};

		attempt(retries);
	});
}

(async () => {
	try {
		console.log(`Fetching athlete page: ${url}`);
		const html = await fetchUrl(url);

		console.log(`Received HTML (${html.length} bytes)`);

		// Extract all event links - they point to location pages
		// Pattern: <a href="/locationname/">Event Name</a>
		const eventLinkRegex =
			/<a\s+href=["']\/([a-z0-9\-]+)\/["'][^>]*>([^<]*?parkrun[^<]*?)<\/a>/gi;

		const parkruns = new Map(); // Use map to avoid duplicates
		let match;

		while ((match = eventLinkRegex.exec(html)) !== null) {
			const [, location, eventText] = match;
			const cleanText = eventText
				.replace(/<[^>]*>/g, "")
				.replace(/&nbsp;/g, " ")
				.replace(/&amp;/g, "&")
				.replace(/&lt;/g, "<")
				.replace(/&gt;/g, ">")
				.replace(/&#039;/g, "'")
				.replace(/&apos;/g, "'")
				.trim()
				.replace(/\s+/g, " ");

			if (cleanText && !parkruns.has(cleanText)) {
				parkruns.set(cleanText, true);
			}
		}

		// Also search for text that looks like parkrun names in the HTML
		// Look for patterns like "Something parkrun" within table data
		const tableDataRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
		const cellMatches = html.matchAll(tableDataRegex);

		for (const cellMatch of cellMatches) {
			const cellHtml = cellMatch[1];

			// Skip if it's a table header or contains numbers only
			if (/<th/i.test(cellHtml) || /^\s*\d+\s*$/.test(cellHtml)) {
				continue;
			}

			// Try to extract text with "parkrun" in it
			const textMatch = cellHtml.match(/([^<>]{0,100}parkrun[^<>]{0,100})/i);
			if (textMatch) {
				let name = textMatch[1]
					.replace(/<[^>]*>/g, "")
					.replace(/&nbsp;/g, " ")
					.replace(/&amp;/g, "&")
					.replace(/&#039;/g, "'")
					.trim()
					.replace(/\s+/g, " ");

				// Clean up to just the parkrun name
				name = name.split(/\s{2,}|,/)[0].trim();

				if (
					name &&
					name.toLowerCase().includes("parkrun") &&
					name.length > 3 &&
					name.length < 100
				) {
					if (!parkruns.has(name)) {
						parkruns.set(name, true);
					}
				}
			}
		}

		const parkrunArray = Array.from(parkruns.keys()).sort();

		console.log(`\nParsed ${parkrunArray.length} unique parkruns:`);
		console.log("\nFirst 10:");
		parkrunArray.slice(0, 10).forEach((p) => console.log(`  - ${p}`));

		if (parkrunArray.length > 20) {
			console.log("\n...");
			console.log("\nLast 10:");
			parkrunArray.slice(-10).forEach((p) => console.log(`  - ${p}`));
		}

		// Save to file
		const outputPath = path.join(
			__dirname,
			"..",
			"data",
			"completed-parkruns.json",
		);
		fs.writeFileSync(outputPath, JSON.stringify(parkrunArray, null, 2));
		console.log(`\nSaved ${parkrunArray.length} parkruns to ${outputPath}`);
	} catch (error) {
		console.error("Error:", error.message);
		process.exit(1);
	}
})();
