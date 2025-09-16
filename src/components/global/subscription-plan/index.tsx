import React from "react";

type Props = {
  type: "FREE" | "PRO";
  children: React.ReactNode;
};

function SubscriptionPlan({ type, children }: Props) {
  const  data  = null
  return data?.data?.subscription?.plan === type && children;
}

export default SubscriptionPlan;