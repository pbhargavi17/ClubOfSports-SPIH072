// SportTemplateForm — config-driven, renders any sport's template fields dynamically.
// Floodlit Clubhouse reminder: every field earns its place by directly shaping the Skill Index or match quality.
import { Loader2, Save, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { SectionKicker } from "@/components/ProductPrimitives";
import {
  getSportTemplate,
  saveSportProfile,
  getMySportProfile,
  type SportTemplate,
  type TemplateField,
  type UserSportProfile,
} from "@/lib/api";
import { sports } from "@/lib/mock-data";

interface SportTemplateFormProps {
  sportName: string;
  onSaved: (skillIndex: number) => void;
  onCancel: () => void;
}

const sportGlyph: Record<string, string> = {
  Badminton: "⌁", Cricket: "◒", Football: "◉", Basketball: "🏀",
  Running: "↗", Chess: "♞", Swimming: "≈", "Table Tennis": "◈",
};

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: TemplateField;
  value: string | number;
  onChange: (val: string | number) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <label className="field-label" key={field.name}>
        {field.label.toUpperCase()}
        <select
          id={`sport-field-${field.name}`}
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select {field.label}…
          </option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="field-label" key={field.name}>
        {field.label.toUpperCase()}
        <input
          id={`sport-field-${field.name}`}
          type="number"
          min={0}
          value={value as number}
          placeholder={field.placeholder ?? "0"}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </label>
    );
  }

  // text fallback
  return (
    <label className="field-label" key={field.name}>
      {field.label.toUpperCase()}
      <input
        id={`sport-field-${field.name}`}
        type="text"
        value={value as string}
        placeholder={field.placeholder ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function SportTemplateForm({ sportName, onSaved, onCancel }: SportTemplateFormProps) {
  const [template, setTemplate] = useState<SportTemplate | null>(null);
  const [existingProfile, setExistingProfile] = useState<UserSportProfile | null>(null);
  const [values, setValues] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sportColor = sports.find((s) => s.name === sportName)?.color ?? "#C7F25C";
  const glyph = sportGlyph[sportName] ?? "◈";

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSportTemplate(sportName),
      getMySportProfile(sportName).catch(() => null),
    ])
      .then(([tmpl, profile]) => {
        setTemplate(tmpl);
        setExistingProfile(profile);
        // Pre-fill defaults: if editing, use saved data; else use first option for selects
        const defaults: Record<string, string | number> = {};
        for (const field of tmpl.template_config.fields) {
          if (profile?.profile_data[field.name] !== undefined) {
            defaults[field.name] = profile.profile_data[field.name];
          } else if (field.type === "select" && field.options?.[0]) {
            defaults[field.name] = field.options[0];
          } else if (field.type === "number") {
            defaults[field.name] = 0;
          } else {
            defaults[field.name] = "";
          }
        }
        setValues(defaults);
      })
      .catch(() => {
        toast.error("Could not load sport template. Check that the backend is running and templates are seeded.");
      })
      .finally(() => setLoading(false));
  }, [sportName]);

  const handleSave = async () => {
    if (!template) return;
    setSaving(true);
    try {
      const result = await saveSportProfile(sportName, values);
      toast.success(`${sportName} profile saved! Skill Index: ${result.skill_index}`);
      onSaved(result.skill_index);
    } catch {
      toast.error("Could not save sport profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="sport-template-loading">
        <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
        <p>Loading {sportName} template…</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="sport-template-loading">
        <p>Template for {sportName} not found. Please seed the templates.</p>
        <button className="button-outline" onClick={onCancel}>Go back</button>
      </div>
    );
  }

  return (
    <div className="sport-template-form">
      {/* Sport header */}
      <div className="sport-template-header">
        <span className="sport-template-glyph" style={{ color: sportColor }}>{glyph}</span>
        <div>
          <SectionKicker>{existingProfile ? "EDIT SPORT PROFILE" : "NEW SPORT PROFILE"}</SectionKicker>
          <h3>{sportName}</h3>
          <p style={{ fontSize: 13, opacity: 0.65, marginTop: 4 }}>
            {existingProfile
              ? "Update your details to improve your Skill Index and match quality."
              : "Fill in your details — this shapes your Skill Index and who you get matched with."}
          </p>
        </div>
      </div>

      {/* Skill Index preview notice */}
      <div className="sport-template-notice">
        <span>⚡</span>
        <span>Your Skill Index is automatically calculated from these answers.</span>
      </div>

      {/* Dynamic fields */}
      <div className="sport-template-fields">
        {template.template_config.fields.map((field) => (
          <FieldInput
            key={field.name}
            field={field}
            value={values[field.name] ?? ""}
            onChange={(val) => setValues((prev) => ({ ...prev, [field.name]: val }))}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="sport-template-actions">
        <button className="button-outline" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
        <button className="button-lime" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} />
              Saving…
            </>
          ) : (
            <>
              <Save size={15} />
              Save {sportName} profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
