import {
    useDroppable
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";

import KanbanTaskCard from "./KanbanTaskCard";


export default function KanbanColumn({
    id,
    title,
    tasks
}) {

    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id,
        data: {
            type: "column",
            status: id
        }
    });


    return (

        <div
            ref={setNodeRef}
            className={`
                flex
                min-h-[500px]
                flex-col
                rounded-2xl
                border
                p-4
                transition-colors

                ${
                    isOver
                        ? "border-indigo-300 bg-indigo-50/60"
                        : "border-slate-200 bg-slate-50"
                }
            `}
        >

            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">

                <div className="flex items-center gap-2">

                    <div
                        className={`
                            h-2.5
                            w-2.5
                            rounded-full

                            ${
                                id === "todo"
                                    ? "bg-slate-400"
                                    : id === "in-progress"
                                        ? "bg-amber-500"
                                        : "bg-emerald-500"
                            }
                        `}
                    />

                    <h2 className="font-semibold text-slate-800">
                        {title}
                    </h2>

                </div>


                <span className="
                    rounded-full
                    bg-white
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    text-slate-500
                ">
                    {tasks.length}
                </span>

            </div>


            {/* TASKS */}

            <SortableContext
                items={tasks.map(
                    (task) => task._id
                )}
                strategy={
                    verticalListSortingStrategy
                }
            >

                <div className="space-y-3">

                    {tasks.map((task) => (

                        <KanbanTaskCard
                            key={task._id}
                            task={task}
                        />

                    ))}

                </div>

            </SortableContext>


            {tasks.length === 0 && (

                <div className="
                    flex
                    min-h-[150px]
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-dashed
                    border-slate-300
                    text-sm
                    text-slate-400
                ">

                    Drop tasks here

                </div>

            )}

        </div>

    );
}