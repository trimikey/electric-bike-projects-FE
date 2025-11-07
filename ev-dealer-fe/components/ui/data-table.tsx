"use client";

import React from "react";

export type Column<T> = {
  header: string;
  accessorKey?: keyof T;
  id?: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
};

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyLabel?: string;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  emptyLabel = "Không có dữ liệu",
}: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <table className="min-w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id ?? col.accessorKey?.toString()}
                className="text-left px-4 py-2 font-semibold"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t hover:bg-muted/50">
              {columns.map((col) => (
                <td key={col.id ?? col.accessorKey?.toString()} className="px-4 py-2">
                  {col.cell
                    ? col.cell({ row: { original: row } })
                    : (row[col.accessorKey as string] as any)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
