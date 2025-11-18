import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading reset page...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
