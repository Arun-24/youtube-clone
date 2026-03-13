import axios from "../lib/axiosinstance";
import { useUser } from "../lib/AuthContext";
import { Button } from "./ui/button";

const plans = [
  {
    name: "FREE",
    price: 0,
    description: [
      "Watch videos up to 5 minutes",
      "Basic access",
      "Limited experience",
    ],
  },
  {
    name: "BRONZE",
    price: 10,
    description: [
      "Watch videos up to 7 minutes",
      "Fewer interruptions",
      "Better experience",
    ],
  },
  {
    name: "SILVER",
    price: 50,
    description: [
      "Watch videos up to 10 minutes",
      "Priority viewing",
      "Smooth experience",
    ],
  },
  {
    name: "GOLD",
    price: 100,
    description: [
      "Unlimited watch time",
      "No restrictions",
      "Best premium experience",
    ],
  },
];

const PlanUpgrade = () => {
  const { user } = useUser() as any;

  const handleUpgrade = async (plan: string) => {
    try {
      const { data } = await axios.post("/api/payment/create-order", { plan });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "YouTube Clone",
        description: `${plan} Plan Upgrade`,
        handler: async function (response: any) {
          await axios.post("/api/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan,
            email: user.email,
          });

          alert("Plan upgraded successfully!");
          window.location.reload();
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#ff0000",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">
        Upgrade Your Plan
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = user?.plan === plan.name;

          return (
            <div
              key={plan.name}
              className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  ${
    plan.name === "GOLD"
      ? "border-yellow-400"
      : "border-[color:var(--border-color)]"
  }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-semibold">{plan.name}</h2>
                  {plan.price > 0 && (
                    <span className="text-lg font-bold">₹{plan.price}</span>
                  )}
                </div>

                <ul className="text-sm text-[color:var(--text-muted)] space-y-1 mb-6">
                  {plan.description.map((point, index) => (
                    <li key={index}>• {point}</li>
                  ))}
                </ul>
              </div>

              {isCurrentPlan ? (
                <Button variant="secondary" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : plan.name === "FREE" ? (
                <Button variant="secondary" className="w-full" disabled>
                  Free Plan
                </Button>
              ) : (
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleUpgrade(plan.name)}
                >
                  Upgrade
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanUpgrade;
