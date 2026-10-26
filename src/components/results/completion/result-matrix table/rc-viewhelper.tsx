"use client"

import { BarChart2, FileDown, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { usePDF, Margin } from "react-to-pdf"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from '@/lib/utils';

// Mock type for demonstration - replace with your actual type
type ResultTableModuleType = {
    modulename: string
    totalscore: number
    maxscore: number
    errors: number
    compiles: number
    time: number
}

const RCViewHelper = ({
    mdata,
    name,
    rollnumber,
}: {
    mdata: ResultTableModuleType[]
    name: string
    rollnumber: string
}) => {
    const formattedDate = formatDate(new Date(), "-")
    const { toPDF, targetRef } = usePDF({
        filename: `${name}-${rollnumber}-${formattedDate}.pdf`,
        page: {
            margin: Margin.SMALL,
            format: "letter",
            orientation: "landscape",
        },
        canvas: {
            mimeType: "image/jpeg",
            qualityRatio: 1,
        },
    })

    // Add safety check for empty data
    if (!mdata || mdata.length === 0) {
        return (
            <Dialog>
                <DialogTrigger className="bg-primary border p-1 rounded-md text-white font-bold hover:bg-primary/90 transition-colors">
                    <BarChart2 />
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-md">
                    <div className="p-6 text-center">
                        <p>No data available to display charts.</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    // Process mdata to convert time to hours for overall charts
    const processedMdata = mdata.map((item) => ({
        ...item,
        time: item.time / 60, // Convert minutes to hours
    }))

    // console.log(processedMdata)

    // Prepare data for different chart types
    const scoreData = mdata.map((item) => ({
        modulename: item.modulename,
        totalscore: item.totalscore,
        maxscore: item.maxscore,
        percentage: Math.round((item.totalscore / item.maxscore) * 100),
    }))

    const performanceData = mdata.map((item) => ({
        modulename: item.modulename,
        errors: item.errors,
        compiles: item.compiles,
        successRate: item.compiles > 0 ? Math.round(((item.compiles - item.errors) / item.compiles) * 100) : 0,
    }))

    const timeData = mdata.map((item) => ({
        modulename: item.modulename,
        time: item.time / 60, // Convert minutes to hours for chart data
    }))

    const scoreChartConfig = {
        totalscore: {
            label: "Total Score",
            color: "hsl(270, 100%, 50%)", // Original purple color
        },
        maxscore: {
            label: "Maximum Score",
            color: "hsl(210, 40%, 80%)", // Keep this light gray for max score
        },
        percentage: {
            label: "Percentage",
            color: "hsl(270, 100%, 50%)", // Same as totalscore
        },
    } satisfies ChartConfig

    const performanceChartConfig = {
        errors: {
            label: "Errors",
            color: "hsl(0, 78%, 62%)", // Original red color
        },
        compiles: {
            label: "Compiles",
            color: "hsl(24, 100%, 67%)", // Original orange color
        },
        successRate: {
            label: "Success Rate %",
            color: "hsl(24, 100%, 67%)", // Use compiles color for success rate
        },
    } satisfies ChartConfig

    const timeChartConfig = {
        time: {
            label: "Time (Hours)", // Updated label
            color: "hsl(187, 78%, 55%)", // Original cyan color
        },
    } satisfies ChartConfig

    const overallChartConfig = {
        totalscore: {
            label: "Total Score",
            color: "hsl(270, 100%, 50%)",
        },
        errors: {
            label: "Errors",
            color: "hsl(0, 78%, 62%)",
        },
        compiles: {
            label: "Compiles",
            color: "hsl(24, 100%, 67%)",
        },
        time: {
            label: "Time",
            color: "hsl(187, 78%, 55%)",
        },
    } satisfies ChartConfig

    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props

        // Add safety checks
        if (!payload || !payload.value) {
            return null
        }

        const text = payload.value.toString()
        const words = text.split(/[\s:]+/).filter((word: any) => word.length > 0)

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="#666" fontSize="12">
                    {words.map((word: string, index: number) => (
                        <tspan key={index} x="0" dy={index === 0 ? "1.2em" : "1.2em"}>
                            {word}
                        </tspan>
                    ))}
                </text>
            </g>
        )
    }

    // Function to format minutes into HH:MM
    const formatMinutesToHHMM = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const remainingMinutes = Math.round(minutes % 60) // Round minutes to avoid floating point issues
        return `${String(hours).padStart(2, "0")}:${String(remainingMinutes).padStart(2, "0")}`
    }

    // Function to format hours (decimal) into HH:MM
    const formatHoursToHHMM = (hours: number) => {
        const totalMinutes = hours * 60
        return formatMinutesToHHMM(totalMinutes)
    }

    // Calculate summary statistics
    const totalModules = mdata.length
    const averageScore = mdata.reduce((sum, item) => sum + (item.totalscore / item.maxscore) * 100, 0) / totalModules
    const totalErrors = mdata.reduce((sum, item) => sum + item.errors, 0)
    const totalTimeMinutes = mdata.reduce((sum, item) => sum + item.time, 0) // Sum of original minutes
    const totalTimeFormatted = formatMinutesToHHMM(totalTimeMinutes) // Format total minutes to HH:MM

    const CustomTimeTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const timeValue = payload[0].value // This value is now in hours (decimal)
            const timeFormatted = formatHoursToHHMM(timeValue) // Format hours (decimal) to HH:MM
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm">
                        <span
                            className="inline-block w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: payload[0].color }}
                        ></span>
                        Time: {timeFormatted}
                    </p>
                </div>
            )
        }
        return null
    }

    const CustomOverallTooltip = ({ active, payload, label, config }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{label}</p>
                    {payload.map((entry: any, index: number) => {
                        const { dataKey, value, color } = entry
                        const itemConfig = config[dataKey]
                        let displayValue = value

                        if (dataKey === "time") {
                            displayValue = formatHoursToHHMM(value) // Now value is in hours, so format from hours
                        }

                        return (
                            <p key={`item-${index}`} className="text-sm">
                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                                {itemConfig?.label || dataKey}: {displayValue}
                            </p>
                        )
                    })}
                </div>
            )
        }
        return null
    }

    return (
        <>
            <Dialog>
                <DialogTrigger className="bg-primary border p-1 rounded-md text-white font-bold hover:bg-primary/90 transition-colors">
                    <BarChart2 />
                </DialogTrigger>
                <DialogHeader className="hidden"></DialogHeader>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[100vw] w-full h-screen flex justify-center items-center p-4">
                    <DialogTitle className="sr-only">Performance Analysis Dashboard</DialogTitle>
                    <div className="w-full h-[95%] overflow-auto">
                        <Card className="w-full min-h-full" ref={targetRef}>
                            <CardHeader className="flex flex-row justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl">
                                        {name} : {rollnumber}
                                    </CardTitle>
                                    <CardDescription className="text-lg">Performance Analysis Dashboard</CardDescription>
                                </div>
                                <Button onClick={() => toPDF()} className="bg-red-700 text-white hover:bg-red-800 p-2 gap-2">
                                    <FileDown className="h-5 w-5" />
                                </Button>
                            </CardHeader>

                            {/* Summary Cards (always visible at the top) */}
                            <div className="px-6 pb-4">
                                <div className="grid grid-cols-4 gap-4 mb-6">
                                    <Card className="h-full w-full flex justify-center items-center py-6">
                                        <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                                            <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                                <p className="text-xl w-1/2">Avg Score</p>
                                            </div>
                                            <div className="h-full w-[35%] flex items-center justify-start px-4">
                                                <p className="text-2xl font-semibold text-green-600 w-1/2">{averageScore.toFixed(1)}%</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="h-full w-full flex justify-center items-center py-6">
                                        <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                                            <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                                            <TrendingUp className="h-8 w-8 text-blue-600" />
                                                <p className="text-xl w-1/2">Modules</p>
                                            </div>
                                            <div className="h-full w-[35%] flex items-center justify-end px-4 ">
                                                <p className="text-2xl font-semibold text-blue-600 w-1/2">{totalModules}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    
                                    <Card className="h-full w-full flex justify-center items-center py-6">
                                        <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                                            <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                                            <AlertCircle className="h-8 w-8 text-red-600" />
                                                <p className="text-xl w-1/2">Total Errors</p>
                                            </div>
                                            <div className="h-full w-[35%] flex items-center justify-end px-4 ">
                                                <p className="text-2xl font-semibold text-red-600 w-1/2">{totalErrors}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="h-full w-full flex justify-center items-center py-6">
                                        <CardContent className="p-0 h-full w-full flex items-center justify-center gap-2">
                                            <div className="h-full w-[65%] flex items-center justify-center flex-row gap-4">
                                            <Clock className="h-8 w-8 text-cyan-600" />
                                                <p className="text-xl w-1/2">Total Time</p>
                                            </div>
                                            <div className="h-full w-[35%] flex items-center justify-start px-4 ">
                                                <p className="text-2xl font-semibold text-cyan-600 w-1/2">{totalTimeFormatted}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <CardContent className="w-full">
                                <Tabs defaultValue="overall" className="w-full">
                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="overall">Overall Analysis</TabsTrigger>
                                        <TabsTrigger value="scores">Score Analysis</TabsTrigger>
                                        <TabsTrigger value="performance">Error Analysis</TabsTrigger>
                                        <TabsTrigger value="time">Time Analysis</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="overall" className="space-y-6">
                                        {/* Original Combined Data for Charts */}
                                        <div className="space-y-6">
                                            {/* Original Line Chart */}
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Performance Trends</h3>
                                                <ChartContainer config={overallChartConfig} className="h-96 w-full">
                                                    <LineChart
                                                        accessibilityLayer={true}
                                                        data={processedMdata}
                                                        margin={{
                                                            left: 50,
                                                            right: 50,
                                                            top: 20,
                                                            bottom: 60,
                                                        }}
                                                    >
                                                        <CartesianGrid vertical={false} />
                                                        <XAxis
                                                            dataKey="modulename"
                                                            axisLine={true}
                                                            tickMargin={8}
                                                            tick={<CustomXAxisTick />}
                                                            interval={0}
                                                        />
                                                        <YAxis domain={[0, Math.max(...processedMdata.map(d => d.maxscore))]} /> {/* Set domain based on maxscore */}
                                                        <ChartTooltip
                                                            cursor={false}
                                                            content={<CustomOverallTooltip config={overallChartConfig} />}
                                                        />
                                                        <ChartLegend content={<ChartLegendContent />} />
                                                        <Line
                                                            dataKey="totalscore"
                                                            type="natural"
                                                            stroke="var(--color-totalscore)"
                                                            strokeWidth={2}
                                                            dot={{
                                                                fill: "var(--color-totalscore)",
                                                            }}
                                                            activeDot={{
                                                                r: 6,
                                                            }}
                                                        />
                                                        <Line
                                                            dataKey="errors"
                                                            type="natural"
                                                            stroke="var(--color-errors)"
                                                            strokeWidth={2}
                                                            dot={{
                                                                fill: "var(--color-errors)",
                                                            }}
                                                            activeDot={{
                                                                r: 6,
                                                            }}
                                                        />
                                                        <Line
                                                            dataKey="compiles"
                                                            type="natural"
                                                            stroke="var(--color-compiles)"
                                                            strokeWidth={2}
                                                            dot={{
                                                                fill: "var(--color-compiles)",
                                                            }}
                                                            activeDot={{
                                                                r: 6,
                                                            }}
                                                        />
                                                        <Line
                                                            dataKey="time"
                                                            type="natural"
                                                            stroke="var(--color-time)"
                                                            strokeWidth={2}
                                                            dot={{
                                                                fill: "var(--color-time)",
                                                            }}
                                                            activeDot={{
                                                                r: 6,
                                                            }}
                                                        />
                                                    </LineChart>
                                                </ChartContainer>
                                            </div>

                                            {/* Original Bar Chart */}
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-semibold">Performance Comparison</h3>
                                                <ChartContainer config={overallChartConfig} className="h-96 w-full">
                                                    <BarChart
                                                        accessibilityLayer={true}
                                                        data={processedMdata}
                                                        margin={{
                                                            left: 50,
                                                            right: 50,
                                                            top: 10,
                                                            bottom: 60,
                                                        }}
                                                    >
                                                        <CartesianGrid vertical={false} />
                                                        <XAxis
                                                            dataKey="modulename"
                                                            tickLine={false}
                                                            tickMargin={10}
                                                            axisLine={true}
                                                            tick={<CustomXAxisTick />}
                                                            interval={0}
                                                        />
                                                        <YAxis domain={[0, Math.max(...processedMdata.map(d => d.maxscore))]} /> {/* Set domain based on maxscore */}
                                                        <ChartTooltip
                                                            cursor={false}
                                                            content={<CustomOverallTooltip config={overallChartConfig} />}
                                                        />
                                                        <ChartLegend content={<ChartLegendContent />} className="mt-4" />
                                                        <Bar dataKey="totalscore" fill="var(--color-totalscore)" radius={4} />
                                                        <Bar dataKey="errors" fill="var(--color-errors)" radius={4} />
                                                        <Bar dataKey="compiles" fill="var(--color-compiles)" radius={4} />
                                                        <Bar dataKey="time" fill="var(--color-time)" radius={4} />
                                                    </BarChart>
                                                </ChartContainer>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="scores" className="space-y-6">
                                        {/* Score Bar Chart */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Score Comparison</h3>
                                            <ChartContainer config={scoreChartConfig} className="h-80 w-full">
                                                <BarChart
                                                    accessibilityLayer={true}
                                                    data={scoreData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={true}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    <Bar dataKey="maxscore" fill="var(--color-maxscore)" radius={4} name="Maximum Score" />
                                                    <Bar dataKey="totalscore" fill="var(--color-totalscore)" radius={4} name="Score Achieved" />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>

                                        {/* Percentage Line Chart */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Score Percentage Trend</h3>
                                            <ChartContainer config={scoreChartConfig} className="h-80 w-full">
                                                <LineChart
                                                    accessibilityLayer={true}
                                                    data={scoreData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        axisLine={true}
                                                        tickMargin={8}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis domain={[0, 100]} />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    <Line
                                                        dataKey="percentage"
                                                        type="monotone"
                                                        stroke="var(--color-percentage)"
                                                        strokeWidth={3}
                                                        dot={{ fill: "var(--color-percentage)", r: 6 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="performance" className="space-y-6">
                                        {/* Performance Bar Chart */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Compilation Performance</h3>
                                            <ChartContainer config={performanceChartConfig} className="h-80 w-full">
                                                <BarChart
                                                    accessibilityLayer={true}
                                                    data={performanceData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={true}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                                    <ChartLegend content={<ChartLegendContent />} />
                                                    <Bar dataKey="compiles" fill="var(--color-compiles)" radius={4} name="Total Attempts" />
                                                    <Bar dataKey="errors" fill="var(--color-errors)" radius={4} name="Errors" />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>

                                        {/* Success Rate Area Chart */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Success Rate Trend</h3>
                                            <ChartContainer config={performanceChartConfig} className="h-80 w-full">
                                                <AreaChart
                                                    accessibilityLayer={true}
                                                    data={performanceData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        axisLine={true}
                                                        tickMargin={8}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis domain={[0, 100]} />
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                    <Area
                                                        dataKey="successRate"
                                                        type="monotone"
                                                        fill="var(--color-successRate)"
                                                        fillOpacity={0.4}
                                                        stroke="var(--color-successRate)"
                                                        strokeWidth={2}
                                                    />
                                                </AreaChart>
                                            </ChartContainer>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="time" className="space-y-6">
                                        {/* Time Analysis */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Time Spent per Module (Hours)</h3>
                                            <ChartContainer config={timeChartConfig} className="h-80 w-full">
                                                <BarChart
                                                    accessibilityLayer={true}
                                                    data={timeData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={true}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis tickFormatter={formatHoursToHHMM} />
                                                    <ChartTooltip cursor={false} content={<CustomTimeTooltip />} />
                                                    <Bar dataKey="time" fill="var(--color-time)" radius={4} name="Time (hours)" />
                                                </BarChart>
                                            </ChartContainer>
                                        </div>

                                        {/* Time Trend Line Chart */}
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold">Time Progression</h3>
                                            <ChartContainer config={timeChartConfig} className="h-80 w-full">
                                                <LineChart
                                                    accessibilityLayer={true}
                                                    data={timeData}
                                                    margin={{ left: 20, right: 20, top: 20, bottom: 60 }}
                                                >
                                                    <CartesianGrid vertical={false} />
                                                    <XAxis
                                                        dataKey="modulename"
                                                        axisLine={true}
                                                        tickMargin={8}
                                                        tick={<CustomXAxisTick />}
                                                        interval={0}
                                                    />
                                                    <YAxis tickFormatter={formatHoursToHHMM} />
                                                    <ChartTooltip cursor={false} content={<CustomTimeTooltip />} />
                                                    <Line
                                                        dataKey="time"
                                                        type="monotone"
                                                        stroke="var(--color-time)"
                                                        strokeWidth={3}
                                                        dot={{ fill: "var(--color-time)", r: 6 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default RCViewHelper
