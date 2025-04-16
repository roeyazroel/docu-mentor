import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "rounded-xl shadow-xl border border-gray-200",
              headerTitle: "text-xl font-bold",
              headerSubtitle: "text-sm text-gray-500",
            },
          }}
          afterSignInUrl="/"
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Docu-Mentor — Your intelligent documentation assistant
          </p>
        </div>
      </div>
    </div>
  );
}
