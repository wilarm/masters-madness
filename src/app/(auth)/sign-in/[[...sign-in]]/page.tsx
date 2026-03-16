import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-[var(--shadow-xl)] rounded-xl",
            headerTitle: "font-heading",
            formButtonPrimary:
              "bg-masters-green hover:bg-masters-green-dark transition-colors",
          },
        }}
      />
    </div>
  );
}
