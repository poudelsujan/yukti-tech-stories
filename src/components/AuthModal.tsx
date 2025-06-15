
import React, { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  mode: "login" | "signup";
  onClose: () => void;
}

const AuthModal = ({ isOpen, mode, onClose }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Optionally show name field for signup
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Placeholder: Show "ready for integration"
    setTimeout(() => {
      setLoading(false);
      onClose();
      alert("Auth form submitted. Connect your API integration here!");
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[99]">
      <div className="bg-white rounded-lg shadow-xl w-[95vw] max-w-sm p-8 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={22} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "login" ? "Log In" : "Sign Up"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === "signup" && (
            <div>
              <label className="block text-gray-700 mb-1 text-sm">Full Name</label>
              <input
                type="text"
                value={name}
                className="border px-3 py-2 rounded w-full"
                onChange={e => setName(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Email</label>
            <input
              type="email"
              value={email}
              className="border px-3 py-2 rounded w-full"
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm">Password</label>
            <input
              type="password"
              value={password}
              className="border px-3 py-2 rounded w-full"
              onChange={e => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-600 text-white rounded-lg w-full py-3 font-semibold hover:bg-emerald-700 transition"
            disabled={loading}
          >
            {loading
              ? mode === "login"
                ? "Logging In..."
                : "Signing Up..."
              : mode === "login"
              ? "Log In"
              : "Sign Up"}
          </button>
        </form>
        <div className="mt-4 text-center">
          {mode === "login" ? (
            <>
              <span className="text-gray-500 text-sm">New here? </span>
              <button
                onClick={() => onClose()}
                className="text-emerald-600 font-semibold text-sm ml-1"
              >
                {/* You might prefer handling switching modes from parent */}
                Sign up
              </button>
            </>
          ) : (
            <>
              <span className="text-gray-500 text-sm">Already have an account? </span>
              <button
                onClick={() => onClose()}
                className="text-green-700 font-semibold text-sm ml-1"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
