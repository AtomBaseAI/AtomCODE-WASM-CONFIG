
import React from 'react'
import { useParams } from 'next/navigation'
import DeleteCourseStaff from '@/components/course-staff/course-staff-table/cstf-delete';

interface Params {
    [key: string]: string;
    cid: string;
}

const StaffDeleteHelper = ({ uid }: { uid: string }) => {
    const { cid } = useParams<Params>();
    return (
        <>
            <DeleteCourseStaff uid={uid} cid={cid} />
        </>
    )
}

export default StaffDeleteHelper