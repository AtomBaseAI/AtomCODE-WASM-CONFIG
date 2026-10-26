"use client";

/**
 * Runtime-version dropdown for a language (doc §3: "a practical version
 * selector offers only combinations that are actually packaged and tested").
 *
 * Lists every RuntimeProfile of the language (e.g. Python → 3.11/3.12/3.13/
 * 3.14, Java → 8/11/17). Items render as the plain version label — e.g.
 * "Python 3.11" — without engine details. Unverified profiles render
 * disabled with "(not configured)".
 */

import {
  getProfilesForLanguage,
  type RuntimeProfile,
} from "@/lib/runtime-registry";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function profileVersionLabel(profile: RuntimeProfile): string {
  return profile.label;
}

export function LanguageVersionSelect({
  lang,
  value,
  onChange,
  className,
  disabled,
}: {
  lang: string;
  value?: string | null;
  onChange: (profileId: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const profiles = getProfilesForLanguage(lang);
  if (profiles.length === 0) return null;

  const active = profiles.find((p) => p.id === value) ?? profiles[0];

  return (
    <Select
      value={active?.id}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger
        className={className}
        aria-label="Runtime version"
      >
        <SelectValue placeholder="Version" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{active?.label.split(" ")[0]} versions</SelectLabel>
          {profiles.map((profile) => (
            <SelectItem
              key={profile.id}
              value={profile.id}
              disabled={!profile.verified}
            >
              {profileVersionLabel(profile)}
              {!profile.verified ? " (not configured)" : ""}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
