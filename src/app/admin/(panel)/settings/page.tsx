import { SettingsEditor } from "@/components/admin/settings-editor";
import { getSettings } from "@/lib/data";

export default async function AdminSettings() {
  return (
    <div className="pt-2">
      <SettingsEditor initial={await getSettings()} />
    </div>
  );
}
