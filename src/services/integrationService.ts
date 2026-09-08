import { fetch } from '@tauri-apps/plugin-http';
import { updatePlatformStats } from './platformService';

/**
 * Fetch stats for a given platform and username, and save it to the DB.
 */
export async function syncPlatformStats(platformId: number, platformName: string, username: string): Promise<void> {
  let stats = null;

  try {
    const pName = platformName.toLowerCase();
    if (pName.includes("leetcode")) {
      stats = await fetchLeetCodeStats(username);
    } else if (pName.includes("codeforces")) {
      stats = await fetchCodeforcesStats(username);
    } else {
      throw new Error(`API integration not supported for ${platformName}`);
    }

    if (stats) {
      await updatePlatformStats(platformId, JSON.stringify(stats));
    }
  } catch (error: any) {
    console.error(`Failed to sync stats for ${platformName}:`, error);
    const msg = error?.message || (typeof error === "string" ? error : "Unknown error");
    throw new Error(`Sync failed: ${msg}`);
  }
}

/**
 * Fetch LeetCode stats via their GraphQL API
 */
async function fetchLeetCodeStats(username: string) {
  const query = `
    query getUserProfile($username: String!) {
      matchedUser(username: $username) {
        submitStats: submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify({
      query,
      variables: { username }
    })
  });

  if (!response.ok) {
    throw new Error(`LeetCode HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "LeetCode GraphQL error");
  }

  const matchedUser = json.data?.matchedUser;
  if (!matchedUser) {
    throw new Error("User not found on LeetCode");
  }

  const acSubmissionNum = matchedUser.submitStats?.acSubmissionNum || [];
  const getCount = (diff: string) => acSubmissionNum.find((x: any) => x.difficulty === diff)?.count || 0;

  return {
    totalSolved: getCount("All"),
    easySolved: getCount("Easy"),
    mediumSolved: getCount("Medium"),
    hardSolved: getCount("Hard"),
    rating: Math.round(json.data?.userContestRanking?.rating || 0),
    ranking: json.data?.userContestRanking?.globalRanking || 0,
  };
}

/**
 * Fetch Codeforces stats via their official REST API
 */
async function fetchCodeforcesStats(username: string) {
  const response = await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
  
  if (!response.ok) {
    throw new Error(`Codeforces HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.status !== "OK" || !json.result || json.result.length === 0) {
    throw new Error(json.comment || "Failed to fetch Codeforces profile");
  }

  const user = json.result[0];

  return {
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank || "unrated",
    maxRank: user.maxRank || "unrated",
  };
}

/**
 * Fetch contests for a given platform and username, and save them to the DB.
 */
export async function syncUserContests(platformId: number, platformName: string, username: string): Promise<number> {
  let count = 0;
  try {
    const pName = platformName.toLowerCase();
    if (pName.includes("codeforces")) {
      count = await fetchCodeforcesContests(platformId, username);
    } else if (pName.includes("leetcode")) {
      count = await fetchLeetCodeContests(platformId, username);
    } else {
      throw new Error(`Contest sync not supported for ${platformName}`);
    }
    return count;
  } catch (error: any) {
    console.error(`Failed to sync contests for ${platformName}:`, error);
    const msg = error?.message || (typeof error === "string" ? error : "Unknown error");
    throw new Error(`Contest sync failed: ${msg}`);
  }
}

async function fetchLeetCodeContests(platformId: number, username: string): Promise<number> {
  const query = `
    query userContestRankingInfo($username: String!) {
      userContestRankingHistory(username: $username) {
        attended
        rating
        ranking
        contest {
          title
          startTime
        }
      }
    }
  `;

  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify({ query, variables: { username } })
  });

  if (!response.ok) {
    throw new Error(`LeetCode HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "LeetCode GraphQL error");
  }

  const history = json.data?.userContestRankingHistory;
  if (!history || !Array.isArray(history)) {
    return 0;
  }

  const { createContest, getAllContests } = await import("./contestService");
  const existingContests = await getAllContests();
  let addedCount = 0;
  let previousRating = 1500; // LeetCode starting rating

  for (const record of history) {
    if (!record.attended) continue;

    // LeetCode URL structure usually follows /contest/<slug> but we only have the title
    // Let's create a predictable URL from the title, e.g. "Weekly Contest 111" -> "weekly-contest-111"
    const slug = record.contest?.title?.toLowerCase().replace(/\s+/g, '-') || "unknown-contest";
    const url = `https://leetcode.com/contest/${slug}`;
    
    const newRating = Math.round(record.rating);
    const ratingChange = newRating - previousRating;
    const ratingBefore = previousRating;
    previousRating = newRating;

    if (existingContests.some((c: any) => c.url === url || c.name === record.contest?.title)) {
      continue;
    }

    await createContest({
      name: record.contest?.title || "LeetCode Contest",
      platform_id: platformId,
      url: url,
      contest_date: new Date(record.contest?.startTime * 1000).toISOString(),
      rating_before: ratingBefore,
      rating_change: ratingChange,
      rating_after: newRating,
      notes: `Rank: ${record.ranking}`,
      problems: []
    });
    addedCount++;
  }

  return addedCount;
}

async function fetchCodeforcesContests(platformId: number, username: string): Promise<number> {
  const response = await fetch(`https://codeforces.com/api/user.rating?handle=${username}`);
  
  if (!response.ok) {
    throw new Error(`Codeforces HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.status !== "OK") {
    throw new Error(json.comment || "Failed to fetch Codeforces contests");
  }

  // Import dynamically to avoid circular dependencies if any
  const { createContest, getAllContests } = await import("./contestService");
  const existingContests = await getAllContests();
  let addedCount = 0;

  for (const ratingChange of json.result) {
    // Check if contest already exists by URL
    const url = `https://codeforces.com/contest/${ratingChange.contestId}`;
    if (existingContests.some((c: any) => c.url === url)) {
      continue;
    }

    await createContest({
      name: ratingChange.contestName,
      platform_id: platformId,
      url: url,
      contest_date: new Date(ratingChange.ratingUpdateTimeSeconds * 1000).toISOString(),
      rating_before: ratingChange.oldRating,
      rating_change: ratingChange.newRating - ratingChange.oldRating,
      rating_after: ratingChange.newRating,
      notes: `Rank: ${ratingChange.rank}`,
      problems: []
    });
    addedCount++;
  }

  return addedCount;
}

