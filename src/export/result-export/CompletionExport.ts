import { ResultTableStudentType } from '@/schemas/result-matrix-schema';
import { formatDate } from '@/lib/utils';
import { unparse } from 'papaparse';

const transformData = (data: ResultTableStudentType[]) => {
    // console.log(JSON.stringify(data))
    const headers: string[] = ['studentname', 'rollnumber', 'email'];
    const transformedData: Record<string, any>[] = [];

    data.forEach(student => {
        const row: Record<string, any> = {
            studentname: student.studentname,
            rollnumber: student.rollnumber,
            batch: student.batch,
            department: student.department,
            section: student.section,
            email: student.email
        };

        student.moduledata.forEach((module, index) => {
            const modulePrefix = `M${index + 1}(${module.modulename})`;
            row[`${modulePrefix}-MCQScore`] = module.mcqscore;
            row[`${modulePrefix}-CodeScore`] = module.codescore;
            row[`${modulePrefix}-TotalScore`] = module.totalscore;
            row[`${modulePrefix}-MaxScore`] = module.maxscore;

            if (transformedData.length === 0) {
                headers.push(
                    `${modulePrefix}-MCQScore`,
                    `${modulePrefix}-CodeScore`,
                    `${modulePrefix}-TotalScore`,
                    `${modulePrefix}-MaxScore`
                );
            }
        });

        row['completionpercentage'] = student.completionpercentage;
        transformedData.push(row);
    });

    headers.push('completionpercentage');
    return { headers, transformedData };
};

export const CompletionExport = (data: ResultTableStudentType[], courseName: string): void => {
    const { headers, transformedData } = transformData(data);
    const csv = unparse({ fields: headers, data: transformedData });
    const formattedDate = formatDate(new Date(), "-"); // DD-MM-YYYY in app timezone (Asia/Kolkata)
    const filename = `${courseName}-${formattedDate}.csv`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
