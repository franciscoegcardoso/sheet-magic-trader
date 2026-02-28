/**
 * Export data as CSV or Excel-compatible CSV file
 */
export function exportToCSV(
  data: Record<string, string | number | null | undefined>[],
  filename: string,
  columns?: { key: string; label: string }[]
) {
  if (data.length === 0) return;

  const keys = columns ? columns.map((c) => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map((c) => c.label) : keys;

  const BOM = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const separator = ";"; // Semicolon for Brazilian locale Excel

  const csvRows = [
    headers.join(separator),
    ...data.map((row) =>
      keys
        .map((key) => {
          const val = row[key];
          if (val == null) return "";
          const str = String(val);
          // Escape quotes and wrap if contains separator/quote/newline
          if (str.includes(separator) || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(separator)
    ),
  ];

  const blob = new Blob([BOM + csvRows.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
