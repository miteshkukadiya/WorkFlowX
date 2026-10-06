import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";


const COLORS = [
    "#94a3b8",
    "#6366f1",
    "#22c55e"
];


export default function TaskStatusChart({
    status
}) {

    const data = [

        {
            name: "Todo",
            value:
                status?.todo || 0
        },

        {
            name: "In Progress",
            value:
                status?.inProgress || 0
        },

        {
            name: "Done",
            value:
                status?.done || 0
        }

    ];


    const total =
        data.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item.value,
            0
        );


    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
        ">

            <div>

                <h2 className="
                    font-bold
                    text-slate-900
                ">

                    Task Status

                </h2>

                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">

                    Distribution of your tasks

                </p>

            </div>


            {total === 0 ? (

                <div className="
                    flex
                    h-[280px]
                    items-center
                    justify-center
                    text-sm
                    text-slate-400
                ">

                    No task data available.

                </div>

            ) : (

                <>

                    <div className="
                        relative
                        mt-4
                        h-[260px]
                    ">

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

                            <PieChart>

                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={95}
                                    paddingAngle={3}
                                >

                                    {data.map(
                                        (
                                            entry,
                                            index
                                        ) => (

                                            <Cell
                                                key={
                                                    entry.name
                                                }
                                                fill={
                                                    COLORS[
                                                        index
                                                    ]
                                                }
                                            />

                                        )
                                    )}

                                </Pie>


                                <Tooltip />

                            </PieChart>

                        </ResponsiveContainer>


                        <div className="
                            pointer-events-none
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                        ">

                            <div className="
                                text-center
                            ">

                                <p className="
                                    text-3xl
                                    font-bold
                                    text-slate-900
                                ">

                                    {total}

                                </p>

                                <p className="
                                    text-xs
                                    text-slate-500
                                ">

                                    Tasks

                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="
                        grid
                        grid-cols-3
                        gap-2
                    ">

                        {data.map(
                            (
                                item,
                                index
                            ) => (

                                <div
                                    key={
                                        item.name
                                    }
                                    className="
                                        text-center
                                    "
                                >

                                    <div className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-1.5
                                    ">

                                        <span
                                            className="
                                                h-2
                                                w-2
                                                rounded-full
                                            "
                                            style={{
                                                backgroundColor:
                                                    COLORS[
                                                        index
                                                    ]
                                            }}
                                        />

                                        <span className="
                                            text-xs
                                            text-slate-500
                                        ">

                                            {item.name}

                                        </span>

                                    </div>


                                    <p className="
                                        mt-1
                                        font-bold
                                        text-slate-800
                                    ">

                                        {item.value}

                                    </p>

                                </div>

                            )
                        )}

                    </div>

                </>

            )}

        </div>

    );
}