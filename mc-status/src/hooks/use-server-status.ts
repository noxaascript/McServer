import { useQuery } from "@tanstack/react-query";

interface McSrvStatPlayer {
  name: string;
  uuid: string;
}

export interface McSrvStatResponse {
  online: boolean;
  ip: string;
  port: number;
  hostname?: string;
  version?: string;
  protocol?: number;
  players?: {
    online: number;
    max: number;
    list?: McSrvStatPlayer[];
  };
  motd?: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  icon?: string;
}

async function fetchStatus(ip: string, edition: "java" | "bedrock"): Promise<McSrvStatResponse> {
  if (!ip) throw new Error("IP is required");
  const baseUrl = "https://api.mcsrvstat.us";
  const path = edition === "bedrock" ? "/bedrock/3/" : "/3/";
  const response = await fetch(`${baseUrl}${path}${ip}`);
  if (!response.ok) {
    throw new Error("Failed to fetch server status");
  }
  return response.json();
}

export function useServerStatus(ip: string, edition: "java" | "bedrock", enabled: boolean = true) {
  return useQuery({
    queryKey: ["server-status", ip, edition],
    queryFn: () => fetchStatus(ip, edition),
    enabled: enabled && !!ip,
    refetchInterval: 30000, // 30 seconds
    staleTime: 10000,
  });
}
