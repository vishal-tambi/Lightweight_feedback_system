import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
// import toast from 'react-hot-toast'
import {
  BarChart3,
  Users,
  MessageSquare,
  Plus,
  LogOut,
  TrendingUp,
  CheckCircle,
  Clock,
  User,
  Settings
} from 'lucide-react'

const Dashboard = () => {
  const { user, token, logout } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && token) {
      fetchStats()
    }
    // eslint-disable-next-line
  }, [user, token])

  const fetchStats = async () => {
    if (!user || !token) return;
    try {
      const response = await axios.get('/dashboard/stats')
      setStats(response.data)
    } catch (error) {
      console.error(error);
      // toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon: Icon, // eslint-disable-line no-unused-vars
    color = 'blue' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center">
        <div className={`p-2 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )

  const QuickAction = ({ title, description, icon: Icon, // eslint-disable-line no-unused-vars
    href, color = 'indigo' }) => (
    <Link
      to={href}
      className={`block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-${color}-500`}
    >
      <div className="flex items-center">
        <div className={`p-2 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Feedback System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700">{user?.username}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${user?.role === 'manager'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                  }`}>
                  {user?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.username}!
          </h2>
          <p className="mt-2 text-gray-600">
            {user?.role === 'manager'
              ? 'Manage your team feedback and track performance'
              : 'View your feedback and track your progress'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user?.role === 'manager' ? (
            <>
              <StatCard
                title="Team Size"
                value={stats?.team_size || 0}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total Feedback"
                value={stats?.total_feedback || 0}
                icon={MessageSquare}
                color="green"
              />
              <StatCard
                title="Positive Feedback"
                value={stats?.positive_feedback || 0}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Negative Feedback"
                value={stats?.negative_feedback || 0}
                icon={Settings}
                color="red"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Feedback"
                value={stats?.total_feedback || 0}
                icon={MessageSquare}
                color="blue"
              />
              <StatCard
                title="Acknowledged"
                value={stats?.acknowledged_feedback || 0}
                icon={CheckCircle}
                color="green"
              />
              <StatCard
                title="Pending"
                value={stats?.pending_feedback || 0}
                icon={Clock}
                color="yellow"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user?.role === 'manager' ? (
              <>
                <QuickAction
                  title="Create Feedback"
                  description="Submit new feedback for team members"
                  icon={Plus}
                  href="/feedback/create"
                  color="green"
                />
                <QuickAction
                  title="View Feedback"
                  description="See all feedback you've given"
                  icon={MessageSquare}
                  href="/feedback"
                  color="blue"
                />
                <QuickAction
                  title="Team Members"
                  description="Manage your team members"
                  icon={Users}
                  href="/team"
                  color="purple"
                />
              </>
            ) : (
              <>
                <QuickAction
                  title="View Feedback"
                  description="See feedback you've received"
                  icon={MessageSquare}
                  href="/feedback"
                  color="blue"
                />
                <QuickAction
                  title="Pending Feedback"
                  description="Review unacknowledged feedback"
                  icon={Clock}
                  href="/feedback"
                  color="yellow"
                />
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No recent activity to display</p>
            <p className="text-sm">Start by creating or viewing feedback</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 