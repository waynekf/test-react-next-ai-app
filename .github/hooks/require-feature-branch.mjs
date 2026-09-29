import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const EDIT_TOOL_NAMES = new Set([
	"apply_patch",
	"create_directory",
	"create_file",
	"create_new_jupyter_notebook",
	"edit_notebook_file",
	"vscode_renameSymbol",
]);

function readHookInput() {
	const input = fs.readFileSync(0, "utf8").trim();

	if (!input) {
		return null;
	}

	try {
		return JSON.parse(input);
	} catch {
		return null;
	}
}

function extractToolName(value) {
	if (!value || typeof value !== "object") {
		return null;
	}

	const directCandidates = [
		value.toolName,
		value.tool_name,
		value?.tool?.name,
		value?.toolUse?.name,
		value?.toolInvocation?.name,
		value?.eventData?.toolName,
		value?.eventData?.tool_name,
		value?.eventData?.tool?.name,
	];

	for (const candidate of directCandidates) {
		if (typeof candidate === "string" && candidate.length > 0) {
			return candidate;
		}
	}

	const queue = [value];

	while (queue.length > 0) {
		const current = queue.shift();

		if (!current || typeof current !== "object") {
			continue;
		}

		for (const [key, nestedValue] of Object.entries(current)) {
			if (
				/^tool(?:Name|_name)?$/i.test(key) &&
				typeof nestedValue === "string" &&
				nestedValue.length > 0
			) {
				return nestedValue;
			}

			if (nestedValue && typeof nestedValue === "object") {
				queue.push(nestedValue);
			}
		}
	}

	return null;
}

function normalizeToolName(toolName) {
	return (
		toolName
			.split(/[.:/\\]/)
			.filter(Boolean)
			.at(-1) ?? toolName
	);
}

function getRepoRoot() {
	const scriptDir = path.dirname(fileURLToPath(import.meta.url));
	return path.resolve(scriptDir, "..", "..");
}

function getCurrentBranch(repoRoot) {
	try {
		return execFileSync("git", ["-C", repoRoot, "branch", "--show-current"], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
	} catch {
		return null;
	}
}

function printDecision(decision, reason) {
	process.stdout.write(
		JSON.stringify(
			{
				continue: decision === "allow",
				stopReason: reason,
				systemMessage: reason,
				hookSpecificOutput: {
					hookEventName: "PreToolUse",
					permissionDecision: decision,
					permissionDecisionReason: reason,
				},
			},
			null,
			2,
		),
	);
}

const payload = readHookInput();

if (!payload) {
	process.exit(0);
}

const toolName = extractToolName(payload);

if (!toolName) {
	process.exit(0);
}

const normalizedToolName = normalizeToolName(toolName);

if (!EDIT_TOOL_NAMES.has(normalizedToolName)) {
	process.exit(0);
}

const branch = getCurrentBranch(getRepoRoot());

if (branch !== "main" && branch !== "master") {
	process.exit(0);
}

const reason = `Blocked ${normalizedToolName} on '${branch}'. Create or switch to a dedicated feature branch before making code changes.`;

printDecision("deny", reason);
process.exit(2);
