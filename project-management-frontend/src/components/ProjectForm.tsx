import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectFormData } from '../types';
import { projectAPI } from '../services/api';

const ProjectForm: React.FC = () => {
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const titleMaxLength = 100;
  const descriptionMaxLength = 500;

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await projectAPI.getProject(id!);
      if (response.success) {
        setFormData(response.data);
      }
    } catch (err) {
      setError('Failed to load project');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await projectAPI.updateProject(id, formData);
      } else {
        await projectAPI.createProject(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'title' && value.length > titleMaxLength) return;
    if (name === 'description' && value.length > descriptionMaxLength) return;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEdit ? 'Edit Project' : 'Create New Project'}
          </h1>
          <p className="text-gray-600">
            {isEdit ? 'Update your project details' : 'Fill in the details to create a new project'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Project Title Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-semibold text-gray-900">
                  Project Title *
                </label>
                <span className={`text-sm ${
                  formData.title.length > titleMaxLength * 0.8 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formData.title.length}/{titleMaxLength} characters
                </span>
              </div>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter project title"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                maxLength={titleMaxLength}
              />
            </div>

            {/* Description Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-lg font-semibold text-gray-900">
                  Description
                </label>
                <span className={`text-sm ${
                  formData.description.length > descriptionMaxLength * 0.8 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {formData.description.length}/{descriptionMaxLength} characters
                </span>
              </div>
              <textarea
                name="description"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter project description (optional)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={descriptionMaxLength}
              />
              <p className="text-gray-500 text-sm mt-2">
                Provide a detailed description of your project goals and objectives
              </p>
            </div>

            {/* Status Field (Only for Edit) */}
            {isEdit && (
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'completed'})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 pt-6">
              {/* Buttons */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading || !formData.title.trim()}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 font-medium text-lg"
                >
                  {loading ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;