import {
    useState
} from "react";

import {
    Check,
    MessageSquare,
    Pencil,
    Send,
    Trash2,
    X
} from "lucide-react";

import {
    commentService
} from "../../services/commentService";


export default function CommentsSection({
    taskId,
    comments,
    setComments,
    currentUserId,
    isProjectOwner,
    onActivityRefresh
}) {

    const [content, setContent] =
        useState("");

    const [sending, setSending] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [editContent, setEditContent] =
        useState("");

    const [error, setError] =
        useState("");


    const handleAdd =
        async (event) => {

            event.preventDefault();


            const value =
                content.trim();


            if (!value) {
                return;
            }


            try {

                setSending(true);
                setError("");


                const comment =
                    await commentService
                        .create(
                            taskId,
                            value
                        );


                setComments(
                    (previous) => [
                        ...previous,
                        comment
                    ]
                );


                setContent("");


                await onActivityRefresh?.();


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to add comment"
                );

            } finally {

                setSending(false);

            }

        };


    const startEdit = (
        comment
    ) => {

        setEditingId(
            comment._id
        );

        setEditContent(
            comment.content
        );

    };


    const cancelEdit = () => {

        setEditingId(null);
        setEditContent("");

    };


    const saveEdit =
        async (commentId) => {

            const value =
                editContent.trim();


            if (!value) {
                return;
            }


            try {

                const updated =
                    await commentService
                        .update(
                            commentId,
                            value
                        );


                setComments(
                    (previous) =>
                        previous.map(
                            (comment) =>
                                comment._id ===
                                commentId
                                    ? updated
                                    : comment
                        )
                );


                cancelEdit();


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to edit comment"
                );

            }

        };


    const handleDelete =
        async (comment) => {

            const confirmed =
                window.confirm(
                    "Delete this comment?"
                );


            if (!confirmed) {
                return;
            }


            try {

                setError("");


                await commentService
                    .delete(
                        comment._id
                    );


                setComments(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                item._id !==
                                comment._id
                        )
                );


                await onActivityRefresh?.();


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to delete comment"
                );

            }

        };


    return (

        <section className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
        ">

            <div className="
                flex
                items-center
                gap-3
                border-b
                border-slate-100
                px-6
                py-5
            ">

                <MessageSquare
                    size={20}
                    className="text-indigo-600"
                />

                <div>

                    <h2 className="
                        font-semibold
                        text-slate-900
                    ">

                        Comments

                    </h2>

                    <p className="
                        text-xs
                        text-slate-500
                    ">

                        {comments.length} comments

                    </p>

                </div>

            </div>


            <div className="p-6">

                {error && (

                    <div className="
                        mb-4
                        rounded-lg
                        bg-red-50
                        p-3
                        text-sm
                        text-red-600
                    ">

                        {error}

                    </div>

                )}


                {/* ADD COMMENT */}

                <form
                    onSubmit={handleAdd}
                    className="mb-7"
                >

                    <textarea
                        value={content}
                        onChange={(event) =>
                            setContent(
                                event.target.value
                            )
                        }
                        rows={3}
                        maxLength={1000}
                        placeholder="Write a comment..."
                        className="
                            w-full
                            resize-none
                            rounded-xl
                            border
                            border-slate-200
                            px-4
                            py-3
                            text-sm
                            outline-none
                            focus:border-indigo-500
                        "
                    />


                    <div className="
                        mt-2
                        flex
                        items-center
                        justify-between
                    ">

                        <span className="
                            text-xs
                            text-slate-400
                        ">

                            {content.length}/1000

                        </span>


                        <button
                            disabled={
                                sending ||
                                !content.trim()
                            }
                            className="
                                flex
                                items-center
                                gap-2
                                rounded-lg
                                bg-indigo-600
                                px-4
                                py-2
                                text-sm
                                font-semibold
                                text-white
                                hover:bg-indigo-700
                                disabled:opacity-50
                            "
                        >

                            <Send size={15} />

                            {sending
                                ? "Sending..."
                                : "Comment"}

                        </button>

                    </div>

                </form>


                {/* COMMENTS */}

                {comments.length === 0 ? (

                    <div className="
                        py-10
                        text-center
                        text-sm
                        text-slate-500
                    ">

                        No comments yet.

                    </div>

                ) : (

                    <div className="space-y-6">

                        {comments.map(
                            (comment) => {

                                const commentUserId =
                                    String(
                                        comment.user
                                            ?._id ||
                                        comment.user
                                    );


                                const isMine =
                                    commentUserId ===
                                    currentUserId;


                                const canDelete =
                                    isMine ||
                                    isProjectOwner;


                                return (

                                    <div
                                        key={
                                            comment._id
                                        }
                                        className="
                                            flex
                                            gap-3
                                        "
                                    >

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-full
                                            bg-indigo-100
                                            text-sm
                                            font-bold
                                            text-indigo-700
                                        ">

                                            {comment.user
                                                ?.name
                                                ?.charAt(0)
                                                ?.toUpperCase() ||
                                                "?"}

                                        </div>


                                        <div className="
                                            min-w-0
                                            flex-1
                                        ">

                                            <div className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-x-2
                                                gap-y-1
                                            ">

                                                <p className="
                                                    text-sm
                                                    font-semibold
                                                    text-slate-900
                                                ">

                                                    {comment.user
                                                        ?.name ||
                                                        "Unknown"}

                                                </p>


                                                <span className="
                                                    text-xs
                                                    text-slate-400
                                                ">

                                                    {new Date(
                                                        comment.createdAt
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}

                                                </span>


                                                {comment.edited && (

                                                    <span className="
                                                        text-xs
                                                        text-slate-400
                                                    ">

                                                        (edited)

                                                    </span>

                                                )}

                                            </div>


                                            {editingId ===
                                            comment._id ? (

                                                <div className="mt-2">

                                                    <textarea
                                                        value={
                                                            editContent
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditContent(
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                        rows={3}
                                                        maxLength={1000}
                                                        className="
                                                            w-full
                                                            resize-none
                                                            rounded-lg
                                                            border
                                                            border-slate-200
                                                            p-3
                                                            text-sm
                                                        "
                                                    />


                                                    <div className="
                                                        mt-2
                                                        flex
                                                        gap-2
                                                    ">

                                                        <button
                                                            onClick={() =>
                                                                saveEdit(
                                                                    comment._id
                                                                )
                                                            }
                                                            className="
                                                                rounded-lg
                                                                bg-indigo-600
                                                                p-2
                                                                text-white
                                                            "
                                                        >

                                                            <Check
                                                                size={15}
                                                            />

                                                        </button>


                                                        <button
                                                            onClick={
                                                                cancelEdit
                                                            }
                                                            className="
                                                                rounded-lg
                                                                bg-slate-100
                                                                p-2
                                                                text-slate-600
                                                            "
                                                        >

                                                            <X
                                                                size={15}
                                                            />

                                                        </button>

                                                    </div>

                                                </div>

                                            ) : (

                                                <p className="
                                                    mt-2
                                                    whitespace-pre-wrap
                                                    text-sm
                                                    leading-6
                                                    text-slate-600
                                                ">

                                                    {comment.content}

                                                </p>

                                            )}


                                            {editingId !==
                                                comment._id && (

                                                <div className="
                                                    mt-2
                                                    flex
                                                    gap-3
                                                ">

                                                    {isMine && (

                                                        <button
                                                            onClick={() =>
                                                                startEdit(
                                                                    comment
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-xs
                                                                text-slate-400
                                                                hover:text-indigo-600
                                                            "
                                                        >

                                                            <Pencil
                                                                size={12}
                                                            />

                                                            Edit

                                                        </button>

                                                    )}


                                                    {canDelete && (

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    comment
                                                                )
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-1
                                                                text-xs
                                                                text-slate-400
                                                                hover:text-rose-600
                                                            "
                                                        >

                                                            <Trash2
                                                                size={12}
                                                            />

                                                            Delete

                                                        </button>

                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                )}

            </div>

        </section>

    );
}