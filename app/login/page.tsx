import LoginForm from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50">
      <div className="flex justify-center items-center">
        <LoginForm />
      </div>
      <footer className="text-center text-sm text-gray-500 mt-6">
        © {new Date().getFullYear()} EV Dealer Management
      </footer>
    </div>
  );
}
