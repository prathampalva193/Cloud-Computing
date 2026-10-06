// Initial Realistic Cloud Workloads across AWS, Azure, and GCP

export const INITIAL_WORKLOADS = [
  {
    id: 'wkl-001',
    name: 'Customer Checkout API Fleet',
    provider: 'AWS',
    serviceType: 'Compute (EC2/VM)',
    regionId: 'aws:us-east-1',
    environment: 'Production',
    businessUnit: 'E-Commerce',
    specs: {
      instanceType: 'c6i.4xlarge x 8',
      vCPUs: 128,
      ramGb: 256,
      gpus: 0,
      storageTb: 2.0
    },
    utilizationPct: 42,
    monthlyHours: 720,
    hourlyCostUsd: 5.44, // ~$3,916/mo
    notes: 'Primary e-commerce API cluster handling transactional user traffic.'
  },
  {
    id: 'wkl-002',
    name: 'LLM Fine-Tuning & Inference Cluster',
    provider: 'GCP',
    serviceType: 'AI/ML Inference Cluster',
    regionId: 'gcp:us-central1',
    environment: 'Production',
    businessUnit: 'Data Science',
    specs: {
      instanceType: 'a2-highgpu-4g (4x A100)',
      vCPUs: 48,
      ramGb: 340,
      gpus: 4,
      storageTb: 10.0
    },
    utilizationPct: 88,
    monthlyHours: 520, // Runs high-load jobs during business shifts
    hourlyCostUsd: 14.80, // ~$7,696/mo
    notes: 'Generative AI search embeddings and model re-ranking services.'
  },
  {
    id: 'wkl-003',
    name: 'Kubernetes Production Core (AKS)',
    provider: 'Azure',
    serviceType: 'Kubernetes Cluster',
    regionId: 'azure:eastus',
    environment: 'Production',
    businessUnit: 'Core Platform',
    specs: {
      instanceType: 'Standard_D32s_v5 x 4',
      vCPUs: 128,
      ramGb: 512,
      gpus: 0,
      storageTb: 5.0
    },
    utilizationPct: 55,
    monthlyHours: 720,
    hourlyCostUsd: 6.16, // ~$4,435/mo
    notes: 'Microservices mesh orchestration for frontend and backend web applications.'
  },
  {
    id: 'wkl-004',
    name: 'Enterprise Data Warehouse (Snowflake/BigQuery)',
    provider: 'GCP',
    serviceType: 'Analytics & Data Lake',
    regionId: 'gcp:europe-west1',
    environment: 'Production',
    businessUnit: 'Data Science',
    specs: {
      instanceType: 'n2-highmem-32 x 6',
      vCPUs: 192,
      ramGb: 1536,
      gpus: 0,
      storageTb: 85.0
    },
    utilizationPct: 70,
    monthlyHours: 720,
    hourlyCostUsd: 18.50, // ~$13,320/mo
    notes: 'Daily BI reporting engine and nocturnal telemetry aggregation warehouse.'
  },
  {
    id: 'wkl-005',
    name: 'Primary PostgreSQL Database Cluster',
    provider: 'AWS',
    serviceType: 'Managed DB (Postgres/RDS)',
    regionId: 'aws:us-east-1',
    environment: 'Production',
    businessUnit: 'Core Platform',
    specs: {
      instanceType: 'db.r6g.8xlarge (Multi-AZ)',
      vCPUs: 64,
      ramGb: 256,
      gpus: 0,
      storageTb: 8.5
    },
    utilizationPct: 48,
    monthlyHours: 720,
    hourlyCostUsd: 4.80, // ~$3,456/mo
    notes: 'Relational database housing user accounts, order histories, and inventories.'
  },
  {
    id: 'wkl-006',
    name: 'Dev & Staging Kubernetes Cluster',
    provider: 'AWS',
    serviceType: 'Kubernetes Cluster',
    regionId: 'aws:us-east-1',
    environment: 'Development',
    businessUnit: 'Internal Tools',
    specs: {
      instanceType: 'm6i.2xlarge x 6',
      vCPUs: 48,
      ramGb: 192,
      gpus: 0,
      storageTb: 3.0
    },
    utilizationPct: 22, // Low utilization off-hours!
    monthlyHours: 720, // Running 24/7 unnecessarily!
    hourlyCostUsd: 2.30, // ~$1,656/mo
    notes: 'Developer sandbox environments left running continuously over nights & weekends.'
  },
  {
    id: 'wkl-007',
    name: 'Global Asset Storage & CDN Edge',
    provider: 'Azure',
    serviceType: 'Object Storage & CDN',
    regionId: 'azure:westeurope',
    environment: 'Production',
    businessUnit: 'E-Commerce',
    specs: {
      instanceType: 'Premium Hot Storage Tier',
      vCPUs: 8, // Nominal compute overhead
      ramGb: 32,
      gpus: 0,
      storageTb: 140.0
    },
    utilizationPct: 30,
    monthlyHours: 720,
    hourlyCostUsd: 1.15, // ~$828/mo
    notes: 'High-throughput product media, user avatars, and static UI assets.'
  },
  {
    id: 'wkl-008',
    name: 'Async Batch Image Processing Pipeline',
    provider: 'AWS',
    serviceType: 'Serverless Functions',
    regionId: 'aws:ap-southeast-1',
    environment: 'Batch Analytics',
    businessUnit: 'Customer Support',
    specs: {
      instanceType: 'AWS Lambda (10B invocations)',
      vCPUs: 32,
      ramGb: 64,
      gpus: 0,
      storageTb: 1.0
    },
    utilizationPct: 90,
    monthlyHours: 350,
    hourlyCostUsd: 1.95, // ~$682/mo
    notes: 'Batch document OCR and thumbnail extraction triggered by customer uploads.'
  }
];
