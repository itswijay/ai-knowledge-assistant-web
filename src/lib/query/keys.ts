export const queryKeys = {
  currentUser: () => ["current-user"] as const,
  organizations: {
    all: () => ["organizations"] as const,
    list: () => ["organizations", "list"] as const,
    detail: (organizationId: string) => ["organization", organizationId] as const,
    assistants: (organizationId: string) =>
      ["organization", organizationId, "assistants"] as const,
    assistant: (organizationId: string, assistantId: string) =>
      ["organization", organizationId, "assistant", assistantId] as const,
    documents: (organizationId: string, assistantId: string) =>
      ["organization", organizationId, "assistant", assistantId, "documents"] as const,
  },
};
