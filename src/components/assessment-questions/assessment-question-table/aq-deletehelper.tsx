
import React from 'react'
import { useParams } from 'next/navigation'
import DeleteAssessmentQuestion from './aq-delete';

interface Params {
    [key: string]: string;
    aid: string;
}

const QuestionDeleteHelper = ({ qid }: { qid: string }) => {
    const { aid } = useParams<Params>();
    return (
        <>
            <DeleteAssessmentQuestion qid={qid} aid={aid} />
        </>
    )
}

export default QuestionDeleteHelper