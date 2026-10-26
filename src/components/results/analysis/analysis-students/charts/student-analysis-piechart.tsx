"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

type graphdata = {
    title: string
    score: number | undefined,
    total: number | undefined,
}


export function PieChartComponent({ title, score, total }: { title: string, score: number, total: number, }) {
    const faileddata = total - score
    const chartData = [
        { analysis: "success", ratio: score, fill: "var(--color-success)" },
        { analysis: "failed", ratio: faileddata, fill: "var(--color-failed)" },
    ]

    const chartConfig = {

        success: {
            label: "Score",
            color: "hsl(160 60% 45%)",
        },
        failed: {
            label: "Error",
            color: "hsl(0, 78%, 62%)",
        },
    } satisfies ChartConfig
    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie data={chartData} dataKey="ratio" nameKey="analysis" />
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    <div className="text-green-500 p-1">
                        Score : {score}
                    </div>
                    <div className="text-red-500 p-1">
                        Error : {faileddata}
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}
