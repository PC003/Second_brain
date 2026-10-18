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
    } else if (pName.includes("codechef")) {
      stats = await fetchCodeChefStats(username);
    } else if (pName.includes("atcoder")) {
      stats = await fetchAtCoderStats(username);
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
 * Fetch CodeChef stats via public profile HTML
 */
async function fetchCodeChefStats(username: string) {
  const response = await fetch(`https://www.codechef.com/users/${username}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`CodeChef HTTP error: ${response.status}`);
  }

  const html = await response.text();

  if (!html.includes("User Profile") && !html.includes("var all_rating")) {
    throw new Error(`User "${username}" not found on CodeChef`);
  }

  // 1. Current Rating
  const ratingMatch = html.match(/<div class="rating-number">([^<]+)<\/div>/);
  const rating = ratingMatch && !isNaN(parseInt(ratingMatch[1])) ? parseInt(ratingMatch[1].trim()) : 0;

  // 2. Highest / Max Rating
  const maxRatingMatch = html.match(/\(Highest Rating\s*(\d+)\)/i);
  let maxRating = maxRatingMatch ? parseInt(maxRatingMatch[1]) : rating;

  // 3. Stars
  const starsMatch = html.match(/<div class="rating-star">([\s\S]*?)<\/div>/);
  let stars = 0;
  if (starsMatch) {
    stars = (starsMatch[1].match(/&#9733;/g) || []).length;
  }
  if (stars === 0 && rating > 0) {
    if (rating < 1400) stars = 1;
    else if (rating < 1600) stars = 2;
    else if (rating < 1800) stars = 3;
    else if (rating < 2000) stars = 4;
    else if (rating < 2200) stars = 5;
    else if (rating < 2500) stars = 6;
    else stars = 7;
  }

  // 4. Global Rank
  const globalRankMatch = html.match(/<strong class="global-rank">([^<]+)<\/strong>/i) ||
                          html.match(/<a href="\/ratings\/all"[^>]*><strong>(\d+)<\/strong><\/a>/i);
  const globalRank = globalRankMatch ? globalRankMatch[1].trim() : undefined;

  // 5. Total Problems Solved
  const solvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i) ||
                      html.match(/<h3>Total Problems Solved:\s*(\d+)<\/h3>/i) ||
                      html.match(/Fully Solved \((\d+)\)/i);
  const totalSolved = solvedMatch ? parseInt(solvedMatch[1]) : 0;

  // Check if contest history has a higher rating
  const allRatingMatch = html.match(/var all_rating = (\[.*?\]);/);
  if (allRatingMatch) {
    try {
      const allRating = JSON.parse(allRatingMatch[1]);
      if (Array.isArray(allRating) && allRating.length > 0) {
        const ratings = allRating.map((r: any) => parseInt(r.rating)).filter((n: number) => !isNaN(n));
        if (ratings.length > 0) {
          maxRating = Math.max(maxRating, ...ratings);
        }
      }
    } catch (_) {
      // Ignore JSON parse errors
    }
  }

  return {
    rating,
    maxRating,
    stars,
    globalRank,
    totalSolved,
  };
}

/**
 * Fetch AtCoder stats via public profile HTML & contest history
 */
async function fetchAtCoderStats(username: string) {
  const profileRes = await fetch(`https://atcoder.jp/users/${username}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (profileRes.status === 404) {
    throw new Error(`User "${username}" not found on AtCoder`);
  }
  if (!profileRes.ok) {
    throw new Error(`AtCoder HTTP error: ${profileRes.status}`);
  }

  const html = await profileRes.text();
  if (html.includes("404 Not Found") || html.includes("User not found")) {
    throw new Error(`User "${username}" not found on AtCoder`);
  }

  let rating = 0;
  let maxRating = 0;
  let rank = "Unrated";
  let lastCompeted = "";

  const ratingMatch = html.match(/Rating<\/th>\s*<td[^>]*><span[^>]*>(\d+)<\/span>/i) ||
                      html.match(/Rating<\/th>\s*<td[^>]*>(\d+)/i);
  if (ratingMatch) {
    rating = parseInt(ratingMatch[1]);
  }

  const highestMatch = html.match(/Highest Rating<\/th>\s*<td[^>]*><span[^>]*>(\d+)<\/span>/i) ||
                       html.match(/Highest Rating<\/th>\s*<td[^>]*>(\d+)/i);
  if (highestMatch) {
    maxRating = parseInt(highestMatch[1]);
  }

  const rankMatch = html.match(/Rank<\/th>\s*<td[^>]*>([^<]+)<\/td>/i);
  if (rankMatch) {
    rank = rankMatch[1].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
  }

  const lastCompMatch = html.match(/Last Competed<\/th>\s*<td[^>]*>([^<]+)<\/td>/i);
  if (lastCompMatch) {
    lastCompeted = lastCompMatch[1].trim();
  }

  let ratedContests = 0;
  try {
    const historyRes = await fetch(`https://atcoder.jp/users/${username}/history/json`);
    if (historyRes.ok) {
      const history = await historyRes.json();
      if (Array.isArray(history)) {
        const rated = history.filter((h: any) => h.IsRated);
        ratedContests = rated.length;
        if (rated.length > 0) {
          const lastRated = rated[rated.length - 1];
          if (!rating) rating = lastRated.NewRating;
          if (!maxRating) maxRating = Math.max(...rated.map((h: any) => h.NewRating));
        }
      }
    }
  } catch (_) {
    // Ignore JSON history errors
  }

  return {
    rating,
    maxRating: Math.max(rating, maxRating),
    rank,
    ratedContests,
    lastCompeted,
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
    } else if (pName.includes("codechef")) {
      count = await fetchCodeChefContests(platformId, username);
    } else if (pName.includes("atcoder")) {
      count = await fetchAtCoderContests(platformId, username);
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

/**
 * Fetch CodeChef contests from public profile history and save to DB
 */
async function fetchCodeChefContests(platformId: number, username: string): Promise<number> {
  const response = await fetch(`https://www.codechef.com/users/${username}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`CodeChef HTTP error: ${response.status}`);
  }

  const html = await response.text();
  const match = html.match(/var all_rating = (\[.*?\]);/);
  if (!match) {
    return 0;
  }

  let contestsData: any[] = [];
  try {
    contestsData = JSON.parse(match[1]);
  } catch (e) {
    console.error("Failed to parse CodeChef contest history JSON", e);
    return 0;
  }

  if (!Array.isArray(contestsData) || contestsData.length === 0) {
    return 0;
  }

  const { createContest, getAllContests } = await import("./contestService");
  const existingContests = await getAllContests();
  let addedCount = 0;
  let previousRating = 1500;

  for (const c of contestsData) {
    const contestCode = c.code || "";
    const url = `https://www.codechef.com/${contestCode}`;
    const contestName = c.name || `CodeChef ${contestCode}`;
    const newRating = parseInt(c.rating) || 0;
    const ratingBefore = previousRating;
    const ratingChange = newRating - ratingBefore;
    previousRating = newRating;

    if (existingContests.some((existing: any) => existing.url === url || existing.name === contestName)) {
      continue;
    }

    let contestDate = new Date().toISOString();
    if (c.end_date) {
      const parsedDate = new Date(c.end_date.replace(" ", "T") + "Z");
      if (!isNaN(parsedDate.getTime())) {
        contestDate = parsedDate.toISOString();
      }
    }

    await createContest({
      name: contestName,
      platform_id: platformId,
      url,
      contest_date: contestDate,
      rating_before: ratingBefore,
      rating_change: ratingChange,
      rating_after: newRating,
      notes: c.rank ? `Rank: ${c.rank}` : "",
      problems: [],
    });
    addedCount++;
  }

  return addedCount;
}

/**
 * Fetch AtCoder contests from user history and save to DB
 */
async function fetchAtCoderContests(platformId: number, username: string): Promise<number> {
  const response = await fetch(`https://atcoder.jp/users/${username}/history/json`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!response.ok) {
    throw new Error(`AtCoder HTTP error: ${response.status}`);
  }

  const history = await response.json();
  if (!Array.isArray(history) || history.length === 0) {
    return 0;
  }

  const { createContest, getAllContests } = await import("./contestService");
  const existingContests = await getAllContests();
  let addedCount = 0;

  for (const record of history) {
    const screenName = record.ContestScreenName || "";
    const slug = screenName.replace('.contest.atcoder.jp', '').replace(/\.atcoder\.jp$/, '');
    const url = slug ? `https://atcoder.jp/contests/${slug}` : `https://atcoder.jp/users/${username}/history`;
    const name = record.ContestName || record.ContestNameEn || slug || "AtCoder Contest";

    if (existingContests.some((existing: any) => existing.url === url || existing.name === name)) {
      continue;
    }

    const ratingBefore = typeof record.OldRating === "number" ? record.OldRating : 0;
    const ratingAfter = typeof record.NewRating === "number" ? record.NewRating : ratingBefore;
    const ratingChange = ratingAfter - ratingBefore;

    let contestDate = new Date().toISOString();
    if (record.EndTime) {
      const parsed = new Date(record.EndTime);
      if (!isNaN(parsed.getTime())) {
        contestDate = parsed.toISOString();
      }
    }

    const notesParts: string[] = [];
    if (record.Place) notesParts.push(`Rank: ${record.Place}`);
    if (record.Performance) notesParts.push(`Performance: ${record.Performance}`);

    await createContest({
      name,
      platform_id: platformId,
      url,
      contest_date: contestDate,
      rating_before: ratingBefore,
      rating_change: ratingChange,
      rating_after: ratingAfter,
      notes: notesParts.join(", "),
      problems: [],
    });
    addedCount++;
  }

  return addedCount;
}


