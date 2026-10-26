
import React from 'react'
import { useParams } from 'next/navigation'
import DeleteCourseStudent from '@/components/course-student/course-student-table/cs-delete';

interface Params {
    [key: string]: string;
    cid: string;
}

const StudentDeleteHelper = ({ uid }: { uid: string }) => {
    const { cid } = useParams<Params>();
    return (
        <>
            <DeleteCourseStudent uid={uid} cid={cid} />
        </>
    )
}

export default StudentDeleteHelper