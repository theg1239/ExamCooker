import React from 'react';
import Fuse from 'fuse.js';
import { PastPaper, PrismaClient, Tag } from "@prisma/client";
import { redirect } from 'next/navigation';
import Pagination from '../../components/Pagination';
import PastPaperCard from '../../components/PastPaperCard';
import SearchBar from '../../components/SearchBar';
import UploadButtonPaper from '../../components/uploadButtonPaper';
import Dropdown from '../../components/FilterComponent';
import { parsePastPaperTitle } from '@/lib/parsePastPaperTitle';

const SCORE_THRESHOLD = 0.6;

type PastPaperWithTags = PastPaper & {
    tags: Tag[];
};

function validatePage(page: number, totalPages: number): number {
    if (isNaN(page) || page < 1) {
        return 1;
    }
    if (page > totalPages && totalPages > 0) {
        return totalPages;
    }
    return page;
}

function performSearch(query: string, dataSet: PastPaperWithTags[]) {
    const options = {
        includeScore: true,
        keys: [
            { name: 'title', weight: 1 },
            { name: 'tags.name', weight: 2 }
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
        findAllMatches: true,
        useExtendedSearch: true,
    };
    const fuse = new Fuse(dataSet, options);
    const searchResults = fuse.search({
        $or: [
            { title: query },
            { 'tags.name': query },
            { title: `'${query}` }
        ]
    });
    return searchResults
        .filter((fuseResult) => (fuseResult.score || 1) < SCORE_THRESHOLD)
        .map((fuseResult) => fuseResult.item);
}

async function pastPaperPage({ searchParams }: { searchParams: { page?: string, search?: string, tags?: string | string[], examType?: string, slot?: string, year?: string, subjectCode?: string, subject?: string } }) {
    const prisma = new PrismaClient();
    const pageSize = 9;
    const search = searchParams.search || '';
    const examTypeFilter = (searchParams.examType || '').toUpperCase();
    const slotFilter = (searchParams.slot || '').toUpperCase();
    const yearFilter = searchParams.year || '';
    const subjectCodeFilter = (searchParams.subjectCode || '').toUpperCase();
    const subjectNameFilter = (searchParams.subject || '').toLowerCase();
    const page = parseInt(searchParams.page || '1', 10);
    const tags: string[] = Array.isArray(searchParams.tags)
        ? searchParams.tags
        : (searchParams.tags ? searchParams.tags.split(',') : []);

    let filteredPastPapers = await prisma.pastPaper.findMany({
        where: {
            isClear: true,
            ...(tags.length > 0 && {
                tags: {
                    some: {
                        name: {
                            in: tags,
                        },
                    },
                },
            }),
        },
        include: {
            tags: true,
        },
        orderBy: {
            createdAt: 'desc',
        }
    });
    if (search) {
        filteredPastPapers = performSearch(search, filteredPastPapers);
    }

    // In-memory metadata extraction & filtering (no schema changes)
    const parsed = filteredPastPapers.map(pp => ({ original: pp, meta: parsePastPaperTitle(pp.title) }));

    // Build distinct value sets for UI selects BEFORE applying metadata filters
    const distinct = {
        examTypes: Array.from(new Set(parsed.map(p => p.meta.examType).filter(Boolean))) as string[],
        slots: Array.from(new Set(parsed.map(p => p.meta.slot).filter(Boolean))) as string[],
        years: Array.from(new Set(parsed.map(p => p.meta.academicYear).filter(Boolean))) as string[],
        subjectCodes: Array.from(new Set(parsed.map(p => p.meta.subjectCode).filter(Boolean))) as string[],
    };

    const metaFiltered = parsed.filter(item => {
        const m = item.meta;
        if (examTypeFilter && m.examType !== examTypeFilter) return false;
        if (slotFilter && m.slot !== slotFilter) return false;
        if (yearFilter && m.academicYear !== yearFilter) return false;
        if (subjectCodeFilter && m.subjectCode !== subjectCodeFilter) return false;
        if (subjectNameFilter && (!m.subjectName || !m.subjectName.toLowerCase().includes(subjectNameFilter))) return false;
        return true;
    });

    filteredPastPapers = metaFiltered.map(p => p.original);

    const totalCount = filteredPastPapers.length;
    const totalPages = Math.ceil(totalCount / pageSize);

    const validatedPage = validatePage(page, totalPages);

    const startIndex = (validatedPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPastPapers = filteredPastPapers.slice(startIndex, endIndex);

    if (validatedPage !== page) {
        const params = new URLSearchParams();
        params.set('page', String(validatedPage));
        if (search) params.set('search', search);
        if (tags.length > 0) params.set('tags', tags.join(','));
        if (examTypeFilter) params.set('examType', examTypeFilter);
        if (slotFilter) params.set('slot', slotFilter);
        if (yearFilter) params.set('year', yearFilter);
        if (subjectCodeFilter) params.set('subjectCode', subjectCodeFilter);
        if (subjectNameFilter) params.set('subject', subjectNameFilter);
        redirect(`/past_papers?${params.toString()}`);
    }

    return (
        <div className="p-8 transition-colors flex flex-col min-h-screen items-center text-black dark:text-[#D5D5D5]">
            <h1 className="text-center mb-4">Past Papers</h1>
            <div className="hidden w-5/6 lg:w-1/2 md:flex items-center justify-center p-4 space-y-4 sm:space-y-0 sm:space-x-4 pt-2">
                <Dropdown pageType='past_papers' metaDistinct={distinct} />
                <SearchBar pageType="past_papers" initialQuery={search} />
                <UploadButtonPaper />
            </div>

            <div className='flex-col w-5/6 md:hidden space-y-4'>
                <SearchBar pageType="past_papers" initialQuery={search} />
                <div className='flex justify-between items-center gap-4'>
                    <Dropdown pageType='past_papers' metaDistinct={distinct} />
                    <UploadButtonPaper />
                </div>
            </div>


            {tags.length > 0 && (
                <div className="flex justify-center mb-4">
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex justify-center">
                <div className="w-fit grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6  place-content-center">
                    {paginatedPastPapers.length > 0 ? (
                        paginatedPastPapers.map((eachPaper, index) => (
                            <div key={eachPaper.id} className="flex justify-center">
                                <PastPaperCard pastPaper={eachPaper} index={index} />
                            </div>
                        ))
                    ) : (
                        <p className="col-span-3 text-center">
                            {search || tags.length > 0
                                ? "No past papers found matching your search or selected tags."
                                : "No past papers found."}
                        </p>
                    )}
                </div>
            </div>
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={validatedPage}
                        totalPages={totalPages}
                        basePath="/past_papers"
                        searchQuery={search}
                        tagsQuery={tags.join(',')}
                        examType={examTypeFilter || undefined}
                        slot={slotFilter || undefined}
                        year={yearFilter || undefined}
                        subjectCode={subjectCodeFilter || undefined}
                        subject={subjectNameFilter || undefined}
                    />
                </div>
            )}
        </div>
    );
}

export default pastPaperPage;

