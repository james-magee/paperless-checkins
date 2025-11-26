const parseValue = (value: string) => {
  const num = Number.parseInt(value);
  if (!Number.isNaN(num)) {
    return num;
  }
  switch (value) {
    case "FALSE":
      return false;
    case "False":
      return false;
    case "false":
      return false;

    case "TRUE":
      return true;
    case "true":
      return true;
    default:
      return value;
  }
};

export const csvParse = (
  csvContent: string,
  delimiter: string = ",",
  shouldParse: boolean = true,
  shouldLog: boolean = true,
  lastLineBlank: boolean = true,
): any[] => {
  if (shouldLog) {
    console.log(`RAW CONTENT:\n${csvContent}`);
  }
  const lines = csvContent.split("\n");
  const headers = lines[0].split(delimiter).map((s) => s.trim());
  if (shouldLog) {
    console.log(`HEADERS:\n${headers.join(" ")}`);
  }
  const output = [];
  const lastlineIndex = lastLineBlank ? lines.length - 1 : lines.length;
  for (let li = 1; li < lastlineIndex; li++) {
    const line = lines[li];
    console.log(line);
    const entry: Record<string, any> = {};
    const entries = line.split(delimiter).map((s) => s.trim());
    if (entries.length != headers.length) {
      console.log(entries);
      throw Error("improperly formed csv");
    }
    for (let i = 0; i < headers.length; i++) {
      const headerName = headers[i];
      const entryValue = shouldParse ? parseValue(entries[i]) : entries[i];
      entry[headerName] = entryValue;
    }
    output.push(entry);
  }
  if (shouldLog) {
    console.log(output);
  }
  return output;
};
