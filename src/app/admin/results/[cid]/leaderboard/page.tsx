
import BackBtn from "@/components/backbtn"
import { RankAnimation } from "@/components/results/leaderboard/rank-animations"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { leaderboardData } from "@/data/results"

const CourseLeaderboard = async ({ params }: { params: Promise<{ cid: string}> }) => {
    const { cid } = await params
    // const courseid = parseInt(cid, 10)
    const LeaderboardDatax = await leaderboardData(cid)
    if (!LeaderboardDatax || LeaderboardDatax.length === 0) {
        return (
            <>
                No Data Available!
            </>
        );
    }
    return (
        <>
            <div className="flex h-full flex-1 flex-col space-y-2 p-4 md:p-8 w-full justify-center items-center">
                <div className="flex flex-wrap items-center justify-between gap-2 space-y-2 w-full">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">
                            Course Leaderboard
                        </h2>
                        <p className="text-muted-foreground">
                            Completed Students : {LeaderboardDatax?.length}
                        </p>
                    </div>
                    <div className="flex justify-center items-center gap-x-4">
                        <BackBtn />
                    </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 md:gap-8 h-full w-full">
                    <div className="border shadow-sm rounded-lg p-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[100px]">Rank</TableHead>
                                    <TableHead className="min-w-[100px]">Rollnumber</TableHead>
                                    <TableHead className="min-w-[100px]">Name</TableHead>
                                    <TableHead className="table-cell">Modules Completed</TableHead>
                                    <TableHead className="table-cell">Total Score</TableHead>
                                    <TableHead className="table-cell">MCQ Score</TableHead>
                                    <TableHead className="table-cell">Code Score</TableHead>
                                    <TableHead className="table-cell">Compiles</TableHead>
                                    <TableHead className="table-cell">Errors</TableHead>
                                    <TableHead className="table-cell">Total Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {
                                    LeaderboardDatax.map((leader) => (
                                        <TableRow className="h-14" key={leader.Rank}>
                                            <TableCell className="font-medium">
                                                <RankAnimation rank={leader.Rank} />
                                            </TableCell>
                                            <TableCell className="font-medium">{leader.Rollnumber}</TableCell>
                                            <TableCell className="font-medium">{leader.StudentName}</TableCell>
                                            <TableCell className="table-cell">{leader.TotalModules}</TableCell>
                                            <TableCell className="table-cell">{leader.TotalScore}</TableCell>
                                            <TableCell className="table-cell">{leader.McqScore}</TableCell>
                                            <TableCell className="table-cell">{leader.CodeScore}</TableCell>
                                            <TableCell className="table-cell">{leader.TotalCompiles}</TableCell>
                                            <TableCell className="table-cell">{leader.TotalErrors}</TableCell>
                                            <TableCell className="table-cell">{leader.TotalTime}</TableCell>
                                        </TableRow>
                                    ))
                                }

                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CourseLeaderboard