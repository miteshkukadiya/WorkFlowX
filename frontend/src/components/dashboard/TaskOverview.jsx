import {
    CheckCircle2,
    Circle,
    Clock3
} from "lucide-react";


export default function TaskOverview({
    overview = {}
}) {

    const items = [

        {
            label:
                "Todo",

            value:
                overview.todo || 0,

            icon:
                Circle
        },

        {
            label:
                "In Progress",

            value:
                overview.inProgress || 0,

            icon:
                Clock3
        },

        {
            label:
                "Completed",

            value:
                overview.done || 0,

            icon:
                CheckCircle2
        }

    ];


    const total =
        items.reduce(
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

                    My Task Overview

                </h2>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">

                    Current status of your assigned tasks

                </p>

            </div>


            <div className="
                mt-6
                grid
                gap-3
                sm:grid-cols-3
                lg:grid-cols-1
                xl:grid-cols-3
            ">

                {items.map(
                    ({
                        label,
                        value,
                        icon: Icon
                    }) => (

                        <div
                            key={
                                label
                            }
                            className="
                                rounded-xl
                                border
                                border-slate-100
                                bg-slate-50
                                p-4
                            "
                        >

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">

                                <Icon
                                    size={18}
                                    className="
                                        text-indigo-600
                                    "
                                />


                                <span className="
                                    text-xl
                                    font-bold
                                    text-slate-900
                                ">

                                    {value}

                                </span>

                            </div>


                            <p className="
                                mt-3
                                text-xs
                                font-medium
                                text-slate-500
                            ">

                                {label}

                            </p>

                        </div>

                    )
                )}

            </div>


            <div className="
                mt-5
                flex
                items-center
                justify-between
                border-t
                border-slate-100
                pt-4
            ">

                <span className="
                    text-sm
                    text-slate-500
                ">

                    Total assigned

                </span>


                <span className="
                    font-bold
                    text-slate-900
                ">

                    {total}

                </span>

            </div>

        </div>

    );
}