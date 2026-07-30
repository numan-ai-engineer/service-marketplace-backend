function ForgotPassword() {
  return (
    <div>
      <h1>Forgot Password</h1>

      <p>Enter your email to reset your password.</p>

      <input
        type="email"
        placeholder="Enter Email"
      />

      <button>
        Send Reset Link
      </button>
    </div>
  );
}

export default ForgotPassword;