export const GIG_CATEGORIES = [
  { value: 'graphics', label: 'Graphics Design', emoji: '🎨' },
  { value: 'study_guides', label: 'Study Guides', emoji: '📚' },
  { value: 'proofreading', label: 'Proofreading', emoji: '✍️' },
  { value: 'presentations', label: 'Presentations', emoji: '📊' },
  { value: 'tutoring', label: 'Tutoring', emoji: '👨‍🏫' },
  { value: 'resume_design', label: 'Resume Design', emoji: '📄' },
  { value: 'brainstorming', label: 'Brainstorming', emoji: '💡' },
  { value: 'other', label: 'Other', emoji: '🔧' },
] as const;

export const DELIVERY_DAYS_OPTIONS = [
  { value: 1, label: '1 Day - Express' },
  { value: 2, label: '2 Days' },
  { value: 3, label: '3 Days' },
  { value: 5, label: '5 Days' },
  { value: 7, label: '7 Days' },
] as const;

export const ORDER_STATUS_LABELS = {
  pending: { label: 'Pending Payment', color: 'warning' },
  paid: { label: 'Paid', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'destructive' },
} as const;

export type GigCategory = typeof GIG_CATEGORIES[number]['value'];
export type OrderStatus = keyof typeof ORDER_STATUS_LABELS;
