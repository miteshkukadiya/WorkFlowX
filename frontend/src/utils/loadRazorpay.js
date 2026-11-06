export const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) {
            resolve();
            return;
        }

        const script = document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = () => resolve();

        script.onerror = () => {
            reject(new Error("Unable to load Razorpay Checkout"));
        };

        document.body.appendChild(script);
    });
};