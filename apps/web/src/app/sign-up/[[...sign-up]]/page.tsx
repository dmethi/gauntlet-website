import { SignUp } from '@clerk/nextjs';

const SignUpPage = () => (
  <div className="flex min-h-[70vh] items-center justify-center py-12">
    <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />
  </div>
);

export default SignUpPage;
