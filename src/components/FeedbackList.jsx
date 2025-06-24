import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  CheckCircle, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  MessageSquare
} from 'lucide-react'

const FeedbackList = () => {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      const response = await axios.get('/feedback')
      setFeedback(response.data)
    } catch (error) {
      console.error(error);
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  const handleAcknowledge = async (feedbackId) => {
    try {
      await axios.post(`/feedback/${feedbackId}/acknowledge`)
      toast.success('Feedback acknowledged')
      fetchFeedback()
    } catch (error) {
      console.error(error);
      toast.error('Failed to acknowledge feedback')
    }
  }

  const handleEdit = async (feedbackId) => {
    try {
      await axios.put(`/feedback/${feedbackId}`, editForm)
      toast.success('Feedback updated')
      setEditingId(null)
      setEditForm({})
      fetchFeedback()
    } catch (error) {
      console.error(error);
      toast.error('Failed to update feedback')
    }
  }

  const startEdit = (feedbackItem) => {
    setEditingId(feedbackItem.id)
    setEditForm({
      strengths: feedbackItem.strengths,
      areas_to_improve: feedbackItem.areas_to_improve,
      sentiment: feedbackItem.sentiment
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-5 w-5 text-green-600" />
      case 'negative':
        return <ThumbsDown className="h-5 w-5 text-red-600" />
      default:
        return <Minus className="h-5 w-5 text-gray-600" />
    }
  }

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800'
      case 'negative':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
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
              <Link to="/dashboard" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Feedback</h1>
            </div>
            {user?.role === 'manager' && (
              <Link
                to="/feedback/create"
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                <Plus className="h-5 w-5" />
                <span>Create Feedback</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-900">{feedback.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedback.filter(f => f.acknowledged).length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {feedback.filter(f => !f.acknowledged).length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-6">
          {feedback.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
              <p className="text-gray-600 mb-6">
                {user?.role === 'manager' 
                  ? 'Start by creating feedback for your team members'
                  : 'You haven\'t received any feedback yet'
                }
              </p>
              {user?.role === 'manager' && (
                <Link
                  to="/feedback/create"
                  className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create First Feedback</span>
                </Link>
              )}
            </div>
          ) : (
            feedback.map((feedbackItem) => (
              <div key={feedbackItem.id} className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {getSentimentIcon(feedbackItem.sentiment)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSentimentColor(feedbackItem.sentiment)}`}>
                      {feedbackItem.sentiment}
                    </span>
                    {!feedbackItem.acknowledged && (
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(feedbackItem.created_at), 'MMM dd, yyyy')}
                  </div>
                </div>

                {/* Content */}
                {editingId === feedbackItem.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Strengths
                      </label>
                      <textarea
                        value={editForm.strengths}
                        onChange={(e) => setEditForm({...editForm, strengths: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Areas to Improve
                      </label>
                      <textarea
                        value={editForm.areas_to_improve}
                        onChange={(e) => setEditForm({...editForm, areas_to_improve: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sentiment
                      </label>
                      <select
                        value={editForm.sentiment}
                        onChange={(e) => setEditForm({...editForm, sentiment: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="positive">Positive</option>
                        <option value="neutral">Neutral</option>
                        <option value="negative">Negative</option>
                      </select>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEdit(feedbackItem.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Strengths</h4>
                      <p className="text-gray-900 bg-green-50 p-3 rounded-md">
                        {feedbackItem.strengths}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Areas to Improve</h4>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded-md">
                        {feedbackItem.areas_to_improve}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Last updated: {format(new Date(feedbackItem.updated_at), 'MMM dd, yyyy HH:mm')}
                  </div>
                  <div className="flex space-x-3">
                    {user?.role === 'manager' && (
                      <button
                        onClick={() => startEdit(feedbackItem)}
                        className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    {user?.role === 'employee' && !feedbackItem.acknowledged && (
                      <button
                        onClick={() => handleAcknowledge(feedbackItem.id)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedbackList 