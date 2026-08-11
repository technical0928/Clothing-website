const supportSections = [
  {
    id: "contact",
    title: "Contact Us",
    body: "For order help, sizing questions, or product details, message Noor-e-Multan on WhatsApp or email support@noor-e-multan.example. Our team replies with clear next steps.",
  },
  {
    id: "how-to-order",
    title: "How to Order",
    body: "Choose a product, select size and color, add it to cart, then complete checkout with your delivery details. After confirmation, the team prepares your parcel and shares delivery updates.",
  },
  {
    id: "faq",
    title: "FAQ",
    body: "Common questions include sizing, delivery time, exchange eligibility, and fabric details. Product pages show the key information first so customers can decide quickly.",
  },
  {
    id: "loyalty-card",
    title: "Noor-e-Multan Loyalty Card",
    body: "The loyalty card section is reserved for returning-customer benefits, seasonal offers, and early collection access.",
  },
  {
    id: "terms",
    title: "Terms Of Use",
    body: "Use the website for genuine shopping, accurate order details, and respectful communication. Prices, availability, and product details can change as collections update.",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    body: "Customer information is used to process orders, improve support, and communicate delivery updates. Noor-e-Multan keeps customer details limited to store operations.",
  },
  {
    id: "size-guide",
    title: "Size Guide",
    body: "Check shoulder, chest, waist, length, and sleeve measurements before ordering. When between sizes, choose the fit based on the fabric and whether you prefer relaxed or tailored styling.",
  },
  {
    id: "fabric-care",
    title: "Fabric Care",
    body: "Wash delicate lawn and embroidered pieces gently, avoid harsh bleach, dry in shade, and press at a suitable heat level. Good fabric care keeps colors richer for longer.",
  },
];

export default function SupportPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-12">
        <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-700">
          Customer Care
        </p>
        <h1 className="mt-4 font-serif text-6xl font-bold text-stone-900 max-md:text-4xl">
          Shopping help, policies, and product guidance.
        </h1>
        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {supportSections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-32 border border-stone-200 bg-stone-50 p-7"
            >
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-stone-600">{section.body}</p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
