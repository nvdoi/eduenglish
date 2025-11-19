"use client";

import { useState, useEffect } from 'react';
import { API_BASE_URL } from "../config/api";

interface Course {
  _id: string;
  name: string;
  description: string;
  level: string;
  image: string;
  duration: number;
  isPublished: boolean;
  vocabularies: any[];
  grammars: any[];
  exercises: any[];
}

export default function TestCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    testAPI();
  }, []);

  const testAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🧪 Testing API from frontend...');
      
      // Test basic connection
      const response = await fetch(`${API_BASE_URL}/api/courses?isPublished=true`);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response:', data);
      
      setApiResponse(data);
      
      if (data.success) {
        setCourses(data.courses || []);
      } else {
        setError('API returned success: false');
      }
      
    } catch (error: any) {
      console.error('❌ Frontend API Test Failed:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🧪 API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Status</h2>
          
          {isLoading && (
            <div className="text-blue-600">Testing API connection...</div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          {apiResponse && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-green-800 font-semibold"> API Response</h3>
              <pre className="text-sm text-green-700 mt-2 overflow-x-auto">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Courses Found ({courses.length})</h2>
          
          {courses.length === 0 && !isLoading && (
            <div className="text-gray-500 text-center py-8">
              No courses found or API error
            </div>
          )}
          
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {course.level}
                      </span>
                      <span>{course.duration}h</span>
                      <span className={`px-2 py-1 rounded ${
                        course.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isPublished ? 'Published' : ' Draft'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📚 {course.vocabularies?.length || 0} từ vựng</span>
                      <span>📖 {course.grammars?.length || 0} ngữ pháp</span>
                      <span>📝 {course.exercises?.length || 0} bài tập</span>
                    </div>
                  </div>
                  <img 
                    src={course.image} 
                    alt={course.name}
                    className="w-20 h-20 object-cover rounded-lg ml-4"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={testAPI}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Again
          </button>
        </div>
      </div>
    </div>
  );
}
