'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';
import { ResultTableStudentType } from '@/schemas/result-matrix-schema';
import { CompletionExport } from '@/export/result-export/CompletionExport';


interface ExportButtonProps {
    data: ResultTableStudentType[];
    courseName: string;
}

const CompletionExportButton: React.FC<ExportButtonProps> = ({ data, courseName }) => {
    const handleExport = () => {
        CompletionExport(data, courseName);
    };

    return (
        <Button onClick={handleExport} className="bg-green-500 hover:bg-green-700 text-white">
            <DownloadCloud className="mr-2" />
            Download
        </Button>
    );
};

export default CompletionExportButton;
