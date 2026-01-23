export function toProfileUpsertPayload(user) {
  // username 생성: 이메일 앞부분 또는 user id 앞 8자리
  const emailPrefix = user.email?.split('@')[0];
  const username = emailPrefix || `user_${user.id.slice(0, 8)}`;

  return {
    id: user.id,
    username,
    full_name:
      user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatar_url: user.user_metadata?.avatar_url ?? null,
  };
}
