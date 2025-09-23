export const Strings = {
    normalize: (s) => s?.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    strip: (s) => Strings.normalize(s)?.split("/")[0]?.trim().replace(/\W+/g, "_").toLowerCase(),
};

function nameParts({ name: fullName }) {
    const relevant = fullName.split(" // ")[0];
    const match = relevant.match(/^(.*?)(?:, | of the | the )(.*)/);
    if (match) {
        const [, name, title] = match;
        return { name: name.trim(), title: title.trim() };
    }
    return { name: relevant.trim(), title: undefined };
}

export function titleFromCard(details) {
    if (details.length === 1) {
        return nameParts(details[0]);
    } else {
        return {
            name: details.map((d) => nameParts(d).name).join(" and "),
        };
    }
}
