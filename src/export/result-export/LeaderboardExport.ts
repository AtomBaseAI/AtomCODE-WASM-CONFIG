import { formatDate } from '@/lib/utils';
import { unparse } from 'papaparse';

export interface LeaderboardRow {
    Rank: number | undefined;
    Rollnumber: string | null;
    StudentName: string | null;
    TotalModules: number;
    TotalScore: number;
    McqScore: number;
    CodeScore: number;
    TotalCompiles: number;
    TotalErrors: number;
    TotalTime: string;
}

const HEADERS: string[] = [
    'Rank',
    'Rollnumber',
    'StudentName',
    'Modules Completed',
    'Total Score',
    'MCQ Score',
    'Code Score',
    'Compiles',
    'Errors',
    'Total Time',
];

/** Turns a course title into a safe file-name fragment (no slashes, etc.). */
const sanitizeFilename = (name: string): string =>
    name
        .trim()
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 60) || 'Course';

export const LeaderboardExport = (
    data: LeaderboardRow[],
    courseName: string | null | undefined
): void => {
    const rows = data.map(leader => ({
        'Rank': leader.Rank ?? '',
        'Rollnumber': leader.Rollnumber ?? '',
        'StudentName': leader.StudentName ?? '',
        'Modules Completed': leader.TotalModules,
        'Total Score': leader.TotalScore,
        'MCQ Score': leader.McqScore,
        'Code Score': leader.CodeScore,
        'Compiles': leader.TotalCompiles,
        'Errors': leader.TotalErrors,
        'Total Time': leader.TotalTime,
    }));

    const csv = unparse({ fields: HEADERS, data: rows });
    // BOM so Excel opens UTF-8 names correctly
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const formattedDate = formatDate(new Date(), "-"); // DD-MM-YYYY in app timezone (Asia/Kolkata)
    const filename = `${sanitizeFilename(courseName ?? 'Course')}-Leaderboard-${formattedDate}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
