import RegisterForm from "@/components/forms/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50">
      <div className="flex justify-center items-center">
        <RegisterForm />
      </div>
      <footer className="text-center text-sm text-gray-500 mt-6">
        © {new Date().getFullYear()} EV Dealer Management
      </footer>
    </div>
  );
}
