import {
    useEffect,
    useState
} from "react";

import {
    X
} from "lucide-react";


const initialForm = {
    taskId: "",
    date: "",
    hours: 0,
    minutes: 0,
    description: ""
};


export default function ManualTimeModal({
    isOpen,
    onClose,
    onSubmit,
    tasks,
    saving
}) {

    const [form, setForm] =
        useState(initialForm);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const today =
            new Date()
                .toLocaleDateString(
                    "en-CA"
                );


        setForm({
            ...initialForm,
            date: today
        });

        setError("");


    }, [isOpen]);


    if (!isOpen) {
        return null;
    }


    const handleChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setForm(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );

    };


    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        if (!form.taskId) {

            setError(
                "Please select a task"
            );

            return;

        }


        const hours =
            Number(form.hours);

        const minutes =
            Number(form.minutes);


        if (
            hours < 0 ||
            minutes < 0 ||
            minutes > 59 ||
            (
                hours === 0 &&
                minutes === 0
            )
        ) {

            setError(
                "Enter valid working time"
            );

            return;

        }


        try {

            setError("");

            await onSubmit({
                ...form,
                hours,
                minutes
            });

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to add time"
            );

        }

    };


    return (

        <div className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
        ">

            <div className="
                w-full
                max-w-lg
                rounded-2xl
                bg-white
                shadow-2xl
            ">

                <div className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-100
                    px-6
                    py-5
                ">

                    <div>

                        <h2 className="text-xl font-bold text-slate-900">
                            Add Manual Time
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Record work that was not tracked by the timer.
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
                            hover:bg-slate-100
                        "
                    >
                        <X size={20} />
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="space-y-5 p-6"
                >

                    {error && (

                        <div className="
                            rounded-lg
                            bg-red-50
                            p-3
                            text-sm
                            text-red-600
                        ">

                            {error}

                        </div>

                    )}


                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Task
                        </label>

                        <select
                            name="taskId"
                            value={form.taskId}
                            onChange={handleChange}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                            "
                        >

                            <option value="">
                                Select Task
                            </option>


                            {tasks.map(
                                (task) => (

                                    <option
                                        key={task._id}
                                        value={task._id}
                                    >

                                        {task.title}
                                        {" — "}
                                        {task.project?.name}

                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Date
                        </label>

                        <input
                            type="date"
                            name="date"
                            value={form.date}
                            onChange={handleChange}
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                            "
                        />

                    </div>


                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Hours
                            </label>

                            <input
                                type="number"
                                name="hours"
                                min="0"
                                max="24"
                                value={form.hours}
                                onChange={handleChange}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                "
                            />

                        </div>


                        <div>

                            <label className="mb-2 block text-sm font-medium">
                                Minutes
                            </label>

                            <input
                                type="number"
                                name="minutes"
                                min="0"
                                max="59"
                                value={form.minutes}
                                onChange={handleChange}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    px-4
                                    py-3
                                "
                            />

                        </div>

                    </div>


                    <div>

                        <label className="mb-2 block text-sm font-medium">
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            rows={3}
                            maxLength={300}
                            placeholder="What did you work on?"
                            className="
                                w-full
                                resize-none
                                rounded-xl
                                border
                                border-slate-200
                                px-4
                                py-3
                            "
                        />

                    </div>


                    <div className="
                        flex
                        justify-end
                        gap-3
                        border-t
                        border-slate-100
                        pt-5
                    ">

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                px-5
                                py-3
                                text-sm
                                font-medium
                            "
                        >

                            Cancel

                        </button>


                        <button
                            disabled={saving}
                            className="
                                rounded-xl
                                bg-indigo-600
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-indigo-700
                                disabled:opacity-50
                            "
                        >

                            {saving
                                ? "Saving..."
                                : "Add Time"}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}