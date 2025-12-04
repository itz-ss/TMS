import React, { useState, useEffect, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateSettingsThunk } from "../../store/authSlice";

/* SettingsPage
   - Displays and updates theme and notification preferences
   - Loads data from Redux (user.settings), allows edits, and dispatches updateSettingsThunk
   - Provides simple save/error UI feedback
*/
export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Local UI state for settings form
  const [settings, setSettings] = useState({
    theme: "light",
    notifications: {
      taskAssigned: true,
      taskRevision: true,
      taskApproved: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Sync Redux user.settings to local form
  useEffect(() => {
    if (user?.settings) {
      setSettings(user.settings);
    }
  }, [user?.settings]);

  const handleChangeTheme = useCallback((e) => {
    setSettings((s) => ({ ...s, theme: e.target.value }));
  }, []);

  const handleToggle = useCallback((key) => {
    setSettings((s) => ({
      ...s,
      notifications: { ...s.notifications, [key]: !s.notifications[key] },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await dispatch(updateSettingsThunk(settings)).unwrap();
      setMessage({ type: "success", text: "Settings saved" });
      setSettings(result); // Important to sync with backend
    } catch (err) {
      setMessage({ type: "error", text: err?.message || "Failed to save settings" });
    } finally {
      setLoading(false);
    }
  }, [settings, dispatch]);

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      <div className="settings-section">
        <label>Theme</label>
        <select value={settings.theme} onChange={handleChangeTheme}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="settings-section">
        <label>Notifications</label>
        <div>
          <label>
            <input type="checkbox" checked={settings.notifications.taskAssigned} onChange={() => handleToggle('taskAssigned')} />
            Task assigned
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={settings.notifications.taskRevision} onChange={() => handleToggle('taskRevision')} />
            Task revision
          </label>
        </div>
        <div>
          <label>
            <input type="checkbox" checked={settings.notifications.taskApproved} onChange={() => handleToggle('taskApproved')} />
            Task approved
          </label>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          {loading ? "Saving…" : "Save Settings"}
        </button>
        {message && <p className={`msg ${message.type}`}>{message.text}</p>}
      </div>
    </div>
  );
}
