import { Link, useLocation } from "wouter";
import { Server, Settings, Library, Zap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Status", icon: Zap },
    { path: "/panel", label: "Panel", icon: Settings },
    { path: "/mods", label: "Library", icon: Library },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center gap-2 group cursor-pointer">
              <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 group-hover:border-primary/60 transition-colors">
                <Server className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg hidden md:inline-block tracking-tight">Nexus Control</span>
            </Link>
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-muted text-foreground border border-border/50"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col relative w-full">
        {children}
      </div>
    </div>
  );
}
