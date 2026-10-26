import { getModuleQuestionsByModuleId } from '@/data/student/modules';

import CodeView from '@/components/student-role/practice/code/code-view';
import { CircleSlash } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
const getSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}

const CodeMain = async ({ params }: { params: Promise<{ mid: string, cid: string, umid: string }> }) => {
    const { mid, cid, umid } = await params;
    const uid = await getSessionUserID()
    if (uid === null || uid === undefined) {
        return (
            <>
                <div className="w-full h-screen flex flex-col gap-2 justify-center items-center">
                    <div className=" shadow-lg rounded-md overflow-hidden w-[20rem] order-first lg:order-none border hover:border-red-500" >
                        <div className="py-5 px-6 sm:px-8 flex flex-col justify-center items-center gap-4">
                            <CircleSlash className="h-10 w-10 text-red-400" />
                            Session Expired !
                        </div>
                    </div>
                    <Link href='/student/dashboard' className=" w-[20rem] bg-primary hover:bg-primary/80 h-9 rounded-md text-white font-semibold flex justify-center items-center"> Home </Link>
                </div>
            </>
        )
    }
    const ModuleQuestions = await getModuleQuestionsByModuleId(mid, uid) || [];
    return (
        <>
            <CodeView questions={ModuleQuestions} mid={mid} uid={uid} cid={cid} umid={umid} />
        </>
    )
}

export default CodeMain