import React from "react";
import { Search, Bell, Plus, Filter, MoreHorizontal } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background">
        <div className="flex items-center gap-4">
          <h2 className="text-foreground font-semibold font-avenir">Dashboard</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-md text-muted-foreground hover:text-foreground transition-colors font-avenir">
              <Filter size={14} />
              Filter
            </button>
            <button
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="More options"
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-9 pr-4 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring font-avenir"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm rounded-md transition-colors font-avenir">
            <Plus size={14} />
            Create
          </button>
          <ThemeToggle />
          <button
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
