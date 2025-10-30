export const toInputDate = (iso?: string | null) => {
if (!iso) return "";
const d = new Date(iso);
const yyyy = d.getFullYear();
const mm = String(d.getMonth() + 1).padStart(2, "0");
const dd = String(d.getDate()).padStart(2, "0");
return `${yyyy}-${mm}-${dd}`;
};