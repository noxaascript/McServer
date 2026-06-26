import { useState, useEffect } from "react";
import { useGetConfig, useUpdateConfig, getGetConfigQueryKey } from "@workspace/api-client-react";
import type { ServerConfigInput } from "@workspace/api-client-react/src/generated/api.schemas";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Save, Server, HardDrive, Globe, Network } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function Panel() {
  const { data: config, isLoading } = useGetConfig({ query: { queryKey: getGetConfigQueryKey() } });
  const updateConfig = useUpdateConfig();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ServerConfigInput>({});

  useEffect(() => {
    if (config) {
      setFormData({
        serverName: config.serverName,
        motd: config.motd,
        maxRamGb: config.maxRamGb,
        minRamGb: config.minRamGb,
        maxPlayers: config.maxPlayers,
        javaPort: config.javaPort,
        bedrockPort: config.bedrockPort,
        serverIp: config.serverIp,
        customDomain: config.customDomain,
      });
    }
  }, [config]);

  const handleChange = (field: keyof ServerConfigInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSliderChange = (field: "maxRamGb" | "minRamGb", value: number[]) => {
    const val = value[0];
    setFormData(prev => {
      const next = { ...prev, [field]: val };
      if (field === "maxRamGb" && next.minRamGb && next.minRamGb > val) {
        next.minRamGb = val;
      }
      if (field === "minRamGb" && next.maxRamGb && next.maxRamGb < val) {
        next.maxRamGb = val;
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate(
      { data: formData },
      {
        onSuccess: (updated) => {
          queryClient.setQueryData(getGetConfigQueryKey(), updated);
          toast({
            title: "Configuration Saved",
            description: "Server configuration has been updated successfully.",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to update configuration. Please try again.",
            variant: "destructive",
          });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden flex flex-col text-foreground pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background pointer-events-none" />
      
      <div className="relative z-10 container max-w-4xl mx-auto px-4 py-12 flex-1">
        <header className="mb-8 animate-in slide-in-from-top-8 fade-in duration-500">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Server className="w-8 h-8 text-primary" />
            Server Panel
          </h1>
          <p className="text-muted-foreground mt-2">Manage core server properties and allocations.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-700 delay-150 fill-mode-both">
          <Card className="border-border/40 bg-card/80 backdrop-blur-md">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                Identity & Access
              </CardTitle>
              <CardDescription>Public-facing server details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverName">Server Name</Label>
                  <Input 
                    id="serverName" 
                    value={formData.serverName || ""} 
                    onChange={e => handleChange("serverName", e.target.value)} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Input 
                    id="maxPlayers" 
                    type="number" 
                    min="1" 
                    max="500"
                    value={formData.maxPlayers || ""} 
                    onChange={e => handleChange("maxPlayers", Number(e.target.value))} 
                    className="bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motd">Message of the Day (MOTD)</Label>
                <Input 
                  id="motd" 
                  value={formData.motd || ""} 
                  onChange={e => handleChange("motd", e.target.value)} 
                  className="bg-background/50 font-mono"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serverIp">Server IP</Label>
                  <Input 
                    id="serverIp" 
                    value={formData.serverIp || ""} 
                    onChange={e => handleChange("serverIp", e.target.value)} 
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customDomain">Custom Domain</Label>
                  <Input 
                    id="customDomain" 
                    value={formData.customDomain || ""} 
                    onChange={e => handleChange("customDomain", e.target.value)} 
                    className="bg-background/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/80 backdrop-blur-md">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-muted-foreground" />
                Resource Allocation
              </CardTitle>
              <CardDescription>Memory and performance tuning</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Minimum RAM (GB)</Label>
                  <span className="text-sm font-mono text-muted-foreground">{formData.minRamGb || 1} GB</span>
                </div>
                <Slider 
                  value={[formData.minRamGb || 1]} 
                  min={1} 
                  max={12} 
                  step={1} 
                  onValueChange={v => handleSliderChange("minRamGb", v)}
                  className="py-4"
                />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Label>Maximum RAM (GB)</Label>
                  <span className="text-sm font-mono text-primary font-bold">{formData.maxRamGb || 1} GB</span>
                </div>
                <Slider 
                  value={[formData.maxRamGb || 1]} 
                  min={1} 
                  max={12} 
                  step={1} 
                  onValueChange={v => handleSliderChange("maxRamGb", v)}
                  className="py-4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/80 backdrop-blur-md">
            <CardHeader className="border-b border-border/20 pb-4">
              <CardTitle className="flex items-center gap-2">
                <Network className="w-5 h-5 text-muted-foreground" />
                Networking
              </CardTitle>
              <CardDescription>Port configuration for cross-play</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="javaPort">Java Port</Label>
                <Input 
                  id="javaPort" 
                  type="number" 
                  value={formData.javaPort || ""} 
                  onChange={e => handleChange("javaPort", Number(e.target.value))} 
                  className="bg-background/50 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bedrockPort">Bedrock Port (Geyser)</Label>
                <Input 
                  id="bedrockPort" 
                  type="number" 
                  value={formData.bedrockPort || ""} 
                  onChange={e => handleChange("bedrockPort", Number(e.target.value))} 
                  className="bg-background/50 font-mono"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={updateConfig.isPending} className="w-full sm:w-auto font-semibold">
              <Save className="w-4 h-4 mr-2" />
              {updateConfig.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
