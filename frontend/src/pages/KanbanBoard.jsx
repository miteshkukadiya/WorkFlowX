import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useSensor,
    useSensors
} from "@dnd-kit/core";

import {
    arrayMove
} from "@dnd-kit/sortable";

import {
    Columns3,
    RefreshCw
} from "lucide-react";

import {
    taskService
} from "../services/taskService";

import {
    projectService
} from "../services/projectService";

import KanbanColumn
    from "../components/kanban/KanbanColumn";


import TaskDragPreview
    from "../components/kanban/TaskDragPreview";


const columns = [

    {
        id: "todo",
        title: "To Do"
    },

    {
        id: "in-progress",
        title: "In Progress"
    },

    {
        id: "done",
        title: "Done"
    }

];


export default function KanbanBoard() {

    const [tasks, setTasks] = useState([]);

    const [projects, setProjects] = useState([]);

    const [selectedProject, setSelectedProject] =
        useState("");

    const [activeTask, setActiveTask] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    const sensors = useSensors(

        useSensor(
            PointerSensor,
            {
                activationConstraint: {
                    distance: 6
                }
            }
        )

    );


    // LOAD DATA

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                tasksData,
                projectsData
            ] = await Promise.all([

                taskService.getAll(),

                projectService.getAll()

            ]);


            setTasks(tasksData);

            setProjects(projectsData);


        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Failed to load Kanban board"
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // FILTER BY PROJECT

    const boardTasks = useMemo(() => {

    if (!selectedProject) {
        return [];
    }

    return tasks.filter(
        (task) =>
            String(task.project?._id) ===
            String(selectedProject)
    );

}, [
    tasks,
    selectedProject
]);


    // GET TASKS FOR COLUMN

    const getColumnTasks = (status) => {

        return boardTasks
            .filter(
                (task) =>
                    task.status === status
            )
            .sort(
                (a, b) =>
                    (a.position || 0) -
                    (b.position || 0)
            );

    };


    // FIND TASK STATUS

    const findTaskStatus = (taskId) => {

        const task = tasks.find(
            (item) =>
                item._id === taskId
        );

        return task?.status;

    };

    const saveBoardOrder = async (
        updatedTasks
    ) => {

        if (!selectedProject) {
            return;
        }


        for (const column of columns) {

            const columnTasks =
                updatedTasks
                    .filter(
                        (task) =>
                            task.status ===
                            column.id
                    )
                    .sort(
                        (a, b) =>
                            (a.position || 0) -
                            (b.position || 0)
                    );


            if (columnTasks.length === 0) {
                continue;
            }


            await taskService.reorder(

                selectedProject,

                columnTasks.map(
                    (task) => ({
                        _id: task._id,
                        status: column.id
                    })
                )

            );

        }

    };


    // DRAG START

    const handleDragStart = (event) => {

        const task = tasks.find(
            (item) =>
                item._id === event.active.id
        );

        setActiveTask(task || null);

    };


    // DRAG END

    // const handleDragEnd = async (event) => {

    //     const {
    //         active,
    //         over
    //     } = event;

    //     setActiveTask(null);


    //     if (!over) {
    //         return;
    //     }


    //     const activeId =
    //         String(active.id);

    //     const overId =
    //         String(over.id);


    //     const draggedTask = tasks.find(
    //         (task) =>
    //             task._id === activeId
    //     );


    //     if (!draggedTask) {
    //         return;
    //     }


    //     // OLD STATUS

    //     const oldStatus =
    //         draggedTask.status;


    //     // DETERMINE TARGET STATUS

    //     let newStatus;


    //     const isColumn = columns.some(
    //         (column) =>
    //             column.id === overId
    //     );


    //     if (isColumn) {

    //         newStatus = overId;

    //     } else {

    //         newStatus =
    //             findTaskStatus(overId);

    //     }


    //     if (!newStatus) {
    //         return;
    //     }


    //     const oldColumnTasks =
    //         getColumnTasks(oldStatus);

    //     const newColumnTasks =
    //         getColumnTasks(newStatus);


    //     let newPosition = 0;


    //     // SAME COLUMN REORDER

    //     if (oldStatus === newStatus) {

    //         const oldIndex =
    //             oldColumnTasks.findIndex(
    //                 (task) =>
    //                     task._id === activeId
    //             );

    //         const newIndex =
    //             oldColumnTasks.findIndex(
    //                 (task) =>
    //                     task._id === overId
    //             );


    //         if (
    //             oldIndex === -1 ||
    //             newIndex === -1 ||
    //             oldIndex === newIndex
    //         ) {
    //             return;
    //         }


    //         const reordered =
    //             arrayMove(
    //                 oldColumnTasks,
    //                 oldIndex,
    //                 newIndex
    //             );


    //         newPosition =
    //             newIndex;


    //         setTasks((previous) => {

    //             const positions =
    //                 new Map(
    //                     reordered.map(
    //                         (task, index) => [
    //                             task._id,
    //                             index
    //                         ]
    //                     )
    //                 );



    //             return previous.map(
    //                 (task) => {

    //                     if (
    //                         task.status !==
    //                         oldStatus
    //                     ) {
    //                         return task;
    //                     }


    //                     if (
    //                         !positions.has(
    //                             task._id
    //                         )
    //                     ) {
    //                         return task;
    //                     }


    //                     return {
    //                         ...task,
    //                         position:
    //                             positions.get(
    //                                 task._id
    //                             )
    //                     };

    //                 }
    //             );

    //         });


    //     } else {

    //         // MOVING BETWEEN COLUMNS

    //         const overIndex =
    //             newColumnTasks.findIndex(
    //                 (task) =>
    //                     task._id === overId
    //             );


    //         newPosition =
    //             overIndex >= 0
    //                 ? overIndex
    //                 : newColumnTasks.length;


    //         setTasks((previous) =>
    //             previous.map(
    //                 (task) =>
    //                     task._id ===
    //                     activeId

    //                         ? {
    //                             ...task,
    //                             status:
    //                                 newStatus,
    //                             position:
    //                                 newPosition
    //                         }

    //                         : task
    //             )
    //         );

    //     }


    //     // SAVE TO DATABASE

    //     try {

    //         setSaving(true);

    //         await taskService.move(
    //             activeId,
    //             newStatus,
    //             newPosition
    //         );


    //         /*
    //          * Reload after persistence.
    //          *
    //          * This keeps frontend order aligned
    //          * with MongoDB.
    //          */

    //         const freshTasks =
    //             await taskService.getAll();

    //         setTasks(freshTasks);


    //     } catch (err) {

    //         setError(
    //             err.response?.data?.message ||
    //             "Failed to move task"
    //         );

    //         await loadData();

    //     } finally {

    //         setSaving(false);

    //     }

    // };

    // DRAG END

