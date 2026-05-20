import Bull from "bull";
import { redisClient } from "../config/redis";
import { sequelize } from "../config/database";
import DailyAnalytics from "../models/DailyAnalytics";
import ReadLog from "../models/ReadLog";
import { Op } from "sequelize";

const analyticsQueue = new Bull("analytics-queue", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
  },
});

// Process job: Aggregate read logs into daily analytics
analyticsQueue.process(async (job) => {
  const { date } = job.data;
  const targetDate = date || new Date();

  // Set timezone to GMT
  const gmtDate = new Date(targetDate.toISOString().split("T")[0]);
  const dateStr = gmtDate.toISOString().split("T")[0];

  console.log(`Processing analytics for date: ${dateStr}`);

  // Get all read logs for the specified date, grouped by article
  const readCounts = await ReadLog.findAll({
    where: {
      read_at: {
        [Op.gte]: new Date(`${dateStr} 00:00:00`),
        [Op.lt]: new Date(`${dateStr} 23:59:59`),
      },
    },
    attributes: [
      "article_id",
      [sequelize.fn("COUNT", sequelize.col("read_logs.id")), "count"],
    ],
    group: ["article_id"],
  });

  // Upsert into DailyAnalytics
  for (const count of readCounts) {
    const articleId = (count as any).article_id;
    const viewCount = parseInt((count as any).getDataValue("count"));

    await DailyAnalytics.upsert({
      article_id: articleId,
      view_count: viewCount,
      date: new Date(dateStr),
    });
  }

  console.log(`Completed analytics processing for date: ${dateStr}`);
  return { processed: true, date: dateStr, articles: readCounts.length };
});

export const addAnalyticsJob = async (date?: Date) => {
  await analyticsQueue.add(
    { date: date || new Date() },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
    },
  );
};

// Schedule daily job at 00:05 GMT
export const scheduleDailyAnalytics = () => {
  const scheduleNextRun = () => {
    const now = new Date();
    const nextRun = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        5,
        0,
      ),
    );

    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    const delay = nextRun.getTime() - now.getTime();

    setTimeout(async () => {
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      await addAnalyticsJob(yesterday);
      scheduleNextRun();
    }, delay);
  };

  scheduleNextRun();
};

export default analyticsQueue;
