import { SignIn } from '@clerk/nextjs';

const SignInPage = () => (
  <div className="flex min-h-[70vh] items-center justify-center py-12">
    <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/managers" />
  </div>
);

export default SignInPage;
