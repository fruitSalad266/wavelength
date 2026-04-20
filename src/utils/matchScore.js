/**
 * Calculates a 0–100 compatibility score between two user profiles.
 *
 * Weights:
 *   Shared interests  40%
 *   Same major        20%
 *   Same class year   15%
 *   Shared clubs      15%
 *   Mutual friends    10%
 */
export function calculateMatchScore(currentUser, otherUser, currentFriendIds = [], otherFriendIds = []) {
  let score = 0;

  // Shared interests (40%)
  const myInterests = currentUser.interests || [];
  const theirInterests = otherUser.interests || [];
  const sharedInterests = myInterests.filter((i) => theirInterests.includes(i));
  const maxInterests = Math.max(myInterests.length, theirInterests.length, 1);
  if (myInterests.length > 0 || theirInterests.length > 0) {
    score += (sharedInterests.length / maxInterests) * 40;
  }

  // Same major (20%)
  const sameMajor =
    currentUser.major &&
    otherUser.major &&
    currentUser.major.trim().toLowerCase() === otherUser.major.trim().toLowerCase();
  if (sameMajor) score += 20;

  // Same class year (15%)
  const sameYear =
    currentUser.class_year &&
    otherUser.class_year &&
    currentUser.class_year === otherUser.class_year;
  if (sameYear) score += 15;

  // Shared clubs (15%)
  const myClubs = currentUser.extras?.clubs || [];
  const theirClubs = otherUser.extras?.clubs || [];
  if (myClubs.length === 0 && theirClubs.length === 0) {
    // Neither listed clubs — treat as neutral, give full weight
    score += 15;
  } else {
    const sharedClubs = myClubs.filter((c) => theirClubs.includes(c));
    const maxClubs = Math.max(myClubs.length, theirClubs.length, 1);
    score += (sharedClubs.length / maxClubs) * 15;
  }

  // Mutual friends (10%)
  const otherFriendSet = new Set(otherFriendIds);
  const hasMutual = currentFriendIds.some((id) => otherFriendSet.has(id));
  if (hasMutual) score += 10;

  // Breakdown for display
  const breakdown = {
    sharedInterests,
    sameMajor: !!sameMajor,
    sameYear: !!sameYear,
    sharedClubs: myClubs.filter((c) => theirClubs.includes(c)),
    mutualFriendCount: currentFriendIds.filter((id) => otherFriendSet.has(id)).length,
  };

  return { score: Math.round(score), breakdown };
}
