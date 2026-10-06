export default function ReportStatCard({
    title,
    value,
    subtitle,
    icon: Icon
}) {

    return (

        <div className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition
            hover:-translate-y-0.5
            hover:shadow-md
        ">

            <div className="
                flex
                items-start
                justify-between
                gap-4
            ">

                <div>

                    <p className="
                        text-sm
                        font-medium
                        text-slate-500
                    ">

                        {title}

                    </p>


                    <p className="
                        mt-2
                        text-3xl
                        font-bold
                        tracking-tight
                        text-slate-900
                    ">

                        {value}

                    </p>


                    {subtitle && (

                        <p className="
                            mt-2
                            text-xs
                            text-slate-500
                        ">

                            {subtitle}

                        </p>

                    )}

                </div>


                <div className="
                    rounded-xl
                    bg-indigo-50
                    p-3
                    text-indigo-600
                ">

                    <Icon size={20} />

                </div>

            </div>

        </div>

    );
}