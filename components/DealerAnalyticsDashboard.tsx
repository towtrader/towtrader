import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, MessageSquare, TrendingUp, Trophy, Clock, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { ListingInquiry } from "@shared/schema";

interface DealerAnalytics {
  totalViews: number;
  totalInquiries: number;
  conversionRate: number;
  averageDaysOnMarket: number;
  averageDaysToSell: number;
  totalSoldItems: number;
  topPerformingListings: { truckId: number; title: string; views: number; inquiries: number; daysOnMarket: number }[];
  recentInquiries: ListingInquiry[];
}

export function DealerAnalyticsDashboard() {
  const { token } = useAuth();

  const { data: analytics, isLoading } = useQuery<DealerAnalytics>({
    queryKey: ['/api/dealers/analytics'],
    enabled: !!token,
    queryFn: async () => {
      const response = await fetch('/api/dealers/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const engagementRate = analytics.totalViews > 0 
    ? (analytics.totalInquiries / analytics.totalViews * 100)
    : 0;

  const inquiryStatusData = [
    { name: 'New', value: analytics.recentInquiries.filter(i => i.status === 'new').length, color: '#3b82f6' },
    { name: 'Responded', value: analytics.recentInquiries.filter(i => i.status === 'responded').length, color: '#10b981' },
    { name: 'Qualified', value: analytics.recentInquiries.filter(i => i.status === 'qualified').length, color: '#f59e0b' },
    { name: 'Converted', value: analytics.recentInquiries.filter(i => i.status === 'converted').length, color: '#ef4444' },
    { name: 'Lost', value: analytics.recentInquiries.filter(i => i.status === 'lost').length, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalInquiries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-500">
                  Engagement: {engagementRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Days on Market</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageDaysOnMarket}</p>
                <p className="text-xs text-gray-500">Per active listing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Average Days to Sell</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.averageDaysToSell || '--'}</p>
                <p className="text-xs text-gray-500">{analytics.totalSoldItems} sold items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Listings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Top Performing Listings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topPerformingListings.length > 0 ? (
              <div className="space-y-4">
                {analytics.topPerformingListings.map((listing, index) => (
                  <div key={listing.truckId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-48">{listing.title}</p>
                        <p className="text-sm text-gray-500">{listing.daysOnMarket} days on market</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{listing.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="h-3 w-3" />
                          <span>{listing.inquiries}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No performance data yet</p>
                <p className="text-sm">Analytics will appear as your listings get views</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inquiry Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Inquiry Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {inquiryStatusData.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inquiryStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {inquiryStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {inquiryStatusData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No inquiries yet</p>
                <p className="text-sm">Inquiry data will appear when customers contact you</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Inquiries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Inquiries</span>
            </div>
            <Badge variant="outline">{analytics.recentInquiries.length} total</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.recentInquiries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Unit of Interest</TableHead>
                  <TableHead>Inquiry Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentInquiries.slice(0, 10).map((inquiry) => (
                  <TableRow key={inquiry.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inquiry.customerName || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{inquiry.customerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {(() => {
                          const fullMessage = inquiry.message || 'General Inquiry';
                          const parts = fullMessage.split('\n\n');
                          const unitInfo = parts[0]?.replace('Inquiry about: ', '') || 'General Inquiry';
                          const customerMessage = parts[1] || '';
                          
                          // Check if the message contains HTML links
                          const hasHtmlLink = unitInfo.includes('<a href=');
                          
                          if (hasHtmlLink) {
                            console.log('Original unitInfo:', unitInfo);
                            // Handle double quotes in HTML that get escaped
                            const normalizedHtml = unitInfo.replace(/&quot;/g, '"').replace(/""/g, '"');
                            console.log('Normalized HTML:', normalizedHtml);
                            const linkMatch = normalizedHtml.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/);
                            console.log('Link match result:', linkMatch);
                            
                            if (linkMatch) {
                              const [, url, title] = linkMatch;
                              console.log('Extracted URL:', url, 'Title:', title);
                              return (
                                <>
                                  <p className="font-medium text-sm">
                                    <a 
                                      href={url}
                                      className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.open(url, '_blank');
                                      }}
                                    >
                                      {title}
                                    </a>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {customerMessage.substring(0, 50)}
                                    {customerMessage.length > 50 ? '...' : ''}
                                  </p>
                                </>
                              );
                            } else {
                              // Fallback: render as plain text with manual link creation
                              console.log('Failed to parse HTML link, using fallback');
                              const titleOnly = unitInfo.replace(/<[^>]*>/g, ''); // Strip HTML tags
                              return (
                                <>
                                  <p className="font-medium text-sm text-blue-600">{titleOnly}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {customerMessage.substring(0, 50)}
                                    {customerMessage.length > 50 ? '...' : ''}
                                  </p>
                                </>
                              );
                            }
                          } else {
                            // Legacy format handling for older inquiries
                            const isTrailer = unitInfo.includes('(Trailer ID:');
                            const isTruck = unitInfo.includes('(Truck ID:');
                            
                            if (isTrailer) {
                              const match = unitInfo.match(/\(Trailer ID: (\d+)\)/);
                              const trailerId = match ? match[1] : null;
                              const title = unitInfo.replace(/\s*\(Trailer ID: \d+\)/, '');
                              
                              return (
                                <>
                                  <p className="font-medium text-sm">
                                    <a 
                                      href={`/trailers/${trailerId}`}
                                      className="text-blue-600 hover:text-blue-800 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {title}
                                    </a>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {customerMessage.substring(0, 50)}
                                    {customerMessage.length > 50 ? '...' : ''}
                                  </p>
                                </>
                              );
                            } else if (isTruck) {
                              const match = unitInfo.match(/\(Truck ID: (\d+)\)/);
                              const truckId = match ? match[1] : null;
                              const title = unitInfo.replace(/\s*\(Truck ID: \d+\)/, '');
                              
                              return (
                                <>
                                  <p className="font-medium text-sm">
                                    <a 
                                      href={`/trucks/${truckId}`}
                                      className="text-blue-600 hover:text-blue-800 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {title}
                                    </a>
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {customerMessage.substring(0, 50)}
                                    {customerMessage.length > 50 ? '...' : ''}
                                  </p>
                                </>
                              );
                            } else {
                              return (
                                <>
                                  <p className="font-medium text-sm truncate">{unitInfo}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {customerMessage.substring(0, 50)}
                                    {customerMessage.length > 50 ? '...' : ''}
                                  </p>
                                </>
                              );
                            }
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {inquiry.inquiryType.replace('_', ' ').replace('trailer contact', 'trailer').replace('contact', 'truck')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          inquiry.status === 'converted' ? 'default' :
                          inquiry.status === 'qualified' ? 'secondary' :
                          inquiry.status === 'responded' ? 'outline' : 'destructive'
                        }
                      >
                        {inquiry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          inquiry.priority === 'high' ? 'destructive' :
                          inquiry.priority === 'medium' ? 'secondary' : 'outline'
                        }
                      >
                        {inquiry.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(inquiry.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {inquiry.customerPhone && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`tel:${inquiry.customerPhone}`)}
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                        {inquiry.customerEmail && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(`mailto:${inquiry.customerEmail}`)}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No inquiries yet</p>
              <p className="text-sm">Customer inquiries will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}