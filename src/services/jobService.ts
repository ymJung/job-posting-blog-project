import axios from 'axios';
import { load } from 'cheerio';
import { JobPosting, JobResponse } from '@/types/job';
import { subMonths } from 'date-fns';
import prisma from '@/lib/prisma';

const JASOSEOL_BASE_URL = 'https://jasoseol.com';
const JOB_DETAIL_URL = `${JASOSEOL_BASE_URL}/employment/get.json`;

/**
 * Scrapes job IDs from Jasoseol main page
 */
export async function scrapeJobIds(): Promise<number[]> {
  try {
    const response = await axios.get(JASOSEOL_BASE_URL);
    const $ = load(response.data);
    const jobIds: number[] = [];

    // Find all recruitment links and extract company IDs
    $('a[href^="/recruit/"]').each((_, element) => {
      const href = $(element).attr('href');
      if (href) {
        const companyId = parseInt(href.split('/').pop() || '0');
        if (companyId > 0) {
          jobIds.push(companyId);
        }
      }
    });

    return jobIds;
  } catch (error) {
    console.error('Error scraping job IDs:', error);
    return [];
  }
}

/**
 * Fetches detailed job information for a given company ID
 */
export async function fetchJobDetail(companyId: number): Promise<JobPosting | null> {
  try {
    const response = await axios.post<JobResponse>(
      JOB_DETAIL_URL,
      {
        employment_company_id: companyId,
        employment_id: 0
      },
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching job detail for company ${companyId}:`, error);
    return null;
  }
}

/**
 * Filters jobs based on view count and resume count criteria
 */
export function filterJobs(jobs: JobPosting[]): JobPosting[] {
  const oneMonthAgo = subMonths(new Date(), 1);
  
  return jobs.filter(job => {
    const jobDate = new Date(job.created_at);
    return (
      job.view_count >= 100 &&
      job.resume_count >= 100 &&
      jobDate >= oneMonthAgo
    );
  });
}

/**
 * Save a job to the database
 */
export async function saveJob(job: JobPosting): Promise<void> {
  await prisma.job.create({
    data: {
      employmentCompanyId: job.employment_company_id,
      title: job.title,
      companyName: job.company_name,
      viewCount: job.view_count,
      resumeCount: job.resume_count,
      description: job.description,
      deadline: new Date(job.deadline),
      isSaved: true,
    },
  });
}

/**
 * Get all saved jobs from the database
 */
export async function getSavedJobs(): Promise<JobPosting[]> {
  const savedJobs = await prisma.job.findMany({
    where: {
      isSaved: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return savedJobs.map(job => ({
    employment_company_id: job.employmentCompanyId,
    employment_id: 0,
    title: job.title,
    company_name: job.companyName,
    view_count: job.viewCount,
    resume_count: job.resumeCount,
    description: job.description,
    created_at: job.createdAt.toISOString(),
    updated_at: job.updatedAt.toISOString(),
    deadline: job.deadline.toISOString(),
  }));
}

/**
 * Remove a job from saved jobs
 */
export async function unsaveJob(employmentCompanyId: number): Promise<void> {
  await prisma.job.delete({
    where: {
      employmentCompanyId,
    },
  });
}

/**
 * Main function to collect and process job postings
 */
export async function collectJobPostings(): Promise<JobPosting[]> {
  const jobIds = await scrapeJobIds();
  const jobDetails: JobPosting[] = [];

  // Process job IDs in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < jobIds.length; i += batchSize) {
    const batch = jobIds.slice(i, i + batchSize);
    const batchPromises = batch.map(id => fetchJobDetail(id));
    const batchResults = await Promise.all(batchPromises);
    
    jobDetails.push(...batchResults.filter((job): job is JobPosting => job !== null));
    
    // Add a small delay between batches
    if (i + batchSize < jobIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return filterJobs(jobDetails);
}
