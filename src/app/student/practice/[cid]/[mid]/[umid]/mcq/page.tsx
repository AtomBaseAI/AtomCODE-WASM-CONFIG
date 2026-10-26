import { getAllMCQByModuleId } from '@/data/student/mcq';
import MCQView from '@/components/student-role/practice/mcq/mcq-view';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { auth } from '@/auth';
import Link from 'next/link';
import { CircleSlash } from 'lucide-react';
import { MCQ } from '@/schemas/student/mcq-schema';

const getSessionUserID = async () => {
    const session = await auth();
    return session?.user?.id
}

const MCQMain = async ({ params }: { params: Promise<{ mid: string, umid: string }> }) => {
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
    const { mid, umid } = await params;
    const ModuleMCQs = (await getAllMCQByModuleId(mid))
        .filter((mcq): mcq is MCQ => mcq.moduleId !== null);

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <MCQView mcqs={ModuleMCQs} mid={mid} uid={uid} umid={umid} />
            </ContextMenuTrigger>
            <ContextMenuContent>
                <ContextMenuItem>Help?</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
};

export default MCQMain;
