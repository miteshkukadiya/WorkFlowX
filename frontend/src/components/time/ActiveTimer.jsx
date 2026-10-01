import {
    useEffect,
    useState
} from "react";

import {
    Square,
    Timer
} from "lucide-react";

import {
    formatDuration
} from "../../utils/time";


export default function ActiveTimer({
    activeTimer,
    onStop,
    stopping
}) {

    const [elapsed, setElapsed] =
        useState(0);


    useEffect(() => {

        if (!activeTimer) {

            setElapsed(0);

            return;

        }


        const calculateElapsed = () => {

            const start =
                new Date(
                    activeTimer.startTime
                ).getTime();


            const now =
                Date.now();


            setElapsed(
                Math.max(
                    0,
                    Math.floor(
                        (
                            now - start
                        ) / 1000
                    )
                )
            );

        };


        calculateElapsed();


        const interval =
            setInterval(
                calculateElapsed,
                1000
            );


        return () =>
            clearInterval(interval);


    }, [activeTimer]);


    if (!activeTimer) {

        return (

            <div className="
                rounded-2xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-6
            ">

                <div className="
                    flex
                    items-center
                    gap-3
                    text-slate-500
                ">

                    <Timer size={22} />

                    <div>

                        <p className="font-medium text-slate-700">
                            No timer running
                        </p>

                        <p className="text-sm">
                            Select a task and start tracking.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    return (

        <div className="
            overflow-hidden
            rounded-2xl
            border
            border-indigo-100
            bg-white
            shadow-sm
        ">

            <div className="
                bg-indigo-50
                px-6
                py-3
                text-sm
                font-medium
                text-indigo-700
            ">

                Timer is running

            </div>


            <div className="p-6">

                <div className="
                    flex
                    flex-col
                    gap-6
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    <div>

                        <p className="text-sm text-slate-500">
                            Currently working on
                        </p>

                        <h2 className="mt-1 text-lg font-semibold text-slate-900">

                            {activeTimer.task?.title}

                        </h2>

                        <p className="mt-1 text-sm text-slate-500">

                            {activeTimer.project?.name}

                        </p>

                    </div>


                    <div className="sm:text-right">

                        <p className="
                            font-mono
                            text-3xl
                            font-bold
                            tracking-wider
                            text-slate-900
                        ">

                            {formatDuration(
                                elapsed
                            )}

                        </p>


                        <button
                            onClick={onStop}
                            disabled={stopping}
                            className="
                                mt-3
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-rose-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-rose-700
                                disabled:opacity-50
                            "
                        >

                            <Square size={15} />

                            {stopping
                                ? "Stopping..."
                                : "Stop Timer"}

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );
}