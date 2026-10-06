import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";


export default function WeeklyTimeChart({
    data = []
}) {

    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
        ">

            <h2 className="
                font-bold
                text-slate-900
            ">

                Weekly Time

            </h2>


            <p className="
                mt-1
                text-sm
                text-slate-500
            ">

                Your tracked hours during the last 7 days

            </p>


            <div className="
                mt-6
                h-[300px]
            ">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <AreaChart
                        data={data}
                    >

                        <defs>

                            <linearGradient
                                id="timeGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >

                                <stop
                                    offset="5%"
                                    stopColor="#6366f1"
                                    stopOpacity={0.25}
                                />

                                <stop
                                    offset="95%"
                                    stopColor="#6366f1"
                                    stopOpacity={0}
                                />

                            </linearGradient>

                        </defs>


                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />


                        <XAxis
                            dataKey="day"
                            tickLine={false}
                            axisLine={false}
                        />


                        <YAxis
                            tickLine={false}
                            axisLine={false}
                        />


                        <Tooltip
                            formatter={(
                                value
                            ) => [
                                `${value} hrs`,
                                "Tracked"
                            ]}
                        />


                        <Area
                            type="monotone"
                            dataKey="hours"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fill="url(#timeGradient)"
                        />

                    </AreaChart>

                </ResponsiveContainer>

            </div>

        </div>

    );
}