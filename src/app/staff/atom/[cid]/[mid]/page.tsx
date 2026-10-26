import { getModuleQuestionsByModuleId } from '@/data/modules';


import CodeView from '@/components/code/code-view';
const CodeMain = async ({ params }: { params: Promise<{ cid, mid }> }) => {
    const { mid, cid } = await params;


    const ModuleQuestions = await getModuleQuestionsByModuleId(mid) || [];

    return (
        <>
            <CodeView questions={ModuleQuestions} mid={mid} cid={cid} />
        </>
    )
}

export default CodeMain