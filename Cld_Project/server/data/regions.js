// Cloud Region Environmental Data & Carbon Intensities
// Sources based on Ember Climate, electricityMaps annual averages, and CCF datasets

export const REGIONS = {
  // AWS Regions
  'aws:us-east-1': {
    provider: 'AWS',
    code: 'us-east-1',
    name: 'US East (N. Virginia)',
    gridCarbonIntensity: 365, // gCO2e/kWh (PJM Interconnection grid mix)
    pue: 1.15,
    renewableMatch: '62%',
    location: 'Ashburn, VA, USA',
    costFactor: 1.0,
    cleanAlternative: 'aws:us-west-2'
  },
  'aws:us-west-2': {
    provider: 'AWS',
    code: 'us-west-2',
    name: 'US West (Oregon)',
    gridCarbonIntensity: 78, // gCO2e/kWh (Hydro heavy grid)
    pue: 1.12,
    renewableMatch: '95%',
    location: 'Boardman, OR, USA',
    costFactor: 1.0,
    cleanAlternative: null
  },
  'aws:eu-west-1': {
    provider: 'AWS',
    code: 'eu-west-1',
    name: 'Europe (Ireland)',
    gridCarbonIntensity: 285, // gCO2e/kWh
    pue: 1.14,
    renewableMatch: '80%',
    location: 'Dublin, Ireland',
    costFactor: 1.05,
    cleanAlternative: 'aws:eu-north-1'
  },
  'aws:eu-north-1': {
    provider: 'AWS',
    code: 'eu-north-1',
    name: 'Europe (Stockholm)',
    gridCarbonIntensity: 18, // gCO2e/kWh (Nordic hydro & wind)
    pue: 1.11,
    renewableMatch: '99%',
    location: 'Stockholm, Sweden',
    costFactor: 0.98,
    cleanAlternative: null
  },
  'aws:ap-southeast-1': {
    provider: 'AWS',
    code: 'ap-southeast-1',
    name: 'Asia Pacific (Singapore)',
    gridCarbonIntensity: 410, // gCO2e/kWh (Gas heavy)
    pue: 1.25,
    renewableMatch: '45%',
    location: 'Singapore',
    costFactor: 1.12,
    cleanAlternative: 'aws:ap-southeast-2'
  },
  'aws:ap-southeast-2': {
    provider: 'AWS',
    code: 'ap-southeast-2',
    name: 'Asia Pacific (Sydney)',
    gridCarbonIntensity: 520, // gCO2e/kWh (Coal heavy grid)
    pue: 1.20,
    renewableMatch: '50%',
    location: 'Sydney, Australia',
    costFactor: 1.10,
    cleanAlternative: 'gcp:asia-northeast1'
  },

  // GCP Regions
  'gcp:us-central1': {
    provider: 'GCP',
    code: 'us-central1',
    name: 'US Central (Iowa)',
    gridCarbonIntensity: 390, // gCO2e/kWh (Wind mixed with coal/gas)
    pue: 1.10,
    renewableMatch: '88%',
    location: 'Council Bluffs, IA, USA',
    costFactor: 0.95,
    cleanAlternative: 'gcp:us-west1'
  },
  'gcp:us-west1': {
    provider: 'GCP',
    code: 'us-west1',
    name: 'US West (Oregon)',
    gridCarbonIntensity: 72, // gCO2e/kWh
    pue: 1.09,
    renewableMatch: '98%',
    location: 'The Dalles, OR, USA',
    costFactor: 0.98,
    cleanAlternative: null
  },
  'gcp:europe-west9': {
    provider: 'GCP',
    code: 'europe-west9',
    name: 'Europe West (Paris)',
    gridCarbonIntensity: 52, // gCO2e/kWh (Nuclear & renewables)
    pue: 1.10,
    renewableMatch: '96%',
    location: 'Paris, France',
    costFactor: 1.04,
    cleanAlternative: null
  },
  'gcp:europe-west1': {
    provider: 'GCP',
    code: 'europe-west1',
    name: 'Europe West (Belgium)',
    gridCarbonIntensity: 145, // gCO2e/kWh
    pue: 1.11,
    renewableMatch: '90%',
    location: 'St. Ghislain, Belgium',
    costFactor: 1.02,
    cleanAlternative: 'gcp:europe-west9'
  },
  'gcp:asia-east1': {
    provider: 'GCP',
    code: 'asia-east1',
    name: 'Asia East (Taiwan)',
    gridCarbonIntensity: 540, // gCO2e/kWh
    pue: 1.18,
    renewableMatch: '38%',
    location: 'Changhua County, Taiwan',
    costFactor: 1.05,
    cleanAlternative: 'gcp:asia-northeast1'
  },

  // Azure Regions
  'azure:eastus': {
    provider: 'Azure',
    code: 'eastus',
    name: 'East US (Virginia)',
    gridCarbonIntensity: 370, // gCO2e/kWh
    pue: 1.18,
    renewableMatch: '65%',
    location: 'Virginia, USA',
    costFactor: 1.0,
    cleanAlternative: 'azure:westus2'
  },
  'azure:westus2': {
    provider: 'Azure',
    code: 'westus2',
    name: 'West US 2 (Washington)',
    gridCarbonIntensity: 65, // gCO2e/kWh (Hydro power)
    pue: 1.12,
    renewableMatch: '96%',
    location: 'Washington, USA',
    costFactor: 1.0,
    cleanAlternative: null
  },
  'azure:westeurope': {
    provider: 'Azure',
    code: 'westeurope',
    name: 'West Europe (Netherlands)',
    gridCarbonIntensity: 290, // gCO2e/kWh
    pue: 1.16,
    renewableMatch: '75%',
    location: 'Amsterdam, Netherlands',
    costFactor: 1.06,
    cleanAlternative: 'azure:swedencentral'
  },
  'azure:swedencentral': {
    provider: 'Azure',
    code: 'swedencentral',
    name: 'Sweden Central (Gävle)',
    gridCarbonIntensity: 15, // gCO2e/kWh (Hydro/Nuclear/Wind)
    pue: 1.09,
    renewableMatch: '100%',
    location: 'Gävle, Sweden',
    costFactor: 0.99,
    cleanAlternative: null
  },
  'azure:southeastasia': {
    provider: 'Azure',
    code: 'southeastasia',
    name: 'Southeast Asia (Singapore)',
    gridCarbonIntensity: 420, // gCO2e/kWh
    pue: 1.24,
    renewableMatch: '42%',
    location: 'Singapore',
    costFactor: 1.11,
    cleanAlternative: 'azure:japaneast'
  }
};
