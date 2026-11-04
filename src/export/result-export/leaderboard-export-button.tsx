'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import { LeaderboardExport, LeaderboardRow } from '@/export/result-export/LeaderboardExport';

interface LeaderboardExportButtonProps {
    data: LeaderboardRow[];
    courseName: string | null | undefined;
    disabled?: boolean;
}

const LeaderboardExportButton: React.FC<LeaderboardExportButtonProps> = ({ data, courseName, disabled }) => {
    const handleExport = () => {
        LeaderboardExport(data, courseName);
    };

    return (
        <Button
            onClick={handleExport}
            disabled={disabled || data.length === 0}
            aria-label={`Export leaderboard for ${courseName ?? 'course'} as CSV`}
            className="bg-green-500 hover:bg-green-700 text-white"
        >
            <DownloadCloud className="mr-2" />
            Download
        </Button>
    );
};

export default LeaderboardExportButton;
