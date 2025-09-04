import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Eye, Phone, Mail, MessageSquare, TrendingUp, Users, Target } from "lucide-react";

interface ListingAnalyticsProps {
  analytics: {
    totalViews: number;
    uniqueViews: number;
    phoneClicks: number;
    emailClicks: number;
    inquiries: number;
    conversionRate: number;
    avgTimeOnListing: number;
    viewsLast30Days: { date: string; views: number }[];
  };
}

export function ListingAnalytics({ analytics }: ListingAnalyticsProps) {
  const engagementRate = analytics.totalViews > 0 
    ? ((analytics.phoneClicks + analytics.emailClicks + analytics.inquiries) / analytics.totalViews * 100)
    : 0;

  const stats = [
    {
      title: "Total Views",
      value: analytics.totalViews,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Unique Visitors",
      value: analytics.uniqueViews,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Phone Clicks",
      value: analytics.phoneClicks,
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Email Clicks",
      value: analytics.emailClicks,
      icon: Mail,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Inquiries",
      value: analytics.inquiries,
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Conversion Rate",
      value: `${analytics.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Engagement Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Overall Engagement</span>
                <span className="text-lg font-semibold">{engagementRate.toFixed(1)}%</span>
              </div>
              <Progress value={engagementRate} className="h-2" />
              <p className="text-xs text-gray-500">
                Based on interactions per view (calls, emails, inquiries)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">View Quality</span>
                <Badge variant={analytics.uniqueViews / Math.max(analytics.totalViews, 1) > 0.7 ? "default" : "secondary"}>
                  {analytics.totalViews > 0 ? ((analytics.uniqueViews / analytics.totalViews) * 100).toFixed(0) : 0}% unique
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Contact Rate</span>
                <Badge variant={analytics.phoneClicks + analytics.emailClicks > 0 ? "default" : "secondary"}>
                  {analytics.totalViews > 0 ? (((analytics.phoneClicks + analytics.emailClicks) / analytics.totalViews) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inquiry Rate</span>
                <Badge variant={analytics.inquiries > 0 ? "default" : "secondary"}>
                  {analytics.totalViews > 0 ? ((analytics.inquiries / analytics.totalViews) * 100).toFixed(1) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Views Chart */}
      {analytics.viewsLast30Days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Views Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.viewsLast30Days}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value) => [value, 'Views']}
                  />
                  <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}