import { Button } from "~/components/ui/button";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { createCallerWithContext } from "~/server/api/root.server";
import { TRPCError } from "@trpc/server";
import { auth } from "~/lib/auth/auth.server";
import { useEffect } from "react";
import { useInviteLinkTokenStore } from "~/hooks/common/useInviteLinkTokenStore";

export async function loader({ request, params }: LoaderFunctionArgs) {
  try {
    const token = params.token;
    if (!token)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Invite link expired",
      });

    const isAuthUser = await auth.api.getSession({ headers: request.headers });
    if (!isAuthUser)
      return {
        token: params.token,
        title: "Join the Company",
        message:
          "To accept this invite, please log in or sign up for an account",
      };

    const caller = await createCallerWithContext(request);

    await caller.companyMember.joinByInviteLink({ token });

    return { successJoin: true };
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.message === "Invite link expired") {
        return {
          title: "Invite Expired",
          message: "This invite link has expired. Please request a new one.",
        };
      }
      if (error.message === "You are already a member of this company") {
        return {
          title: "Already Joined",
          message: "You're already a member of this company.",
        };
      }
    } else {
      throw error;
    }
  }
}

// TODO: Cron job to delete expired invite links

export default function Invite() {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const { setToken, clearToken } = useInviteLinkTokenStore();

  useEffect(() => {
    if (loaderData?.token) {
      setToken(loaderData.token);
    } else {
      clearToken();
    }
    if (loaderData?.successJoin) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaderData]);

  if (loaderData?.successJoin) return null;

  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="max-w-md space-y-4 bg-muted p-6 rounded-xl border shadow">
        <h1 className="text-2xl font-bold text-foreground">
          {loaderData?.title || "Invite Link Expired"}
        </h1>
        <p className="text-muted-foreground">
          {loaderData?.message || "Please try again later."}
        </p>
        {loaderData?.token ? (
          <>
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            <Button onClick={() => navigate("/login")}>Login</Button>
          </>
        ) : (
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        )}
      </div>
    </section>
  );
}
