const colorMap = {
    W: 0b00001, // White (2^0 = 1)
    U: 0b00010, // Blue (2^1 = 2)
    B: 0b00100, // Black (2^2 = 4)
    R: 0b01000, // Red (2^3 = 8)
    G: 0b10000, // Green (2^4 = 16)
};

export function getColorNumber(colorString) {
    colorString = colorString.toUpperCase();
    if (colorString === "C") return 0;
    let colorValue = 0;
    for (const char of colorString) {
        if (colorMap[char]) {
            colorValue |= colorMap[char];
        }
    }
    return colorValue;
}

export function getCombinations(colorString) {
    colorString = colorString.toUpperCase();
    const colors = [];
    for (const char of colorString) {
        if (colorMap[char]) {
            colors.push(colorMap[char]);
        }
    }
    const combinations = [];
    const total = 1 << colors.length;
    for (let i = 1; i < total; i++) {
        let combo = 0;
        for (let j = 0; j < colors.length; j++) {
            if (i & (1 << j)) {
                combo |= colors[j];
            }
        }
        combinations.push(combo);
    }
    return combinations;
}
