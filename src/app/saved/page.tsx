import SavedJobList from '@/components/job/SavedJobList';

export default function SavedJobsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Saved Jobs</h1>
      <SavedJobList />
    </main>
  );
}
