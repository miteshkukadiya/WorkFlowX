import {
    Crown,
    Mail,
    Trash2,
    UserRound
} from "lucide-react";


export default function MemberCard({
    member,
    isOwner = false,
    canRemove = false,
    onRemove
}) {

    const initial =
        member?.name
            ?.charAt(0)
            ?.toUpperCase() || "?";


    return (

        <div className="
            flex
            items-center
            justify-between
            gap-4
            rounded-xl
            border
            border-slate-200
            bg-white
            p-4
        ">

            <div className="
                flex
                min-w-0
                items-center
                gap-3
            ">

                <div className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-indigo-100
                    font-semibold
                    text-indigo-700
                ">

                    {initial}

                </div>


                <div className="min-w-0">

                    <div className="
                        flex
                        items-center
                        gap-2
                    ">

                        <p className="
                            truncate
                            font-semibold
                            text-slate-900
                        ">

                            {member.name}

                        </p>


                        {isOwner && (

                            <Crown
                                size={15}
                                className="
                                    shrink-0
                                    text-amber-500
                                "
                            />

                        )}

                    </div>


                    <div className="
                        mt-1
                        flex
                        items-center
                        gap-1.5
                        text-xs
                        text-slate-500
                    ">

                        <Mail size={13} />

                        <span className="truncate">
                            {member.email}
                        </span>

                    </div>


                    <div className="
                        mt-2
                        inline-flex
                        items-center
                        gap-1
                        rounded-full
                        bg-slate-100
                        px-2
                        py-1
                        text-[11px]
                        font-medium
                        capitalize
                        text-slate-600
                    ">

                        <UserRound size={11} />

                        {isOwner
                            ? "Project Owner"
                            : "Member"}

                    </div>

                </div>

            </div>


            {canRemove && (

                <button
                    onClick={() =>
                        onRemove(member)
                    }
                    title="Remove member"
                    className="
                        shrink-0
                        rounded-lg
                        p-2
                        text-slate-400
                        hover:bg-rose-50
                        hover:text-rose-600
                    "
                >

                    <Trash2 size={17} />

                </button>

            )}

        </div>

    );
}