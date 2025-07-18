import timezones from "timezones-list"
import fs from "fs";
import path from "path";

// create a list of timezones (for dropdowns)
const timezoneList = timezones.map((tz) => ({
    value: tz.tzCode,
    label: tz.tzCode
}));

// sort the list alphabetically by label
timezoneList.sort((a, b) => a.label.localeCompare(b.label));

// add a default option
timezoneList.unshift({
    value: "",
    label: ""
});

// save to a file
const fp = path.join(__dirname, "../public/data/timezones.json");
fs.writeFileSync(fp, JSON.stringify(timezoneList, null, 2));

console.log(`Timezone list generated: ${fp}, length: ${timezoneList.length}`);