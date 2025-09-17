"use client"

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/ui/icons"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "How do I create a new account?",
    answer:
      "To create a new account, go to the Accounts page and click 'Create Account'. Choose your account type (Savings, Current, or Investment) and follow the setup process.",
  },
  {
    question: "How can I transfer money between accounts?",
    answer:
      "You can transfer money using the Payments page. Select 'Transfer' and choose your source and destination accounts, enter the amount, and confirm the transaction.",
  },
  {
    question: "What are the different savings plans available?",
    answer:
      "We offer various savings plans including Susu (automated savings), Goal-based savings, and Fixed deposits. Each plan has different interest rates and terms.",
  },
  {
    question: "How do I apply for a loan?",
    answer:
      "Visit the Loans page and click 'Apply for Loan'. Fill out the application form with your details, choose the loan type and amount, and submit for review.",
  },
  {
    question: "Is my money safe with MicroFi?",
    answer:
      "Yes, your money is protected with bank-level security, encryption, and regulatory compliance. We follow strict security protocols to keep your funds safe.",
  },
]

const supportCategories = [
  {
    title: "Account Management",
    description: "Help with creating and managing accounts",
    icon: Icons.CreditCard,
  },
  {
    title: "Payments & Transfers",
    description: "Assistance with transactions and payments",
    icon: Icons.ArrowLeftRight,
  },
  {
    title: "Loans & Credit",
    description: "Support for loan applications and management",
    icon: Icons.Banknote,
  },
  {
    title: "Savings & Investments",
    description: "Help with savings plans and investments",
    icon: Icons.PiggyBank,
  },
  {
    title: "Security & Privacy",
    description: "Account security and privacy concerns",
    icon: Icons.Shield,
  },
  {
    title: "Technical Support",
    description: "App issues and technical problems",
    icon: Icons.Settings,
  },
]

export default function HelpPage() {
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
              <p className="text-muted-foreground">Find answers to common questions and get support</p>
            </div>

            {/* Search */}
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Icons.Search />
                  <Input placeholder="Search for help articles..." className="flex-1" />
                  <Button>Search</Button>
                </div>
              </CardContent>
            </Card>

            {/* Support Categories */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {supportCategories.map((category, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <category.icon />
                        </div>
                        <div>
                          <h3 className="font-semibold">{category.title}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Still Need Help?</CardTitle>
                <CardDescription>Contact our support team for personalized assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Icons.MessageCircle />
                    <h3 className="font-semibold mt-2">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-3">Chat with our support team</p>
                    <Button variant="outline" size="sm">
                      Start Chat
                    </Button>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Icons.Mail />
                    <h3 className="font-semibold mt-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">Send us an email</p>
                    <Button variant="outline" size="sm">
                      Send Email
                    </Button>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Icons.Phone />
                    <h3 className="font-semibold mt-2">Phone Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">Call our support line</p>
                    <Button variant="outline" size="sm">
                      Call Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
