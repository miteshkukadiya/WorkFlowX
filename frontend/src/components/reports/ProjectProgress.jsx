export default function ProjectProgress({
    projects = []
}) {

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

                    Project Progress

                </h2>


                <p className="
                    mt-1
                    text-sm
                    text-slate-500
                ">

                    Completion across your projects

                </p>

            </div>


            {projects.length === 0 ? (

                <div className="
                    py-12
                    text-center
                    text-sm
                    text-slate-400
                ">

                    No projects available.

                </div>

            ) : (

                <div className="
                    mt-6
                    space-y-6
                ">

                    {projects.map(
                        (project) => (

                            <div
                                key={
                                    project._id
                                }
                            >

                                <div className="
                                    mb-2
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                ">

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
                                                project.name
                                            }

                                        </p>


                                        <p className="
                                            mt-0.5
                                            text-xs
                                            text-slate-500
                                        ">

                                            {
                                                project.completedTasks
                                            }

                                            {" of "}

                                            {
                                                project.totalTasks
                                            }

                                            {" tasks completed"}

                                        </p>

                                    </div>


                                    <span className="
                                        shrink-0
                                        text-sm
                                        font-bold
                                        text-slate-800
                                    ">

                                        {
                                            project.progress
                                        }%

                                    </span>

                                </div>


                                <div className="
                                    h-2.5
                                    overflow-hidden
                                    rounded-full
                                    bg-slate-100
                                ">

                                    <div
                                        className="
                                            h-full
                                            rounded-full
                                            bg-indigo-600
                                            transition-all
                                        "
                                        style={{
                                            width:
                                                `${project.progress}%`
                                        }}
                                    />

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}

        </div>

    );
}