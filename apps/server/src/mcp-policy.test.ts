import { describe, expect, test } from "bun:test";
import { ApiError } from "./errors.js";
import {
  assertMcpAllowed,
  mcpAllowed,
  mcpPolicyForConfig,
} from "./mcp-policy.js";

describe("MCP execution policy", () => {
  test("allows MCP for server configurations", () => {
    expect(mcpPolicyForConfig({})).toBe("enabled");
    expect(mcpPolicyForConfig({ mcpPolicy: "enabled" })).toBe("enabled");
    expect(mcpAllowed({})).toBe(true);
    expect(mcpAllowed({ mcpPolicy: "enabled" })).toBe(true);
    expect(() => assertMcpAllowed({})).not.toThrow();
    expect(() => assertMcpAllowed({ mcpPolicy: "enabled" })).not.toThrow();
  });
});
