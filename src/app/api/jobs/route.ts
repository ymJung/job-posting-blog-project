import { NextResponse } from 'next/server'
import { collectJobPostings } from '@/services/jobService'

/**
 * 하는일: 
 * 1. https://jasoseol.com/ 홈페이지의 공고 데이터를 수집하고 
 * 2. 새로운 공고 데이터를 데이터베이스에 저장하고, 
 * 3. 필터링한 공고 리스트를 저장
 * 
 * main page 의 href tag를 조회해서 각 /recruit/{company_id} 단위로 수집하고
 * 최근 1개월안의 새로운 공고 company_id 는  데이터베이스에 저장하고
 * https://jasoseol.com/employment/get.json 을 POST 호출하여 세부내용을 조회한다
 * ex)
 * header:: Content-Type : application/json; charset=utf-8
 * payload:: {  "employment_company_id": {company_id},  "employment_id": 0 }
 * 
 * 반환값을 확인하여 view_count / resume_count  가 기준치 조건을 만족한 공고만 데이터베이스에 저장
 * ex) 
 * \job-posting-blog-project\src\static\ex_get_res.json
 * 
 * @returns 
 */
export async function GET() {
  try {
    const jobs = await collectJobPostings();
    return NextResponse.json({ 
      success: true,
      data: jobs,
      message: `Successfully fetched ${jobs.length} job postings`
    });
  } catch (error) {
    console.error('Error in GET /api/jobs:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch jobs',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}
