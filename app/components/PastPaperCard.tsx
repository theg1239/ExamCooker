"use client";
import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faHeart } from '@fortawesome/free-solid-svg-icons';
import { useFavoritesStore } from '../actions/StoredFavourites';

interface PastPaperCardProps {
    pastPaper: {
        id: string;
        title: string;
    };
    index: number;
    openInNewTab?: boolean;
    onApprove?: () => Promise<void>;
}

function removePdfExtension(title: string) {
    return title.replace(/\.pdf$/, '');
}

function PastPaperCard({ pastPaper, openInNewTab = false }: PastPaperCardProps) {
    const { toggleFavorite, isFavorite } = useFavoritesStore();

    const handleToggleFav = () => {
        toggleFavorite({ id: pastPaper.id, type: 'pastPaper' });
    };

    return (
        <div className="max-w-sm w-full h-full text-black dark:text-[#D5D5D5] ">
            <div className="hover:shadow-xl px-5 py-6 w-full text-center bg-[#5FC4E7] dark:bg-[#ffffff]/10 lg:dark:bg-[#0C1222] dark:border-b-[#3BF4C7] dark:lg:border-b-[#ffffff]/20 dark:border-[#ffffff]/20 border-2 border-[#5FC4E7] hover:border-b-[#ffffff] hover:border-b-2 dark:hover:border-b-[#3BF4C7]  dark:hover:bg-[#ffffff]/10 transition duration-200 transform hover:scale-105 max-w-96">
                <div className="bg-[#d9d9d9] w-full h-44 overflow-hidden">
                    <img
                        src="https://topperworld.in/media/2022/11/c-sc.png"
                        alt={pastPaper.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="mb-2 w-full whitespace-nowrap overflow-hidden text-ellipsis">
                    {removePdfExtension(pastPaper.title)}
                </div>
                <div className="flex justify-between items-center space-x-4">
                    <div></div>
                    <Link
                        href={`/past_papers/${pastPaper.id}`}
                        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="py-1 px-2 text-sm flex items-center bg-white dark:bg-[#3D414E]"
                    >
                        <span className="mr-1 flex items-center justify-center">
                            <FontAwesomeIcon icon={faEye} />
                        </span>
                        View
                    </Link>
                    <button onClick={handleToggleFav} style={{ color: isFavorite(pastPaper.id, 'pastPaper') ? 'red' : 'lightgrey' }}>
                        <FontAwesomeIcon icon={faHeart} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PastPaperCard;
