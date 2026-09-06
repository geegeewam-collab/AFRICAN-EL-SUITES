import Link from "next/link";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-5"
      style={{ backgroundColor: "#0B1526" }}
    >
      <span className="eyebrow">404</span>
      <h1 className="mt-4 text-3xl md:text-4xl font-serif text-white mb-4">
        This listing doesn't exist.
      </h1>
      <p className="text-white/50 text-sm max-w-sm mb-8">
        The link might be mistyped, or this property hasn't been added to
        African El Suites yet.
      </p>
      <Link
        href="/"
        className="px-6 py-3 text-sm font-medium rounded-sm transition-all duration-200 hover:opacity-90"
        style={{ background: "linear-gradient(135deg, #B8935A, #D4B483)", color: "#0B1526" }}
      >
        Browse all properties
      </Link>
    </main>
  );
}
