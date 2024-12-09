import { JobPosting } from '@/types/job';
import { format } from 'date-fns';

interface JobCardProps {
  job: JobPosting;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="p-4 border rounded-lg shadow hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold truncate">{job.title}</h3>
      <p className="text-gray-600 mb-2">{job.company_name}</p>
      <div className="flex justify-between text-sm text-gray-500 mb-2">
        <span>👁️ {job.view_count}</span>
        <span>📝 {job.resume_count}</span>
      </div>
      <div className="text-sm text-gray-500">
        <p>Posted: {format(new Date(job.created_at), 'MMM d, yyyy')}</p>
        <p>Deadline: {format(new Date(job.deadline), 'MMM d, yyyy')}</p>
      </div>
    </div>
  );
}
