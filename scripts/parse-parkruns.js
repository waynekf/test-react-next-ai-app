#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read HTML from stdin or first argument
const inputFile = process.argv[2];

if (!inputFile || !fs.existsSync(inputFile)) {
	console.error("Usage: node parse-parkruns.js <html-file>");
	process.exit(1);
}

const html = fs.readFileSync(inputFile, "utf-8");

console.log(`Parsing HTML file (${html.length} bytes)...`);

// Find the Event Summaries section
const eventSummariesStart = html.indexOf('id="event-summary"');
if (eventSummariesStart === -1) {
	console.error("Could not find Event Summaries section");
	process.exit(1);
}

console.log(`Found Event Summaries at position ${eventSummariesStart}`);

// Extract from Event Summaries to the end of the next closing </table>
const startSearchFrom = eventSummariesStart;
const firstTableStart = html.indexOf("<table", startSearchFrom);
const tableStart = firstTableStart;

let tableEnd = html.indexOf("</table>", tableStart);
if (tableEnd === -1) {
	console.error("Could not find closing </table> tag");
	process.exit(1);
}
tableEnd += "</table>".length;

const tableHtml = html.substring(tableStart, tableEnd);

console.log(`Extracted table (${tableHtml.length} bytes)`);

// Extract all table rows
const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
let match;
const parkruns = new Set();

while ((match = rowRegex.exec(tableHtml)) !== null) {
	const rowHtml = match[1];

	// Skip header rows
	if (/<th\b/i.test(rowHtml)) {
		continue;
	}

	// Find the first <a> tag in the row (contains the parkrun name)
	const linkMatch = rowHtml.match(/<a[^>]*href=[^>]*>([^<]+)<\/a>/i);
	if (linkMatch) {
		const parkrunName = linkMatch[1]
			.replace(/&nbsp;/g, " ")
			.replace(/&amp;/g, "&")
			.replace(/&lt;/g, "<")
			.replace(/&gt;/g, ">")
			.replace(/&#039;/g, "'")
			.replace(/&apos;/g, "'")
			.trim()
			.replace(/\s+/g, " ");

		// Validate it looks like a parkrun name
		if (
			parkrunName &&
			parkrunName.toLowerCase().includes("parkrun") &&
			parkrunName.length > 3 &&
			parkrunName.length < 200
		) {
			parkruns.add(parkrunName);
		}
	}
}

const parkrunArray = Array.from(parkruns).sort();

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
