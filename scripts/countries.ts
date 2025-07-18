import countries from "i18n-iso-countries";
import fs from "fs";
import path from "path";

// create a list of countries (for dropdowns)
const countryList = Object.entries(countries.getNames("en", { select: "official" })).map(([code, name]) => ({
    value: code,
    label: name
}));

// sort the list alphabetically by label
countryList.sort((a, b) => a.label.localeCompare(b.label));

// add a default option
countryList.unshift({
    value: "",
    label: ""
});

// save to a file
const fp = path.join(__dirname, "../public/data/countries.json");
fs.writeFileSync(fp, JSON.stringify(countryList, null, 2));

console.log(`Country list generated: ${fp}, length: ${countryList.length}`);