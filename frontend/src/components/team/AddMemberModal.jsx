import {
    useEffect,
    useState
} from "react";

import {
    Search,
    UserPlus,
    X
} from "lucide-react";

import {
    teamService
} from "../../services/teamService";


export default function AddMemberModal({
    isOpen,
    onClose,
    project,
    onMemberAdded
}) {

    const [query, setQuery] =
        useState("");

    const [results, setResults] =
        useState([]);

    const [searching, setSearching] =
        useState(false);

    const [addingId, setAddingId] =
        useState(null);

    const [error, setError] =
        useState("");


    useEffect(() => {

        if (!isOpen) {

            setQuery("");
            setResults([]);
            setError("");

        }

    }, [isOpen]);


    useEffect(() => {

        if (!isOpen) {
            return;
        }


        const trimmed =
            query.trim();


        if (trimmed.length < 2) {

            setResults([]);

            return;

        }


        const timer =
            setTimeout(
                async () => {

                    try {

                        setSearching(true);
                        setError("");


                        const users =
                            await teamService
                                .searchUsers(
                                    trimmed
                                );


                        const currentMemberIds =
                            new Set([

                                String(
                                    project
                                        ?.owner
                                        ?._id ||
                                    project
                                        ?.owner
                                ),

                                ...(
                                    project
                                        ?.members ||
                                    []
                                ).map(
                                    (member) =>
                                        String(
                                            member
                                                ?._id ||
                                            member
                                        )
                                )

                            ]);


                        setResults(

                            users.filter(
                                (user) =>
                                    !currentMemberIds
                                        .has(
                                            String(
                                                user._id
                                            )
                                        )
                            )

                        );


                    } catch (err) {

                        setError(
                            err.response
                                ?.data
                                ?.message ||
                            "Unable to search users"
                        );

                    } finally {

                        setSearching(false);

                    }

                },
                400
            );


        return () =>
            clearTimeout(timer);


    }, [
        query,
        isOpen,
        project
    ]);


    if (!isOpen) {
        return null;
    }


    const handleAdd =
        async (user) => {

            try {

                setAddingId(
                    user._id
                );

                setError("");


                const updatedProject =
                    await teamService
                        .addMember(
                            project._id,
                            user._id
                        );


                await onMemberAdded(
                    updatedProject
                );


                setResults(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                item._id !==
                                user._id
                        )
                );


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to add member"
                );

            } finally {

                setAddingId(null);

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
                overflow-hidden
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

                        <h2 className="
                            text-xl
                            font-bold
                            text-slate-900
                        ">

                            Add Team Member

                        </h2>

                        <p className="
                            mt-1
                            text-sm
                            text-slate-500
                        ">

                            Add a registered user to{" "}
                            {project?.name}.

                        </p>

                    </div>


                    <button
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


                <div className="p-6">

                    <div className="relative">

                        <Search
                            size={18}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            autoFocus
                            value={query}
                            onChange={(event) =>
                                setQuery(
                                    event.target.value
                                )
                            }
                            placeholder="Search name or email..."
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                py-3
                                pl-10
                                pr-4
                                outline-none
                                focus:border-indigo-500
                            "
                        />

                    </div>


                    {error && (

                        <div className="
                            mt-4
                            rounded-lg
                            bg-red-50
                            p-3
                            text-sm
                            text-red-600
                        ">

                            {error}

                        </div>

                    )}


                    <div className="
                        mt-5
                        max-h-[350px]
                        space-y-3
                        overflow-y-auto
                    ">

                        {searching ? (

                            <p className="
                                py-8
                                text-center
                                text-sm
                                text-slate-500
                            ">

                                Searching users...

                            </p>

                        ) : query.trim().length < 2 ? (

                            <p className="
                                py-8
                                text-center
                                text-sm
                                text-slate-500
                            ">

                                Enter at least 2 characters.

                            </p>

                        ) : results.length === 0 ? (

                            <p className="
                                py-8
                                text-center
                                text-sm
                                text-slate-500
                            ">

                                No available users found.

                            </p>

                        ) : (

                            results.map(
                                (user) => (

                                    <div
                                        key={user._id}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-3
                                            rounded-xl
                                            border
                                            border-slate-200
                                            p-4
                                        "
                                    >

                                        <div className="
                                            min-w-0
                                        ">

                                            <p className="
                                                truncate
                                                font-medium
                                                text-slate-900
                                            ">

                                                {user.name}

                                            </p>

                                            <p className="
                                                truncate
                                                text-sm
                                                text-slate-500
                                            ">

                                                {user.email}

                                            </p>

                                        </div>


                                        <button
                                            onClick={() =>
                                                handleAdd(
                                                    user
                                                )
                                            }
                                            disabled={
                                                addingId ===
                                                user._id
                                            }
                                            className="
                                                flex
                                                shrink-0
                                                items-center
                                                gap-2
                                                rounded-lg
                                                bg-indigo-600
                                                px-3
                                                py-2
                                                text-sm
                                                font-medium
                                                text-white
                                                hover:bg-indigo-700
                                                disabled:opacity-50
                                            "
                                        >

                                            <UserPlus
                                                size={15}
                                            />

                                            {addingId ===
                                            user._id
                                                ? "Adding..."
                                                : "Add"}

                                        </button>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}