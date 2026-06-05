export const formatStaffCodeLabel = (staff) => {
    if (!staff) return "—";
    return `${staff.code} — ${staff.display_name}`;
};
