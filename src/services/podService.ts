import {
  addUrl,
  createSolidDataset,
  createThing,
  getDatetime,
  getSolidDataset,
  getStringNoLocale,
  getThing,
  getUrlAll,
  overwriteFile,
  saveSolidDatasetAt,
  setDatetime,
  setStringNoLocale,
  setThing,
  type SolidDataset,
  type Thing,
} from "@inrupt/solid-client";
import { RDF_TYPE, VOCAB } from "@/schemas/vocab";
import { getAuthedFetch } from "./auth";
import type { Submission, SubmissionRecord } from "@/schemas/submission";
import type { Task, TaskRecord } from "@/schemas/task";

export async function uploadFilesToPod(
  filesContainerUrl: string,
  files: File[],
): Promise<string[]> {
  if (files.length === 0) return [];
  const authFetch = getAuthedFetch();
  const baseContainer = filesContainerUrl.endsWith("/")
    ? filesContainerUrl
    : `${filesContainerUrl}/`;

  const uploadedUrls: string[] = [];

  for (const file of files) {
    const safeName = `${crypto.randomUUID()}-${encodeURIComponent(file.name)}`;
    const targetUrl = `${baseContainer}${safeName}`;
    await overwriteFile(targetUrl, file, {
      contentType: file.type || "application/octet-stream",
      fetch: authFetch,
    });
    uploadedUrls.push(targetUrl);
  }

  return uploadedUrls;
}

function buildSubmissionThing(
  submission: Submission,
  fileUrls: string[],
  baseUrl: string,
): Thing {
  const slug = encodeURIComponent(submission.id || crypto.randomUUID());
  let thing = createThing({ name: `submission-${slug}` });

  thing = addUrl(thing, RDF_TYPE, VOCAB.Submission);
  thing = setStringNoLocale(thing, VOCAB.id, submission.id);
  thing = setStringNoLocale(thing, VOCAB.submitterId, submission.submitterId);
  thing = setDatetime(thing, VOCAB.date, submission.date);
  thing = setStringNoLocale(thing, VOCAB.status, submission.status);

  if (submission.taskDeadline) {
    thing = setDatetime(thing, VOCAB.taskDeadline, submission.taskDeadline);
  }

  if (submission.comment) {
    thing = setStringNoLocale(thing, VOCAB.comment, submission.comment);
  }

  for (const link of submission.links) {
    thing = addUrl(thing, VOCAB.hasLink, link.toString());
  }

  for (const fileUrl of fileUrls) {
    thing = addUrl(thing, VOCAB.hasFile, fileUrl);
  }

  return { ...thing, url: `${baseUrl}#submission-${slug}` };
}

function parseSubmissionThing(thing: Thing): SubmissionRecord | null {
  const id = getStringNoLocale(thing, VOCAB.id);
  const submitterId = getStringNoLocale(thing, VOCAB.submitterId);
  const date = getDatetime(thing, VOCAB.date);
  const status = getStringNoLocale(thing, VOCAB.status);

  if (!id || !submitterId || !date || !status) {
    return null;
  }

  return {
    thingUrl: thing.url,
    id,
    submitterId,
    taskDeadline: getDatetime(thing, VOCAB.taskDeadline) ?? undefined,
    date,
    status,
    comment: getStringNoLocale(thing, VOCAB.comment) ?? undefined,
    links: getUrlAll(thing, VOCAB.hasLink).map((u) => new URL(u)),
    fileUrls: getUrlAll(thing, VOCAB.hasFile),
  };
}

/**
 * Menyimpan satu node Task (beserta subtasks rekursif dan submissions) ke dataset.
 * Jika subtask tidak memiliki userId/deadline sendiri, dapat mewarisi dari parentTask.
 */
