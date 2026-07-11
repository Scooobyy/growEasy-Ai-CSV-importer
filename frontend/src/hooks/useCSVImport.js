// frontend/src/hooks/useCSVImport.js
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function useCSVImport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const uploadCSV = async (file) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await axios.post(`${API_URL}/csv/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to upload CSV';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const processWithAI = async (records) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/csv/process`, {
        records,
      });

      if (response.data.success) {
        setResults(response.data);
        toast.success(`Successfully imported ${response.data.imported} records!`);
        return response.data;
      } else {
        throw new Error(response.data.error || 'Processing failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to process CSV';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResults(null);
    setError(null);
    setLoading(false);
  };

  return {
    loading,
    error,
    results,
    uploadCSV,
    processWithAI,
    reset,
  };
}