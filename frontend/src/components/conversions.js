const conversions = {
    "AVOCADO": 0.0064,
    "BARIBA": 0.0025,
    "CALAMANSI": 0.0016,
    "CHICO": 0.0096,
    "CITRUS": 0.0016,
    "DALANGHITA": 0.0064,
    "DRAGON FRUIT": 0.0020,
    "DURIAN": 0.0049,
    "GUYABANO": 0.0016,
    "JACKFRUIT": 0.0025,
    "LANZONES": 0.0036,
    "MANGO": 0.0225,
    "PAPAYA": 0.0006,
    "POMELO": 0.0063,
    "RAMBUTAN": 0.0080,
    "SANTOL": 0.0144,
    "CACAO": 0.0016,
    "BUNGULAN": 0.0016,
    "LACATAN": 0.0016,
    "LAGKITAN": 0.0016,
    "LATUNDAN": 0.0016,
    "SABA": 0.0016,
    "SEÑORITA": 0.0016,
    "LIBERICA": 0.0012,
    "ROBUSTA": 0.0006,
};

// (#trees planted x Planting distance) / 10,000
// All Planting distances = for ex. AVOCADO: 0.0064 (remove decimal places) => 64

// Detailed file https://docs.google.com/spreadsheets/d/1SlKoYBoDK-b500udHOtl9CzslOclVOhh/edit?gid=1829562814#gid=1829562814

const numOfTreesToHectares = (commodity, treesHarvested) => {
    const rate = conversions[commodity];
    if (rate === undefined) {
        console.error(`Conversion rate for crop type ${commodity} not found`);
        return null;
    }
    return treesHarvested * rate;
};

export default numOfTreesToHectares;