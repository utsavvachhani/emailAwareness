"use client";

import {
  Plus,
  FileText,
  Play,
  Settings,
  Trash2,
  MoreVertical,
  BookOpen,
  Mail,
  HelpCircle,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const contentItems = [
  { id: 1, title: "Phishing Awareness Basics", type: "Lesson", duration: "5 min", status: "Published", engagement: 94, lessons: 12 },
  { id: 2, title: "Password Security 101", type: "Lesson", duration: "3 min", status: "Published", engagement: 88, lessons: 8 },
  { id: 3, title: "Social Engineering Tactics", type: "Lesson", duration: "7 min", status: "Draft", engagement: 0, lessons: 15 },
  { id: 4, title: "Remote Work Safety", type: "Lesson", duration: "4 min", status: "Published", engagement: 76, lessons: 10 },
  { id: 5, title: "Identifying Malicious Links", type: "Lesson", duration: "6 min", status: "Published", engagement: 91, lessons: 14 },
];

export default function ContentPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="module-header">
        <div>
          <h1 className="module-title">Content Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage training lessons, quizzes, and phishing templates
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-9 px-4 bg-foreground text-background text-sm font-medium rounded-md hover:bg-foreground/90 transition-colors">
          <Plus className="h-4 w-4" />
          Create New Content
        </button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-3 gap-6">
        <div className="border border-border rounded-lg p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">24 Lessons</span>
          </div>
          <h3 className="font-semibold text-lg">Micro-Lessons</h3>
          <p className="text-sm text-muted-foreground mt-1">Short, digestible training modules for weekly distribution.</p>
        </div>
        <div className="border border-border rounded-lg p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">12 Templates</span>
          </div>
          <h3 className="font-semibold text-lg">Phishing Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">Simulated phishing emails to test employee awareness.</p>
        </div>
        <div className="border border-border rounded-lg p-6 hover:bg-secondary/30 transition-colors cursor-pointer group">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-secondary rounded flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors">
              <HelpCircle className="h-5 w-5" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">18 Quizzes</span>
          </div>
          <h3 className="font-semibold text-lg">Assessment Quizzes</h3>
          <p className="text-sm text-muted-foreground mt-1">Short quizzes to verify knowledge retention.</p>
        </div>
      </div>

      {/* Content Table */}
      <div className="border border-border rounded-lg">
        <div className="px-4 py-3 border-b border-border bg-secondary/30">
          <h3 className="text-sm font-medium">Recently Updated Content</h3>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Avg Engagement</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contentItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                </td>
                <td>
                  <span className="text-xs font-mono text-muted-foreground">{item.type}</span>
                </td>
                <td>
                  <span className={`status-badge ${item.status === "Published" ? "status-active" : "status-pending"}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: `${item.engagement}%` }} />
                    </div>
                    <span className="text-xs font-mono">{item.engagement}%</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-secondary rounded transition-colors" title="Preview">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="p-1 hover:bg-secondary rounded transition-colors" title="Edit">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-secondary rounded transition-colors">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          View Analytics
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate Content</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
