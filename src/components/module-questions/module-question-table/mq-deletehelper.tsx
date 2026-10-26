
import React from 'react'
import DeleteModuleQuestion from '@/components/module-questions/module-question-table/mq-delete'
import { useParams } from 'next/navigation'

interface Params {
    [key: string]: string;
    mid: string; 
}

const QuestionDeleteHelper = ({ qid }: { qid: string }) => {
    const { mid } = useParams<Params>();
    return (
        <>
            <DeleteModuleQuestion qid={qid} mid={mid}/>
        </>
    )
}

export default QuestionDeleteHelper