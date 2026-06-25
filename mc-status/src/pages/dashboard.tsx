import { useState, useEffect } from "react";
import { Server, Activity, Users, Globe, RefreshCcw } from "lucide-react";
import { useServerStatus } from "@/hooks/use-server-status";
import { CopyableField } from "@/components/copyable-field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";

export function Dashboard() {
  const [ip, setIp] = useState(() => localStorage.getItem("mc-server-ip") || "play.hypixel.net");
  const [inputIp, setInputIp] = useState(ip);
  const queryClient = useQueryClient();

  const { data: javaStatus, isLoading: isJavaLoading, isFetching: isJavaFetching } = useServerStatus(ip, "java");
  const { data: bedrockStatus, isLoading: isBedrockLoading, isFetching: isBedrockFetching } = useServerStatus(ip, "bedrock");

  const [progress, setProgress] = useState(100);

  useEffect(() => {
    localStorage.setItem("mc-server-ip", ip);
  }, [ip]);

  useEffect(() => {
    // 30 seconds countdown timer
    let startTime = Date.now();
    let interval: NodeJS.Timeout;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 30000 - elapsed);
      setProgress((remaining / 30000) * 100);

      if (remaining === 0) {
        startTime = Date.now();
      }
    };

    interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [isJavaFetching, isBedrockFetching]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["server-status"] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputIp.trim()) {
      setIp(inputIp.trim());
    }
  };

  const renderStatusCard = (title: string, data: any, isLoading: boolean, defaultPort: number) => {
    if (isLoading) {
      return (
        <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3 border-b border-border/20">
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      );
    }

    const isOnline = data?.online;

    return (
      <Card className="relative overflow-hidden border-border/40 bg-card/80 backdrop-blur-md transition-all duration-300 hover:border-border/60">
        <div className={`absolute top-0 left-0 w-full h-1 ${isOnline ? 'bg-primary mc-glow' : 'bg-destructive mc-glow-red'}`} />
        <CardHeader className="pb-4 border-b border-border/20 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Server className="w-5 h-5 text-muted-foreground" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-full border border-border/50">
            <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-primary animate-pulse-slow' : 'bg-destructive'}`} />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {isOnline ? (
            <>
              {data.motd?.clean && (
                <div className="bg-background/40 border border-border/30 rounded-md p-4 font-mono text-sm text-center leading-relaxed">
                  {data.motd.clean.map((line: string, i: number) => (
                    <div key={i}>{line || '\u00A0'}</div>
                  ))}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Activity className="w-4 h-4" />
                    Version
                  </div>
                  <span className="font-mono text-sm truncate" title={data.version}>{data.version || 'Unknown'}</span>
                </div>
                <div className="flex flex-col gap-1 p-3 rounded-md bg-muted/20 border border-border/20">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4" />
                    Players
                  </div>
                  <span className="font-mono text-sm">
                    <span className="text-primary font-bold">{data.players?.online || 0}</span>
                    <span className="text-muted-foreground"> / {data.players?.max || 0}</span>
                  </span>
                </div>
              </div>

              <CopyableField 
                label={`${title} Connect`} 
                value={`${data.hostname || ip}:${data.port || defaultPort}`} 
              />
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-3">
              <Server className="w-10 h-10 opacity-20" />
              <p>Server is unreachable.</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen w-full bg-background bg-grid-pattern relative overflow-hidden flex flex-col text-foreground">
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background pointer-events-none" />
      
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-12 flex-1 flex flex-col">
        <header className="flex flex-col items-center text-center space-y-4 mb-12 animate-in slide-in-from-top-8 fade-in duration-700">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 border border-primary/20">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Nexus Status
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real-time telemetry for cross-play Minecraft environments. Connect via Java or Bedrock Edition.
          </p>
        </header>

        <main className="flex-1 space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-150 fill-mode-both">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl bg-card/30 border border-border/40 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="flex w-full sm:max-w-md gap-2">
              <Input
                type="text"
                placeholder="Enter server IP (e.g., play.example.com)"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                className="font-mono bg-background/50 border-border/50 focus-visible:ring-primary"
              />
              <Button type="submit" variant="secondary" className="font-semibold text-secondary-foreground">
                Connect
              </Button>
            </form>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-background/40 px-3 py-1.5 rounded-md border border-border/30">
                <div className="w-4 h-4 rounded-full border-2 border-primary/30 flex items-center justify-center overflow-hidden relative bg-background">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-100 ease-linear"
                    style={{ height: `${progress}%` }}
                  />
                </div>
                <span>Auto-refresh</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isJavaFetching || isBedrockFetching}
                className="bg-background/40 border-border/40 hover:bg-background/60 hover:text-primary transition-colors"
              >
                <RefreshCcw className={`w-4 h-4 mr-2 ${(isJavaFetching || isBedrockFetching) ? 'animate-spin' : ''}`} />
                Refresh Now
              </Button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {renderStatusCard("Java Edition", javaStatus, isJavaLoading, 25565)}
            {renderStatusCard("Bedrock / Geyser", bedrockStatus, isBedrockLoading, 19132)}
          </div>

          {/* Player List */}
          {javaStatus?.online && javaStatus?.players?.list && javaStatus.players.list.length > 0 && (
            <div className="mt-12 space-y-4 animate-in fade-in duration-500 delay-300 fill-mode-both">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Online Players
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {javaStatus.players.list.map((player: any) => (
                  <div 
                    key={player.uuid}
                    className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/30 hover:border-primary/40 hover:bg-card/60 transition-colors group"
                  >
                    <img 
                      src={`https://crafatar.com/avatars/${player.uuid}?size=32&overlay`} 
                      alt={player.name}
                      className="w-8 h-8 rounded-sm pixelated group-hover:scale-110 transition-transform"
                    />
                    <span className="font-mono text-sm truncate font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {player.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
