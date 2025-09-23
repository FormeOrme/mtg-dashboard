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

function getIdentityName(ci) {
    return {
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
    }[sort(ci)];
}

export { getIdentityName, sort };
