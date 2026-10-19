type ConfigTarget = {
  mcp?: unknown;
  mcpServers?: unknown;
  permission?: unknown;
  permissions?: unknown;
  tools?: unknown;
};

type ToolBeforeInput = {
  tool?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function configTarget(input: unknown, output: unknown): ConfigTarget | null {
  if (isRecord(output)) return output;
  return isRecord(input) ? input : null;
}

function normalizeMcpEntry(raw: unknown): Record<string, unknown> | null {
  if (!isRecord(raw)) return null;
  const entry: Record<string, unknown> = { ...raw };
  if (typeof entry.command === "string" && entry.command.trim().length > 0) {
    const args = Array.isArray(entry.args)
      ? entry.args.filter((a): a is string => typeof a === "string")
      : [];
    entry.command = [entry.command.trim(), ...args];
  }
  if (isRecord(entry.env) && !entry.environment) {
    entry.environment = entry.env;
  }
  if (!entry.type) {
    if (entry.url) {
      entry.type = "remote";
    } else if (entry.command) {
      entry.type = "local";
    }
  } else if (entry.type === "stdio") {
    entry.type = "local";
  }
  if (entry.enabled === undefined && entry.disabled === undefined) {
    entry.enabled = true;
  } else if (typeof entry.disabled === "boolean") {
    entry.enabled = !entry.disabled;
  }
  return entry;
}

/**
 * Engine-side MCP adapter. Normalizes mcp and mcpServers config discovery
 * and ensures MCP tools are permitted in the OpenCode agent loop.
 */
export default async function omnirushMcpPolicy() {
  const applyConfig = (input: unknown, output?: unknown): void => {
    const target = configTarget(input, output);
    if (!target) return;

    const mcpMap: Record<string, unknown> = isRecord(target.mcp) ? { ...target.mcp } : {};

    if (isRecord(target.mcpServers)) {
      for (const [name, serverConfig] of Object.entries(target.mcpServers)) {
        const normalized = normalizeMcpEntry(serverConfig);
        if (normalized) {
          mcpMap[name] = normalized;
        }
      }
    }

    for (const [name, serverConfig] of Object.entries(mcpMap)) {
      const normalized = normalizeMcpEntry(serverConfig);
      if (normalized) {
        mcpMap[name] = normalized;
      }
    }

    target.mcp = mcpMap;

    const permissions = isRecord(target.permission) ? target.permission : {};
    target.permission = {
      ...permissions,
      "mcp.*": "allow",
      "mcp:*": "allow",
      "mcp_*": "allow",
    };
  };

  return {
    config: async (input: unknown, output?: unknown) => {
      applyConfig(input, output);
    },
    "tool.execute.before": async (_input: ToolBeforeInput) => {
      // MCP tools are permitted
    },
  };
}
