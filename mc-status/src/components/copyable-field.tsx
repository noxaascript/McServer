import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableFieldProps {
  label: string;
  value: string;
  className?: string;
}

export function CopyableField({ label, value, className }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <button
        onClick={handleCopy}
        className="group relative flex items-center justify-between w-full rounded-md border border-border/50 bg-muted/30 px-3 py-2 text-sm font-mono transition-all hover:border-primary/50 hover:bg-muted/50 hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <span className="truncate max-w-[85%] text-left">{value}</span>
        <span className="flex-shrink-0 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
          {copied ? (
            <Check className="h-4 w-4 text-primary animate-in fade-in zoom-in" />
          ) : (
            <Copy className="h-4 w-4 animate-in fade-in zoom-in" />
          )}
        </span>
      </button>
    </div>
  );
}
