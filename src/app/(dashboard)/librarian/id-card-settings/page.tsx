import { IdCardSettingsForm } from "@/components/admin/id-card-settings-form";
import { getSystemSettings } from "@/actions/settings";

export default async function LibrarianIdCardSettingsPage() {
  const initialConfig = await getSystemSettings();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ID Card Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure the global design and theme for Library ID Cards.
        </p>
      </div>

      <IdCardSettingsForm initialConfig={initialConfig} />
    </div>
  );
}
