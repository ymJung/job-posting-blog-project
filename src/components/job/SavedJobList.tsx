'use client';

import { useEffect, useState } from 'react';
import { JobPosting } from '@/types/job';
import JobCard from './JobCard';
import { getSavedJobs, unsaveJob } from '@/services/jobService';

export default function SavedJobList() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedJobs = async () => {
    try {
      const savedJobs = await getSavedJobs();
      setJobs(savedJobs);
    } catch (err) {
      setError('Failed to fetch saved jobs. Please try again later.');
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (employmentCompanyId: number) => {
    try {
      await unsaveJob(employmentCompanyId);
      setJobs(jobs.filter(job => job.employment_company_id !== employmentCompanyId));
    } catch (err) {
      console.error('Error removing job from saved:', err);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No saved jobs found.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <div key={job.employment_company_id} className="relative">
          <JobCard job={job} />
          <button
            onClick={() => handleUnsave(job.employment_company_id)}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            aria-label="Remove from saved"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
