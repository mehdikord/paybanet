/** Standard result of a create/update/delete server action. */
export type MutationResult<Field extends string = never> = {
  ok: boolean;
  message?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
};
