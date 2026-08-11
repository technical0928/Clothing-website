const sections = [
  {
    id: "about-noor-e-multan",
    eyebrow: "About Noor-e-Multan",
    title: "A clothing house built around graceful everyday luxury.",
    body: "Noor-e-Multan curates Pakistani ready-to-wear for customers who want traditional craft with a modern finish. The store focuses on lawn, seasonal wear, formal silhouettes, and comfortable daily pieces that feel polished without becoming difficult to wear.",
  },
  {
    id: "our-story",
    eyebrow: "Our Story",
    title: "Inspired by Multan's warmth, texture, and cultural detail.",
    body: "The brand direction is simple: soft fabrics, refined color, dependable stitching, and honest product presentation. Every collection is arranged so customers can quickly understand fabric, fit, size, color, and occasion before ordering.",
  },
  {
    id: "careers",
    eyebrow: "Careers",
    title: "Work with a growing fashion storefront.",
    body: "Noor-e-Multan welcomes creative people in styling, product photography, catalog management, customer support, and operations. A good team member is careful with customers, honest about details, and proud of clean presentation.",
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="mx-auto max-w-screen-2xl px-6 py-20 lg:px-12">
        <div className="max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.35em] text-amber-700">
            Noor-e-Multan
          </p>
          <h1 className="mt-4 font-serif text-6xl font-bold leading-tight text-stone-900 max-md:text-4xl">
            Heritage clothing, carefully styled for modern wardrobes.
          </h1>
          <p className="mt-6 text-xl leading-8 text-stone-600">
            Learn more about the brand, the store story, and the experience Noor-e-Multan wants every customer to feel.
          </p>
        </div>

        <div className="mt-16 grid gap-10">
          {sections.map((section) => (
            <section
              id={section.id}
              key={section.id}
              className="scroll-mt-32 border-t border-stone-200 pt-10"
            >
              <p className="text-sm font-bold uppercase tracking-[0.25em] text-amber-700">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 max-w-3xl font-serif text-4xl font-bold text-stone-900">
                {section.title}
              </h2>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-stone-600">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
