import { db } from "@/lib/db";
import { 
  user, 
  company, 
  contact, 
  project, 
  projectRoleAssignment, 
  projectInteraction, 
  projectDocument,
  projectDocumentVersion 
} from "@/lib/db/schema";
import { v4 as uuid } from "uuid";

// Demo users
const demoUsers = [
  {
    id: uuid(),
    name: "John Smith",
    email: "john.smith@powertech.com",
    emailVerified: true,
    role: "admin" as const,
  },
  {
    id: uuid(),
    name: "Sarah Johnson",
    email: "sarah.johnson@powertech.com", 
    emailVerified: true,
    role: "staff" as const,
  },
  {
    id: uuid(),
    name: "Mike Davis",
    email: "mike.davis@powertech.com",
    emailVerified: true,
    role: "staff" as const,
  }
];

// Demo companies
const demoCompanies = [
  {
    id: uuid(),
    name: "Metropolitan Development Corp",
    type: "developer" as const,
    description: "Leading residential and commercial property developer",
    website: "https://metrodev.com",
    phone: "(555) 123-4567",
    email: "info@metrodev.com",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  {
    id: uuid(),
    name: "BuildRight Construction",
    type: "contractor" as const,
    description: "Full-service construction company specializing in commercial projects",
    website: "https://buildright.com",
    phone: "(555) 234-5678",
    email: "contact@buildright.com",
    address: "456 Oak Ave",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    country: "USA"
  },
  {
    id: uuid(),
    name: "Urban Design Studio",
    type: "architect_consultant" as const,
    description: "Award-winning architectural firm",
    website: "https://urbandesign.com",
    phone: "(555) 345-6789",
    email: "hello@urbandesign.com",
    address: "789 Design Blvd",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    country: "USA"
  },
  {
    id: uuid(),
    name: "Premium Materials Supply",
    type: "supplier_vendor" as const,
    description: "High-quality construction materials supplier",
    website: "https://premiummaterials.com",
    phone: "(555) 456-7890",
    email: "orders@premiummaterials.com",
    address: "321 Industrial Way",
    city: "Houston",
    state: "TX",
    zipCode: "77001",
    country: "USA"
  },
  {
    id: uuid(),
    name: "Elite Contractors Inc",
    type: "contractor" as const,
    description: "Luxury residential construction specialists",
    website: "https://elitecontractors.com",
    phone: "(555) 567-8901",
    email: "info@elitecontractors.com",
    address: "654 Luxury Lane",
    city: "Miami",
    state: "FL",
    zipCode: "33101",
    country: "USA"
  }
];

// Demo contacts (2-3 per company)
const generateContacts = (companies: typeof demoCompanies) => {
  const contacts = [];
  
  companies.forEach((company, companyIndex) => {
    const companyContacts = [
      {
        id: uuid(),
        name: `Contact Primary ${companyIndex + 1}`,
        email: `primary${companyIndex + 1}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `(555) ${100 + companyIndex}${companyIndex}-${1000 + companyIndex}${companyIndex}`,
        role: "primary_contact" as const,
        title: "Project Director",
        department: "Operations",
        companyId: company.id
      },
      {
        id: uuid(),
        name: `Manager ${companyIndex + 1}`,
        email: `manager${companyIndex + 1}@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
        phone: `(555) ${200 + companyIndex}${companyIndex}-${2000 + companyIndex}${companyIndex}`,
        role: "project_manager" as const,
        title: "Senior Project Manager",
        department: "Project Management",
        companyId: company.id
      }
    ];
    contacts.push(...companyContacts);
  });
  
  return contacts;
};

// Demo projects
const generateProjects = (users: typeof demoUsers) => {
  const projectNames = [
    "Downtown Corporate Tower",
    "Riverside Luxury Condos",
    "Metro Shopping Complex", 
    "Green Valley Office Park",
    "Sunset Residential Development",
    "Harbor View Hotel",
    "City Center Mixed Use",
    "Parkside Apartments",
    "Tech Campus Phase 1",
    "Waterfront Convention Center",
    "Mountain View Resort",
    "Urban Loft Complex",
    "Gateway Business District",
    "Lakeside Townhomes",
    "Innovation Hub Building",
    "Coastal Retail Plaza",
    "Heritage Square Renovation",
    "Skyline Office Tower",
    "Garden City Homes",
    "Central Station Redevelopment",
    "Pacific Heights Condos",
    "Industrial Park Expansion"
  ];

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"];
  const states = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA", "TX", "CA"];
  const stages = ["design", "construction", "hand_off"] as const;
  const statuses = ["planning", "active", "on_hold", "completed"] as const;

  return projectNames.map((name, index) => ({
    id: uuid(),
    title: name,
    description: `${name} is a cutting-edge development project focusing on modern architecture and sustainable construction practices.`,
    budget: (Math.random() * 50000000 + 5000000).toFixed(2), // 5M to 55M
    startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    endDate: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    stage: stages[Math.floor(Math.random() * stages.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    address: `${100 + index} ${name.split(' ')[0]} Street`,
    city: cities[index % cities.length],
    state: states[index % states.length],
    zipCode: `${10000 + index}`,
    country: "USA",
    createdBy: users[Math.floor(Math.random() * users.length)].id
  }));
};

// Demo project interactions
const generateInteractions = (projects: any[], contacts: any[], users: typeof demoUsers) => {
  const interactions = [];
  const interactionTypes = ["meeting", "phone_call", "email", "site_visit", "document_shared", "milestone_update"] as const;
  const summaries = [
    "Project kickoff meeting",
    "Weekly status update",
    "Budget review discussion",
    "Design approval meeting",
    "Site inspection completed",
    "Contract negotiation",
    "Progress milestone reached",
    "Issue resolution meeting",
    "Quality assurance review",
    "Client presentation"
  ];

  projects.forEach(project => {
    // Generate 3-5 interactions per project
    const numInteractions = Math.floor(Math.random() * 3) + 3;
    for (let i = 0; i < numInteractions; i++) {
      interactions.push({
        id: uuid(),
        projectId: project.id,
        type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
        summary: summaries[Math.floor(Math.random() * summaries.length)],
        description: `Detailed discussion about project progress, addressing key milestones and next steps for ${project.title}.`,
        interactionDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        contactId: contacts[Math.floor(Math.random() * contacts.length)].id,
        createdBy: users[Math.floor(Math.random() * users.length)].id
      });
    }
  });

  return interactions;
};

// Demo documents
const generateDocuments = (projects: any[], users: typeof demoUsers) => {
  const documents = [];
  const documentTypes = ["drawings_plans", "contracts", "permits", "reports", "specifications"] as const;
  const documentNames = [
    "Architectural Plans",
    "Construction Contract",
    "Building Permit",
    "Progress Report",
    "Technical Specifications",
    "Site Survey",
    "Safety Report",
    "Material Specifications"
  ];

  projects.forEach(project => {
    // Generate 2-4 documents per project
    const numDocs = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < numDocs; i++) {
      const docId = uuid();
      documents.push({
        document: {
          id: docId,
          projectId: project.id,
          name: documentNames[Math.floor(Math.random() * documentNames.length)],
          description: `Important project document for ${project.title}`,
          type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
          currentVersion: "1.0",
          accessLevel: "project_members" as const,
          tags: JSON.stringify(["important", "current"]),
          createdBy: users[Math.floor(Math.random() * users.length)].id
        },
        version: {
          id: uuid(),
          documentId: docId,
          version: "1.0",
          fileName: `${documentNames[i % documentNames.length].toLowerCase().replace(/\s+/g, '-')}.pdf`,
          fileSize: (Math.random() * 10000000 + 100000).toString(), // 100KB to 10MB
          mimeType: "application/pdf",
          storageKey: `docs/${docId}/v1.0.pdf`,
          checksum: uuid(),
          versionNotes: "Initial version",
          uploadedBy: users[Math.floor(Math.random() * users.length)].id
        }
      });
    }
  });

  return documents;
};

async function seedDemoData() {
  try {
    console.log("🌱 Starting demo data seed...");

    // Insert users
    console.log("👥 Seeding users...");
    await db.insert(user).values(demoUsers);

    // Insert companies
    console.log("🏢 Seeding companies...");
    await db.insert(company).values(demoCompanies);

    // Insert contacts
    console.log("📞 Seeding contacts...");
    const demoContacts = generateContacts(demoCompanies);
    await db.insert(contact).values(demoContacts);

    // Insert projects
    console.log("🏗️ Seeding projects...");
    const demoProjects = generateProjects(demoUsers);
    await db.insert(project).values(demoProjects);

    // Insert project role assignments
    console.log("👷 Seeding project role assignments...");
    const roleAssignments = [];
    demoProjects.forEach(proj => {
      // Assign 2-3 contacts to each project
      const numAssignments = Math.floor(Math.random() * 2) + 2;
      const shuffledContacts = [...demoContacts].sort(() => 0.5 - Math.random());
      const projectRoles = ["developer", "contractor", "architect_consultant", "project_manager"] as const;
      
      for (let i = 0; i < numAssignments && i < shuffledContacts.length; i++) {
        roleAssignments.push({
          id: uuid(),
          projectId: proj.id,
          contactId: shuffledContacts[i].id,
          role: projectRoles[i % projectRoles.length],
          assignedBy: demoUsers[Math.floor(Math.random() * demoUsers.length)].id
        });
      }
    });
    await db.insert(projectRoleAssignment).values(roleAssignments);

    // Insert project interactions
    console.log("💬 Seeding project interactions...");
    const demoInteractions = generateInteractions(demoProjects, demoContacts, demoUsers);
    await db.insert(projectInteraction).values(demoInteractions);

    // Insert project documents and versions
    console.log("📄 Seeding project documents...");
    const demoDocuments = generateDocuments(demoProjects, demoUsers);
    
    const documents = demoDocuments.map(d => d.document);
    const versions = demoDocuments.map(d => d.version);
    
    await db.insert(projectDocument).values(documents);
    await db.insert(projectDocumentVersion).values(versions);

    console.log("✅ Demo data seeding completed successfully!");
    console.log(`📊 Seeded:`);
    console.log(`   - ${demoUsers.length} users`);
    console.log(`   - ${demoCompanies.length} companies`);
    console.log(`   - ${demoContacts.length} contacts`);
    console.log(`   - ${demoProjects.length} projects`);
    console.log(`   - ${roleAssignments.length} role assignments`);
    console.log(`   - ${demoInteractions.length} interactions`);
    console.log(`   - ${documents.length} documents`);

  } catch (error) {
    console.error("❌ Error seeding demo data:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the seed function
seedDemoData();