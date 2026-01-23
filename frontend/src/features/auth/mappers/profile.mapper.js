export function toProfileUpsertPayload(user) {
  return {
    id: user.id,
    email: user.email ?? null,
    display_name:
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };
}
