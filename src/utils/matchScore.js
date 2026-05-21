/**
 * Calculates a 0–100 compatibility score between two user profiles.
 *
 * Weights:
 *   Shared interests  40%
 *   Same class year   25%
 *   Same major        20%
 *   Shared clubs      10%
 *   Mutual friends     5%
 */
export function calculateMatchScore(currentUser, otherUser, currentFriendIds = [], otherFriendIds = []) {
  if (currentUser?.id && otherUser?.id && currentUser.id === otherUser.id) {
    return { score: 0, breakdown: null, isSelf: true };
  }

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

  // Same class year (25%)
  const sameYear =
    currentUser.class_year &&
    otherUser.class_year &&
    currentUser.class_year === otherUser.class_year;
  if (sameYear) score += 25;

  // Shared clubs (10%)
  const myClubs = currentUser.extras?.clubs || [];
  const theirClubs = otherUser.extras?.clubs || [];
  if (myClubs.length === 0 && theirClubs.length === 0) {
    score += 10;
  } else {
    const _sharedClubs = myClubs.filter((c) => theirClubs.includes(c));
    const maxClubs = Math.max(myClubs.length, theirClubs.length, 1);
    score += (_sharedClubs.length / maxClubs) * 10;
  }

  // Mutual friends (5%)
  const otherFriendSet = new Set(otherFriendIds);
  const hasMutual = currentFriendIds.some((id) => otherFriendSet.has(id));
  if (hasMutual) score += 5;

  const sharedClubs = myClubs.filter((c) => theirClubs.includes(c));
  const mutualFriendCount = currentFriendIds.filter((id) => otherFriendSet.has(id)).length;

  // Breakdown includes actual values so the UI can display reasons
  const breakdown = {
    sharedInterests,
    sameMajor: !!sameMajor,
    major: sameMajor ? otherUser.major : null,
    sameYear: !!sameYear,
    classYear: sameYear ? otherUser.class_year : null,
    sharedClubs,
    mutualFriendCount,
  };

  return { score: Math.round(score), breakdown };
}