const handleDragEnd = async (event) => {

    const {
        active,
        over
    } = event;

    setActiveTask(null);

    if (!over) {
        return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);

    const draggedTask = tasks.find(
        (task) => task._id === activeId
    );

    if (!draggedTask) {
        return;
    }


    // OLD STATUS

    const oldStatus = draggedTask.status;


    // DETERMINE TARGET STATUS

    let newStatus;

    const isColumn = columns.some(
        (column) =>
            column.id === overId
    );

    if (isColumn) {

        newStatus = overId;

    } else {

        newStatus =
            findTaskStatus(overId);
    }

    if (!newStatus) {
        return;
    }


    const oldColumnTasks =
        getColumnTasks(oldStatus);

    const newColumnTasks =
        getColumnTasks(newStatus);


    let newPosition = 0;

    // This variable will contain
    // the FINAL updated frontend tasks.
    let updatedTasks = [];


    // ========================================
    // SAME COLUMN REORDER
    // ========================================

    if (oldStatus === newStatus) {

        const oldIndex =
            oldColumnTasks.findIndex(
                (task) =>
                    task._id === activeId
            );

        const newIndex =
            oldColumnTasks.findIndex(
                (task) =>
                    task._id === overId
            );


        if (
            oldIndex === -1 ||
            newIndex === -1 ||
            oldIndex === newIndex
        ) {
            return;
        }


        const reordered =
            arrayMove(
                oldColumnTasks,
                oldIndex,
                newIndex
            );


        newPosition = newIndex;


        // Create map:
        // taskId -> new position

        const positions =
            new Map(
                reordered.map(
                    (task, index) => [
                        task._id,
                        index
                    ]
                )
            );


        // IMPORTANT:
        // Create updated array FIRST.

        updatedTasks = tasks.map(
            (task) => {

                if (
                    task.status !== oldStatus
                ) {
                    return task;
                }

                if (
                    !positions.has(task._id)
                ) {
                    return task;
                }

                return {
                    ...task,
                    position:
                        positions.get(task._id)
                };
            }
        );

    } else {

        // ========================================
        // MOVING BETWEEN COLUMNS
        // ========================================

        const overIndex =
            newColumnTasks.findIndex(
                (task) =>
                    task._id === overId
            );


        newPosition =
            overIndex >= 0
                ? overIndex
                : newColumnTasks.length;


        // Remove dragged task from old column

        const oldWithoutDragged =
            oldColumnTasks.filter(
                (task) =>
                    task._id !== activeId
            );


        // Update positions of old column

        const oldPositions =
            new Map(
                oldWithoutDragged.map(
                    (task, index) => [
                        task._id,
                        index
                    ]
                )
            );


        // Prepare target column

        const targetTasks =
            newColumnTasks.filter(
                (task) =>
                    task._id !== activeId
            );


        const movedTask = {
            ...draggedTask,
            status: newStatus
        };


        // Insert task at target position

        targetTasks.splice(
            newPosition,
            0,
            movedTask
        );


        // Generate new target positions

        const newPositions =
            new Map(
                targetTasks.map(
                    (task, index) => [
                        task._id,
                        index
                    ]
                )
            );


        // Create final frontend array

        updatedTasks = tasks.map(
            (task) => {

                // Dragged task

                if (task._id === activeId) {

                    return {
                        ...task,
                        status: newStatus,
                        position:
                            newPositions.get(
                                activeId
                            )
                    };
                }


                // Tasks remaining in old column

                if (
                    task.status === oldStatus &&
                    oldPositions.has(task._id)
                ) {

                    return {
                        ...task,
                        position:
                            oldPositions.get(
                                task._id
                            )
                    };
                }


                // Tasks in target column

                if (
                    task.status === newStatus &&
                    newPositions.has(task._id)
                ) {

                    return {
                        ...task,
                        position:
                            newPositions.get(
                                task._id
                            )
                    };
                }


                return task;
            }
        );
    }


    // ========================================
    // UPDATE FRONTEND
    // ========================================

    setTasks(updatedTasks);


    // ========================================
    // SAVE TO DATABASE
    // ========================================

    try {

        setSaving(true);
        setError("");


        // Save moved task first

        await taskService.move(
            activeId,
            newStatus,
            newPosition
        );


        // Save correct ordering
        // of all columns.

        await saveBoardOrder(
            updatedTasks
        );


        // Reload final database state

        const freshTasks =
            await taskService.getAll();

        setTasks(freshTasks);


    } catch (err) {

        console.error(
            "Failed to save Kanban order:",
            err
        );

        setError(
            err.response?.data?.message ||
            "Failed to move task"
        );


        // Restore database state

        await loadData();


    } finally {

        setSaving(false);

    }

};


    return (

        <div className="space-y-6">

            {/* HEADER */}

            <div className="
                flex
                flex-col
                justify-between
                gap-4
                lg:flex-row
                lg:items-center
            ">

                <div>

                    <div className="flex items-center gap-3">

                        <div className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            bg-indigo-50
                            text-indigo-600
                        ">

                            <Columns3 size={22} />

                        </div>


                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">

                                Kanban Board

                            </h1>

                            <p className="mt-1 text-sm text-slate-500">

                                Drag tasks between columns to update progress.

                            </p>

                        </div>

                    </div>

                </div>


                <div className="flex flex-col gap-3 sm:flex-row">

                    <select
                        value={selectedProject}
                        onChange={(event) =>
                            setSelectedProject(
                                event.target.value
                            )
                        }
                        className="
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                        "
                    >

                        <option value="">
                            Select Project
                        </option> 


                        {projects.map(
                            (project) => (

                                <option
                                    key={
                                        project._id
                                    }
                                    value={
                                        project._id
                                    }
                                >

                                    {project.name}

                                </option>

                            )
                        )}

                    </select>


                    <button
                        onClick={loadData}
                        disabled={saving}
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                            font-medium
                            hover:bg-slate-50
                            disabled:opacity-50
                        "
                    >

                        <RefreshCw
                            size={17}
                            className={
                                saving
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {saving
                            ? "Saving..."
                            : "Refresh"}

                    </button>

                </div>

            </div>


            {/* ERROR */}

            {error && (

                <div className="
                    rounded-xl
                    border
                    border-red-100
                    bg-red-50
                    p-4
                    text-sm
                    text-red-600
                ">

                    {error}

                </div>

            )}


            {/* BOARD */}

            {loading ? (

                <div className="
                    flex
                    min-h-[400px]
                    items-center
                    justify-center
                    text-slate-500
                ">

                    Loading Kanban board...

                </div>

            ) : (
            <div className="overflow-x-auto pb-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={
                        closestCorners
                    }
                    onDragStart={
                        handleDragStart
                    }
                    onDragEnd={
                        handleDragEnd
                    }
                >

                    <div className="
                        grid
                        min-w-[900px]
                        grid-cols-3
                        gap-5
                    ">

                        {columns.map(
                            (column) => (

                                <KanbanColumn
                                    key={
                                        column.id
                                    }
                                    id={
                                        column.id
                                    }
                                    title={
                                        column.title
                                    }
                                    tasks={
                                        getColumnTasks(
                                            column.id
                                        )
                                    }
                                />

                            )
                        )}

                    </div>


                    <DragOverlay>

                        {activeTask ? (

                            <TaskDragPreview
                                task={activeTask}
                            />

                        ) : null}

                    </DragOverlay>

                </DndContext>
                </div>

            )}

        </div>

    );
}