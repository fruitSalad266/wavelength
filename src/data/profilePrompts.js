/**
 * Hinge-style profile prompt catalog.
 *
 * Each user picks a subset of these to answer.
 * Stored in profiles.extras.prompts as:
 *   [{ id: 'anthem', answer: { title, artist, url? } }, ...]
 *
 * Types determine the input UI and how the answer renders:
 *   text   — free-text answer (single string)
 *   anthem — song with title, artist, optional Spotify URL
 *   list   — ordered list of items (emoji + title + optional desc)
 */

export const PROFILE_PROMPTS = [
  { id: 'bio', label: 'About me', type: 'text', icon: 'edit-3', maxLength: 200 },
  { id: 'anthem', label: 'My anthem right now', type: 'anthem', icon: 'music' },
  { id: 'top_events', label: 'Top 3 events I\'ve been to', type: 'list', icon: 'heart', maxItems: 3 },
  { id: 'known_for', label: 'I\'m known for...', type: 'text', icon: 'star', maxLength: 150 },
  { id: 'go_to_genre', label: 'My go-to genre', type: 'text', icon: 'headphones', maxLength: 100 },
  { id: 'bucket_list', label: 'My bucket-list event', type: 'text', icon: 'target', maxLength: 150 },
  { id: 'unpopular_opinion', label: 'My unpopular music opinion', type: 'text', icon: 'zap', maxLength: 150 },
  { id: 'perfect_night', label: 'My perfect night out', type: 'text', icon: 'moon', maxLength: 150 },
  { id: 'karaoke', label: 'My go-to karaoke song', type: 'text', icon: 'mic', maxLength: 100 },
  { id: 'hidden_talent', label: 'My hidden talent', type: 'text', icon: 'eye', maxLength: 150 },
  { id: 'festival_essential', label: 'Festival essential I can\'t go without', type: 'text', icon: 'package', maxLength: 150 },
  { id: 'dream_collab', label: 'Artists I\'d love to see collab', type: 'text', icon: 'users', maxLength: 150 },
];

export const MAX_PROMPTS = 5;

export function getPromptById(id) {
  return PROFILE_PROMPTS.find((p) => p.id === id) || null;
}
