export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">Terms of Service</h1>
          <p className="text-muted-foreground">Last updated: January 15, 2024</p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using MicroFi Banking services, you accept and agree to be bound by the terms and
              provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="mb-4">
              Permission is granted to temporarily use MicroFi Banking services for personal, non-commercial transitory
              viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>modify or copy the materials</li>
              <li>use the materials for any commercial purpose or for any public display</li>
              <li>attempt to reverse engineer any software contained in the service</li>
              <li>remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Account Security</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account and password and for restricting
              access to your computer. You agree to accept responsibility for all activities that occur under your
              account or password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Financial Services</h2>
            <p className="mb-4">
              MicroFi Banking provides financial services including but not limited to account management, savings
              plans, loans, and investment services. All financial transactions are subject to applicable laws and
              regulations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Privacy Policy</h2>
            <p className="mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
              information when you use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
            <p className="mb-4">
              In no event shall MicroFi Banking or its suppliers be liable for any damages (including, without
              limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or
              inability to use the materials on MicroFi Banking&apos;s website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Governing Law</h2>
            <p className="mb-4">
              These terms and conditions are governed by and construed in accordance with the laws of Ghana and you
              irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Contact Information</h2>
            <p className="mb-4">If you have any questions about these Terms of Service, please contact us at:</p>
            <div className="bg-muted p-4 rounded-lg">
              <p>Email: legal@microfi.com</p>
              <p>Phone: +233 XX XXX XXXX</p>
              <p>Address: Accra, Ghana</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
