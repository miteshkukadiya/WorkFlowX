const Button = ({
    children,
    type = "button",
    variant = "primary",
    className = "",
    ...props
}) => {

    const baseStyles =
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

    const variants = {
        primary:
            "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",

        secondary:
            "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-300",

        danger:
            "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",

        ghost:
            "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    };

    return (
        <button
            type={type}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;