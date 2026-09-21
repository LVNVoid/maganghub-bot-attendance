import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getUserMaganghubCredential,
  getUserTrackedRepos,
  getUserAutomationConfig,
  updateAutomationConfig,
  getUserGithubAccount,
} from "@/services/settings-service";
import { getUserAiConfig } from "@/services/ai-config-service";
import { MaganghubCredentialCard } from "@/components/maganghub-credential-card";
import { GithubRepoCard } from "@/components/github-repo-card";
import { AutomationConfigCard } from "@/components/automation-config-card";
import { AiConfigCard } from "@/components/ai-config-card";
import crypto from "node:crypto";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Fetch credential, repos, automation config, AI config, and GitHub account in parallel via service layer
  const [credential, repos, automation, aiConfig, githubAccount] = await Promise.all([
    getUserMaganghubCredential(userId),
    getUserTrackedRepos(userId),
    getUserAutomationConfig(userId),
    getUserAiConfig(userId),
    getUserGithubAccount(userId),
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
        <h1 className="text-lg sm:text-xl font-semibold text-ink-primary">
          Pengaturan &amp; Kredensial
        </h1>
        <p className="text-xs text-ink-secondary mt-1">
          Atur kredensial login Monev MagangHub, repository aktivitas, dan mode automasi
        </p>
      </div>

      <div className="space-y-6">
        <AiConfigCard
          hasConfig={!!aiConfig}
          provider={aiConfig?.provider}
          baseUrl={aiConfig?.baseUrl}
          modelName={aiConfig?.modelName}
        />

        <MaganghubCredentialCard
          status={credential?.status || "UNCHECKED"}
          hasCredential={!!credential}
          lastCheckedAt={credential?.lastCheckedAt}
          emailDisplay={emailDisplay}
        />

        <GithubRepoCard
          repos={repos}
          hasToken={!!githubAccount}
          tokenType={githubAccount?.provider === "github" ? "OAUTH" : githubAccount ? "PAT" : undefined}
        />

        <AutomationConfigCard
          isEnabled={activeAutomation.isEnabled}
          webhookKey={activeAutomation.webhookKey}
          scheduleTime={activeAutomation.scheduleTime}
        />
      </div>
    </div>
  );
}
