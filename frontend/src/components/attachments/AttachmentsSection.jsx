import {
    useRef,
    useState
} from "react";

import {
    Download,
    File,
    FileImage,
    FileText,
    Paperclip,
    Plus,
    Trash2,
    Upload
} from "lucide-react";

import {
    attachmentService
} from "../../services/attachmentService";

import {
    formatFileSize
} from "../../utils/file";


const getFileIcon = (
    mimeType
) => {

    if (
        mimeType?.startsWith(
            "image/"
        )
    ) {
        return FileImage;
    }


    if (
        mimeType ===
        "application/pdf" ||
        mimeType ===
        "text/plain"
    ) {
        return FileText;
    }


    return File;
};


export default function AttachmentsSection({
    taskId,
    attachments,
    setAttachments,
    currentUserId,
    isProjectOwner,
    onActivityRefresh
}) {

    const inputRef =
        useRef(null);


    const [uploading, setUploading] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);

    const [error, setError] =
        useState("");


    const handleFile =
        async (event) => {

            const file =
                event.target.files?.[0];


            if (!file) {
                return;
            }


            if (
                file.size >
                10 * 1024 * 1024
            ) {

                setError(
                    "File cannot exceed 10 MB"
                );

                event.target.value = "";

                return;
            }


            try {

                setUploading(true);
                setError("");


                const attachment =
                    await attachmentService
                        .upload(
                            taskId,
                            file
                        );


                setAttachments(
                    (previous) => [
                        attachment,
                        ...previous
                    ]
                );


                await onActivityRefresh?.();


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to upload file"
                );

            } finally {

                setUploading(false);

                event.target.value = "";

            }

        };


    const handleDownload =
        async (attachment) => {

            try {

                setError("");


                await attachmentService
                    .download(
                        attachment
                    );


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to download file"
                );

            }

        };


    const handleDelete =
        async (attachment) => {

            const confirmed =
                window.confirm(
                    `Delete ${attachment.originalName}?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setDeletingId(
                    attachment._id
                );

                setError("");


                await attachmentService
                    .delete(
                        attachment._id
                    );


                setAttachments(
                    (previous) =>
                        previous.filter(
                            (item) =>
                                item._id !==
                                attachment._id
                        )
                );


                await onActivityRefresh?.();


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to delete attachment"
                );

            } finally {

                setDeletingId(null);

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
                justify-between
                gap-4
                border-b
                border-slate-100
                px-6
                py-5
            ">

                <div className="
                    flex
                    items-center
                    gap-3
                ">

                    <Paperclip
                        size={20}
                        className="
                            text-indigo-600
                        "
                    />

                    <div>

                        <h2 className="
                            font-semibold
                            text-slate-900
                        ">

                            Attachments

                        </h2>

                        <p className="
                            text-xs
                            text-slate-500
                        ">

                            {attachments.length}
                            {" "}
                            files

                        </p>

                    </div>

                </div>


                <button
                    onClick={() =>
                        inputRef.current
                            ?.click()
                    }
                    disabled={uploading}
                    className="
                        flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-indigo-600
                        px-3
                        py-2
                        text-sm
                        font-semibold
                        text-white
                        hover:bg-indigo-700
                        disabled:opacity-50
                    "
                >

                    {uploading ? (

                        <Upload
                            size={15}
                            className="
                                animate-pulse
                            "
                        />

                    ) : (

                        <Plus size={15} />

                    )}


                    {uploading
                        ? "Uploading..."
                        : "Add File"}

                </button>


                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="
                        .jpg,
                        .jpeg,
                        .png,
                        .webp,
                        .pdf,
                        .txt,
                        .doc,
                        .docx,
                        .xls,
                        .xlsx
                    "
                    onChange={
                        handleFile
                    }
                />

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


                {attachments.length ===
                0 ? (

                    <div className="
                        py-10
                        text-center
                    ">

                        <Paperclip
                            size={36}
                            className="
                                mx-auto
                                text-slate-300
                            "
                        />

                        <p className="
                            mt-3
                            text-sm
                            font-medium
                            text-slate-700
                        ">

                            No attachments

                        </p>

                        <p className="
                            mt-1
                            text-xs
                            text-slate-500
                        ">

                            Upload documents or screenshots related to this task.

                        </p>

                    </div>

                ) : (

                    <div className="
                        space-y-3
                    ">

                        {attachments.map(
                            (attachment) => {

                                const Icon =
                                    getFileIcon(
                                        attachment.mimeType
                                    );


                                const uploaderId =
                                    String(
                                        attachment
                                            .uploadedBy
                                            ?._id ||
                                        attachment
                                            .uploadedBy
                                    );


                                const canDelete =
                                    uploaderId ===
                                        currentUserId ||
                                    isProjectOwner;


                                return (

                                    <div
                                        key={
                                            attachment._id
                                        }
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            rounded-xl
                                            border
                                            border-slate-200
                                            p-4
                                            transition
                                            hover:border-slate-300
                                        "
                                    >

                                        <div className="
                                            flex
                                            min-w-0
                                            items-center
                                            gap-3
                                        ">

                                            <div className="
                                                flex
                                                h-10
                                                w-10
                                                shrink-0
                                                items-center
                                                justify-center
                                                rounded-lg
                                                bg-indigo-50
                                                text-indigo-600
                                            ">

                                                <Icon
                                                    size={19}
                                                />

                                            </div>


                                            <div className="
                                                min-w-0
                                            ">

                                                <p className="
                                                    truncate
                                                    text-sm
                                                    font-semibold
                                                    text-slate-800
                                                ">

                                                    {
                                                        attachment
                                                            .originalName
                                                    }

                                                </p>


                                                <p className="
                                                    mt-1
                                                    text-xs
                                                    text-slate-500
                                                ">

                                                    {
                                                        formatFileSize(
                                                            attachment
                                                                .size
                                                        )
                                                    }

                                                    {" • "}

                                                    {
                                                        attachment
                                                            .uploadedBy
                                                            ?.name ||
                                                        "Unknown"
                                                    }

                                                    {" • "}

                                                    {
                                                        new Date(
                                                            attachment
                                                                .createdAt
                                                        )
                                                            .toLocaleDateString(
                                                                "en-IN"
                                                            )
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        <div className="
                                            flex
                                            shrink-0
                                            items-center
                                            gap-1
                                        ">

                                            <button
                                                onClick={() =>
                                                    handleDownload(
                                                        attachment
                                                    )
                                                }
                                                title="Download"
                                                className="
                                                    rounded-lg
                                                    p-2
                                                    text-slate-400
                                                    hover:bg-indigo-50
                                                    hover:text-indigo-600
                                                "
                                            >

                                                <Download
                                                    size={17}
                                                />

                                            </button>


                                            {canDelete && (

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            attachment
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        attachment._id
                                                    }
                                                    title="Delete"
                                                    className="
                                                        rounded-lg
                                                        p-2
                                                        text-slate-400
                                                        hover:bg-rose-50
                                                        hover:text-rose-600
                                                        disabled:opacity-50
                                                    "
                                                >

                                                    <Trash2
                                                        size={17}
                                                    />

                                                </button>

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