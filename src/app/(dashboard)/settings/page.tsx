import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUserMaganghubCredential,
  getUserTrackedRepos,
  getUserAutomationConfig,
  updateAutomationConfig,
} from "@/services/settings-service";
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

  // Fetch credential, repos, and automation config in parallel via service layer
  const [credential, repos, automation] = await Promise.all([
    getUserMaganghubCredential(userId),
    getUserTrackedRepos(userId),
    getUserAutomationConfig(userId),
  ]);

  // Ensure an automationConfig exists for the user
  let activeAutomation = automation;
  if (!activeAutomation) {
    activeAutomation = await updateAutomationConfig(userId, {
      isEnabled: false,
      scheduleTime: "13:50",
      webhookKey: crypto.randomBytes(24).toString("hex"),
    });
  }

  let emailDisplay = "";
  if (credential) {
    try {
      const { decrypt } = await import("@/lib/crypto");
      const decrypted = decrypt(credential.encryptedPassword, credential.iv, credential.authTag);
      const parsed = JSON.parse(decrypted);
      if (parsed.email) {
        emailDisplay = parsed.email;
      }
    } catch {
      emailDisplay = "Akun Tersimpan";
    }
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
          emailDisplay={emailDisplay}
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
