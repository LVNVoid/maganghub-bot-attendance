import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MaganghubCredentialCard } from "@/components/maganghub-credential-card";
import { GithubRepoCard } from "@/components/github-repo-card";
import { AutomationConfigCard } from "@/components/automation-config-card";
import crypto from "node:crypto";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch credential, repos, and automation config in parallel
  const [credential, repos, automation] = await Promise.all([
    db.maganghubCredential.findUnique({
      where: { userId },
    }),
    db.githubRepo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    db.automationConfig.findUnique({
      where: { userId },
    }),
  ]);

  // Ensure an automationConfig exists for the user
  let activeAutomation = automation;
  if (!activeAutomation) {
    activeAutomation = await db.automationConfig.create({
      data: {
        userId,
        isEnabled: false,
        webhookKey: crypto.randomBytes(24).toString("hex"),
      },
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary">
          Pengaturan & Konfigurasi Bot
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Atur kredensial login Monev MagangHub, repository aktivitas, dan mode automasi
        </p>
      </div>

      <div className="space-y-6">
        <MaganghubCredentialCard
          status={credential?.status || "UNCHECKED"}
          hasCredential={!!credential}
          lastCheckedAt={credential?.lastCheckedAt}
        />

        <GithubRepoCard repos={repos} />

        <AutomationConfigCard
          isEnabled={activeAutomation.isEnabled}
          webhookKey={activeAutomation.webhookKey}
          scheduleTime={activeAutomation.scheduleTime}
        />
      </div>
    </div>
  );
}
