import { domainConfig } from "../config/domainConfig";

/** @returns {{ course: object, domainTitle: string } | null} */
export function getCourseContext(courseId) {
  for (const domain of domainConfig) {
    const course = domain.courses.find((c) => c.id === courseId);
    if (course) return { course, domainTitle: domain.title };
  }
  return null;
}

export function computeCoursePercentComplete(course, readTopicIds) {
  const totalTopics = course.topics?.length || 0;
  if (totalTopics === 0) return 0;
  const readCount = course.topics.filter((t) =>
    readTopicIds.includes(`${course.id}:${t.id}`)
  ).length;
  return Math.round((readCount / totalTopics) * 100);
}
