"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const monthlyData = [
  { month: "Jan", income: 4000, expenses: 2400, savings: 1600 },
  { month: "Feb", income: 3000, expenses: 1398, savings: 1602 },
  { month: "Mar", income: 2000, expenses: 2800, savings: -800 },
  { month: "Apr", income: 2780, expenses: 3908, savings: -1128 },
  { month: "May", income: 1890, expenses: 4800, savings: -2910 },
  { month: "Jun", income: 2390, expenses: 3800, savings: -1410 },
]

const expenseData = [
  { category: "Food", amount: 1200, color: "#6366f1" },
  { category: "Transport", amount: 800, color: "#8b5cf6" },
  { category: "Utilities", amount: 600, color: "#06b6d4" },
  { category: "Entertainment", amount: 400, color: "#10b981" },
  { category: "Others", amount: 300, color: "#f59e0b" },
]

const savingsGrowth = [
  { month: "Jan", amount: 5000 },
  { month: "Feb", amount: 6200 },
  { month: "Mar", amount: 5400 },
  { month: "Apr", amount: 4272 },
  { month: "May", amount: 1362 },
  { month: "Jun", amount: 2952 },
]

export function FinancialCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Monthly financial overview</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              income: {
                label: "Income",
                color: "hsl(var(--chart-1))",
              },
              expenses: {
                label: "Expenses",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="income" fill="var(--color-chart-1)" />
                <Bar dataKey="expenses" fill="var(--color-chart-2)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Current month spending categories</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "Amount",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {expenseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {expenseData.map((item) => (
              <div key={item.category} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm">{item.category}</span>
                <span className="text-sm font-medium">₵{item.amount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Savings Growth */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Savings Growth</CardTitle>
          <CardDescription>Your savings journey over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              amount: {
                label: "Savings Amount",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={savingsGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="var(--color-chart-3)"
                  fill="var(--color-chart-3)"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
