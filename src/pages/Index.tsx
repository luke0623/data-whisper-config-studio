
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  Database, 
  Settings, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Plus,
  Eye,
  TrendingUp,
  Users,
  Server,
  User
} from 'lucide-react';

const Index = () => {
  // Mock user data
  const userData = {
    name: "John Smith",
    email: "john.smith@company.com",
    role: "Data Engineer",
    department: "Engineering",
    lastLogin: "2 hours ago",
    avatar: "JS"
  };

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      action: "Policy Management module configured",
      time: "2 hours ago",
      status: "success",
      user: "John Smith"
    },
    {
      id: 2,
      action: "Claims ingestion completed",
      time: "4 hours ago",
      status: "success",
      user: "System"
    },
    {
      id: 3,
      action: "Finance model validation failed",
      time: "6 hours ago",
      status: "error",
      user: "System"
    }
  ];

  // Mock statistics
  const stats = {
    totalModules: 8,
    activeIngestions: 3,
    successRate: 94,
    lastUpdate: "2 minutes ago"
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* User Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {userData.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userData.name}!</h1>
            <p className="text-gray-600">{userData.role} • {userData.department}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last login: {userData.lastLogin}</p>
          <Badge variant="outline" className="mt-1">
            <User className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>

      {/* User Stats Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Your Activity Summary</h3>
              <p className="text-sm text-blue-700">You've been productive today, {userData.name.split(' ')[0]}!</p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-lg font-bold text-blue-700">3</p>
                <p className="text-xs text-blue-600">Modules Created</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">12</p>
                <p className="text-xs text-blue-600">Tasks Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">98%</p>
                <p className="text-xs text-blue-600">Success Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <div className="text-center space-y-2">
        <p className="text-lg text-gray-600">Configure your data ingestion and monitor system health</p>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Modules</p>
                <p className="text-2xl font-bold text-blue-700">{stats.totalModules}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-700">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Jobs</p>
                <p className="text-2xl font-bold text-orange-700">{stats.activeIngestions}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Last Update</p>
                <p className="text-sm font-bold text-purple-700">{stats.lastUpdate}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              What would you like to do?
            </CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/modules">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Module</p>
                    <p className="text-sm text-gray-600">Configure a new data source</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
              </div>
            </Link>

            <Link to="/models">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                    <Database className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Setup Data Model</p>
                    <p className="text-sm text-gray-600">Define your data structure</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600" />
              </div>
            </Link>

            <Link to="/tables">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                    <Server className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Configure Tables</p>
                    <p className="text-sm text-gray-600">Map your table structures</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600" />
              </div>
            </Link>

            <Link to="/monitor">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <Eye className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Monitor System</p>
                    <p className="text-sm text-gray-600">Check ingestion status</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Recent Activity
            </CardTitle>
            <CardDescription>What's been happening in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="mt-0.5">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">by {activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t">
              <Link to="/monitor">
                <Button variant="outline" className="w-full">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Banner */}
      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">System Status: All Good!</h3>
                <p className="text-green-100">All modules are running smoothly with {stats.successRate}% success rate</p>
              </div>
            </div>
            <Link to="/monitor">
              <Button variant="secondary" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-3">
            <Users className="h-8 w-8 text-blue-600 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">Need Help Getting Started?</h3>
            <p className="text-gray-600">Our system is designed to be simple. Start by adding a module, then configure your models and tables.</p>
            <Link to="/config">
              <Button>
                Quick Setup Guide
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
