import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PiggyBank, Target, Repeat } from "lucide-react"

const savingsTypes = [
  {
    name: "Fixed Savings",
    description: "Fixed amount, fixed duration",
    icon: Target,
    color: "bg-purple-500",
  },
  {
    name: "Flexible Savings",
    description: "Variable contributions",
    icon: PiggyBank,
    color: "bg-blue-500",
  },
  {
    name: "Susu Plan",
    description: "Traditional rotating savings",
    icon: Repeat,
    color: "bg-orange-500",
  },
]

export function SavingsActions() {
  return (
    <div className="space-y-6">
      {/* Create New Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Create Savings Plan</CardTitle>
          <CardDescription>Start a new savings journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              {savingsTypes.map((type) => (
                <Button
                  key={type.name}
                  variant="outline"
                  className="w-full h-auto p-4 flex items-center space-x-3 hover:bg-accent bg-transparent"
                >
                  <div className={`p-2 rounded-lg ${type.color}`}>
                    <type.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium">{type.name}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Contribution */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Contribution</CardTitle>
          <CardDescription>Add money to existing plans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Select Plan</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose savings plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="emergency">Emergency Fund</SelectItem>
                  <SelectItem value="vacation">Vacation Susu</SelectItem>
                  <SelectItem value="house">House Down Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" placeholder="Enter amount" className="w-full" />
            </div>

            <Button className="w-full">Make Contribution</Button>
          </div>
        </CardContent>
      </Card>

      {/* Savings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Savings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Saved</span>
              <span className="font-medium">₵27,900</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Plans</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Monthly Contributions</span>
              <span className="font-medium">₵1,700</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interest Earned</span>
              <span className="font-medium text-green-600">₵2,340</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
