async function test() {
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
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": "https://leetcode.com"
    },
    body: JSON.stringify({
      query,
      variables: { username: "tourist" }
    })
  });
  console.log(await res.text());
}
test();
