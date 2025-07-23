import React from "react";
import { Search, Bell, Plus, Filter, MoreHorizontal } from "lucide-react";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold font-avenir">Dashboard</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors font-avenir">
              <Filter size={14} />
              Filter
            </button>
            <button
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              aria-label="More options"
              title="More options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:border-gray-600 font-avenir"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-md transition-colors font-avenir">
            <Plus size={14} />
            Create
          </button>
          <button
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
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
