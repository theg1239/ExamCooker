'use client';
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchQuery?: string;
  tagsQuery?: string;
  typeQuery?: string;
  examType?: string;
  slot?: string;
  year?: string;
  subjectCode?: string;
  subject?: string;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, basePath, searchQuery, tagsQuery, typeQuery, examType, slot, year, subjectCode, subject }) => {
  const maxVisiblePages = 5;

  function getPageNumbers() {
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return { pageNumbers, startPage, endPage };
  }

  const { pageNumbers, startPage, endPage } = getPageNumbers();

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    if (searchQuery) params.set('search', searchQuery);
    if (tagsQuery) params.set('tags', tagsQuery);
    if (typeQuery) params.set('type', typeQuery);
    if (examType) params.set('examType', examType);
    if (slot) params.set('slot', slot);
    if (year) params.set('year', year);
    if (subjectCode) params.set('subjectCode', subjectCode);
    if (subject) params.set('subject', subject);
    return `${basePath}?${params.toString()}`;
  };

  const PageLink = ({ page, children }: { page: number; children: React.ReactNode }) => (
    <Link
      href={getPageUrl(page)}
      className={`px-3 py-1.5 text-sm font-medium ${page === currentPage
        ? 'bg-[#73E8CC] dark:bg-[#232530]'
        : 'bg-[#5fc4e7] hover:bg-opacity-85 dark:bg-[#008A90]'
        }`}
    >
      {children}
    </Link>
  );

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      {currentPage > 1 && (
        <PageLink page={currentPage - 1}>
          <FontAwesomeIcon icon={faAngleLeft} />
        </PageLink>
      )}

      {startPage > 1 && (
        <>
          <PageLink page={1}>1</PageLink>
          {startPage > 2 && <span className="text-gray-500">...</span>}
        </>
      )}

      {pageNumbers.map((number) => (
        <PageLink key={number} page={number}>
          {number}
        </PageLink>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
          <PageLink page={totalPages}>{totalPages}</PageLink>
        </>
      )}

      {currentPage < totalPages && (
        <PageLink page={currentPage + 1}>
          <FontAwesomeIcon icon={faAngleRight} />
        </PageLink>
      )}
    </div>
  );
};

export default Pagination;
