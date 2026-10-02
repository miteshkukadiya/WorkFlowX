import api from "./api";


export const attachmentService = {

    getByTask: async (
        taskId
    ) => {

        const response =
            await api.get(
                `/attachments/task/${taskId}`
            );

        return response.data.data;
    },


    


    upload: async (taskId, file) => {

    if (!file) {
        throw new Error(
            "Please select a file"
        );
    }

    const formData = new FormData();

    formData.append(
        "file",
        file
    );

    const response =
        await api.post(
            `/attachments/task/${taskId}`,
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data"
                }
            }
        );

    return response.data.data;
},

    download: async (
        attachment
    ) => {

        const response =
            await api.get(
                `/attachments/${attachment._id}/download`,
                {
                    responseType:
                        "blob"
                }
            );


        const url =
            window.URL.createObjectURL(
                response.data
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            attachment.originalName;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );

    },


    delete: async (
        attachmentId
    ) => {

        const response =
            await api.delete(
                `/attachments/${attachmentId}`
            );

        return response.data;
    }

};