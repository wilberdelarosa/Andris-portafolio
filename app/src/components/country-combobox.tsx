"use client";

import { useId, useMemo, useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import type { Locale } from "@/content/projects";

const COUNTRY_CODES = `AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW`;

type CountryComboboxProps = {
  locale: Locale;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  noResults: string;
};

const normalize = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();

export function CountryCombobox({
  locale,
  label,
  placeholder,
  searchPlaceholder,
  noResults,
}: CountryComboboxProps) {
  const [value, setValue] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = `country-options-${useId().replace(/:/g, "")}`;
  const optionNames = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return COUNTRY_CODES.split(" ")
      .map((code) => ({ code, name: names.of(code) ?? code }))
      .sort((a, b) => a.name.localeCompare(b.name, locale));
  }, [locale]);
  const matches = useMemo(() => {
    const needle = normalize(query.trim());
    return optionNames
      .filter(({ name, code }) => !needle || normalize(`${name} ${code}`).includes(needle))
      .slice(0, 50);
  }, [optionNames, query]);

  const choose = (name: string) => {
    setValue(name);
    setQuery(name);
    setOpen(false);
  };

  return (
    <div className="country-combobox">
      <input type="hidden" name="country" value={value} />
      <input
        type="text"
        role="combobox"
        aria-label={label}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open && matches[activeIndex] ? `${listId}-${matches[activeIndex].code}` : undefined}
        autoComplete="country-name"
        spellCheck={false}
        placeholder={open ? searchPlaceholder : placeholder}
        value={query}
        onFocus={() => {
          setOpen(true);
          setActiveIndex(-1);
        }}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setValue("");
          setActiveIndex(0);
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActiveIndex((index) =>
              Math.min(index < 0 ? 0 : index + 1, matches.length - 1),
            );
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && open && matches[activeIndex]) {
            event.preventDefault();
            choose(matches[activeIndex].name);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {open && (
        <div className="country-combobox-menu">
          {matches.length ? (
            <ul id={listId} role="listbox" aria-label={label}>
              {matches.map(({ code, name }, index) => (
                <li
                  id={`${listId}-${code}`}
                  key={code}
                  role="option"
                  aria-selected={value === name}
                  className={index === activeIndex ? "is-active" : undefined}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p role="status">{noResults}</p>
          )}
        </div>
      )}
      <CaretDown className="country-combobox-hint" size={18} aria-hidden="true" />
    </div>
  );
}
