"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface CostSummaryProps {
  costs: {
    economic: { perPerson: string; total: string };
    balanced: { perPerson: string; total: string };
    luxury: { perPerson: string; total: string };
  };
}

export default function CostSummary({ costs }: CostSummaryProps) {
  const plans = [
    { name: "Economic", data: costs.economic, color: "from-green-500 to-green-600" },
    { name: "Balanced", data: costs.balanced, color: "from-blue-500 to-blue-600" },
    { name: "Luxury", data: costs.luxury, color: "from-amber-500 to-amber-600" },
  ];

  return (
    <Card className="bg-white shadow-2xl border border-gray-100 rounded-2xl">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          Total Estimated Cost
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-gradient-to-br ${plan.color} rounded-xl p-6 text-white`}
            >
              <h3 className="text-lg font-semibold mb-4">{plan.name} Plan</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-sm opacity-90">Per Person</div>
                  <div className="text-2xl font-bold">{plan.data.perPerson}</div>
                </div>
                <div>
                  <div className="text-sm opacity-90">Total</div>
                  <div className="text-xl font-semibold">{plan.data.total}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

