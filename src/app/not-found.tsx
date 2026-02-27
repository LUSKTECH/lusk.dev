import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>404 — Page Not Found</h1>
      <p>
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <p>
        <Link href="/">Return to Home</Link>
      </p>
    </main>
  );
}
