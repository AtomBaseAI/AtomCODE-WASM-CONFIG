'use client';
import React from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { DownloadCloud } from 'lucide-react';

interface ExportCSVProps {
    data: any[];
    fileName: string;
}

const MExport: React.FC<ExportCSVProps> = ({ data, fileName }) => {
    const exportToCSV = () => {
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button className="bg-orange-500 hover:bg-orange-600 text-white p-2" onClick={exportToCSV}>
            <DownloadCloud/>
        </Button>
    );
};

export default MExport;
