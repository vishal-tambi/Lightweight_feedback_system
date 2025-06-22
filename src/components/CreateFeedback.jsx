import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Send, Users } from 'lucide-react'

const CreateFeedback = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    employee_id: '',
    strengths: '',
    areas_to_improve: '',
    sentiment: 'neutral'
  })

  useEffect(() => {
    fetchTeamMembers()
  }, [])

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/users/team')
      setTeamMembers(response.data)
    } catch (error) {
      toast.error('Failed to load team members')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.employee_id) {
      toast.error('Please select an employee')
      return
    }
    
    if (!formData.strengths.trim() || !formData.areas_to_improve.trim()) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setSubmitting(true)
    
    try {
      await axios.post('/feedback', formData)
      toast.success('Feedback submitted successfully')
      navigate('/feedback')
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to submit feedback'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
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
              <Link to="/feedback" className="mr-4">
                <ArrowLeft className="h-6 w-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Send className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Create Feedback</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Feedback</h2>
            <p className="text-gray-600">
              Provide structured feedback to help your team members grow and improve.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Employee Selection */}
            <div>
              <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee *
              </label>
              <select
                id="employee_id"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose an employee</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.username} ({member.email})
                  </option>
                ))}
              </select>
              {teamMembers.length === 0 && (
                <p className="mt-2 text-sm text-red-600">
                  No team members found. Please add team members first.
                </p>
              )}
            </div>

            {/* Strengths */}
            <div>
              <label htmlFor="strengths" className="block text-sm font-medium text-gray-700 mb-2">
                Strengths *
              </label>
              <textarea
                id="strengths"
                name="strengths"
                value={formData.strengths}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What are the employee's key strengths and positive contributions?"
              />
              <p className="mt-1 text-sm text-gray-500">
                Highlight specific examples of what the employee does well.
              </p>
            </div>

            {/* Areas to Improve */}
            <div>
              <label htmlFor="areas_to_improve" className="block text-sm font-medium text-gray-700 mb-2">
                Areas to Improve *
              </label>
              <textarea
                id="areas_to_improve"
                name="areas_to_improve"
                value={formData.areas_to_improve}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="What areas could the employee focus on for improvement?"
              />
              <p className="mt-1 text-sm text-gray-500">
                Provide constructive feedback with actionable suggestions.
              </p>
            </div>

            {/* Sentiment */}
            <div>
              <label htmlFor="sentiment" className="block text-sm font-medium text-gray-700 mb-2">
                Overall Sentiment
              </label>
              <select
                id="sentiment"
                name="sentiment"
                value={formData.sentiment}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Select the overall tone of this feedback.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/feedback"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || teamMembers.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Feedback Tips</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Be specific and provide concrete examples</li>
            <li>• Focus on behaviors and outcomes, not personality</li>
            <li>• Balance positive feedback with areas for improvement</li>
            <li>• Use constructive language that encourages growth</li>
            <li>• Consider the employee's perspective and development goals</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CreateFeedback 