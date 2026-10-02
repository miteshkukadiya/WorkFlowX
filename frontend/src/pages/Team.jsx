import {
    useEffect,
    useState
} from "react";

import {
    FolderKanban,
    UserPlus,
    Users
} from "lucide-react";

import {
    projectService
} from "../services/projectService";

import {
    teamService
} from "../services/teamService";

import {
    useAuth
} from "../context/AuthContext";

import MemberCard
    from "../components/team/MemberCard";

import AddMemberModal
    from "../components/team/AddMemberModal";


export default function Team() {

    const {
        user
    } = useAuth();


    const [projects, setProjects] =
        useState([]);

    const [
        selectedProjectId,
        setSelectedProjectId
    ] = useState("");

    const [team, setTeam] =
        useState({
            owner: null,
            members: []
        });

    const [loading, setLoading] =
        useState(true);

    const [teamLoading, setTeamLoading] =
        useState(false);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [error, setError] =
        useState("");


    const currentUserId =
        String(
            user?._id ||
            user?.id
        );


    // LOAD PROJECTS

    useEffect(() => {

        const loadProjects =
            async () => {

                try {

                    setLoading(true);

                    const data =
                        await projectService
                            .getAll();

                    setProjects(data);


                    if (
                        data.length > 0
                    ) {

                        setSelectedProjectId(
                            data[0]._id
                        );

                    }


                } catch (err) {

                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load projects"
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadProjects();

    }, []);


    // LOAD MEMBERS

    useEffect(() => {

        if (!selectedProjectId) {

            setTeam({
                owner: null,
                members: []
            });

            return;

        }


        const loadMembers =
            async () => {

                try {

                    setTeamLoading(true);
                    setError("");


                    const data =
                        await teamService
                            .getMembers(
                                selectedProjectId
                            );


                    setTeam(data);


                } catch (err) {

                    setError(
                        err.response
                            ?.data
                            ?.message ||
                        "Failed to load team"
                    );

                } finally {

                    setTeamLoading(false);

                }

            };


        loadMembers();


    }, [
        selectedProjectId
    ]);


    const selectedProject =
        projects.find(
            (project) =>
                project._id ===
                selectedProjectId
        );


    const isProjectOwner =
        String(
            selectedProject
                ?.owner
                ?._id ||
            selectedProject
                ?.owner
        ) === currentUserId;


    const handleMemberAdded =
        async (
            updatedProject
        ) => {

            setProjects(
                (previous) =>
                    previous.map(
                        (project) =>
                            project._id ===
                            updatedProject._id
                                ? updatedProject
                                : project
                    )
            );


            setTeam({

                owner:
                    updatedProject.owner,

                members:
                    updatedProject.members || []

            });

        };


    const handleRemove =
        async (member) => {

            const confirmed =
                window.confirm(
                    `Remove ${member.name} from this project? Their assigned tasks will become unassigned.`
                );


            if (!confirmed) {
                return;
            }


            try {

                setError("");


                const updatedProject =
                    await teamService
                        .removeMember(
                            selectedProjectId,
                            member._id
                        );


                setProjects(
                    (previous) =>
                        previous.map(
                            (project) =>
                                project._id ===
                                updatedProject._id
                                    ? updatedProject
                                    : project
                        )
                );


                setTeam({

                    owner:
                        updatedProject.owner,

                    members:
                        updatedProject.members || []

                });


            } catch (err) {

                setError(
                    err.response
                        ?.data
                        ?.message ||
                    "Unable to remove member"
                );

            }

        };


    if (loading) {

        return (

            <div className="
                flex
                min-h-[500px]
                items-center
                justify-center
                text-slate-500
            ">

                Loading team workspace...

            </div>

        );

    }


    return (

        <div className="space-y-8">

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

                    <h1 className="
                        text-2xl
                        font-bold
                        text-slate-900
                        sm:text-3xl
                    ">

                        Team Management

                    </h1>

                    <p className="
                        mt-2
                        text-sm
                        text-slate-500
                    ">

                        Manage project members and collaboration.

                    </p>

                </div>


                {isProjectOwner && (

                    <button
                        onClick={() =>
                            setModalOpen(true)
                        }
                        className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-indigo-600
                            px-5
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            hover:bg-indigo-700
                        "
                    >

                        <UserPlus size={18} />

                        Add Member

                    </button>

                )}

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


            {/* PROJECT SELECTOR */}

            <div className="
                rounded-2xl
                border
                border-slate-200
                bg-white
                p-5
                shadow-sm
            ">

                <div className="
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

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

                            <FolderKanban
                                size={21}
                            />

                        </div>


                        <div>

                            <p className="
                                font-semibold
                                text-slate-900
                            ">

                                Project Team

                            </p>

                            <p className="
                                text-sm
                                text-slate-500
                            ">

                                Select a project to manage its members.

                            </p>

                        </div>

                    </div>


                    <select
                        value={
                            selectedProjectId
                        }
                        onChange={(event) =>
                            setSelectedProjectId(
                                event.target.value
                            )
                        }
                        className="
                            min-w-[220px]
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-4
                            py-3
                            text-sm
                        "
                    >

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

                </div>

            </div>


            {/* EMPTY PROJECT */}

            {projects.length === 0 ? (

                <div className="
                    rounded-2xl
                    border
                    border-dashed
                    border-slate-300
                    bg-white
                    py-20
                    text-center
                ">

                    <Users
                        size={42}
                        className="
                            mx-auto
                            text-slate-300
                        "
                    />

                    <h2 className="
                        mt-4
                        font-semibold
                        text-slate-900
                    ">

                        No projects available

                    </h2>

                    <p className="
                        mt-2
                        text-sm
                        text-slate-500
                    ">

                        Create a project before managing a team.

                    </p>

                </div>

            ) : teamLoading ? (

                <div className="
                    py-20
                    text-center
                    text-slate-500
                ">

                    Loading project members...

                </div>

            ) : (

                <>

                    {/* TEAM STATS */}

                    <div className="
                        grid
                        gap-4
                        sm:grid-cols-3
                    ">

                        <TeamStat
                            title="Total People"
                            value={
                                1 +
                                team.members.length
                            }
                        />

                        <TeamStat
                            title="Project Owner"
                            value="1"
                        />

                        <TeamStat
                            title="Members"
                            value={
                                team.members.length
                            }
                        />

                    </div>


                    {/* OWNER */}

                    {team.owner && (

                        <section>

                            <div className="mb-4">

                                <h2 className="
                                    text-lg
                                    font-semibold
                                    text-slate-900
                                ">

                                    Project Owner

                                </h2>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">

                                    Has full project management access.

                                </p>

                            </div>


                            <div className="
                                grid
                                gap-4
                                lg:grid-cols-2
                            ">

                                <MemberCard
                                    member={
                                        team.owner
                                    }
                                    isOwner
                                />

                            </div>

                        </section>

                    )}


                    {/* MEMBERS */}

                    <section>

                        <div className="
                            mb-4
                            flex
                            items-center
                            justify-between
                        ">

                            <div>

                                <h2 className="
                                    text-lg
                                    font-semibold
                                    text-slate-900
                                ">

                                    Team Members

                                </h2>

                                <p className="
                                    text-sm
                                    text-slate-500
                                ">

                                    Members can access this project and their assigned work.

                                </p>

                            </div>

                        </div>


                        {team.members.length ===
                        0 ? (

                            <div className="
                                rounded-2xl
                                border
                                border-dashed
                                border-slate-300
                                bg-white
                                py-14
                                text-center
                            ">

                                <Users
                                    size={38}
                                    className="
                                        mx-auto
                                        text-slate-300
                                    "
                                />

                                <p className="
                                    mt-4
                                    font-medium
                                    text-slate-700
                                ">

                                    No team members yet.

                                </p>


                                {isProjectOwner && (

                                    <button
                                        onClick={() =>
                                            setModalOpen(
                                                true
                                            )
                                        }
                                        className="
                                            mt-4
                                            text-sm
                                            font-semibold
                                            text-indigo-600
                                        "
                                    >

                                        Add your first member

                                    </button>

                                )}

                            </div>

                        ) : (

                            <div className="
                                grid
                                gap-4
                                lg:grid-cols-2
                            ">

                                {team.members.map(
                                    (member) => (

                                        <MemberCard
                                            key={
                                                member._id
                                            }
                                            member={
                                                member
                                            }
                                            canRemove={
                                                isProjectOwner
                                            }
                                            onRemove={
                                                handleRemove
                                            }
                                        />

                                    )
                                )}

                            </div>

                        )}

                    </section>

                </>

            )}


            <AddMemberModal
                isOpen={
                    modalOpen
                }
                onClose={() =>
                    setModalOpen(false)
                }
                project={
                    selectedProject
                }
                onMemberAdded={
                    handleMemberAdded
                }
            />

        </div>

    );
}


function TeamStat({
    title,
    value
}) {

    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
        ">

            <p className="
                text-3xl
                font-bold
                text-slate-900
            ">

                {value}

            </p>

            <p className="
                mt-1
                text-sm
                text-slate-500
            ">

                {title}

            </p>

        </div>

    );
}