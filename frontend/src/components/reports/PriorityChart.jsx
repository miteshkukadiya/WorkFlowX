import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";


export default function PriorityChart({
    priority
}) {

    const data = [

        {
            name: "Low",
            tasks:
                priority?.low || 0
        },

        {
            name: "Medium",
            tasks:
                priority?.medium || 0
        },

        {
            name: "High",
            tasks:
                priority?.high || 0
        },

        {
            name: "Urgent",
            tasks:
                priority?.urgent || 0
        }

    ];


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

                Task Priority

            </h2>


            <p className="
                mt-1
                text-sm
                text-slate-500
            ">

                Tasks grouped by priority

            </p>


            <div className="
                mt-6
                h-[300px]
            ">

                <ResponsiveContainer
                    width="100%"
                    height="100%"
                >

                    <BarChart
                        data={data}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />


                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                        />


                        <YAxis
                            allowDecimals={false}
                            tickLine={false}
                            axisLine={false}
                        />


                        <Tooltip />


                        <Bar
                            dataKey="tasks"
                            fill="#6366f1"
                            radius={[
                                8,
                                8,
                                0,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            </div>

        </div>

    );
}