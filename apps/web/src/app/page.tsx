import React from "react";
import { Sidebar } from "@/components/sidebar";
import { MainContent } from "@/components/main-content";
import { 
  Calendar,
  TrendingUp,
  Users,
  Target,
  Trophy,
  Clock,
  Star,
  ChevronRight
} from "lucide-react";

const recentItems = [
  {
    id: "TG-1001",
    title: "Week 12 Lineup Optimization Required",
    status: "High Priority",
    assignee: "DM",
    updated: "2 hours ago",
    priority: "high"
  },
  {
    id: "TG-1002", 
    title: "Waiver Wire Claims Due Tonight",
    status: "In Progress",
    assignee: "Team Manager",
    updated: "4 hours ago",
    priority: "medium"
  },
  {
    id: "TG-1003",
    title: "Trade Proposal: CMC for Tyreek + Pick",
    status: "Pending Review",
    assignee: "League Commissioner", 
    updated: "1 day ago",
    priority: "low"
  },
  {
    id: "TG-1004",
    title: "Playoff Bracket Predictions Updated",
    status: "Completed",
    assignee: "Simulation Engine",
    updated: "2 days ago",
    priority: "low"
  },
  {
    id: "TG-1005",
    title: "Week 11 Performance Analysis",
    status: "Under Review",
    assignee: "Analytics Team",
    updated: "3 days ago", 
    priority: "medium"
  }
];

const stats = [
  { label: "Active Teams", value: "8", change: "+2 this week", icon: Users },
  { label: "Win Rate", value: "67%", change: "+5% vs last week", icon: Trophy },
  { label: "Points For", value: "1,247", change: "+89 this week", icon: Target },
  { label: "Proj. Finish", value: "2nd", change: "↑1 spot", icon: TrendingUp },
];

export default function HomePage() {
  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <MainContent>
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Icon size={16} className="text-gray-400" />
                    <span className="text-xs text-green-400 font-avenir">{stat.change}</span>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1 font-avenir">{stat.value}</div>
                  <div className="text-sm text-gray-400 font-avenir">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* Recent Activity Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg">
            <div className="border-b border-gray-800 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold font-avenir">Recent Activity</h3>
                <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1 font-avenir">
                  View all
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            
            <div className="divide-y divide-gray-800">
              {recentItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        item.priority === 'high' ? 'bg-red-500' :
                        item.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm font-mono font-avenir">{item.id}</span>
                          <span className="text-white font-avenir">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                          <span className={`px-2 py-1 rounded-sm text-xs font-avenir ${
                            item.status === 'Completed' ? 'bg-green-900 text-green-300' :
                            item.status === 'In Progress' ? 'bg-blue-900 text-blue-300' :
                            item.status === 'High Priority' ? 'bg-red-900 text-red-300' :
                            'bg-gray-800 text-gray-300'
                          }`}>
                            {item.status}
                          </span>
                          <span className="font-avenir">Assigned to {item.assignee}</span>
                          <span className="flex items-center gap-1 font-avenir">
                            <Clock size={12} />
                            {item.updated}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      className="text-gray-400 hover:text-white"
                      aria-label="Star item"
                      title="Star item"
                    >
                      <Star size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
              <Target className="text-purple-400 mb-3" size={24} />
              <h4 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-geizer)', letterSpacing: '0.1em' }}>SET LINEUP</h4>
              <p className="text-gray-400 text-sm font-avenir">Optimize your starting lineup for this week</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
              <Calendar className="text-blue-400 mb-3" size={24} />
              <h4 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-geizer)', letterSpacing: '0.1em' }}>VIEW SCHEDULE</h4>
              <p className="text-gray-400 text-sm font-avenir">Check upcoming matchups and deadlines</p>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer">
              <TrendingUp className="text-green-400 mb-3" size={24} />
              <h4 className="text-white font-semibold mb-2" style={{ fontFamily: 'var(--font-geizer)', letterSpacing: '0.1em' }}>RUN SIMULATION</h4>
              <p className="text-gray-400 text-sm font-avenir">Get AI-powered playoff predictions</p>
            </div>
          </div>
        </div>
      </MainContent>
    </div>
  );
}
