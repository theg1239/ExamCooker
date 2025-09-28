"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import FilterComp from './filter/FilterComp';
import { faCaretDown, faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter, useSearchParams } from 'next/navigation';

interface Option {
    id: string;
    label: string;
}

interface CheckboxOptions {
    courses?: Option[];
    slots?: Option[];
    years?: Option[];
}

interface PastPaperMetaDistinct {
    examTypes: string[];
    slots: string[];
    years: string[];
    subjectCodes: string[];
}

interface DropdownProps {
    pageType: 'notes' | 'past_papers' | 'resources' | 'forum' | 'favourites';
    metaDistinct?: PastPaperMetaDistinct;
}

const Dropdown: React.FC<DropdownProps> = ({ pageType, metaDistinct }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const searchParams = useSearchParams();
    const [examType, setExamType] = useState<string>(searchParams.get('examType') || '');
    const [slot, setSlot] = useState<string>(searchParams.get('slot') || '');
    const [year, setYear] = useState<string>(searchParams.get('year') || '');
    const [subjectCode, setSubjectCode] = useState<string>(searchParams.get('subjectCode') || '');
    const [subject, setSubject] = useState<string>(searchParams.get('subject') || '');
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tags = searchParams.getAll('tags');
        if (tags.length > 0) {
            setSelectedTags(tags);
        } else {
            setSelectedTags([]);
        }
    }, [searchParams]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    const checkboxOptions: CheckboxOptions = {
        slots: pageType === 'past_papers' && metaDistinct?.slots?.length
            ? metaDistinct.slots.map(s => ({ id: s, label: s }))
            : [
                { id: 'A1', label: 'A1' }, { id: 'A2', label: 'A2' },
                { id: 'B1', label: 'B1' }, { id: 'B2', label: 'B2' },
                { id: 'C1', label: 'C1' }, { id: 'C2', label: 'C2' },
                { id: 'D1', label: 'D1' }, { id: 'D2', label: 'D2' },
                { id: 'E1', label: 'E1' }, { id: 'E2', label: 'E2' },
                { id: 'F1', label: 'F1' }, { id: 'F2', label: 'F2' },
                { id: 'G1', label: 'G1' }, { id: 'G2', label: 'G2' },
            ],
    };

    const handleSelectionChange = useCallback((category: keyof CheckboxOptions, selection: string[]) => {
        const newTags = Array.from(new Set([
            ...selectedTags.filter(tag => !checkboxOptions[category]?.some(option => option.label === tag)),
            ...selection
        ]));
        setSelectedTags(newTags);
        updateURL(newTags);
    }, [selectedTags, checkboxOptions]);

    const updateURL = useCallback((tags: string[]) => {
        const params = new URLSearchParams(searchParams);
        params.delete('tags');
        tags.forEach(tag => params.append('tags', tag));
        const newURL = `/${pageType}?${params.toString()}`;
        router.push(newURL);
    }, [searchParams, router, pageType]);

    const applyMetaFilters = () => {
        const params = new URLSearchParams(searchParams.toString());
        function setOrDelete(key: string, value: string) {
            if (value) params.set(key, value); else params.delete(key);
        }
        setOrDelete('examType', examType.toUpperCase());
        setOrDelete('slot', slot.toUpperCase());
        setOrDelete('year', year);
        setOrDelete('subjectCode', subjectCode.toUpperCase());
        setOrDelete('subject', subject);
        params.set('page', '1');
        const newURL = `/${pageType}?${params.toString()}`;
        router.push(newURL);
        setIsOpen(false);
    };

    const clearMetaFilters = () => {
        setExamType(''); setSlot(''); setYear(''); setSubjectCode(''); setSubject('');
        const params = new URLSearchParams(searchParams.toString());
        ['examType','slot','year','subjectCode','subject'].forEach(k => params.delete(k));
        params.set('page','1');
        router.push(`/${pageType}?${params.toString()}`);
    };

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="inline-flex items-center justify-center w-full border-black dark:border-[#D5D5D5] border-2 text-lg font-bold px-4 py-2 bg-[#5FC4E7] dark:bg-[#7D7467]/20"
            >
                Filter
                {isOpen ? <FontAwesomeIcon icon={faCaretUp} className="ml-2" /> : <FontAwesomeIcon icon={faCaretDown} className="ml-2" />}
            </button>
            <div className={`hide-scrollbar flex flex-col gap-4 sm:flex-row sm:space-x-6 justify-start items-start absolute left-0 mt-2 w-[85vw] sm:w-auto sm:max-w-[1200px] p-4 border-2 border-black dark:border-white bg-[#4AD0FF] dark:bg-[#232530] z-50 overflow-auto rounded-md shadow-xl ${isOpen ? '' : 'hidden'}`}>
                {checkboxOptions.slots && (
                    <div className="min-w-[180px]">
                        <FilterComp
                            title="Slots"
                            options={checkboxOptions.slots}
                            onSelectionChange={(selection) => handleSelectionChange('slots', selection)}
                            selectedOptions={selectedTags.filter(tag => checkboxOptions.slots!.some(option => option.label === tag))}
                            isSlotCategory={true}
                        />
                    </div>
                )}
                {/* Metadata Filters (only past_papers) */}
                {pageType === 'past_papers' && (
                    <div className="flex flex-col gap-2 min-w-[260px]">
                        <span className="font-bold text-lg">Paper Metadata</span>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold">Exam</label>
                                <select value={examType} onChange={e => setExamType(e.target.value)} className="px-2 py-1 bg-white text-black text-sm">
                                    <option value="">Any</option>
                                    {metaDistinct?.examTypes.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold">Slot</label>
                                <select value={slot} onChange={e => setSlot(e.target.value)} className="px-2 py-1 bg-white text-black text-sm">
                                    <option value="">Any</option>
                                    {metaDistinct?.slots.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold">Year</label>
                                <select value={year} onChange={e => setYear(e.target.value)} className="px-2 py-1 bg-white text-black text-sm">
                                    <option value="">Any</option>
                                    {metaDistinct?.years.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-semibold">Code</label>
                                <select value={subjectCode} onChange={e => setSubjectCode(e.target.value)} className="px-2 py-1 bg-white text-black text-sm">
                                    <option value="">Any</option>
                                    {metaDistinct?.subjectCodes.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-xs font-semibold">Subject Contains</label>
                                <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Operating" className="px-2 py-1 bg-white text-black text-sm" />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <button onClick={applyMetaFilters} className="bg-black text-white dark:bg-[#5FC4E7] dark:text-black px-3 py-1 text-sm font-semibold">Apply</button>
                            <button onClick={clearMetaFilters} className="bg-white text-black border border-black dark:border-white px-3 py-1 text-sm">Clear</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropdown;
