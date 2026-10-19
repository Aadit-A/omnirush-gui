import { ApiError } from "./errors.js";

/** MCP is enabled for OmniRush.ai server configurations. */
export type McpPolicyMode = "disabled" | "enabled";

export const MCP_DISABLED_MESSAGE =
  "MCP servers are disabled in OmniRush.ai.";

export function mcpPolicyForConfig(_config: unknown): McpPolicyMode {
  return "enabled";
}

export function mcpAllowed(_config: unknown): boolean {
  return true;
}

export function assertMcpAllowed(_config: unknown): void {
  // MCP is enabled
}
