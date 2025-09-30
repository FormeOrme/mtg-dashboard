const COLOR_ORDER = ["W", "U", "B", "R", "G"];
function sort(ci) {
    if (!ci) return "";
    return ci
        .toUpperCase()
        .split("")
        .sort((a, b) => {
            const aIndex = COLOR_ORDER.indexOf(a);
            const bIndex = COLOR_ORDER.indexOf(b);
            return aIndex - bIndex;
        })
        .join("");
}

const COLOR_IDENTITIES = {
    C: "Colorless",
    W: "White",
    U: "Blue",
    B: "Black",
    R: "Red",
    G: "Green",
    WU: "Azorius",
    WB: "Orzhov",
    WR: "Boros",
    WG: "Selesnya",
    UB: "Dimir",
    UR: "Izzet",
    UG: "Simic",
    BR: "Rakdos",
    BG: "Golgari",
    RG: "Gruul",
    WUG: "Bant",
    WUB: "Esper",
    UBR: "Grixis",
    BRG: "Jund",
    WRG: "Naya",
    WBG: "Abzan",
    URG: "Temur",
    WUR: "Jeskai",
    UBG: "Sultai",
    WBR: "Mardu",
    WUBR: "Yore-Tiller",
    WUBG: "Witch-Maw",
    WURG: "Ink-Treader",
    WBRG: "Dune-Brood",
    UBRG: "Glint-Eye",
    WUBRG: "Five-Color",
};

export const COLOR_MAP = {
    W: "#fffde7CC",
    U: "#2196f3CC",
    B: "#607d8bCC",
    R: "#f44336CC",
    G: "#4caf50CC",
    C: "#9e9e9eCC",
};

function getIdentityName(ci) {
    return COLOR_IDENTITIES[sort(ci)];
}

export const ALL_COLORS = Object.entries(COLOR_IDENTITIES).map(([code, name]) => ({
    code,
    name,
}));

export { getIdentityName, sort };
