export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const NS = "https://solid-taskflow.com/ns/workflow#";

export const VOCAB = {
  namespace: NS,

  // Classes
  Task: `${NS}Task`,
  Submission: `${NS}Submission`,

  // Shared & Task predicates
  id: `${NS}id`,
  userId: `${NS}userId`,
  proposerId: `${NS}proposerId`,
  createdAt: `${NS}createdAt`,
  editedAt: `${NS}editedAt`,
  status: `${NS}status`,
  title: `${NS}title`,
  deadline: `${NS}deadline`,
  description: `${NS}description`,
  hasFile: `${NS}hasFile`,
  hasLink: `${NS}hasLink`,
  hasSubtask: `${NS}hasSubtask`,
  hasSubmission: `${NS}hasSubmission`,

  // Submission predicates
  submitterId: `${NS}submitterId`,
  taskDeadline: `${NS}taskDeadline`,
  date: `${NS}date`,
  comment: `${NS}comment`,
} as const;