async function upsertTaskNode(
  dataset: SolidDataset,
  datasetUrl: string,
  task: Task,
  filesContainerUrl?: string,
  inheritedUserId?: string,
  inheritedDeadline?: Date,
): Promise<{ dataset: SolidDataset; record: TaskRecord }> {
  const effectiveUserId = task.userId ?? inheritedUserId;
  const effectiveDeadline = task.deadline ?? inheritedDeadline;

  const taskFileUrls = filesContainerUrl
    ? await uploadFilesToPod(filesContainerUrl, task.files)
    : [];

  const taskSlug = encodeURIComponent(task.id || crypto.randomUUID());
  let taskThing = createThing({ name: `task-${taskSlug}` });
  taskThing = { ...taskThing, url: `${datasetUrl}#task-${taskSlug}` };

  taskThing = addUrl(taskThing, RDF_TYPE, VOCAB.Task);
  taskThing = setStringNoLocale(taskThing, VOCAB.id, task.id);
  taskThing = setStringNoLocale(taskThing, VOCAB.proposerId, task.proposerId);
  taskThing = setDatetime(taskThing, VOCAB.createdAt, task.createdAt);
  taskThing = setStringNoLocale(taskThing, VOCAB.status, task.status);
  taskThing = setStringNoLocale(taskThing, VOCAB.title, task.title);
  taskThing = setStringNoLocale(taskThing, VOCAB.description, task.description);

  if (effectiveUserId) {
    taskThing = setStringNoLocale(taskThing, VOCAB.userId, effectiveUserId);
  }

  if (task.editedAt) {
    taskThing = setDatetime(taskThing, VOCAB.editedAt, task.editedAt);
  }

  if (effectiveDeadline) {
    taskThing = setDatetime(taskThing, VOCAB.deadline, effectiveDeadline);
  }

  for (const link of task.links) {
    taskThing = addUrl(taskThing, VOCAB.hasLink, link.toString());
  }

  for (const fileUrl of taskFileUrls) {
    taskThing = addUrl(taskThing, VOCAB.hasFile, fileUrl);
  }

  let currentDataset = dataset;
  const subtaskRecords: TaskRecord[] = [];

  for (const subTask of task.subtasks) {
    const subResult = await upsertTaskNode(
      currentDataset,
      datasetUrl,
      subTask,
      filesContainerUrl,
      effectiveUserId,
      effectiveDeadline,
    );
    currentDataset = subResult.dataset;
    taskThing = addUrl(taskThing, VOCAB.hasSubtask, subResult.record.thingUrl);
    subtaskRecords.push(subResult.record);
  }

  const submissionRecords: SubmissionRecord[] = [];

  for (const sub of task.submissions) {
    // Hubungkan Task.userId -> Submission.submitterId & Task.deadline -> Submission.taskDeadline
    const linkedSubmitterId = sub.submitterId || effectiveUserId || "";
    const linkedTaskDeadline = sub.taskDeadline ?? effectiveDeadline;

    const normalizedSubmission: Submission = {
      ...sub,
      submitterId: linkedSubmitterId,
      taskDeadline: linkedTaskDeadline,
    };

    const subFileUrls = filesContainerUrl
      ? await uploadFilesToPod(filesContainerUrl, normalizedSubmission.files)
      : [];

    const subThing = buildSubmissionThing(
      normalizedSubmission,
      subFileUrls,
      datasetUrl,
    );
    currentDataset = setThing(currentDataset, subThing);
    taskThing = addUrl(taskThing, VOCAB.hasSubmission, subThing.url);

    submissionRecords.push({
      thingUrl: subThing.url,
      id: normalizedSubmission.id,
      submitterId: normalizedSubmission.submitterId,
      taskDeadline: normalizedSubmission.taskDeadline,
      date: normalizedSubmission.date,
      status: normalizedSubmission.status,
      comment: normalizedSubmission.comment,
      links: normalizedSubmission.links,
      fileUrls: subFileUrls,
    });
  }

  currentDataset = setThing(currentDataset, taskThing);

  return {
    dataset: currentDataset,
    record: {
      thingUrl: taskThing.url,
      id: task.id,
      userId: effectiveUserId,
      proposerId: task.proposerId,
      createdAt: task.createdAt,
      editedAt: task.editedAt,
      status: task.status,
      title: task.title,
      deadline: effectiveDeadline,
      description: task.description,
      links: task.links,
      fileUrls: taskFileUrls,
      subtasks: subtaskRecords,
      submissions: submissionRecords,
    },
  };
}

export async function saveTaskToPod(
  datasetUrl: string,
  task: Task,
  filesContainerUrl?: string,
): Promise<TaskRecord> {
  const authFetch = getAuthedFetch();

  let dataset;
  try {
    dataset = await getSolidDataset(datasetUrl, { fetch: authFetch });
  } catch {
    dataset = createSolidDataset();
  }

  const { dataset: updatedDataset, record } = await upsertTaskNode(
    dataset,
    datasetUrl,
    task,
    filesContainerUrl,
  );

  await saveSolidDatasetAt(datasetUrl, updatedDataset, { fetch: authFetch });
  return record;
}

function parseTaskNode(
  dataset: SolidDataset,
  thingUrl: string,
  visited = new Set<string>(),
): TaskRecord | null {
  if (visited.has(thingUrl)) return null;
  const thing = getThing(dataset, thingUrl);
  if (!thing) return null;

  const nextVisited = new Set(visited);
  nextVisited.add(thingUrl);

  const deadline = getDatetime(thing, VOCAB.deadline) ?? undefined;
  const rawUserId = getStringNoLocale(thing, VOCAB.userId) ?? undefined;

  const submissions: SubmissionRecord[] = [];
  for (const subUrl of getUrlAll(thing, VOCAB.hasSubmission)) {
    const subThing = getThing(dataset, subUrl);
    if (subThing) {
      const parsed = parseSubmissionThing(subThing);
      if (parsed) {
        submissions.push({
          ...parsed,
          submitterId: parsed.submitterId || rawUserId || "",
          taskDeadline: parsed.taskDeadline ?? deadline,
        });
      }
    }
  }

  const subtasks: TaskRecord[] = [];
  for (const subTaskUrl of getUrlAll(thing, VOCAB.hasSubtask)) {
    const parsedSubTask = parseTaskNode(dataset, subTaskUrl, nextVisited);
    if (parsedSubTask) {
      subtasks.push(parsedSubTask);
    }
  }

  const userId = rawUserId ?? submissions[0]?.submitterId ?? undefined;

  return {
    thingUrl: thing.url,
    id: getStringNoLocale(thing, VOCAB.id) ?? "",
    userId,
    proposerId: getStringNoLocale(thing, VOCAB.proposerId) ?? "",
    createdAt: getDatetime(thing, VOCAB.createdAt) ?? new Date(0),
    editedAt: getDatetime(thing, VOCAB.editedAt) ?? undefined,
    status: getStringNoLocale(thing, VOCAB.status) ?? "",
    title: getStringNoLocale(thing, VOCAB.title) ?? "",
    deadline,
    description: getStringNoLocale(thing, VOCAB.description) ?? "",
    links: getUrlAll(thing, VOCAB.hasLink).map((u) => new URL(u)),
    fileUrls: getUrlAll(thing, VOCAB.hasFile),
    subtasks,
    submissions,
  };
}

export async function readTaskTreeFromPod(
  datasetUrl: string,
  rootTaskId: string,
): Promise<TaskRecord | null> {
  const authFetch = getAuthedFetch();
  const dataset = await getSolidDataset(datasetUrl, { fetch: authFetch });
  const rootThingUrl = `${datasetUrl}#task-${encodeURIComponent(rootTaskId)}`;
  return parseTaskNode(dataset, rootThingUrl);
}
