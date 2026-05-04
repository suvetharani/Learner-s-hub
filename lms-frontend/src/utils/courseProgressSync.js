import { computeCoursePercentComplete, getCourseContext } from "./courseDomain";

const RAW_API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
const trimmedApiBase = String(RAW_API_BASE || "").replace(/\/+$/, "");
const API = trimmedApiBase.endsWith("/api")
  ? trimmedApiBase
  : `${trimmedApiBase}/api`;
const RECENT_COURSES_KEY = "recentCourses";

/**
 * Records topic completion after reading (no quiz) or passing quiz, and refreshes dashboard progress.
 */
export async function syncTopicCourseProgress(userId, courseId, topicId) {
  if (!userId || !courseId || !topicId) return null;

  const topicKey = `${courseId}:${topicId}`;
  let readTopicIds = [];

  try {
    const progRes = await fetch(`${API}/users/course-progress/${userId}`);
    if (progRes.ok) {
      const body = await progRes.json();
      readTopicIds = Array.isArray(body.readTopicIds) ? [...body.readTopicIds] : [];
    }
  } catch {
    readTopicIds = [];
  }

  const simulatedIds = readTopicIds.includes(topicKey)
    ? readTopicIds
    : [...readTopicIds, topicKey];

  const ctx = getCourseContext(courseId);
  const course = ctx?.course;

  const isCourseDone =
    !!course?.topics?.length &&
    course.topics.every((t) => simulatedIds.includes(`${courseId}:${t.id}`));

  try {
    const trackRes = await fetch(`${API}/users/course-progress/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        courseId,
        topicId,
        coursePoints: course?.points || 0,
        completed: !!isCourseDone,
      }),
    });
    const data = await trackRes.json().catch(() => ({}));
    if (!trackRes.ok) throw new Error(data.message || "track failed");

    const finalIds = Array.isArray(data.learning?.readTopicIds)
      ? data.learning.readTopicIds
      : simulatedIds;

    const progressPct =
      course && ctx ? computeCoursePercentComplete(course, finalIds) : null;

    if (course && ctx && progressPct != null) {
      try {
        const key = `${RECENT_COURSES_KEY}:${userId}`;
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const updated = Array.isArray(list) ? [...list] : [];
        const idx = updated.findIndex((c) => c.id === course.id);
        const entry = {
          id: course.id,
          name: course.name,
          domain: ctx.domainTitle,
          progress: progressPct,
          points: course.points || 0,
          lastAccessed: new Date().toISOString(),
        };
        if (idx >= 0) updated[idx] = entry;
        else updated.unshift(entry);
        localStorage.setItem(key, JSON.stringify(updated.slice(0, 10)));
        window.dispatchEvent(new Event("recentCoursesUpdated"));

        await fetch(`${API}/users/recent-courses/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            course: { ...entry, lastAccessed: new Date().toISOString() },
          }),
        }).catch(() => {});
      } catch {
        /* ignore storage */
      }
    }

    window.dispatchEvent(new Event("courseProgressUpdated"));
    return progressPct;
  } catch {
    window.dispatchEvent(new Event("courseProgressUpdated"));
    return null;
  }
}
