import { useState, useRef } from "react";
import { useListMods, useGetModStats, useDeleteMod, useUpdateMod, getListModsQueryKey, getGetModStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, Library, HardDrive, Play, PowerOff, FileBox } from "lucide-react";

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function Mods() {
  const { data: mods, isLoading: isModsLoading } = useListMods(undefined, { query: { queryKey: getListModsQueryKey() } });
  const { data: stats, isLoading: isStatsLoading } = useGetModStats({ query: { queryKey: getGetModStatsQueryKey() } });
  const deleteMod = useDeleteMod();
  const updateMod = useUpdateMod();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 200 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max file size is 200MB", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name);

    try {
      const res = await fetch("/api/mods", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast({ title: "Upload complete", description: `${file.name} uploaded successfully.` });
      queryClient.invalidateQueries({ queryKey: getListModsQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetModStatsQueryKey() });
    } catch (err) {
      toast({ title: "Upload failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = (id: number) => {
    deleteMod.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Mod deleted" });
        queryClient.invalidateQueries({ queryKey: getListModsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetModStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    });
  };

  const handleToggle = (id: number, enabled: string) => {
    updateMod.mutate({ id, data: { enabled } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListModsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetModStatsQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to update mod", variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background bg-grid-pattern relative overflow-hidden flex flex-col text-foreground pb-20">
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background pointer-events-none" />
      
      <div className="relative z-10 container max-w-5xl mx-auto px-4 py-12 flex-1">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-top-8 fade-in duration-500">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Library className="w-8 h-8 text-primary" />
              Mod Library
            </h1>
            <p className="text-muted-foreground mt-2">Manage server modifications and plugins.</p>
          </div>
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleUpload} 
              className="hidden" 
              accept=".jar,.zip"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isUploading}
              className="w-full md:w-auto"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Mod"}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-in fade-in duration-700 delay-150 fill-mode-both">
          <Card className="bg-card/50 backdrop-blur-sm border-border/40">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <FileBox className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Mods</p>
                {isStatsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{stats?.total || 0}</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/40">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Play className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Enabled</p>
                {isStatsLoading ? <Skeleton className="h-8 w-16 mt-1" /> : <p className="text-3xl font-bold">{stats?.enabled || 0}</p>}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/50 backdrop-blur-sm border-border/40">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="bg-muted p-3 rounded-full">
                <HardDrive className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Total Size</p>
                {isStatsLoading ? <Skeleton className="h-8 w-24 mt-1" /> : <p className="text-3xl font-bold">{formatBytes(stats?.totalSizeBytes || 0)}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-in fade-in duration-700 delay-300 fill-mode-both">
          {isModsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : mods?.length === 0 ? (
            <div className="text-center py-20 bg-card/30 backdrop-blur-sm rounded-xl border border-border/40">
              <Library className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No mods installed</h3>
              <p className="text-muted-foreground mt-1">Upload a .jar or .zip file to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mods?.map(mod => (
                <Card key={mod.id} className={`overflow-hidden transition-all duration-200 border-border/40 ${mod.enabled === 'true' ? 'bg-card/80 border-primary/20' : 'bg-card/30 opacity-75 grayscale-[0.3]'}`}>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <h3 className="font-bold text-lg truncate" title={mod.name}>{mod.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate" title={mod.filename}>{mod.filename}</p>
                      </div>
                      <Badge variant="outline" className="bg-background/50 font-mono text-[10px]">
                        {formatBytes(mod.sizeBytes)}
                      </Badge>
                    </div>
                    
                    {mod.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{mod.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={mod.enabled === 'true'} 
                          onCheckedChange={(c) => handleToggle(mod.id, c ? 'true' : 'false')} 
                        />
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {mod.enabled === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2"
                        onClick={() => handleDelete(mod.id)}
                        disabled={deleteMod.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
