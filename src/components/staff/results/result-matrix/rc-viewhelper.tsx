"use client"
import { BarChart2, FileDown, Scroll } from 'lucide-react'
import React from 'react'
import { usePDF, Resolution, Margin, Options } from 'react-to-pdf';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, XAxis, YAxis } from "recharts"
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
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from '@/components/ui/button';
import { ResultTableModuleType } from '@/schemas/result-matrix-schema';
import { formatDate } from '@/lib/utils';


const RCViewHelper = ({ mdata, name, rollnumber }: { mdata: ResultTableModuleType[] , name: string, rollnumber: string }) => {

    const formattedDate = formatDate(new Date(), "-"); // DD-MM-YYYY in app timezone (Asia/Kolkata)
    const { toPDF, targetRef } = usePDF({
        filename: `${name}-${rollnumber}-${formattedDate}.pdf`,
        // resolution: Resolution.EXTREME,
        page: {
            // margin is in MM, default is Margin.NONE = 0
            margin: Margin.SMALL,
            // default is 'A4'
            format: "letter",
            // default is 'portrait'
            orientation: "landscape",
        },
        // canvas: {
        //     // default is 'image/jpeg' for better size performance
        //     mimeType: "image/png",
        //     qualityRatio: 1,
        // },
    });
    const convertedData = mdata.map((item: any) => ({
        ...item,
        time: (item.time / 60).toFixed(2)
    }));
    const chartConfig = {
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
            label: "Time (minutes)",
            color: "hsl(187, 78%, 55%)",
        },
    } satisfies ChartConfig;
    const CustomXAxisTick = (props: any) => {
        const { x, y, payload } = props;
        const text = payload.value;

        // Split the text by colon
        const [firstLine, secondLine] = text.split(":");

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="middle" fill="#666">
                    <tspan x="0" dy="1.2em">{firstLine}</tspan>
                    {secondLine && <tspan x="0" dy="1.2em">{secondLine}</tspan>}
                </text>
            </g>
        );
    };
    return (
        <>
            <Dialog>
                <DialogTrigger className='bg-primary border p-1 rounded-md text-white font-bold'>
                    <BarChart2 />
                </DialogTrigger>
                <DialogContent aria-describedby={undefined} className="sm:max-w-[95vw] w-full max-h-[95vh] flex justify-center overflow-y-auto">
                    <DialogHeader className='w-5/6 my-auto'>
                        <DialogTitle className="sr-only">Modules Matrix Chart</DialogTitle>
                        <Card className='w-full' ref={targetRef}>
                            <CardHeader className='flex flex-row justify-between items-center'>
                                <div>
                                    <CardTitle>{name} : {rollnumber}</CardTitle>
                                    <CardDescription>Modules Matrix</CardDescription>
                                </div>
                                <Button onClick={() => toPDF()} className='bg-red-700 text-white hover:bg-red-800 p-2'><FileDown className='h-6 w-6' /></Button>
                            </CardHeader>
                            <CardContent className='flex justify-center items-center w-full h-[42rem] flex-col gap-6'>
                                <ChartContainer config={chartConfig} className='h-1/2 w-full'>
                                    <LineChart
                                        accessibilityLayer
                                        data={convertedData}
                                        margin={{
                                            left: 50,
                                            right: 50,
                                            top: 20,
                                            bottom: 20
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        {/* <XAxis
                                            dataKey="modulename"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                        /> */}
                                        <XAxis
                                            dataKey="modulename"
                                            axisLine={true}
                                            tickMargin={8}
                                            tick={<CustomXAxisTick />}
                                            interval={0}

                                        />
                                        <YAxis domain={[0, mdata.length ? mdata[0].maxscore : 100]} />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
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
                                {/* <ChartContainer config={chartConfig} className='h-1/2 w-full'>
                                    <AreaChart
                                        accessibilityLayer
                                        data={convertedData}
                                        margin={{
                                            left: 10,
                                            right: 20,
                                            top: 30,
                                            bottom: 10
                                        }}
                                    >
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="modulename"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value.slice(0, 6)}
                                        />

                                        <YAxis />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                        <defs>
                                            <linearGradient id="fillTotalscore" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-totalscore)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-totalscore)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                            <linearGradient id="fillErrors" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-errors)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-errors)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                            <linearGradient id="fillCompiles" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-compiles)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-compiles)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                            <linearGradient id="fillTime" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor="var(--color-time)"
                                                    stopOpacity={0.8}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="var(--color-time)"
                                                    stopOpacity={0.1}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            dataKey="errors"
                                            type="natural"
                                            fill="url(#fillErrors)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-errors)"
                                            stackId="a"
                                        />
                                        <Area
                                            dataKey="compiles"
                                            type="natural"
                                            fill="url(#fillCompiles)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-compiles)"
                                            stackId="b"
                                        />
                                        <Area
                                            dataKey="time"
                                            type="natural"
                                            fill="url(#fillTime)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-time)"
                                            stackId="c"
                                        />
                                        <Area
                                            dataKey="totalscore"
                                            type="natural"
                                            fill="url(#fillTotalscore)"
                                            fillOpacity={0.4}
                                            stroke="var(--color-totalscore)"
                                            stackId="d"
                                        />
                                    </AreaChart>
                                </ChartContainer> */}
                                <ChartContainer config={chartConfig} className='h-1/2 w-full'>
                                    <BarChart accessibilityLayer data={convertedData}
                                        margin={{
                                            left: 50,
                                            right: 50,
                                            top: 10,
                                            bottom: 10
                                        }}>
                                        <CartesianGrid vertical={false} />
                                        <XAxis
                                            dataKey="modulename"
                                            tickLine={false}
                                            tickMargin={10}
                                            axisLine={true}
                                            tick={<CustomXAxisTick />}
                                            interval={0}
                                        // tickFormatter={value}
                                        />
                                        <YAxis type="number" domain={[0, mdata.length ? mdata[0].maxscore : 100]} />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dashed" />}
                                        />
                                        <ChartLegend content={<ChartLegendContent />} className='mt-4' />
                                        <Bar dataKey="totalscore" fill="var(--color-totalscore)" radius={4} >
                                            <LabelList
                                                position="top"
                                                offset={12}
                                                className="text-primary"
                                                fontSize={12}
                                            />
                                        </Bar>
                                        <Bar dataKey="errors" fill="var(--color-errors)" radius={4}  >
                                            <LabelList
                                                position="top"
                                                offset={12}
                                                className="text-red-500"
                                                fontSize={12}
                                            />
                                        </Bar>
                                        <Bar dataKey="compiles" fill="var(--color-compiles)" radius={4}  >
                                            <LabelList
                                                position="top"
                                                offset={12}
                                                className="text-red-500"
                                                fontSize={12}
                                            />
                                        </Bar>
                                        <Bar dataKey="time" fill="var(--color-time)" radius={4}  >
                                            <LabelList
                                                position="top"
                                                offset={12}
                                                className="text-cyan-500"
                                                fontSize={12}
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default RCViewHelper